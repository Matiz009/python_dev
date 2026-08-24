import { useEffect, useRef } from 'react'
import { X, Search, ChevronLeft, ChevronRight, Inbox, CircleCheck, CircleAlert, TriangleAlert, Clock } from 'lucide-react'

/* -------------------------------- Surfaces ------------------------------- */

export function Card({ className = '', children, ...rest }) {
  return (
    <div
      className={`rounded-xl border border-neutral-200/80 bg-white shadow-sm shadow-neutral-900/[0.03] ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200/80 px-4 py-3.5 sm:px-5 ${className}`}>
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold text-neutral-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-[13.5px] text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* --------------------------------- Badges -------------------------------- */

const BADGE_TONES = {
  neutral: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  good: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-900 ring-amber-200',
  critical: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-blue-50 text-blue-800 ring-blue-200',
  violet: 'bg-violet-50 text-violet-800 ring-violet-200',
}

export function Badge({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium ring-1 ring-inset ${BADGE_TONES[tone]} ${className}`}
    >
      {Icon && <Icon size={12} strokeWidth={2.25} aria-hidden="true" />}
      {children}
    </span>
  )
}

/**
 * Status is never colour-alone — every badge carries an icon and its label,
 * which is also what makes the palette safe for colour-vision deficiency.
 */
const STATUS_MAP = {
  Active: { tone: 'good', icon: CircleCheck },
  Approved: { tone: 'good', icon: CircleCheck },
  Passed: { tone: 'good', icon: CircleCheck },
  Present: { tone: 'good', icon: CircleCheck },
  Delivered: { tone: 'good', icon: CircleCheck },
  Completed: { tone: 'info', icon: CircleCheck },
  Pending: { tone: 'warning', icon: Clock },
  Waitlisted: { tone: 'warning', icon: Clock },
  Late: { tone: 'warning', icon: TriangleAlert },
  Scheduled: { tone: 'info', icon: Clock },
  'In Progress': { tone: 'info', icon: Clock },
  Unscheduled: { tone: 'neutral', icon: Clock },
  Absent: { tone: 'critical', icon: CircleAlert },
  Failed: { tone: 'critical', icon: CircleAlert },
  Rejected: { tone: 'critical', icon: CircleAlert },
  Cancelled: { tone: 'critical', icon: CircleAlert },
  'At Risk': { tone: 'critical', icon: TriangleAlert },
  Weekend: { tone: 'neutral' },
  Upcoming: { tone: 'neutral' },
}

export function StatusBadge({ status, className = '' }) {
  const cfg = STATUS_MAP[status] ?? { tone: 'neutral' }
  return (
    <Badge tone={cfg.tone} icon={cfg.icon} className={className}>
      {status}
    </Badge>
  )
}

/* -------------------------------- Controls ------------------------------- */

const BUTTON_VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-600 shadow-sm',
  secondary: 'bg-white text-neutral-700 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus-visible:outline-brand-600',
  subtle: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus-visible:outline-brand-600',
  ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-brand-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-700 shadow-sm',
}

const BUTTON_SIZES = {
  sm: 'h-8 px-2.5 text-[13px] gap-1.5',
  md: 'h-9.5 px-3.5 text-[13.5px] gap-2',
  icon: 'h-9 w-9 justify-center',
}

export function Button({
  variant = 'secondary', size = 'md', icon: Icon, children, className = '', type = 'button', ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2} aria-hidden="true" />}
      {children}
    </button>
  )
}

export function Field({ label, hint, required, htmlFor, className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-neutral-700">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] text-neutral-500">{hint}</p>}
    </div>
  )
}

const CONTROL_BASE =
  'rounded-lg border border-neutral-300 bg-white px-3 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:bg-neutral-50'

/**
 * Controls fill their container by default, but a caller passing its own `w-*`
 * utility must win. Tailwind resolves conflicting utilities by stylesheet order,
 * not class order, so `w-full` is omitted rather than overridden.
 */
const widthFor = (className) => (/(^|\s)w-/.test(className) ? '' : 'w-full')

export function Input({ className = '', ...rest }) {
  return <input className={`${CONTROL_BASE} h-9.5 ${widthFor(className)} ${className}`} {...rest} />
}

export function Textarea({ className = '', rows = 3, ...rest }) {
  return <textarea rows={rows} className={`${CONTROL_BASE} py-2 ${widthFor(className)} ${className}`} {...rest} />
}

export function Select({ className = '', children, ...rest }) {
  return (
    <select className={`${CONTROL_BASE} h-9.5 pr-8 ${widthFor(className)} ${className}`} {...rest}>
      {children}
    </select>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${CONTROL_BASE} h-9.5 w-full pl-9`}
      />
    </div>
  )
}

/* --------------------------------- Modal --------------------------------- */

export function Modal({ open, onClose, title, description, footer, size = 'md', children }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl outline-none sm:rounded-2xl ${widths[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-neutral-900">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-neutral-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-m-1.5 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50/70 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------ Misc pieces ------------------------------ */

export function EmptyState({ title, message, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-neutral-100 p-3 text-neutral-400">
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="text-[14px] font-medium text-neutral-800">{title}</p>
      {message && <p className="mt-1 max-w-sm text-[13px] text-neutral-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ProgressBar({ value, tone = 'brand', label }) {
  const pct = Math.max(0, Math.min(100, value))
  const tones = { brand: 'bg-brand-500', good: 'bg-emerald-600', warning: 'bg-amber-500', critical: 'bg-red-600' }
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={`h-full rounded-full ${tones[tone]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="tnum w-10 shrink-0 text-right text-[12px] text-neutral-600">{Math.round(pct)}%</span>
    </div>
  )
}

export function Pagination({ page, pageCount, total, onPage }) {
  if (pageCount <= 1) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/80 px-4 py-3 sm:px-5">
      <p className="tnum text-[12.5px] text-neutral-500">
        Page {page} of {pageCount} · {total} records
      </p>
      <div className="flex items-center gap-1.5">
        <Button size="sm" icon={ChevronLeft} disabled={page === 1} onClick={() => onPage(page - 1)}>
          Prev
        </Button>
        <Button size="sm" disabled={page === pageCount} onClick={() => onPage(page + 1)}>
          Next
          <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto rounded-lg bg-neutral-100 p-1">
      {tabs.map((tab) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              selected ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.label}
            {tab.count != null && <span className="tnum ml-1.5 text-neutral-400">{tab.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
