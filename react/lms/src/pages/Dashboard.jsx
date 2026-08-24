import { useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart,
  CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  ArrowDownRight, ArrowUpRight, CalendarCheck, Download, Eye, GraduationCap,
  Layers, Pencil, Percent, Table2, Users,
} from 'lucide-react'
import {
  Badge, Button, Card, CardHeader, PageHeader, StatusBadge,
} from '../components/ui/Primitives.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { AXIS_PROPS, ChartLegend, ChartTooltip, GRID_PROPS, INK, SERIES } from '../components/charts/ChartKit.jsx'
import { useApp } from '../context/AppContext.jsx'
import { BATCHES, BATCH_METRICS, FUNDING_SPLIT, INTAKE_TREND, KPIS, VOUCHERS } from '../data/mockData.js'

const KPI_ICONS = {
  students: Users,
  batches: Layers,
  completion: GraduationCap,
  attendance: CalendarCheck,
}

function MetricCard({ kpi }) {
  const Icon = KPI_ICONS[kpi.id] ?? Percent
  const up = kpi.trend === 'up'
  const Arrow = up ? ArrowUpRight : ArrowDownRight

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-neutral-500">{kpi.label}</p>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <Icon size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>

      <p className="tnum mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
        {kpi.format === 'percent' ? `${kpi.value}%` : kpi.value.toLocaleString()}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        {/* Delta reads via arrow + sign as well as colour. */}
        <span
          className={`inline-flex items-center gap-0.5 text-[12.5px] font-medium ${
            up ? 'text-[#006300]' : 'text-red-700'
          }`}
        >
          <Arrow size={13} strokeWidth={2.5} aria-hidden="true" />
          {up ? '+' : ''}
          {kpi.delta}%
        </span>
        <span className="text-[12px] text-neutral-500">{kpi.hint}</span>
      </div>
    </Card>
  )
}

/* ----------------------------- Intake growth ----------------------------- */

const INTAKE_SERIES = [
  { key: 'enrolled', label: 'Enrolled', color: SERIES[0] },
  { key: 'graduated', label: 'Graduated', color: SERIES[1] },
]

function IntakeTrendCard() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Intake growth trends"
        subtitle="New enrolments against graduations, last 12 months"
        actions={<ChartLegend items={INTAKE_SERIES} />}
      />
      <div className="px-2 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={INTAKE_TREND} margin={{ top: 4, right: 16, bottom: 0, left: -12 }}>
            <defs>
              {INTAKE_SERIES.map((s) => (
                <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="month" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} width={44} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: INK.axis, strokeWidth: 1 }}
            />
            {INTAKE_SERIES.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#fill-${s.key})`}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                dot={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/* --------------------------- Funding distribution ------------------------- */

function FundingCard() {
  const [asTable, setAsTable] = useState(false)
  const total = FUNDING_SPLIT.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card>
      <CardHeader
        title="Funding & grant distribution"
        subtitle={`${total.toLocaleString()} funded seats`}
        actions={
          <Button
            size="sm"
            variant="ghost"
            icon={asTable ? Eye : Table2}
            onClick={() => setAsTable((v) => !v)}
          >
            {asTable ? 'Chart' : 'Table'}
          </Button>
        }
      />

      {asTable ? (
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-neutral-200/80 bg-neutral-50/70">
              <th scope="col" className="px-5 py-2.5 text-[11.5px] font-semibold tracking-wide text-neutral-500 uppercase">Source</th>
              <th scope="col" className="px-5 py-2.5 text-right text-[11.5px] font-semibold tracking-wide text-neutral-500 uppercase">Seats</th>
              <th scope="col" className="px-5 py-2.5 text-right text-[11.5px] font-semibold tracking-wide text-neutral-500 uppercase">Share</th>
            </tr>
          </thead>
          <tbody>
            {FUNDING_SPLIT.map((d, i) => (
              <tr key={d.name} className="border-b border-neutral-100 last:border-0">
                <td className="px-5 py-2.5">
                  <span className="flex items-center gap-2 text-neutral-700">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES[i] }} aria-hidden="true" />
                    {d.name}
                  </span>
                </td>
                <td className="tnum px-5 py-2.5 text-right text-neutral-900">{d.value.toLocaleString()}</td>
                <td className="tnum px-5 py-2.5 text-right text-neutral-600">
                  {((d.value / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="px-4 pt-3 pb-4">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={FUNDING_SPLIT}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {FUNDING_SPLIT.map((entry, i) => (
                  <Cell key={entry.name} fill={SERIES[i]} />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(v) => `${v.toLocaleString()} (${((v / total) * 100).toFixed(1)}%)`}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Direct labels: the relief for the sub-3:1 slice, and identity without colour alone. */}
          <ul className="mt-3 space-y-1.5">
            {FUNDING_SPLIT.map((d, i) => (
              <li key={d.name} className="flex items-center gap-2 text-[12.5px]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: SERIES[i] }} aria-hidden="true" />
                <span className="truncate text-neutral-600">{d.name}</span>
                <span className="tnum ml-auto font-medium text-neutral-900">
                  {((d.value / total) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

/* ------------------------------ Batch metrics ----------------------------- */

function BatchMetricsCard() {
  return (
    <Card>
      <CardHeader title="Batch enrolment" subtitle="Seats filled against a 150-seat capacity" />
      <div className="px-2 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={BATCH_METRICS} margin={{ top: 4, right: 16, bottom: 0, left: -14 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="batch" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} width={44} domain={[0, 150]} />
            <Tooltip
              content={<ChartTooltip footer="Capacity 150 seats per batch" />}
              cursor={{ fill: 'rgba(11,11,11,0.035)' }}
            />
            <Bar dataKey="enrolled" name="Enrolled" fill={SERIES[2]} radius={[4, 4, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/* ---------------------------- Voucher & audit ----------------------------- */

function VoucherTable() {
  const { notify } = useApp()
  const [batch, setBatch] = useState('')
  const [status, setStatus] = useState('')

  const rows = VOUCHERS.filter(
    (v) => (!batch || v.batch === batch) && (!status || v.status === status)
  )

  const columns = [
    {
      key: 'id',
      header: 'Voucher',
      sortable: true,
      render: (r) => <span className="tnum font-medium text-neutral-900">{r.id}</span>,
    },
    { key: 'student', header: 'Student', sortable: true },
    {
      key: 'batch',
      header: 'Batch',
      sortable: true,
      render: (r) => <Badge tone="neutral">{r.batch}</Badge>,
    },
    { key: 'action', header: 'Audit action' },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (r) => <span className="tnum text-neutral-900">PKR {r.amount.toLocaleString()}</span>,
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (r) => <span className="tnum text-neutral-500">{r.timestamp}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-neutral-900">Voucher & audit trail</h2>
          <p className="mt-0.5 text-[13px] text-neutral-500">
            Every fee movement recorded against a batch, newest first.
          </p>
        </div>
        <Button
          icon={Download}
          onClick={() => notify('Audit trail exported as CSV.')}
        >
          Export
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['id', 'student', 'action', 'batch']}
        searchPlaceholder="Search voucher, student or action…"
        filters={[
          { key: 'batch', label: 'Batch', options: BATCHES, value: batch, onChange: setBatch },
          { key: 'status', label: 'Status', options: ['Active', 'Pending', 'Completed'], value: status, onChange: setStatus },
        ]}
        actions={(row) => [
          { label: 'View voucher', icon: Eye, onSelect: () => notify(`Opening ${row.id}.`, 'info') },
          { label: 'Edit record', icon: Pencil, onSelect: () => notify(`Editing ${row.id}.`, 'info') },
          { label: 'Download PDF', icon: Download, onSelect: () => notify(`${row.id} downloaded.`) },
        ]}
      />
    </div>
  )
}

/* --------------------------------- Page ---------------------------------- */

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Control centre"
        subtitle="Campus-wide performance for the current academic cycle."
        actions={
          <>
            <Button icon={Download}>Export report</Button>
            <Button variant="primary" icon={Layers}>New batch</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <MetricCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <IntakeTrendCard />
        <FundingCard />
      </div>

      <div className="mt-5">
        <BatchMetricsCard />
      </div>

      <div className="mt-5">
        <VoucherTable />
      </div>
    </>
  )
}
