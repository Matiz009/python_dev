# 5 Pandas Projects — Built From Your Bootcamp Deck

Pulled from your 12-concept deck (Series/DataFrame → .str accessor) and the 30 practice problems. Each project chains 4-6 concepts into something that looks like real work, not a toy exercise. All code is self-contained (synthetic data generated inline, except Project 4 which pulls a real dataset) — copy-paste and run.

Use these as capstones after each problem tier, or hand them out as portfolio pieces — students can screenshot the output and put it on LinkedIn/GitHub, which is more useful to them than 30 isolated problems.

---

## Project 1: School Report Card Generator

**Description:** Takes three separate tables (students, marks, fees) and produces a single ranked report card per student — average score, grade-relative percentile, and fee status — the way a school admin office would actually need it.

**Use case:** Direct extension of your own gradebook analogy from the deck. Students building this can literally use it for TFES/Corvit's own reporting if you let them plug in real (anonymized) data. Also doubles as interview-ready proof they can do multi-table joins + groupby + pivot in one pipeline.

**Concepts used:** `merge()`, `pivot_table()`, `groupby().rank()`, `.map()`, multi-index handling

```python
import pandas as pd
import numpy as np

np.random.seed(42)

students = pd.DataFrame({
    'student_id': range(1, 21),
    'name': [f'Student_{i}' for i in range(1, 21)],
    'grade_level': np.random.choice([9, 10, 11], 20)
})

subjects = ['Math', 'Science', 'English']
rows = []
for sid in students['student_id']:
    for subj in subjects:
        rows.append({'student_id': sid, 'subject': subj, 'score': np.random.randint(40, 100)})
marks = pd.DataFrame(rows)

fees = pd.DataFrame({
    'student_id': range(1, 18),
    'amount_due': 5000,
    'amount_paid': np.random.choice([5000, 3000, 0], 17)
})

df = marks.merge(students, on='student_id', how='left')
df = df.merge(fees, on='student_id', how='left')

# Pivot marks into a wide report card
report = df.pivot_table(index=['student_id', 'name', 'grade_level'], columns='subject', values='score')
report['average'] = report[subjects].mean(axis=1)

# Percentile is relative to the student's own grade, not the whole school
report['grade_percentile'] = (
    df.groupby('grade_level')['score'].rank(pct=True).groupby(df['student_id']).mean() * 100
)

report['fee_status'] = report.index.get_level_values('student_id').map(
    lambda sid: 'Paid' if (fees.loc[fees.student_id == sid, 'amount_paid'].sum() >=
                            fees.loc[fees.student_id == sid, 'amount_due'].sum()) else 'Pending/Unknown'
)

report = report.sort_values('average', ascending=False).reset_index()
report['rank'] = report['average'].rank(ascending=False, method='min').astype(int)

print(report.head(10).to_string(index=False))
print("\nClass average per subject:")
print(df.groupby('subject')['score'].mean().round(1))
```

---

## Project 2: Freelance Invoice & Client Health Tracker

**Description:** Cleans a messy invoice log (inconsistent casing, extra whitespace, missing amounts/emails) and turns it into a client health report — who's overdue, who's your biggest client, who's missing contact info.

**Use case:** This is your actual freelance workflow (Upwork clients, invoicing, payment tracking). Directly transferable to a real Google Sheets export of your own client list. This is also the single most requested type of "business analyst" starter project on Upwork/Fiverr gigs — good portfolio bait.

**Concepts used:** `.str` accessor (`.strip()`, `.replace()`, `.title()`, `.extract()`), `groupby().transform()` for group-wise null filling, `isna()`, `sort_values()`, `value_counts()`

```python
import pandas as pd
import numpy as np

data = {
    'invoice_id': range(1, 16),
    'client_name': [' acme corp ', 'Beta LLC', 'acme CORP', 'Gamma Inc', 'Beta llc ', 'Delta Co',
                     'acme corp', ' Epsilon  Ltd', 'Gamma inc', 'Beta LLC', 'Delta CO', 'Zeta Group',
                     'Epsilon Ltd', 'Zeta group', 'Gamma Inc'],
    'client_email': ['finance@acme.com', 'ap@beta.io', 'finance@acme.com', 'billing@gamma.co',
                      'ap@beta.io', None, 'finance@acme.com', 'pay@epsilon.com', 'billing@gamma.co',
                      'ap@beta.io', None, 'accounts@zeta.com', 'pay@epsilon.com', 'accounts@zeta.com',
                      'billing@gamma.co'],
    'amount': [1200, 800, 950, np.nan, 800, 400, 1500, 600, 700, np.nan, 400, 300, 600, 350, 900],
    'status': ['Paid', 'Paid', 'Overdue', 'Paid', 'Pending', 'Paid', 'Paid', 'Overdue',
               'Paid', 'Paid', 'Pending', 'Paid', 'Paid', 'Overdue', 'Pending'],
    'date_issued': pd.date_range('2026-01-01', periods=15, freq='9D')
}
df = pd.DataFrame(data)

# Collapse whitespace THEN title-case — title() alone won't fix double spaces
df['client_name'] = df['client_name'].str.replace(r'\s+', ' ', regex=True).str.strip().str.title()

# Fill missing amounts with each client's own median, not the global median
df['amount'] = df.groupby('client_name')['amount'].transform(lambda s: s.fillna(s.median()))
df['amount'] = df['amount'].fillna(df['amount'].median())

overdue = df[df['status'] == 'Overdue'].sort_values('amount', ascending=False)
print("Overdue invoices:\n", overdue[['client_name', 'amount', 'date_issued']].to_string(index=False))

client_summary = df.groupby('client_name').agg(
    total_billed=('amount', 'sum'),
    invoice_count=('invoice_id', 'count'),
    avg_invoice=('amount', 'mean')
).sort_values('total_billed', ascending=False)
print("\nClient summary:\n", client_summary.round(1))

print("\nStatus breakdown:\n", df['status'].value_counts())

df['email_domain'] = df['client_email'].str.extract(r'@([\w\.-]+)')
print("\nMissing emails by client:\n", df.loc[df.client_email.isna(), 'client_name'].tolist())
```

---

## Project 3: E-commerce Sales & Returns Dashboard

**Description:** Builds a sales analysis pipeline over orders + returns data — revenue by region/product, monthly trend, and return rate per product (a metric raw revenue numbers hide).

**Use case:** Closest analog to what a junior data analyst gets asked to do in week 1 of a real job. If a student can produce this pivot + trend + return-rate breakdown unprompted, that's a legitimate "I can do BI-lite work" signal for a resume.

**Concepts used:** `merge()`, `pivot_table()` with `fill_value`, `.dt` accessor + `to_period()`, `groupby()` with multiple aggregations, `value_counts()`

```python
import pandas as pd
import numpy as np

np.random.seed(7)

orders = pd.DataFrame({
    'order_id': range(1, 31),
    'customer_id': np.random.randint(1, 11, 30),
    'product': np.random.choice(['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headset'], 30),
    'region': np.random.choice(['North', 'South', 'East', 'West'], 30),
    'quantity': np.random.randint(1, 5, 30),
    'unit_price': np.random.choice([50, 100, 250, 500, 1200], 30),
    'order_date': pd.date_range('2026-01-01', periods=30, freq='3D')
})
orders['revenue'] = orders['quantity'] * orders['unit_price']

returns = pd.DataFrame({
    'order_id': [3, 7, 15, 22],
    'reason': ['Defective', 'Wrong Item', 'Defective', 'Changed Mind']
})

full = orders.merge(returns, on='order_id', how='left')
full['returned'] = full['reason'].notna()

region_summary = full.pivot_table(index='region', columns='product', values='revenue',
                                   aggfunc='sum', fill_value=0)
print("Revenue by region x product:\n", region_summary)

monthly = full.groupby(full['order_date'].dt.to_period('M'))['revenue'].sum()
print("\nMonthly revenue:\n", monthly)

top_products = full.groupby('product')['revenue'].sum().sort_values(ascending=False)
print("\nTop products by revenue:\n", top_products)

return_rate = full.groupby('product')['returned'].mean().mul(100).round(1)
print("\nReturn rate % by product:\n", return_rate)

print("\nOrder count by region:\n", full['region'].value_counts())
```

---

## Project 4: Titanic Wrangling Pipeline (Real Dataset)

**Description:** Pulls the actual Titanic dataset over HTTP and runs a real cleaning + feature-extraction pipeline — extract title from name via regex, fill missing ages by title-group median (not blanket median), bin fares, and answer a real analytical question (survival by class/sex).

**Use case:** This is the "prove you can handle a dataset you didn't create" project. Every data science interview eventually asks a Titanic-style question — this gets that rep in with your own explanation baked in instead of a copy-pasted Kaggle notebook. Directly matches your H10 practice problem — this is that problem solved end-to-end as reference.

**Concepts used:** `read_csv(url)`, `isna()`/`info()`, `.str.extract()` with regex, `groupby().transform()`, `pd.cut()`, `pivot_table()`, boolean masking

```python
import pandas as pd

url = 'https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv'
df = pd.read_csv(url)

print(df.info())
print("\nNull counts:\n", df.isna().sum())

# Extract title (Mr, Mrs, Miss, Master, etc.) from the Name column
df['Title'] = df['Name'].str.extract(r',\s*([A-Za-z]+)\.')
title_survival = df.groupby('Title')['Survived'].mean().sort_values(ascending=False)
print("\nSurvival rate by title:\n", (title_survival * 100).round(1))

# Fill missing Age with the median AGE FOR THAT TITLE GROUP, not the overall median
df['Age'] = df.groupby('Title')['Age'].transform(lambda s: s.fillna(s.median()))
df['Age'] = df['Age'].fillna(df['Age'].median())

df['Embarked'] = df['Embarked'].fillna(df['Embarked'].mode()[0])

df['FareBand'] = pd.cut(df['Fare'], bins=[-1, 10, 30, 100, 600],
                         labels=['Low', 'Mid', 'High', 'Luxury'])

survival_by_class_sex = df.pivot_table(index='Pclass', columns='Sex', values='Survived', aggfunc='mean')
print("\nSurvival rate by class and sex:\n", (survival_by_class_sex * 100).round(1))

women_children = df[(df['Age'] < 12) | (df['Sex'] == 'female')]
print("\nWomen & children survival rate:", round(women_children['Survived'].mean() * 100, 1))

clean_cols = ['PassengerId', 'Survived', 'Pclass', 'Title', 'Sex', 'Age', 'FareBand', 'Embarked']
clean = df[clean_cols]
print("\nCleaned sample:\n", clean.head())
print("\nRemaining nulls after cleaning:", clean.isna().sum().sum())
```

---

## Project 5: Attendance Tracker with Duplicate Detection

**Description:** Simulates 6 months of daily attendance for 8 students, injects duplicate/conflicting records (like a real system would produce from double form submissions), deduplicates, then flags students who dropped below 75% attendance in any single month.

**Use case:** Directly usable for school ops (TFES attendance) if adapted to real records. Also the best project for teaching a habit most bootcamp grads skip: **detect duplicates before you trust any aggregate**. Combines H8 (duplicate detection) and H7 (rolling monthly report) from your practice set into one pipeline.

**Concepts used:** `pd.date_range()`, `duplicated(subset=..., keep=False)`, `drop_duplicates(keep='last')`, `.dt.to_period('M')`, `groupby()` on two keys

```python
import pandas as pd
import numpy as np

np.random.seed(3)

students = [f'S{i}' for i in range(1, 9)]
dates = pd.date_range('2026-01-01', '2026-06-30', freq='D')

rows = []
for sid in students:
    base_rate = np.random.uniform(0.65, 0.98)
    for d in dates:
        rows.append({'student_id': sid, 'date': d, 'present': np.random.rand() < base_rate})
att = pd.DataFrame(rows)

# Inject duplicate/conflicting records — this happens in every real attendance system
dupes = att.sample(5, random_state=1).copy()
dupes['present'] = ~dupes['present']
att = pd.concat([att, dupes], ignore_index=True)

dup_mask = att.duplicated(subset=['student_id', 'date'], keep=False)
print(f"Duplicate rows found: {dup_mask.sum()}")

# Keep the most recent record per student/date
att = att.sort_values('date').drop_duplicates(subset=['student_id', 'date'], keep='last')

att['month'] = att['date'].dt.to_period('M')
monthly_pct = att.groupby(['student_id', 'month'])['present'].mean().mul(100).round(1)
monthly_pct = monthly_pct.reset_index(name='attendance_pct')

at_risk = monthly_pct[monthly_pct['attendance_pct'] < 75]
print("\nStudents below 75% in any month:")
print(at_risk.to_string(index=False))

overall = att.groupby('student_id')['present'].mean().mul(100).round(1).sort_values()
print("\nOverall attendance % (6 months):\n", overall)
```

---

## How to deploy these

- **Sequencing:** 1 → 3 → 5 use synthetic multi-table data (safe, no internet dependency, good for in-class live coding). 4 needs internet access — check your bootcamp venue's network before using it live.
- **Grading angle:** Don't grade on "does it run." Grade on whether they picked the right join type in P1/P3, whether they used group-relative fills in P2/P4 instead of a blanket median (this is the exact H10 hint you already wrote), and whether P5's dedup step actually ran before the aggregation.
- **Portfolio framing:** Tell students to rename these with their own domain spin (e.g., P2 → "Gym Membership Billing Tracker") before posting to GitHub — recruiters pattern-match on generic project names and discount them.
