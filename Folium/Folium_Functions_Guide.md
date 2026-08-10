# Folium Reference Guide — Functions, Use Cases & Practice Tasks

A practical, implementation-first reference. Every function below has: what it does, when you'd actually reach for it, why it matters, a working code snippet, and a practice task. Work through it top to bottom and you'll have rebuilt (and extended) a full geo-visualization pipeline by the end.

**Setup (run once):**
```bash
pip install folium pandas geopandas
```
```python
import folium
from folium import plugins
import pandas as pd
```

---

## Table of Contents
1. [Map Initialization](#1-map-initialization)
2. [Markers & Points](#2-markers--points)
3. [Info Display (Popups, Tooltips, Icons)](#3-info-display-popups-tooltips-icons)
4. [Layers & Overlays](#4-layers--overlays)
5. [Plugins](#5-plugins-foliumplugins)
6. [Vector Drawing](#6-vector-drawing)
7. [Export & Interaction Utilities](#7-export--interaction-utilities)
8. [Progressive Practice Roadmap](#8-progressive-practice-roadmap)

---

## 1. Map Initialization

### `folium.Map()`
**Description:** Creates the base map object — the canvas everything else gets added to.

**Use Case:** Every single Folium project starts here. You use it to set the starting view (location, zoom) and pick the basemap style (streets, terrain, satellite-like, minimal).

**Importance:** This is your first impression. `tiles` alone changes whether a map looks like a student project or a client deliverable. Getting `location` and `zoom_start` wrong means users land on the wrong part of the world and have to manually navigate — bad UX.

```python
m = folium.Map(
    location=[30.3753, 69.3451],   # Pakistan centroid [lat, lon]
    zoom_start=6,
    tiles="CartoDB positron"        # try: "OpenStreetMap", "Stamen Terrain", "CartoDB dark_matter"
)
m.save("base_map.html")
```

**Practice Task:** Create four maps of the same city using four different `tiles` values. Compare which is most readable for a dark-themed dashboard vs. a printed report.

---

## 2. Markers & Points

### `folium.Marker()`
**Description:** Drops a single pin at a lat/long coordinate, optionally with a popup and custom icon.

**Use Case:** Plotting discrete locations — a store's branches, event venues, individual case reports. Your COVID assignment used this for each city.

**Importance:** It's the most basic building block of point-based geo-viz, but it doesn't scale — past ~20-30 points the map gets cluttered and unreadable. Know it well, then know when to replace it.

```python
folium.Marker(
    location=[31.5204, 74.3587],   # Lahore
    popup="Lahore: 12,450 cases",
    tooltip="Click for details",
    icon=folium.Icon(color="red", icon="info-sign")
).add_to(m)
```

**Practice Task:** Loop through your cities dataframe and add a `Marker` for every row. Then count how many markers you have — if it's over 25, that's your cue for Task 3 below (MarkerCluster).

---  

### `folium.CircleMarker()`
**Description:** A circular marker whose **radius** and **color** you control directly — unlike `Marker`, it can visually encode a numeric value.

**Use Case:** Any time the *size* of the point should mean something — case count, revenue, population, magnitude. This is the direct upgrade from flat pins.

**Importance:** This is what separates "I plotted some points" from "I visualized data." A map where bigger circles = more cases communicates a number instantly, without anyone reading a popup.

```python
folium.CircleMarker(
    location=[24.8607, 67.0011],   # Karachi
    radius=min(cases / 500, 30),   # scale radius by case count, cap it
    color="crimson",
    fill=True,
    fill_opacity=0.6,
    popup=f"Karachi: {cases} cases"
).add_to(m)
```

**Practice Task:** Replace every `Marker` in your assignment with a `CircleMarker` where radius is proportional to case count. Cap the radius so one outlier city doesn't dwarf the whole map.

---

## 3. Info Display (Popups, Tooltips, Icons)

### `folium.Popup()`
**Description:** The click-to-open info box attached to a marker. Accepts raw text or HTML.

**Use Case:** Showing detailed info (multiple stats, a mini table, an image) without cluttering the map itself.

**Importance:** Most students pass a plain string. Passing HTML instead turns a popup into a mini dashboard card — this is a 10-minute change that massively increases perceived polish.

```python
html = """
<table style='font-size:13px'>
  <tr><td><b>City:</b></td><td>Lahore</td></tr>
  <tr><td><b>Cases:</b></td><td>12,450</td></tr>
  <tr><td><b>Deaths:</b></td><td>210</td></tr>
</table>
"""
folium.Marker(
    location=[31.5204, 74.3587],
    popup=folium.Popup(html, max_width=250)
).add_to(m)
```

**Practice Task:** Rebuild every popup in your assignment as an HTML table showing cases, deaths, and recovery rate for that city.

---

### `folium.Tooltip()`
**Description:** A hover-triggered label — shows on mouseover, no click required.

**Use Case:** Quick-glance context (e.g., city name) before a user commits to clicking for the full popup.

**Importance:** Reduces friction. Popups require a click; tooltips are instant. Best practice is tooltip = short label, popup = full detail.

```python
folium.Marker(
    location=[31.5204, 74.3587],
    tooltip="Lahore",
    popup="Full case breakdown here..."
).add_to(m)
```

**Practice Task:** Add a tooltip showing just the city name to every marker, keeping the detailed HTML popup from the previous task.

---

### `folium.Icon()`
**Description:** Customizes a `Marker`'s appearance — color and glyph (from Bootstrap/FontAwesome icon sets).

**Use Case:** Visually distinguishing categories at a glance — e.g., red icons for high-severity cities, green for low, without needing to click anything.

**Importance:** Color-coding by severity is a standard client ask. This function is how you deliver it with plain `Marker` (use `CircleMarker` color if you've already switched).

```python
def severity_color(cases):
    if cases > 10000: return "red"
    elif cases > 1000: return "orange"
    return "green"

folium.Marker(
    location=[31.5204, 74.3587],
    icon=folium.Icon(color=severity_color(cases), icon="exclamation-triangle", prefix="fa")
).add_to(m)
```

**Practice Task:** Write a `severity_color()` function and apply it across all your city markers based on case thresholds you define.

---

## 4. Layers & Overlays

### `folium.Choropleth()`
**Description:** Shades geographic regions (districts, states, countries) based on a numeric value, using a GeoJSON boundary file joined to your data.

**Use Case:** "Show me case density by district" — this is the single most common real-world geo-viz request. Point maps show *where events happened*; choropleths show *how a region compares to others*.

**Importance:** This is the highest-value function in the whole library for client/portfolio work. It's also the one most students skip because it needs a GeoJSON file — which is exactly why having it in your project differentiates you.

```python
folium.Choropleth(
    geo_data="pakistan_districts.geojson",
    name="choropleth",
    data=df,
    columns=["District", "Cases"],
    key_on="feature.properties.district_name",   # must match your GeoJSON's property key
    fill_color="YlOrRd",
    fill_opacity=0.7,
    line_opacity=0.3,
    legend_name="COVID-19 Cases by District"
).add_to(m)
```

**Practice Task:** Find a Pakistan districts GeoJSON (search GitHub), match the property key to your dataframe's district column, and build a choropleth of total cases by district.

---

### `folium.GeoJson()`
**Description:** Renders raw GeoJSON geometry (points, lines, or polygons) on the map, with full control over styling via a function.

**Use Case:** Anything `Choropleth` can't handle out of the box — custom per-feature styling, tooltips on polygons, non-choropleth boundary overlays (e.g., just outlining provinces without shading).

**Importance:** `Choropleth` is actually a wrapper around `GeoJson` — knowing the underlying function means you're not stuck when you need more control than the wrapper gives you.

```python
folium.GeoJson(
    "pakistan_provinces.geojson",
    style_function=lambda feature: {
        "fillColor": "#3186cc",
        "color": "black",
        "weight": 1,
        "fillOpacity": 0.3,
    },
    tooltip=folium.GeoJsonTooltip(fields=["province_name"])
).add_to(m)
```

**Practice Task:** Overlay province boundaries as outlines only (no fill) on top of your choropleth, so borders stay visible.

---

### `folium.LayerControl()`
**Description:** Adds a UI toggle in the corner of the map letting users switch layers on/off.

**Use Case:** The moment you have more than one dataset on the map (cases layer, deaths layer, recovered layer, heatmap layer), you need this — otherwise everything renders at once and becomes unreadable.

**Importance:** This is what turns a single static map into an interactive multi-view dashboard. Non-negotiable once you pass one layer.

```python
folium.FeatureGroup(name="Cases").add_to(m)
folium.FeatureGroup(name="Deaths").add_to(m)
folium.LayerControl(collapsed=False).add_to(m)   # must be added LAST
```

**Practice Task:** Split your markers into three `FeatureGroup` layers (Cases, Deaths, Recovered), add each group's markers separately, then add `LayerControl` so users can toggle between them.

---

### `folium.FeatureGroup()`
**Description:** A named container you add markers/shapes to, so they can be toggled together as one unit via `LayerControl`.

**Use Case:** Grouping related markers (e.g., all "Deaths" circle markers) so they turn on/off as a set instead of individually.

**Importance:** Without this, `LayerControl` has nothing meaningful to toggle — they work as a pair.

```python
deaths_layer = folium.FeatureGroup(name="Deaths")
for _, row in df.iterrows():
    folium.CircleMarker(
        location=[row["lat"], row["lon"]],
        radius=row["deaths"] / 20,
        color="black"
    ).add_to(deaths_layer)
deaths_layer.add_to(m)
```

**Practice Task:** Build three `FeatureGroup`s (Cases, Deaths, Recovered) with independently scaled circle radii, then confirm each toggles correctly in the rendered HTML.

---

## 5. Plugins (`folium.plugins`)

### `MarkerCluster()`
**Description:** Automatically groups nearby markers into a single number-labeled cluster that expands as you zoom in.

**Use Case:** Any dataset with more than ~30 points in a small area — without this, dense areas become an unreadable pile of overlapping pins.

**Importance:** This is the standard fix for marker overload. It's expected in any professional point-map — its absence is an immediate "this wasn't built by someone experienced" signal.

```python
from folium.plugins import MarkerCluster
cluster = MarkerCluster().add_to(m)
for _, row in df.iterrows():
    folium.Marker([row["lat"], row["lon"]], popup=row["city"]).add_to(cluster)
```

**Practice Task:** Load your full cities dataset (all ~130+ Pakistani cities if available) into a `MarkerCluster` and verify clusters collapse/expand correctly on zoom.

---

### `HeatMap()`
**Description:** Renders a density/intensity heatmap from a list of `[lat, lon, weight]` points — no GeoJSON boundaries required.

**Use Case:** Quick density visualization when you don't have (or don't need) administrative boundaries — e.g., "where is case density highest" without needing a district-level breakdown.

**Importance:** It's the fastest way to show concentration. Compared to `Choropleth`, it requires zero external boundary files, making it the better first move when you're short on time or data.

```python
from folium.plugins import HeatMap
heat_data = df[["lat", "lon", "cases"]].values.tolist()
HeatMap(heat_data, radius=15, blur=20, max_zoom=10).add_to(m)
```

**Practice Task:** Build a `HeatMap` layer of case density and compare it visually against your `Choropleth` layer — note where they agree/disagree and why.

---

### `HeatMapWithTime()`
**Description:** An animated heatmap that changes frame-by-frame across a time index you provide, with a play/pause slider.

**Use Case:** Showing how case density spread over weeks/months instead of a single frozen snapshot — this is a trend story, not a static fact.

**Importance:** This is a genuine "wow" feature in a demo — animated data is rare in student projects and immediately signals a higher skill level.

```python
from folium.plugins import HeatMapWithTime
# data: list of lists, one list of [lat, lon, weight] per time period
HeatMapWithTime(data_by_week, index=week_labels, radius=15, auto_play=True).add_to(m)
```

**Practice Task:** If your Excel data has date columns, pivot it into weekly snapshots and build an animated spread map across the first 8 weeks of your dataset.

---

### `TimestampedGeoJson()`
**Description:** Similar goal to `HeatMapWithTime` but works with GeoJSON features (points or polygons) rather than raw heat data — gives more control over per-feature styling over time.

**Use Case:** Animating individual events over time (e.g., each city's marker growing as its case count rises week over week) rather than a blurred heat cloud.

**Importance:** More precise than `HeatMapWithTime` when you want labeled, styled markers changing over time instead of a generic heat gradient — useful when the story is "which specific city," not just "which region."

```python
from folium.plugins import TimestampedGeoJson
TimestampedGeoJson(
    geojson_features,   # each feature needs a "time" property
    period="P1W",        # advance one week per frame
    duration="P1W",
    auto_play=True
).add_to(m)
```

**Practice Task:** Convert your weekly case data into GeoJSON features with a `time` property per city, and animate individual city markers growing over the outbreak timeline.

---

### `Fullscreen()`
**Description:** Adds a fullscreen-toggle button to the map corner.

**Use Case:** Any map meant to be presented, demoed, or embedded — letting viewers expand it removes the tiny-iframe problem.

**Importance:** Zero analytical value, 100% polish value. Costs one line, always worth adding.

```python
from folium.plugins import Fullscreen
Fullscreen().add_to(m)
```

**Practice Task:** Add this to your final map and confirm it works inside the exported HTML (not just inside a notebook cell).

---

### `MeasureControl()`
**Description:** Lets users click points on the map to measure distance/area interactively.

**Use Case:** Logistics, urban planning, or any use case where "how far apart are these two things" matters to the end user.

**Importance:** Not always relevant, but when it is (delivery radius, catchment areas) it saves you from building a custom distance calculator — it's built in.

```python
from folium.plugins import MeasureControl
MeasureControl(primary_length_unit="kilometers").add_to(m)
```

**Practice Task:** Add `MeasureControl` and measure the distance between Lahore and Karachi directly on your rendered map.

---

### `Draw()`
**Description:** Adds a toolbar letting users draw shapes (markers, lines, polygons, rectangles) directly on the map and export them as GeoJSON.

**Use Case:** User-generated annotations — e.g., letting a client mark a delivery zone or a field boundary themselves, without touching code.

**Importance:** This turns your map from a read-only report into a lightweight input tool. Useful if you ever build a client-facing app on top of Folium (e.g., a Streamlit wrapper).

```python
from folium.plugins import Draw
Draw(export=True).add_to(m)
```

**Practice Task:** Add `Draw`, manually draw a polygon around Punjab province, and export the resulting GeoJSON to a file.

---

### `MiniMap()`
**Description:** Adds a small locator map in the corner showing the current view within a wider context.

**Use Case:** Helps users maintain spatial context when zoomed in tightly on a small area.

**Importance:** Minor UX polish — cheap to add, occasionally genuinely useful on very zoomed-in maps.

```python
from folium.plugins import MiniMap
MiniMap(toggle_display=True).add_to(m)
```

**Practice Task:** Add a `MiniMap`, zoom into a single city on your map, and confirm the minimap still shows Pakistan's outline for context.

---

## 6. Vector Drawing

### `folium.PolyLine()`
**Description:** Draws a line connecting a sequence of lat/long coordinates.

**Use Case:** Routes, paths, connections between points — e.g., a supply chain route, a travel itinerary, or a "spread path" between outbreak origin cities.

**Importance:** Anything involving movement or connection between two or more points needs this — points alone can't show relationships.

```python
route = [[31.5204, 74.3587], [24.8607, 67.0011], [33.6844, 73.0479]]  # Lahore -> Karachi -> Islamabad
folium.PolyLine(route, color="blue", weight=3, opacity=0.7).add_to(m)
```

**Practice Task:** Draw a line connecting your five highest-case cities in descending order of case count, so the line traces the "severity path."

---

### `folium.Circle()`
**Description:** Like `CircleMarker`, but the radius is in **real-world meters**, not pixels — it scales correctly as you zoom.

**Use Case:** Representing an actual physical radius — a delivery zone, a quarantine perimeter, a service area — where the real-world size matters, not just relative visual size.

**Importance:** Easy to confuse with `CircleMarker`. Use `Circle` when the number represents real distance; use `CircleMarker` when it represents a relative data value like case count.

```python
folium.Circle(
    location=[31.5204, 74.3587],
    radius=5000,     # meters — a real 5km radius
    color="purple",
    fill=True,
    fill_opacity=0.2
).add_to(m)
```

**Practice Task:** Draw a real 10km quarantine-radius circle around your two highest-case cities and note how differently it renders compared to `CircleMarker`.

---

### `folium.Polygon()`
**Description:** Draws a closed shape from a list of coordinates — used for custom regions not available as a GeoJSON boundary.

**Use Case:** Defining a custom area (a neighborhood, a sales territory) when no ready-made boundary file exists.

**Importance:** Your fallback when `Choropleth`/`GeoJson` boundaries aren't available for the exact region you need — you can draw it yourself.

```python
folium.Polygon(
    locations=[[31.4, 74.2], [31.6, 74.2], [31.6, 74.5], [31.4, 74.5]],
    color="green", fill=True, fill_opacity=0.3
).add_to(m)
```

**Practice Task:** Manually define a rough polygon around Lahore's urban core and shade it to represent "high-density zone."

---

### `folium.Rectangle()`
**Description:** Draws a rectangular bounding box from two corner coordinates.

**Use Case:** Highlighting a bounding region — e.g., "everything within this bounding box is Punjab province" as a quick approximation.

**Importance:** Simple, fast substitute for `Polygon` when precision doesn't matter, only rough area does.

```python
folium.Rectangle(
    bounds=[[29.0, 70.0], [33.0, 75.0]],
    color="orange", fill=False
).add_to(m)
```

**Practice Task:** Draw bounding-box rectangles around each of Pakistan's four provinces (rough approximations are fine) and label each with a tooltip.

---

## 7. Export & Interaction Utilities

### `map.save()`
**Description:** Exports the entire map (with all layers/plugins) as a single standalone `.html` file.

**Use Case:** This is your actual deliverable. A notebook cell output isn't shareable or embeddable — the saved HTML is.

**Importance:** Students often stop at "it renders in the notebook." Clients and portfolios need the exported file. This is the difference between a school exercise and a shippable artifact.

```python
m.save("pakistan_covid_dashboard.html")
```

**Practice Task:** Save your final combined map (choropleth + heatmap + clustered markers + layer control) as one HTML file and open it directly in a browser (not inside Jupyter) to confirm everything still works.

---

### `folium.LatLngPopup()`
**Description:** Shows the exact lat/long coordinates in a popup wherever the user clicks on the map.

**Use Case:** Debugging — quickly grabbing coordinates for a location you don't have in your dataset yet.

**Importance:** Small utility, genuinely useful when you're manually building out a coordinates file (like the one your assignment already uses) and need to check/add a missing city.

```python
m.add_child(folium.LatLngPopup())
```

**Practice Task:** Add this to a scratch map and use it to find the coordinates of three cities missing from your current dataset.

---

### `folium.ClickForMarker()`
**Description:** Drops a new marker at whatever point the user clicks, showing its coordinates.

**Use Case:** Rapid manual data entry — building a coordinates list by clicking cities on a map instead of looking up each one.

**Importance:** Same category as `LatLngPopup` — a data-collection helper, not a presentation feature. Useful during the data-prep phase of a project like yours.

```python
m.add_child(folium.ClickForMarker(popup="New point"))
```

**Practice Task:** Use this to manually build a 5-city coordinates list by clicking on a blank map, then compare the accuracy against your existing coordinates file.

---

## 8. Progressive Practice Roadmap

Work through these in order — each step builds on the last and results in a genuinely portfolio-worthy final map.

| Step | Task | Functions Used |
|---|---|---|
| 1 | Rebuild your assignment's markers as `CircleMarker`s sized by case count | `CircleMarker` |
| 2 | Color-code by severity | `Icon` / `CircleMarker(color=...)` |
| 3 | Convert popups to HTML tables | `Popup` |
| 4 | Add hover tooltips with city names | `Tooltip` |
| 5 | Split data into Cases/Deaths/Recovered toggleable layers | `FeatureGroup`, `LayerControl` |
| 6 | Cluster markers for the full ~130-city dataset | `MarkerCluster` |
| 7 | Add a density heatmap as an alternate view | `HeatMap` |
| 8 | Source a Pakistan districts GeoJSON and build a choropleth | `Choropleth` |
| 9 | Animate case growth over time | `HeatMapWithTime` or `TimestampedGeoJson` |
| 10 | Add UX polish (fullscreen, measure tool, minimap) | `Fullscreen`, `MeasureControl`, `MiniMap` |
| 11 | Export as standalone HTML and verify it works outside Jupyter | `map.save()` |
| 12 | (Stretch) Wrap the final map in a Streamlit app with a city search/filter sidebar | `streamlit`, `map.save()` / `st.components.v1.html()` |

**Deliverable to aim for:** one `.html` file that opens in any browser, has a working layer toggle, at least one animated or choropleth layer, and clustered markers — that's the file you link from your portfolio, not the raw notebook.
