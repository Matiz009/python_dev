# Task 3 — Lahore City Explorer (pandas + Folium)

**Topics used:** pandas (groupby, filtering, sorting) · Folium (Map, Marker, CircleMarker, HeatMap, FeatureGroup / LayerControl, PolyLine)

**File provided:** `lahore_places.csv` — 20 real Lahore landmarks with category, coordinates, average visitor rating, and estimated daily footfall.

---

## Learning Goal

Turn a plain CSV of places into an interactive, explorable map — the same core skill behind store-locator pages, delivery-zone dashboards, and tourism apps.

---

## Step-by-Step Tasks

### Part A — Load & Explore (pandas)
1. Load `lahore_places.csv` into a DataFrame and inspect it with `.head()` and `.info()`.
2. Use `groupby("category")` to find the average `avg_rating` and total `daily_footfall` per category. Which category draws the most foot traffic overall?
3. Sort the DataFrame by `daily_footfall` descending — which single place gets the most visitors?

> 💡 **Hint:** `df.groupby("category")[["avg_rating","daily_footfall"]].agg({"avg_rating":"mean","daily_footfall":"sum"})` gets both in one call.

### Part B — Base Map (Folium)
4. Create a `folium.Map` centered roughly on Lahore (~`31.53, 74.34`) with a reasonable starting zoom level.
5. Loop through every row of the DataFrame and add a `folium.Marker` for each place, with a popup showing the name, category, and rating.

> 💡 **Hint:** `folium.Marker(location=[row.lat, row.lon], popup=f"{row['name']} — {row.avg_rating}★").add_to(m)`. Iterate rows with `df.itertuples()` or `df.iterrows()` — either is fine here.

### Part C — Color-Code by Category
6. Build a Python dictionary mapping each unique `category` to a distinct color (e.g. `"Heritage": "darkred"`, `"Shopping": "blue"`, `"Park": "green"`, ...).
7. Replace your plain markers from Part B with `folium.CircleMarker`s colored according to this dictionary, so categories are visually distinguishable at a glance.

> 💡 **Hint:** `df["category"].unique()` tells you exactly which categories you need to assign colors to — don't hardcode a guess, check the real column values.

### Part D — Size by Footfall
8. Scale each `CircleMarker`'s `radius` proportionally to that place's `daily_footfall`, so busier locations appear visibly bigger on the map. Pick a divisor that keeps circles readable (not tiny dots, not overlapping blobs).

> 💡 **Hint:** Something like `radius = row.daily_footfall / 1500` is a reasonable starting scale for this dataset — adjust until it looks right, there's no single correct number.

### Part E — Heatmap Layer
9. Import `HeatMap` from `folium.plugins` and add a heatmap layer using `[lat, lon, daily_footfall]` as the weighted points, so you can see footfall density across the city at a glance, separately from the individual markers.

> 💡 **Hint:** `from folium.plugins import HeatMap` then `HeatMap(df[["lat","lon","daily_footfall"]].values.tolist()).add_to(m)`.

### Part F — Toggleable Layers
10. Instead of adding every CircleMarker straight to the map, put each category's markers into its own `folium.FeatureGroup`, add those groups to the map, and finish with `folium.LayerControl()` so a user can toggle categories (e.g. hide "Shopping", show only "Heritage") on the live map.

> 💡 **Hint:** Create one `FeatureGroup` per unique category *before* your marker loop, add each marker to `groups[row.category]` instead of `m` directly, then `.add_to(m)` every group at the end, followed by `folium.LayerControl().add_to(m)`.

### Part G — Save
11. Save your finished map to `lahore_map.html` and open it in a browser to confirm everything renders and the layer toggle works.

---

## Bonus Challenge (optional)
- Add a `folium.PolyLine` tracing a simple walking route between 3–4 nearby heritage sites (e.g. Badshahi Mosque → Lahore Fort → Data Darbar), and print the straight-line distance between consecutive stops using coordinates (no need for real road routing — this is a nod to the shortest-path idea from graph/routing problems, just simplified).
- Filter the map to only show places with `avg_rating >= 4.5` — a "must-visit only" view.

## Submission Checklist
- [ ] `lahore_map.html` produced and opens correctly
- [ ] Markers color-coded by category, sized by footfall
- [ ] Heatmap layer present
- [ ] Layer control toggles categories on/off
