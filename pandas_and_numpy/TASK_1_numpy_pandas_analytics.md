# Task 1 — Campus Store Sales Analytics (NumPy + pandas)

**Topics used:** NumPy (ndarray, aggregations, broadcasting, boolean/fancy indexing) · pandas (read_csv, cleaning, `.str`, groupby, merge, pivot_table)

**Files provided:**
- `campus_store_sales.csv` — 601 raw transaction rows, June 2026, three TFES campus stores
- `store_inventory.csv` — current stock levels per product

**Dataset is intentionally messy** — this is on purpose. It has missing prices, duplicate rows, and inconsistent product-name casing/spacing, so you get real cleaning practice, not a tidy toy dataset.

---

## Learning Goal

By the end, you'll have a clean, analysis-ready sales report that answers: *which products/branches make the most money, which days looked abnormal, and which products need restocking?*

---

## Step-by-Step Tasks

### Part A — Load & Inspect (pandas)
1. Load `campus_store_sales.csv` into a DataFrame.
2. Run `.head()`, `.info()`, `.shape`, and `.describe()` to understand what you're working with.
3. Count how many missing values exist per column, and how many exact duplicate rows exist.

> 💡 **Hint:** `.isna().sum()` for missing values, `.duplicated().sum()` for duplicates. Don't skip this step — write down the numbers you find so you can compare "before vs after" once you clean.

### Part B — Clean the Data (pandas)
4. Drop the exact duplicate rows.
5. Standardize the `product` column: strip whitespace and fix casing so `"gel pen pack"`, `"GEL PEN PACK"`, and `"Gel Pen Pack"` all become one consistent value.
6. Handle the missing `unit_price` values — **do not just drop those rows** (you'd lose real sales). Fill each missing price with the **average price of that same product** across the dataset.
7. Convert `date` to a proper datetime type.

> 💡 **Hint:** Use the `.str` accessor (`.str.strip()`, `.str.title()`) for step 5 — this is exactly what was covered in the pandas deck's `.str` Accessor section. For step 6, look up `groupby().transform()` or compute a per-product mean and use `.fillna()` per group — a `for` loop over products also works if `transform` feels unfamiliar.

### Part C — Feature Engineering & NumPy Aggregations
8. Add a new column `revenue = units_sold * unit_price`.
9. Convert the `revenue` column to a NumPy array. Using **NumPy functions only** (not pandas `.mean()`/`.std()`), compute: total revenue, mean revenue per transaction, standard deviation, and the 90th percentile.
10. **Boolean/fancy indexing:** find every transaction where `revenue` is more than 2 standard deviations above the mean (a simple outlier/"big sale day" filter). Print how many such transactions exist and which products they belong to.
11. **Broadcasting:** each branch charges a different local tax rate — Gulberg Campus 5%, DHA Campus 7%, Model Town Campus 6%. Without writing a loop, create a NumPy array of tax rates matched to each row's branch, and broadcast-multiply it against the revenue array to get a `net_revenue` column.

> 💡 **Hint:** For step 9, the functions are `np.sum`, `np.mean`, `np.std`, `np.percentile`. For step 10, remember a boolean mask looks like `arr[arr > threshold]` — build the threshold from your mean and std first. For step 11, one clean approach: build a dict mapping branch → rate, use `.map()` on the branch column to get a rate-per-row Series, then convert *that* to a NumPy array and multiply elementwise with the revenue array — that elementwise multiply is the "broadcasting" part.

### Part D — Group Analysis (pandas)
12. Use `groupby()` to find total revenue per product, sorted highest to lowest. Which product earns the most?
13. Use `groupby()` on `category` and `branch` together, then reshape the result with `pivot_table()` so branches are columns, categories are rows, and values are total revenue.
14. Use `value_counts()` to find the most frequently sold product (by transaction count, not revenue — these may not be the same product!).

> 💡 **Hint:** `pivot_table(values="revenue", index="category", columns="branch", aggfunc="sum")`. If you get a `KeyError`, double check you actually created the `revenue` column before this step.

### Part E — Merge & Restock Check
15. Merge your cleaned sales DataFrame with `store_inventory.csv` on `product` (and `category`, since both files share it) to bring in `stock_qty` and `reorder_level`.
16. Using boolean filtering on the merged DataFrame, list every product where `stock_qty < reorder_level` — these need restocking.
17. Export your final cleaned + merged DataFrame to `campus_store_sales_clean.csv`.

> 💡 **Hint:** `pd.merge(sales_df, inventory_df, on=["product", "category"], how="left")`. If row counts explode after merging, check for duplicate product names still lurking from Part B — that usually means step 5's cleaning wasn't fully applied everywhere.

---

## Bonus Challenge (optional)
- Which branch has the highest *average* revenue per transaction, not just total revenue? Does the answer change your idea of "best-performing branch"?
- Plot daily total revenue for the month (any charting library you've used) and mark the outlier days you found in step 10.

## Submission Checklist
- [ ] Cleaned CSV (`campus_store_sales_clean.csv`) exported
- [ ] Answers to Part A–E written as comments or a short markdown cell above each block of code
- [ ] Code runs top-to-bottom without errors on a fresh restart
