# Task 2 — Quote Scraper & Analyzer (Web Scraping + OOP + Collections)

**Topics used:** Web Scraping (`requests` + `BeautifulSoup`, pagination) · OOP (custom class, `__repr__`, `__eq__`/`__hash__`) · Collections (`Counter`, `defaultdict`, `set`) · pandas (`to_csv`)

**Target site:** `https://quotes.toscrape.com` — the same practice sandbox site used in the web scraping deck. It's built for scraping practice, so no ethics concerns, but you'll still follow the checklist below like a professional would.

**Fallback file provided:** `quotes_fallback.csv` — 20 original practice quotes to work with **only if your lab has no internet access that day**. If you can reach the internet, scrape the live site — the fallback is a backup, not the main path.

---

## Learning Goal

Build a small end-to-end pipeline: scrape → model the data as objects → deduplicate & analyze with collections → export with pandas. This mirrors real scraping projects, where raw HTML becomes structured, de-duplicated, analyzable data.

---

## Step-by-Step Tasks

### Part A — Ethics & Setup
1. Before writing any code, open `https://quotes.toscrape.com/robots.txt` in your browser and confirm scraping is allowed.
2. Install/import `requests` and `bs4.BeautifulSoup`.
3. Fetch the homepage and confirm you get a `200` status code before parsing anything.

> 💡 **Hint:** `r = requests.get(url); print(r.status_code)`. If it's not 200, stop and debug your URL/connection before moving on — don't try to parse a failed response.

### Part B — Model the Data with OOP
4. Create a `Quote` class with three attributes: `text`, `author`, `tags` (a list of strings).
5. Give it a `__repr__` method so printing a `Quote` shows something readable, e.g. `Quote(author='Amara Voss', tags=3)`.
6. Give it `__eq__` and `__hash__` methods so two `Quote` objects with the same `text` and `author` are treated as equal — this is what will let you dedupe them with a Python `set` later.

> 💡 **Hint:** `__hash__` should return `hash((self.text, self.author))`. If you define `__eq__` without `__hash__`, Python makes the object unhashable and your `set` in Part D will crash — this is a very common mistake, watch for it.

### Part C — Scrape With Pagination
7. Write the extraction logic: for each quote block on a page, pull the quote text, author name, and list of tags, and create a `Quote` object from them.
8. Handle pagination: `quotes.toscrape.com` has a "Next →" button/link at the bottom of each page. Keep following it and scraping until there's no more "Next" link.
9. Add a `time.sleep(0.5)` between page requests — be a polite scraper, even on a practice site.
10. Collect every `Quote` object into one Python list, `all_quotes`.

> 💡 **Hint:** Quotes live inside `<div class="quote">` blocks. Inside each: text is in a `<span class="text">`, author in `<small class="author">`, and tags are each an `<a class="tag">`. The "Next" link is an `<li class="next"><a href="...">`. Build and test your extraction logic on **one page first** before wrapping it in a pagination loop.

### Part D — Analyze With Collections
11. Use a Python `set` (relying on the `__eq__`/`__hash__` you wrote) to remove any accidental duplicate `Quote` objects from `all_quotes`.
12. Use `collections.Counter` to count how many times each **tag** appears across every quote, and print the top 5 most common tags.
13. Use `collections.defaultdict(list)` to group quotes by author, so you can answer: "which author has the most quotes on this site?"

> 💡 **Hint:** For step 12, you'll need to flatten each quote's `tags` list into one big list of all tags before feeding it to `Counter` — a list comprehension with a nested loop does this in one line. For step 13, loop through `all_quotes` and do `author_map[quote.author].append(quote)`.

### Part E — Export
14. Convert your final (deduplicated) list of `Quote` objects into a pandas DataFrame with columns `text`, `author`, `tags` (join tags into a single `"tag1|tag2"` string per row for CSV-friendliness).
15. Export to `scraped_quotes.csv`.

> 💡 **Hint:** `"|".join(quote.tags)` turns a list into one clean string cell. Build a list of dicts first (`[{"text": q.text, ...} for q in all_quotes]`), then `pd.DataFrame(that_list)` — much cleaner than building the DataFrame column-by-column.

---

## Fallback Mode (no internet)
If you can't reach the live site, load `quotes_fallback.csv` with pandas instead of scraping, convert each row into a `Quote` object, and do Parts B, D, and E exactly as above (skip Part C's pagination logic, or simulate it by chunking the CSV into "pages" of 5 rows if your instructor wants pagination practice anyway).

## Bonus Challenge (optional)
- Build a `QuoteCollection` class that *wraps* your list of `Quote` objects and exposes methods like `.filter_by_author(name)` and `.top_tags(n)` — this pushes the Counter/defaultdict logic behind a clean OOP interface instead of loose functions.
- What happens if you scrape the same site twice in a row and merge both runs into one `set`? Confirm your dedup logic actually catches the repeats.

## Submission Checklist
- [ ] `Quote` class with `__repr__`, `__eq__`, `__hash__`
- [ ] Full site scraped (or fallback CSV used) with pagination handled
- [ ] Top 5 tags and top author printed
- [ ] `scraped_quotes.csv` exported
