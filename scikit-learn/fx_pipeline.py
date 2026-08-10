# %% [markdown]
# # FX Direction Model — Walk-Forward, Cost-Aware, 1:2 RR
#
# Honest goal: not "predict the market." Goal is a properly validated
# pipeline that tells you truthfully whether a small edge survives costs.
#
# SWAP IN REAL DATA: replace `generate_synthetic_ohlcv()` with:
#   import yfinance as yf
#   df = yf.download("EURUSD=X", start="2021-01-01", interval="1h")
# or your own CSV: df = pd.read_csv("your_eurusd.csv", parse_dates=["date"], index_col="date")
# Everything downstream (labeling, features, walk-forward, backtest) is unchanged.

# %%
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import warnings
warnings.filterwarnings("ignore")

np.random.seed(42)

# %% [markdown]
# ## 1. Data (synthetic stand-in — see note above)

# %%
def generate_synthetic_ohlcv(n_bars=6000, start_price=1.1000):
    """Realistic-ish 4H EUR/USD-style series: mild autocorrelation +
    volatility clustering, so the pipeline has *something* learnable —
    real FX has much weaker structure than this."""
    returns = np.zeros(n_bars)
    vol = 0.0006
    for i in range(1, n_bars):
        vol = 0.95 * vol + 0.05 * abs(returns[i-1]) + 0.00005
        drift = 0.08 * returns[i-1]  # weak momentum
        returns[i] = drift + np.random.normal(0, vol)
    close = start_price * np.exp(np.cumsum(returns))
    high = close * (1 + np.abs(np.random.normal(0, 0.0004, n_bars)))
    low = close * (1 - np.abs(np.random.normal(0, 0.0004, n_bars)))
    open_ = np.roll(close, 1); open_[0] = start_price
    idx = pd.date_range("2021-01-01", periods=n_bars, freq="4h")
    return pd.DataFrame({"open": open_, "high": high, "low": low, "close": close}, index=idx)

df = generate_synthetic_ohlcv()
print(df.shape)
df.head()

# %% [markdown]
# ## 2. Features — no look-ahead, everything computed from past bars only

# %%
def add_features(df):
    df = df.copy()
    for w in [3, 6, 12, 24]:
        df[f"ret_{w}"] = df["close"].pct_change(w)
    df["vol_12"] = df["close"].pct_change().rolling(12).std()
    df["rsi_14"] = compute_rsi(df["close"], 14)
    ema12 = df["close"].ewm(span=12).mean()
    ema26 = df["close"].ewm(span=26).mean()
    df["macd"] = ema12 - ema26
    df["hour"] = df.index.hour
    df["session_london"] = df["hour"].between(7, 15).astype(int)
    df["session_ny"] = df["hour"].between(13, 21).astype(int)
    return df

def compute_rsi(close, period=14):
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))

df = add_features(df)

# %% [markdown]
# ## 3. Triple-barrier labeling — bakes the 1:2 RR into the label itself
# For each bar: look forward up to `max_hold` bars. Label 1 if price hits
# +2R first, 0 if it hits -1R first, drop (NaN) if neither hits (timeout).

# %%
def triple_barrier_labels(df, stop_r=0.0025, rr=2.0, max_hold=24):
    close = df["close"].values
    high = df["high"].values
    low = df["low"].values
    n = len(df)
    labels = np.full(n, np.nan)

    for i in range(n - max_hold):
        entry = close[i]
        stop = entry - stop_r * entry
        target = entry + rr * stop_r * entry
        for j in range(i + 1, i + max_hold + 1):
            if low[j] <= stop:
                labels[i] = 0
                break
            if high[j] >= target:
                labels[i] = 1
                break
    return pd.Series(labels, index=df.index)

df["label"] = triple_barrier_labels(df)
print("Label distribution:\n", df["label"].value_counts(dropna=False))

# %%
feature_cols = ["ret_3", "ret_6", "ret_12", "ret_24", "vol_12", "rsi_14",
                 "macd", "session_london", "session_ny"]
data = df.dropna(subset=feature_cols + ["label"]).copy()
X = data[feature_cols]
y = data["label"].astype(int)

# %% [markdown]
# ## 4. Walk-forward validation — NEVER random train_test_split on time series
# Train on a rolling window, test on the immediately following window,
# slide forward. This is the part that gets skipped and invalidates most
# "profitable" FX ML backtests you'll see online.

# %%
def walk_forward_splits(n, n_folds=6, train_frac=0.7):
    fold_size = n // n_folds
    splits = []
    for k in range(n_folds - 1):
        train_end = fold_size * (k + 1)
        test_end = min(fold_size * (k + 2), n)
        train_start = max(0, train_end - int(fold_size * train_frac * (k + 1)))
        splits.append((train_start, train_end, train_end, test_end))
    return splits

splits = walk_forward_splits(len(data))
results = []

for fold, (tr_s, tr_e, te_s, te_e) in enumerate(splits):
    X_train, y_train = X.iloc[tr_s:tr_e], y.iloc[tr_s:tr_e]
    X_test, y_test = X.iloc[te_s:te_e], y.iloc[te_s:te_e]

    model = RandomForestClassifier(n_estimators=200, max_depth=5,
                                    min_samples_leaf=50, random_state=42)
    model.fit(X_train, y_train)
    proba = model.predict_proba(X_test)[:, 1]

    fold_df = data.iloc[te_s:te_e].copy()
    fold_df["proba"] = proba
    fold_df["fold"] = fold
    results.append(fold_df)

oos = pd.concat(results)  # out-of-sample predictions, all folds
print(f"{len(oos)} out-of-sample predictions across {len(splits)} folds")

# %% [markdown]
# ## 5. Cost-aware backtest
# Only take trades where model confidence clears a threshold. Subtract a
# realistic spread cost from every trade — this is where most "edges" die.

# %%
def backtest(oos, threshold=0.55, spread_cost_r=0.06, rr=2.0):
    """spread_cost_r expressed as fraction of 1R (stop distance).
    ~0.06 approximates a 1.5-pip spread against a 25-pip stop."""
    trades = oos[oos["proba"] >= threshold].copy()
    trades["pnl_r"] = np.where(trades["label"] == 1, rr, -1) - spread_cost_r
    return trades

trades = backtest(oos)
n_trades = len(trades)
win_rate = (trades["label"] == 1).mean()
avg_r = trades["pnl_r"].mean()
equity = trades["pnl_r"].cumsum()

# Sharpe (per-trade, not annualized — small sample, treat as directional signal)
sharpe = trades["pnl_r"].mean() / trades["pnl_r"].std() if trades["pnl_r"].std() > 0 else 0
max_dd = (equity.cummax() - equity).max()

breakeven_wr = 1 / (1 + 2.0)  # 1:2 RR breakeven ≈ 33.3% before costs

print(f"Trades taken:        {n_trades} / {len(oos)} bars ({n_trades/len(oos):.1%} selectivity)")
print(f"Win rate:            {win_rate:.1%}  (breakeven at 1:2 RR ≈ {breakeven_wr:.1%})")
print(f"Avg R per trade:     {avg_r:+.3f}  (after cost)")
print(f"Total R:             {equity.iloc[-1]:+.2f}")
print(f"Per-trade Sharpe:    {sharpe:.2f}")
print(f"Max drawdown:        {max_dd:.2f}R")
