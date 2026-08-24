import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'
import { Card, EmptyState, Pagination, SearchInput, Select } from './Primitives.jsx'

/**
 * Searchable / filterable / sortable grid used by every module page.
 *
 * columns: { key, header, render?, sortable?, align?, className?, width? }
 * filters: { key, label, options[], value, onChange }
 * actions: (row) => [{ label, icon, tone?, onSelect }]
 */
export default function DataTable({
  columns,
  rows,
  searchKeys = [],
  searchPlaceholder = 'Search…',
  filters = [],
  actions,
  pageSize = 10,
  toolbarExtra,
  emptyTitle = 'Nothing to show',
  emptyMessage = 'Try clearing the search or filters.',
  getRowKey = (row) => row.id,
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const [page, setPage] = useState(1)

  const filterSignature = filters.map((f) => f.value).join('|')

  // Any change to the result set puts the reader back on page 1, otherwise
  // they can land on a page that no longer exists.
  useEffect(() => {
    setPage(1)
  }, [query, filterSignature])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    let out = rows

    if (needle && searchKeys.length) {
      out = out.filter((row) =>
        searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(needle))
      )
    }

    if (sort.key) {
      const col = columns.find((c) => c.key === sort.key)
      const accessor = col?.sortValue ?? ((row) => row[sort.key])
      out = [...out].sort((a, b) => {
        const av = accessor(a)
        const bv = accessor(b)
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv))
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }

    return out
  }, [rows, query, sort, columns, searchKeys])

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pageRows = visible.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (key) =>
    setSort((cur) =>
      cur.key === key
        ? { key, dir: cur.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )

  const showToolbar = Boolean(searchKeys.length || filters.length || toolbarExtra)

  return (
    <Card className="overflow-hidden">
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-2.5 border-b border-neutral-200/80 px-4 py-3 sm:px-5">
          {searchKeys.length > 0 && (
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={searchPlaceholder}
              className="min-w-[200px] flex-1 sm:max-w-xs"
            />
          )}

          {filters.map((f) => (
            <label key={f.key} className="flex items-center gap-1.5">
              <span className="sr-only">{f.label}</span>
              <Select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                aria-label={f.label}
                className="h-9.5 w-auto min-w-[9.5rem]"
              >
                <option value="">{f.label}: All</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </label>
          ))}

          {toolbarExtra && <div className="ml-auto flex items-center gap-2">{toolbarExtra}</div>}
        </div>
      )}

      {pageRows.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      ) : (
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/70">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    className={`px-4 py-2.5 text-[11.5px] font-semibold tracking-wide whitespace-nowrap text-neutral-500 uppercase ${
                      col.align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={`inline-flex items-center gap-1 transition-colors hover:text-neutral-800 ${
                          col.align === 'right' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {col.header}
                        {sort.key === col.key ? (
                          sort.dir === 'asc' ? (
                            <ChevronUp size={13} aria-hidden="true" />
                          ) : (
                            <ChevronDown size={13} aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown size={12} className="text-neutral-300" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
                {actions && <th scope="col" className="w-12 px-4 py-2.5" />}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/70"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-[13px] whitespace-nowrap text-neutral-700 ${
                        col.align === 'right' ? 'text-right' : ''
                      } ${col.className ?? ''}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <RowMenu items={actions(row)} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={safePage} pageCount={pageCount} total={visible.length} onPage={setPage} />
    </Card>
  )
}

function RowMenu({ items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  if (!items?.length) return null

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Row actions"
        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                item.onSelect?.()
              }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition-colors ${
                item.tone === 'danger'
                  ? 'text-red-700 hover:bg-red-50'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {item.icon && (
                <item.icon
                  size={14}
                  className={item.tone === 'danger' ? '' : 'text-neutral-400'}
                  aria-hidden="true"
                />
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
