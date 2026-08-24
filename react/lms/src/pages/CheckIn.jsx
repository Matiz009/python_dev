import { useMemo, useState } from 'react'
import {
  CalendarDays, CircleAlert, CircleCheck, Clock, LogIn, LogOut, MapPin, Table2,
  TriangleAlert, Hourglass, CalendarX2,
} from 'lucide-react'
import {
  Badge, Button, Card, CardHeader, PageHeader, Select, StatusBadge,
} from '../components/ui/Primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import {
  CURRENT_USER, MODES, MONTHS, TODAY, YEARS, buildAttendance, summarise,
} from '../data/mockData.js'

/* Status colours are the reserved status palette, never the categorical series. */
const DAY_STYLES = {
  Present: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Late: 'bg-amber-50 text-amber-900 ring-amber-200',
  Absent: 'bg-red-50 text-red-800 ring-red-200',
  Weekend: 'bg-neutral-50 text-neutral-400 ring-neutral-200',
  Upcoming: 'bg-white text-neutral-300 ring-neutral-200 border-dashed',
}

const DAY_ICONS = { Present: CircleCheck, Late: TriangleAlert, Absent: CircleAlert }

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* --------------------------- Session tracker ----------------------------- */

function SessionTracker() {
  const { session, checkIn, checkOut, notify } = useApp()
  const { checkedIn, checkInAt, checkOutAt } = session

  const handleCheckIn = () => {
    checkIn()
    notify('Checked in. Have a good session.')
  }

  const handleCheckOut = () => {
    checkOut()
    notify('Checked out. Your hours have been logged.')
  }

  const tiles = [
    { label: 'Check-in time', value: checkInAt ?? '—', icon: LogIn },
    { label: 'Check-out time', value: checkOutAt ?? '—', icon: LogOut },
    {
      label: 'Session state',
      value: checkedIn ? 'On campus' : checkOutAt ? 'Completed' : 'Not started',
      icon: Clock,
    },
  ]

  return (
    <Card>
      <CardHeader
        title="Today's session times"
        subtitle={`${CURRENT_USER.campus} · ${TODAY.toDateString()}`}
        actions={
          <Badge tone={checkedIn ? 'good' : 'neutral'} icon={checkedIn ? CircleCheck : Clock}>
            {checkedIn ? 'Checked in' : 'Checked out'}
          </Badge>
        }
      />

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3.5">
              <div className="flex items-center gap-2 text-neutral-500">
                <tile.icon size={14} aria-hidden="true" />
                <span className="text-[12px] font-medium">{tile.label}</span>
              </div>
              <p className="tnum mt-1.5 text-lg font-semibold text-neutral-900">{tile.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-neutral-100 pt-4">
          <Button
            variant="primary"
            icon={LogIn}
            onClick={handleCheckIn}
            disabled={checkedIn}
          >
            Check in
          </Button>
          <Button icon={LogOut} onClick={handleCheckOut} disabled={!checkedIn}>
            Check out
          </Button>
          <p className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] text-neutral-500">
            <MapPin size={13} aria-hidden="true" />
            Location verified via campus network
          </p>
        </div>
      </div>
    </Card>
  )
}

/* -------------------------- Attendance register --------------------------- */

function SummaryTile({ label, value, sub, icon: Icon, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-neutral-100 text-neutral-600',
    good: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    critical: 'bg-red-50 text-red-700',
  }
  return (
    <Card className="p-3.5">
      <div className="flex items-center gap-2">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${tones[tone]}`}>
          <Icon size={14} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="text-[12px] font-medium text-neutral-500">{label}</span>
      </div>
      <p className="tnum mt-2 text-xl font-semibold text-neutral-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11.5px] text-neutral-500">{sub}</p>}
    </Card>
  )
}

function AttendanceRegister() {
  const [month, setMonth] = useState(TODAY.getMonth())
  const [year, setYear] = useState(TODAY.getFullYear())
  const [mode, setMode] = useState(MODES[0])
  const [view, setView] = useState('calendar')

  const records = useMemo(() => buildAttendance(year, month, mode), [year, month, mode])
  const stats = useMemo(() => summarise(records), [records])

  const lowAttendance = stats.workingDays > 0 && stats.rate < 70

  // Blank cells before the 1st so the grid lines up under a Monday-first header.
  const leadingBlanks = records.length ? (records[0].weekday + 6) % 7 : 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="My attendance register"
          subtitle={`${MONTHS[month]} ${year} · ${mode} attendance`}
          actions={
            <Button
              size="sm"
              variant="ghost"
              icon={view === 'calendar' ? Table2 : CalendarDays}
              onClick={() => setView((v) => (v === 'calendar' ? 'matrix' : 'calendar'))}
            >
              {view === 'calendar' ? 'Matrix' : 'Calendar'}
            </Button>
          }
        />

        <div className="flex flex-wrap items-center gap-2.5 border-b border-neutral-200/80 px-4 py-3 sm:px-5">
          <label>
            <span className="sr-only">Month</span>
            <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} aria-label="Month" className="w-auto min-w-[8.5rem]">
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </Select>
          </label>
          <label>
            <span className="sr-only">Year</span>
            <Select value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Year" className="w-auto min-w-[6.5rem]">
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </label>
          <label>
            <span className="sr-only">Mode</span>
            <Select value={mode} onChange={(e) => setMode(e.target.value)} aria-label="Mode" className="w-auto min-w-[8rem]">
              {MODES.map((m) => <option key={m}>{m}</option>)}
            </Select>
          </label>

          {/* Legend — status identity never rests on colour alone. */}
          <ul className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {['Present', 'Late', 'Absent'].map((s) => (
              <li key={s}>
                <StatusBadge status={s} />
              </li>
            ))}
          </ul>
        </div>

        {view === 'calendar' ? (
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {WEEKDAY_LABELS.map((d) => (
                <div key={d} className="pb-1 text-center text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
                  {d}
                </div>
              ))}

              {Array.from({ length: leadingBlanks }, (_, i) => (
                <div key={`blank-${i}`} aria-hidden="true" />
              ))}

              {records.map((rec) => {
                const Icon = DAY_ICONS[rec.status]
                const isToday =
                  year === TODAY.getFullYear() && month === TODAY.getMonth() && rec.day === TODAY.getDate()

                return (
                  <div
                    key={rec.day}
                    className={`relative flex min-h-[68px] flex-col rounded-lg border p-1.5 ring-1 ring-inset sm:min-h-[80px] sm:p-2 ${
                      DAY_STYLES[rec.status]
                    } ${isToday ? 'border-brand-500 ring-2 ring-brand-400' : 'border-transparent'}`}
                    title={
                      rec.in
                        ? `${rec.status} · ${rec.in}–${rec.out} · ${rec.hours}h`
                        : rec.status
                    }
                  >
                    <span className="tnum text-[12px] font-semibold">{rec.day}</span>

                    {Icon && (
                      <Icon size={13} strokeWidth={2.25} className="mt-1" aria-hidden="true" />
                    )}

                    {rec.in && (
                      <span className="tnum mt-auto hidden text-[10.5px] leading-tight opacity-80 sm:block">
                        {rec.in}–{rec.out}
                      </span>
                    )}

                    <span className="sr-only">{rec.status}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/70">
                  {['Date', 'Day', 'Status', 'Check in', 'Check out', 'Hours'].map((h) => (
                    <th key={h} scope="col" className="px-4 py-2.5 text-[11.5px] font-semibold tracking-wide text-neutral-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.day} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/70">
                    <td className="tnum px-4 py-2.5 text-[13px] font-medium text-neutral-900">
                      {String(rec.day).padStart(2, '0')} {MONTHS[month].slice(0, 3)}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-neutral-600">
                      {WEEKDAY_LABELS[(rec.weekday + 6) % 7]}
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={rec.status} /></td>
                    <td className="tnum px-4 py-2.5 text-[13px] text-neutral-600">{rec.in ?? '—'}</td>
                    <td className="tnum px-4 py-2.5 text-[13px] text-neutral-600">{rec.out ?? '—'}</td>
                    <td className="tnum px-4 py-2.5 text-[13px] text-neutral-600">
                      {rec.hours ? `${rec.hours}h` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* --------------------------- Low-attendance alert -------------------- */}
      {lowAttendance && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5"
        >
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-red-700" aria-hidden="true" />
          <div>
            <p className="text-[13.5px] font-semibold text-red-900">
              Attendance below the 70% threshold
            </p>
            <p className="mt-0.5 text-[13px] text-red-800">
              You are at <span className="tnum font-semibold">{stats.rate}%</span> for {MONTHS[month]} {year} ({mode}).
              Falling below 70% puts certification eligibility at risk — contact your programme
              coordinator to regularise the record.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------ Summary ------------------------------ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Total present" value={stats.present} sub="full days" icon={CircleCheck} tone="good" />
        <SummaryTile label="Total late" value={stats.late} sub="after 09:00" icon={TriangleAlert} tone="warning" />
        <SummaryTile label="Total absent" value={stats.absent} sub="unexcused" icon={CircleAlert} tone="critical" />
        <SummaryTile label="Working hours" value={`${stats.workingHours}h`} sub="logged" icon={Hourglass} />
        <SummaryTile label="Total hours" value={`${stats.totalHours}h`} sub={`${stats.workingDays} working days`} icon={Clock} />
        <SummaryTile
          label="Attendance rate"
          value={`${stats.rate}%`}
          sub={lowAttendance ? 'below threshold' : 'on track'}
          icon={lowAttendance ? CalendarX2 : CalendarDays}
          tone={lowAttendance ? 'critical' : 'good'}
        />
      </div>
    </div>
  )
}

/* --------------------------------- Page ---------------------------------- */

export default function CheckIn() {
  return (
    <>
      <PageHeader
        title="Campus check-in & attendance"
        subtitle="Track today's session and review your monthly attendance record."
      />
      <div className="space-y-5">
        <SessionTracker />
        <AttendanceRegister />
      </div>
    </>
  )
}
