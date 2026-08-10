# Python Collections — The Complete Grip Guide
### Lists · `map()` · Dictionaries · Tuples

> **How to use this guide:** For each topic — read the concept, run every code block yourself, then solve the 5 problems **before** opening the solutions. You have a grip on a topic when you can solve problem 4 without looking anything up.

> **⚠️ Note for MERN students:** JavaScript has a `Map` *data type*. Python does **not**. In Python, the equivalent of a JS `Map`/object is the **dictionary**. Python's `map()` is a *function* that transforms data. Both are covered below — don't mix them up.

---

## Table of Contents
1. [Lists](#1-lists)
2. [The `map()` Function](#2-the-map-function)
3. [Dictionaries](#3-dictionaries)
4. [Tuples](#4-tuples)
5. [Quick Comparison Cheat Sheet](#5-quick-comparison-cheat-sheet)

---

# 1. Lists

## What is a List?

A **list** is an ordered, changeable collection that can hold any type of items. Think of it as a **train**: coaches connected in a fixed order, and you can add, remove, or swap coaches anytime.

```python
marks = [85, 92, 78, 90]          # a list of ints
mixed = ["Ali", 21, 3.4, True]    # types can be mixed
empty = []                        # an empty list
```

Three properties to memorize:

| Property | Meaning |
|---|---|
| **Ordered** | Items keep their position — index `0` is always first |
| **Mutable** | You can change, add, remove items after creation |
| **Allows duplicates** | `[1, 1, 2]` is perfectly valid |

## Real-World Use Case

A **cart in an e-commerce app**: items get added in order, removed when the user changes their mind, and the same product can appear twice. Order matters (first added, first shown), contents change constantly → a list is the natural fit.

```python
cart = []
cart.append("iPhone 15")      # user adds a phone
cart.append("AirPods")        # then earbuds
cart.append("AirPods")        # gifts one to a friend - duplicate is fine
cart.remove("iPhone 15")      # changed their mind
print(cart)                   # ['AirPods', 'AirPods']
```

## Why is it Important?

- It is the **default container** in Python — loops, function returns, API responses (JSON arrays) all land in lists.
- Almost every real dataset is "a sequence of things": rows from a database, lines from a file, messages in a chat.
- Mastering list **indexing and slicing** is the foundation for strings, tuples, and NumPy arrays later — same syntax everywhere.

## Essential Functions & Methods

```python
nums = [10, 20, 30]

# --- ADDING ---
nums.append(40)          # add ONE item at the end        -> [10, 20, 30, 40]
nums.insert(1, 15)       # add at a specific index        -> [10, 15, 20, 30, 40]
nums.extend([50, 60])    # add MANY items at the end      -> [10, 15, 20, 30, 40, 50, 60]

# --- REMOVING ---
nums.remove(15)          # remove by VALUE (first match)
last = nums.pop()        # remove & RETURN the last item  -> last = 60
first = nums.pop(0)      # remove & RETURN by index       -> first = 10
# nums.clear()           # empty the whole list

# --- SEARCHING ---
nums.index(30)           # position of a value            -> 1
nums.count(20)           # how many times it appears      -> 1
30 in nums               # membership check               -> True

# --- ORDERING ---
nums.sort()              # sort IN PLACE (changes nums)
nums.sort(reverse=True)  # descending
nums.reverse()           # flip the order
sorted_copy = sorted(nums)   # returns a NEW sorted list, original untouched

# --- SIZE & SLICING ---
len(nums)                # how many items
nums[0]                  # first item
nums[-1]                 # last item
nums[1:3]                # slice: index 1 up to (not including) 3
nums[::-1]               # a REVERSED COPY (slicing trick)
```

**`sort()` vs `sorted()` — a classic interview question:**

```python
a = [3, 1, 2]
a.sort()          # changes a itself, returns None
b = sorted(a)     # returns a new list, a stays as it is
```

## Worked Example

```python
# Task: given student marks, drop the lowest, then show the average.
marks = [85, 42, 92, 78, 90]

marks.sort()                    # [42, 78, 85, 90, 92]
lowest = marks.pop(0)           # removes 42
average = sum(marks) / len(marks)

print(f"Dropped: {lowest}")     # Dropped: 42
print(f"Average: {average}")    # Average: 86.25
```

## 🏋️ 5 Problems — Basic to Advanced

**Problem 1 (Basic):** Create a list of your 5 favorite foods. Print the first, the last, and the total count — without hardcoding index numbers for the last item.

**Problem 2 (Basic+):** Given `nums = [4, 9, 1, 9, 7, 9]`, find the largest number **without** using `max()`, and count how many times it appears.

**Problem 3 (Intermediate):** Remove duplicates from `[1, 3, 2, 3, 1, 5, 2]` **while keeping the original order**. Expected output: `[1, 3, 2, 5]`. (Hint: `set()` alone destroys order.)

**Problem 4 (Intermediate+):** Find the **second largest** number in `[10, 45, 22, 45, 8]` — handle the duplicate 45 correctly. Expected output: `22`.

**Problem 5 (Advanced):** Rotate a list to the right by `k` steps. For `[1, 2, 3, 4, 5]` and `k = 2`, expected output: `[4, 5, 1, 2, 3]`. Your solution must also work when `k` is bigger than the list length (e.g. `k = 7` gives the same answer as `k = 2`).

<details>
<summary>✅ Solutions — open only after trying!</summary>

```python
# --- Problem 1 ---
foods = ["biryani", "karahi", "nihari", "pulao", "haleem"]
print(foods[0])       # first
print(foods[-1])      # last - negative index, no hardcoding
print(len(foods))     # count

# --- Problem 2 ---
nums = [4, 9, 1, 9, 7, 9]
largest = nums[0]
for n in nums:              # manual max
    if n > largest:
        largest = n
print(largest)              # 9
print(nums.count(largest))  # 3

# --- Problem 3 ---
items = [1, 3, 2, 3, 1, 5, 2]
unique = []
for x in items:
    if x not in unique:     # only add first appearance
        unique.append(x)
print(unique)               # [1, 3, 2, 5]

# --- Problem 4 ---
nums = [10, 45, 22, 45, 8]
unique = list(set(nums))    # duplicates gone: order not needed here
unique.sort(reverse=True)   # [45, 22, 10, 8]
print(unique[1])            # 22

# --- Problem 5 ---
def rotate(lst, k):
    k = k % len(lst)             # k=7 on length 5 behaves like k=2
    return lst[-k:] + lst[:-k]   # last k items move to the front

print(rotate([1, 2, 3, 4, 5], 2))  # [4, 5, 1, 2, 3]
print(rotate([1, 2, 3, 4, 5], 7))  # [4, 5, 1, 2, 3]
```
</details>

---

# 2. The `map()` Function

## What is `map()`?

`map()` is a built-in function that **applies one function to every item** of a list (or any iterable) and gives back the transformed results. It does *not* store data — it transforms data.

Think of it as a **factory conveyor belt**: raw items go in one end, a machine (your function) processes each one, finished items come out the other end. The belt itself holds nothing.

```python
map(function, iterable)     # the general form
```

> **JS comparison:** Python's `map()` ≈ JavaScript's `array.map()`. Python's *dictionary* ≈ JavaScript's `Map` type. Same word, two totally different things.

## Real-World Use Case

**Cleaning API/form data.** A signup form sends you raw strings — extra spaces, wrong casing, numbers as text. `map()` cleans the entire batch in one line per transformation:

```python
raw_ages = ["21", "34", "18"]           # form data always arrives as strings
ages = list(map(int, raw_ages))         # [21, 34, 18] - real numbers now

raw_names = ["  ali KHAN ", "sara raza  "]
names = list(map(str.strip, raw_names))     # spaces gone
names = list(map(str.title, names))         # ['Ali Khan', 'Sara Raza']
```

## Why is it Important?

- **One-line batch transformation** — replaces a 4-line `for` loop for the "same operation on every item" pattern.
- It's your entry into **functional thinking** (passing functions as arguments) — the same mental model behind React's `array.map()` for rendering lists, and behind pandas/Spark later.
- `map()` is **lazy**: it computes items only when needed, which saves memory on big datasets.

## Essential Ways to Use It

```python
# 1. With a NAMED function
def square(n):
    return n * n
print(list(map(square, [1, 2, 3])))        # [1, 4, 9]

# 2. With a LAMBDA (a one-line, no-name function)
print(list(map(lambda n: n * n, [1, 2, 3])))   # [1, 4, 9]

# 3. With a BUILT-IN function
print(list(map(len, ["hi", "hello", "hey"])))  # [2, 5, 3]

# 4. With TWO lists at once (pairs items up)
a = [1, 2, 3]
b = [10, 20, 30]
print(list(map(lambda x, y: x + y, a, b)))     # [11, 22, 33]

# 5. IMPORTANT: map() returns a map OBJECT, not a list
result = map(int, ["1", "2"])
print(result)          # <map object at 0x...>  <- not the data!
print(list(result))    # [1, 2]                 <- wrap in list() to see it
```

**`map()` vs list comprehension** — both are correct; Python developers often prefer comprehensions for readability:

```python
nums = [1, 2, 3]
doubled_m = list(map(lambda n: n * 2, nums))   # map style
doubled_c = [n * 2 for n in nums]              # comprehension style - same result
```

Rule of thumb: an existing function to apply (`int`, `str.strip`, `len`) → `map()` reads beautifully. A custom expression → comprehension reads better.

## Worked Example

```python
# Task: convert Celsius readings to Fahrenheit, formatted for display.
celsius = [0, 25, 37, 100]

fahrenheit = list(map(lambda c: (c * 9/5) + 32, celsius))
print(fahrenheit)                      # [32.0, 77.0, 98.6, 212.0]

labels = list(map(lambda f: f"{f}°F", fahrenheit))
print(labels)                          # ['32.0°F', '77.0°F', '98.6°F', '212.0°F']
```

## 🏋️ 5 Problems — Basic to Advanced

**Problem 1 (Basic):** Use `map()` to convert `["10", "20", "30"]` into actual integers, then print their sum. Expected output: `60`.

**Problem 2 (Basic+):** Use `map()` with a lambda to get the cube of every number in `[1, 2, 3, 4]`. Expected output: `[1, 8, 27, 64]`.

**Problem 3 (Intermediate):** Given `names = ["ali", "sara", "usman"]`, use `map()` to produce `["ALI (3)", "SARA (4)", "USMAN (5)"]` — uppercase name plus its length.

**Problem 4 (Intermediate+):** Two lists: `prices = [100, 250, 80]` and `quantities = [2, 1, 5]`. Use a single `map()` over both lists to get the bill per item: `[200, 250, 400]`. Then compute the grand total: `850`.

**Problem 5 (Advanced):** You receive `raw = ["  92 ", "45", " 78", "88 "]` (marks as messy strings). Build a pipeline that (a) strips spaces, (b) converts to int, (c) converts each mark to a grade — `"Pass"` if ≥ 50 else `"Fail"` — using `map()` at every step. Expected output: `['Pass', 'Fail', 'Pass', 'Pass']`.

<details>
<summary>✅ Solutions — open only after trying!</summary>

```python
# --- Problem 1 ---
nums = list(map(int, ["10", "20", "30"]))
print(sum(nums))                            # 60

# --- Problem 2 ---
print(list(map(lambda n: n ** 3, [1, 2, 3, 4])))   # [1, 8, 27, 64]

# --- Problem 3 ---
names = ["ali", "sara", "usman"]
result = list(map(lambda n: f"{n.upper()} ({len(n)})", names))
print(result)                               # ['ALI (3)', 'SARA (4)', 'USMAN (5)']

# --- Problem 4 ---
prices = [100, 250, 80]
quantities = [2, 1, 5]
bill = list(map(lambda p, q: p * q, prices, quantities))
print(bill)                                 # [200, 250, 400]
print(sum(bill))                            # 850

# --- Problem 5 ---
raw = ["  92 ", "45", " 78", "88 "]
cleaned = map(str.strip, raw)               # step a: no list() needed mid-pipeline
marks   = map(int, cleaned)                 # step b: chain map on map
grades  = map(lambda m: "Pass" if m >= 50 else "Fail", marks)   # step c
print(list(grades))                         # ['Pass', 'Fail', 'Pass', 'Pass']
```
</details>

---

# 3. Dictionaries

## What is a Dictionary?

A **dictionary (`dict`)** stores data as **key → value pairs**. Instead of asking "what's at position 3?" (lists), you ask "what's the value for *this key*?"

Think of your **phone contacts**: you never scroll to "contact number 47" — you search by *name* (the key) and instantly get the *number* (the value).

```python
student = {
    "name": "Ali",
    "gpa": 3.4,
    "city": "Lahore",
}
print(student["name"])      # Ali  <- access by KEY, not position
```

| Property | Meaning |
|---|---|
| **Key → Value** | Every entry is a pair; keys must be unique |
| **Mutable** | Add, change, delete pairs anytime |
| **Fast lookup** | Finding by key is nearly instant, even with millions of entries |
| **Keys must be immutable** | Strings, numbers, tuples ✔ — lists ✘ |

> **JS comparison:** a Python `dict` is what you know as an object literal `{}` or a `Map` in JavaScript. JSON objects convert directly into Python dicts.

## Real-World Use Case

**Every API response you will ever handle.** A user record from a backend is naturally key → value:

```python
user = {
    "id": 501,
    "username": "mati_dev",
    "is_active": True,
    "skills": ["Python", "React"],     # values can be ANY type - even lists
}

print(user["username"])                     # mati_dev
user["is_active"] = False                   # update a value
user["last_login"] = "2026-07-09"           # add a brand-new key
```

## Why is it Important?

- **Speed:** checking `x in my_list` scans every item; `x in my_dict` jumps straight to the answer. On 1 million records this is the difference between seconds and microseconds.
- **It models real data:** users, configs, JSON, database rows — all key → value.
- **Counting and grouping** — two of the most common programming tasks — are one-liners with dicts.

## Essential Functions & Methods

```python
person = {"name": "Sara", "age": 24}

# --- READING ---
person["name"]               # 'Sara' - but CRASHES (KeyError) if key missing
person.get("email")          # None - SAFE: no crash if key missing
person.get("email", "N/A")   # 'N/A' - safe with a default value

# --- WRITING ---
person["age"] = 25           # update existing key
person["city"] = "Lahore"    # add new key (same syntax!)
person.update({"age": 26, "job": "dev"})   # bulk update/add

# --- REMOVING ---
person.pop("job")            # remove a key & return its value
del person["city"]           # remove a key, return nothing

# --- LOOPING (memorize these three) ---
for key in person.keys():            print(key)
for value in person.values():        print(value)
for key, value in person.items():    print(key, "->", value)

# --- CHECKING ---
"name" in person             # True - checks KEYS, not values
len(person)                  # number of pairs

# --- DICT COMPREHENSION ---
squares = {n: n * n for n in range(1, 4)}   # {1: 1, 2: 4, 3: 9}
```

**`[]` vs `.get()` — burn this into memory:**

```python
scores = {"ali": 90}
scores["sara"]          # ❌ KeyError - program crashes
scores.get("sara")      # ✔ returns None - program survives
scores.get("sara", 0)   # ✔ returns 0 - perfect for counters
```

## Worked Example

```python
# Task: count how many times each word appears in a sentence.
sentence = "the cat sat on the mat the end"

counts = {}
for word in sentence.split():
    counts[word] = counts.get(word, 0) + 1   # get(word, 0): start at 0 if new

print(counts)
# {'the': 3, 'cat': 1, 'sat': 1, 'on': 1, 'mat': 1, 'end': 1}
```

That `get(key, 0) + 1` pattern is *the* counting idiom — you'll use it for the rest of your career.

## 🏋️ 5 Problems — Basic to Advanced

**Problem 1 (Basic):** Build a dict for a mobile phone (`brand`, `model`, `price`). Print the model using square brackets, then try printing `"color"` with `.get()` and a default of `"Unknown"` — no crashes allowed.

**Problem 2 (Basic+):** Given `prices = {"apple": 200, "banana": 90, "mango": 350}` — increase every price by 10% (rounded to 2 decimals) and print the updated dict. Expected: `{'apple': 220.0, 'banana': 99.0, 'mango': 385.0}`. (Try it *without* rounding first and observe Python's float weirdness: `220.00000000000003`!)

**Problem 3 (Intermediate):** Count the frequency of each **character** in the string `"programming"` (use the counting idiom). Expected output includes `'r': 2, 'g': 2, 'm': 2`.

**Problem 4 (Intermediate+):** **Invert** a dictionary: turn `{"ali": 1, "sara": 2, "usman": 3}` into `{1: "ali", 2: "sara", 3: "usman"}` using a loop or a dict comprehension.

**Problem 5 (Advanced):** You have a nested gradebook:
```python
gradebook = {
    "ali":   {"math": 85, "english": 78},
    "sara":  {"math": 92, "english": 88},
    "usman": {"math": 70, "english": 95},
}
```
(a) Print each student's **average**. (b) Find the student with the **highest average**. Expected: Sara with 90.0.

<details>
<summary>✅ Solutions — open only after trying!</summary>

```python
# --- Problem 1 ---
phone = {"brand": "Samsung", "model": "S24", "price": 250000}
print(phone["model"])                    # S24
print(phone.get("color", "Unknown"))     # Unknown - no crash

# --- Problem 2 ---
prices = {"apple": 200, "banana": 90, "mango": 350}
for fruit in prices:
    prices[fruit] = round(prices[fruit] * 1.1, 2)   # round(): raw floats print 220.00000000000003
print(prices)   # {'apple': 220.0, 'banana': 99.0, 'mango': 385.0}
# one-liner version:
# prices = {f: round(p * 1.1, 2) for f, p in prices.items()}

# --- Problem 3 ---
counts = {}
for ch in "programming":
    counts[ch] = counts.get(ch, 0) + 1
print(counts)
# {'p': 1, 'r': 2, 'o': 1, 'g': 2, 'a': 1, 'm': 2, 'i': 1, 'n': 1}

# --- Problem 4 ---
original = {"ali": 1, "sara": 2, "usman": 3}
inverted = {value: key for key, value in original.items()}
print(inverted)   # {1: 'ali', 2: 'sara', 3: 'usman'}

# --- Problem 5 ---
gradebook = {
    "ali":   {"math": 85, "english": 78},
    "sara":  {"math": 92, "english": 88},
    "usman": {"math": 70, "english": 95},
}

best_student, best_avg = None, 0
for student, subjects in gradebook.items():
    avg = sum(subjects.values()) / len(subjects)
    print(f"{student}: {avg}")
    if avg > best_avg:
        best_student, best_avg = student, avg

print(f"Topper: {best_student} with {best_avg}")   # Topper: sara with 90.0
```
</details>

---

# 4. Tuples

## What is a Tuple?

A **tuple** is an ordered collection that **cannot be changed** after creation. It's a list with the doors welded shut.

Think of **GPS coordinates**: `(31.5204, 74.3587)` is Lahore. You'd never want code to accidentally change the latitude — the pair belongs together, permanently.

```python
point = (31.5204, 74.3587)     # parentheses instead of brackets
rgb = (255, 165, 0)            # orange color - fixed forever
single = (5,)                  # ⚠️ one-item tuple NEEDS the comma
not_a_tuple = (5)              # this is just the number 5!
```

| Property | Meaning |
|---|---|
| **Ordered** | Positions are fixed, indexing works like lists |
| **Immutable** | No append, no remove, no item assignment — ever |
| **Faster & lighter** | Less memory than a list; Python can optimize them |
| **Hashable** | Can be used as **dictionary keys** (lists cannot!) |

```python
point = (3, 4)
point[0] = 99      # ❌ TypeError: 'tuple' object does not support item assignment
```

## Real-World Use Case

**Data that must not change + returning multiple values from a function:**

```python
# 1. Fixed records - a database row
row = (501, "Ali Khan", "ali@mail.com")   # id, name, email - protect it

# 2. Functions returning MULTIPLE values (secretly a tuple!)
def min_max(nums):
    return min(nums), max(nums)     # packs into a tuple automatically

low, high = min_max([4, 9, 1, 7])   # unpacks into two variables
print(low, high)                    # 1 9

# 3. Tuples as dictionary keys - impossible with lists
chess_board = {}
chess_board[(0, 0)] = "Rook"
chess_board[(0, 1)] = "Knight"
print(chess_board[(0, 0)])          # Rook
```

## Why is it Important?

- **Safety:** immutable data can't be corrupted by a buggy function three files away. If it shouldn't change, make it a tuple — the bug becomes a crash you see instead of silent wrong data.
- **Multiple return values** — `return a, b` — is everywhere in real Python code, and it's pure tuples.
- **Dict keys:** coordinates, (row, col), (year, month) — composite keys require tuples.

## Essential Functions & Techniques

```python
t = (10, 20, 30, 20)

# --- The ONLY two methods ---
t.count(20)        # 2 - how many times a value appears
t.index(30)        # 2 - position of first occurrence

# --- Everything read-only from lists still works ---
len(t)             # 4
t[0]               # 10
t[-1]              # 20
t[1:3]             # (20, 30) - slicing gives a new tuple
20 in t            # True

# --- PACKING & UNPACKING (the tuple superpower) ---
person = "Ali", 21, "Lahore"      # packing: parentheses optional
name, age, city = person          # unpacking: variables must match count
print(name, age, city)            # Ali 21 Lahore

a, b = 5, 10
a, b = b, a                       # the famous Python swap - no temp variable!
print(a, b)                       # 10 5

first, *rest = (1, 2, 3, 4)       # star grabs the leftovers as a LIST
print(first, rest)                # 1 [2, 3, 4]

# --- CONVERSION ---
list((1, 2, 3))    # [1, 2, 3]  tuple -> list (to edit it)
tuple([1, 2, 3])   # (1, 2, 3)  list -> tuple (to lock it)
```

Only **two** methods — that's the point. A tuple is a list with the "edit" features removed on purpose.

## Worked Example

```python
# Task: loop over products with index numbers, using tuple unpacking.
products = [("Laptop", 1200), ("Mouse", 25), ("Monitor", 300)]

for index, (name, price) in enumerate(products, start=1):
    print(f"{index}. {name} — ${price}")

# 1. Laptop — $1200
# 2. Mouse — $25
# 3. Monitor — $300
```

`enumerate` hands you `(index, item)` tuples; each item is itself a `(name, price)` tuple — unpacked in one clean line.

## 🏋️ 5 Problems — Basic to Advanced

**Problem 1 (Basic):** Create a tuple of the 5 weekdays. Print the first and last day, print its length, and prove immutability: try changing index 0 inside a `try/except` and print a friendly message instead of crashing.

**Problem 2 (Basic+):** Swap three variables in one line: `a, b, c = 1, 2, 3` must become `a=3, b=1, c=2` — no temporary variables.

**Problem 3 (Intermediate):** Write a function `stats(numbers)` that returns the minimum, maximum, and average of a list **as a tuple**. Unpack the result into three variables and print them. Test with `[4, 9, 1, 7]` → min `1`, max `9`, avg `5.25`.

**Problem 4 (Intermediate+):** Given `students = [("Ali", 85), ("Sara", 92), ("Usman", 78)]`, sort the list **by marks (highest first)** and print each student on its own line. (Hint: `sorted()` with a `key` lambda that picks index 1.)

**Problem 5 (Advanced):** A delivery app logs rider positions as `(x, y)` tuples: `path = [(0, 0), (1, 2), (1, 2), (3, 4), (0, 0), (1, 2)]`. Using a dictionary with **tuples as keys**, count how many times each position was visited, then print the most-visited position. Expected: `(1, 2)` visited `3` times.

<details>
<summary>✅ Solutions — open only after trying!</summary>

```python
# --- Problem 1 ---
days = ("Mon", "Tue", "Wed", "Thu", "Fri")
print(days[0], days[-1], len(days))     # Mon Fri 5
try:
    days[0] = "Sunday"
except TypeError:
    print("Tuples cannot be changed - that's the whole point!")

# --- Problem 2 ---
a, b, c = 1, 2, 3
a, b, c = c, a, b        # right side packs (3, 1, 2), left side unpacks
print(a, b, c)           # 3 1 2

# --- Problem 3 ---
def stats(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

low, high, avg = stats([4, 9, 1, 7])    # unpacking the returned tuple
print(low, high, avg)                   # 1 9 5.25

# --- Problem 4 ---
students = [("Ali", 85), ("Sara", 92), ("Usman", 78)]
ranked = sorted(students, key=lambda s: s[1], reverse=True)
for name, marks in ranked:              # unpack inside the loop
    print(f"{name}: {marks}")
# Sara: 92 / Ali: 85 / Usman: 78

# --- Problem 5 ---
path = [(0, 0), (1, 2), (1, 2), (3, 4), (0, 0), (1, 2)]
visits = {}
for pos in path:                        # pos is a tuple -> valid dict key
    visits[pos] = visits.get(pos, 0) + 1

top = max(visits, key=visits.get)       # key with the highest count
print(f"{top} visited {visits[top]} times")   # (1, 2) visited 3 times
```
</details>

---

# 5. Quick Comparison Cheat Sheet

| | **List** | **Dictionary** | **Tuple** |
|---|---|---|---|
| Syntax | `[1, 2, 3]` | `{"a": 1}` | `(1, 2, 3)` |
| Ordered? | ✔ | ✔ (insertion order) | ✔ |
| Changeable? | ✔ mutable | ✔ mutable | ✘ immutable |
| Duplicates? | ✔ | keys ✘ / values ✔ | ✔ |
| Access by | index `lst[0]` | key `d["name"]` | index `t[0]` |
| Best for | ordered sequences that change | labeled data, fast lookup, counting | fixed records, multiple returns, dict keys |
| JS equivalent | `Array` | `Object` / `Map` | `Object.freeze([...])` (roughly) |

**`map()` in one line:** `list(map(func, data))` — apply `func` to every item; it's a transformer, not a container.

### Choosing in 3 questions
1. **Does my data have labels?** → Dictionary
2. **Should it never change?** → Tuple
3. **Otherwise** → List. And when you need to transform any of them item-by-item → `map()` or a comprehension.

---

*Week 2 supplement — TFES Python Bootcamp. Solve all 20 problems before the next class; we'll build on dicts and tuples heavily in the Library project.*
