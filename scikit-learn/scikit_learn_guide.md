# scikit-learn — Reference Guide

## What It Is
`scikit-learn` (imported as `sklearn`) is Python's core machine learning library. It sits on top of NumPy, SciPy, and matplotlib, and gives you a consistent API for the entire ML workflow: preprocessing → training → evaluation → prediction.

It's **not** for deep learning (that's TensorFlow/PyTorch territory). It's for classical ML: regression, classification, clustering, dimensionality reduction.

## Why It's Useful (teach this point explicitly — it's the "why" that sells the tool)
1. **One consistent API for every algorithm.** Every model uses the same three methods: `.fit()`, `.predict()`, `.score()`. Learn one algorithm's syntax, you know 40 others.
2. **Handles the boring 80%.** Train/test splitting, cross-validation, scaling, encoding — all built in, no manual implementation.
3. **Production-realistic without production complexity.** It's what most real-world tabular-data ML actually runs on (not every problem needs a neural net).
4. **Free, fast to prototype in.** A working model in under 10 lines of code — good for a classroom, good for freelance MVPs.

## Core Workflow (the pattern that repeats everywhere)
```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# 1. Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 2. Create + train model
model = LinearRegression()
model.fit(X_train, y_train)

# 3. Predict
predictions = model.predict(X_test)

# 4. Evaluate
mse = mean_squared_error(y_test, predictions)
```

This exact pattern (`fit → predict → score`) is identical whether you're using linear regression, a decision tree, or an SVM. That consistency is the entire point of the library.

---

## Major Modules & Functions

### 1. Data Splitting & Preprocessing (`sklearn.model_selection`, `sklearn.preprocessing`)
| Function | Use |
|---|---|
| `train_test_split()` | Split data into train/test sets |
| `StandardScaler()` | Normalize features (mean=0, std=1) |
| `MinMaxScaler()` | Scale features to a [0,1] range |
| `LabelEncoder()` | Convert categorical labels to numbers |
| `OneHotEncoder()` | Convert categories into binary columns |
| `cross_val_score()` | K-fold cross-validation for reliable accuracy estimates |

### 2. Regression (`sklearn.linear_model`)
| Function | Use |
|---|---|
| `LinearRegression()` | Predict continuous values (e.g., price, temperature) |
| `Ridge()` / `Lasso()` | Regularized regression — prevents overfitting |
| `LogisticRegression()` | Despite the name, this is for **classification**, not regression |

### 3. Classification
| Function | Use |
|---|---|
| `LogisticRegression()` | Binary/multiclass classification, interpretable |
| `KNeighborsClassifier()` | Classify based on nearest data points |
| `DecisionTreeClassifier()` | Rule-based classification, easy to visualize |
| `RandomForestClassifier()` | Ensemble of trees — usually more accurate, less interpretable |
| `SVC()` | Support Vector Machine classifier — strong for smaller, complex datasets |

### 4. Clustering (unsupervised — `sklearn.cluster`)
| Function | Use |
|---|---|
| `KMeans()` | Group data into K clusters (e.g., customer segmentation) |
| `DBSCAN()` | Density-based clustering, finds arbitrary-shaped clusters |

### 5. Dimensionality Reduction (`sklearn.decomposition`)
| Function | Use |
|---|---|
| `PCA()` | Reduce features while keeping most variance — used before visualization or to speed up training |

### 6. Model Evaluation (`sklearn.metrics`)
| Function | Use |
|---|---|
| `accuracy_score()` | % of correct predictions (classification) |
| `confusion_matrix()` | Breakdown of correct/incorrect predictions by class |
| `precision_score()` / `recall_score()` / `f1_score()` | Needed when classes are imbalanced (accuracy alone lies) |
| `mean_squared_error()` / `r2_score()` | Regression error metrics |

### 7. Pipelines (`sklearn.pipeline`)
| Function | Use |
|---|---|
| `Pipeline()` | Chain preprocessing + model into one object — prevents data leakage, cleaner code |

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model', LogisticRegression())
])
pipe.fit(X_train, y_train)
```

---

## Practical Examples

**Example 1 — Predict house prices (regression)**
```python
model = LinearRegression()
model.fit(X_train, y_train)  # X = [sqft, bedrooms, location_score]
price_prediction = model.predict(X_test)
```

**Example 2 — Classify emails as spam/not spam (classification)**
```python
model = RandomForestClassifier()
model.fit(X_train, y_train)  # X = word frequency vectors
predictions = model.predict(X_test)
print(accuracy_score(y_test, predictions))
```

**Example 3 — Segment customers by behavior (clustering, no labels needed)**
```python
kmeans = KMeans(n_clusters=4, random_state=42)
kmeans.fit(customer_data)
customer_data['segment'] = kmeans.labels_
```

---

## Teaching Notes
- Emphasize `random_state=42` (or any fixed number) — makes results reproducible, important for grading/comparing student outputs.
- Common student mistake: fitting the scaler on the full dataset instead of just training data → data leakage. Worth a dedicated 5-minute warning.
- `LogisticRegression` naming confusion trips up every cohort — flag it explicitly in Week 5 D3.
