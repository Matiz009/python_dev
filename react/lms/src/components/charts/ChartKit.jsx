/**
 * Shared chart chrome.
 *
 * Colour rules that this file encodes, so no chart has to re-decide them:
 *  - Categorical hues are assigned in a fixed slot order, never cycled.
 *  - Series colour follows the entity, not its rank — a filter that drops a
 *    series must not repaint the survivors, so charts index SERIES by name.
 *  - Text always wears an ink token, never the series colour; the swatch
 *    beside it carries identity.
 * The slot order below was validated all-pairs against the light surface
 * (worst CVD ΔE 9.2, worst normal-vision ΔE 16.3).
 */

export const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#4a3aa7']

export const INK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
}

export const AXIS_PROPS = {
  tick: { fill: INK.muted, fontSize: 11.5 },
  tickLine: false,
  axisLine: { stroke: INK.axis },
}

export const GRID_PROPS = {
  stroke: INK.grid,
  strokeDasharray: '0',
  vertical: false,
}

/** One tooltip for every chart, so the hover layer reads the same everywhere. */
export function ChartTooltip({ active, payload, label, formatter, footer }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-lg">
      {label != null && (
        <p className="mb-1.5 text-[12px] font-medium text-neutral-900">{label}</p>
      )}
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.dataKey ?? entry.name} className="flex items-center gap-2 text-[12px]">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color ?? entry.payload?.fill }}
              aria-hidden="true"
            />
            <span className="text-neutral-600">{entry.name}</span>
            <span className="tnum ml-auto pl-3 font-medium text-neutral-900">
              {formatter ? formatter(entry.value, entry) : entry.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      {footer && <p className="mt-1.5 border-t border-neutral-100 pt-1.5 text-[11.5px] text-neutral-500">{footer}</p>}
    </div>
  )
}

/** Legend rendered as plain HTML — a legend is always present for >= 2 series. */
export function ChartLegend({ items, className = '' }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${className}`}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-[12px] text-neutral-600">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
