import { useState } from 'react'
import { Download, Mail, Plus, TriangleAlert, UserRound } from 'lucide-react'
import { Badge, Button, Card, PageHeader, ProgressBar, StatusBadge } from '../components/ui/Primitives.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { useApp } from '../context/AppContext.jsx'
import { BATCHES, STUDENTS, SUBJECTS } from '../data/mockData.js'

export default function Students() {
  const { notify } = useApp()
  const [batch, setBatch] = useState('')
  const [subject, setSubject] = useState('')
  const [status, setStatus] = useState('')

  const rows = STUDENTS.filter(
    (s) =>
      (!batch || s.batch === batch) &&
      (!subject || s.subject === subject) &&
      (!status || s.status === status)
  )

  const atRisk = STUDENTS.filter((s) => s.status === 'At Risk').length

  const columns = [
    {
      key: 'name',
      header: 'Student',
      sortable: true,
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-[11.5px] font-semibold text-neutral-600">
            {r.name.split(' ').map((p) => p[0]).join('')}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900">{r.name}</p>
            <p className="truncate text-[12px] text-neutral-500">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'id', header: 'Roll no.', sortable: true, render: (r) => <span className="tnum text-neutral-600">{r.id}</span> },
    { key: 'batch', header: 'Batch', sortable: true, render: (r) => <Badge tone="neutral">{r.batch}</Badge> },
    { key: 'subject', header: 'Programme', sortable: true },
    {
      key: 'attendance',
      header: 'Attendance',
      sortable: true,
      align: 'right',
      render: (r) => (
        <span className={`tnum font-medium ${r.attendance < 70 ? 'text-red-700' : 'text-neutral-900'}`}>
          {r.attendance}%
        </span>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      sortable: true,
      width: '170px',
      render: (r) => (
        <div className="w-36">
          <ProgressBar value={r.progress} label={`${r.name} course progress`} />
        </div>
      ),
    },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={`${STUDENTS.length} enrolled learners across ${BATCHES.length} active batches.`}
        actions={
          <>
            <Button icon={Download} onClick={() => notify('Student roster exported as CSV.')}>Export</Button>
            <Button variant="primary" icon={Plus} onClick={() => notify('Enrolment form opened.', 'info')}>
              Enrol student
            </Button>
          </>
        }
      />

      {atRisk > 0 && (
        <Card className="mb-4 border-amber-200 bg-amber-50/70 p-3.5">
          <div className="flex items-start gap-2.5">
            <TriangleAlert size={17} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
            <p className="text-[13px] text-amber-900">
              <span className="font-semibold">{atRisk} students are flagged at risk</span> — their attendance
              has fallen below the 70% certification threshold. Filter by status “At Risk” to review them.
            </p>
          </div>
        </Card>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['name', 'id', 'email', 'batch', 'subject']}
        searchPlaceholder="Search by name, roll number or email…"
        pageSize={12}
        filters={[
          { key: 'batch', label: 'Batch', options: BATCHES, value: batch, onChange: setBatch },
          { key: 'subject', label: 'Programme', options: SUBJECTS, value: subject, onChange: setSubject },
          { key: 'status', label: 'Status', options: ['Active', 'At Risk', 'Completed'], value: status, onChange: setStatus },
        ]}
        actions={(row) => [
          { label: 'View profile', icon: UserRound, onSelect: () => notify(`Opening ${row.name}'s profile.`, 'info') },
          { label: 'Email student', icon: Mail, onSelect: () => notify(`Draft opened for ${row.email}.`, 'info') },
          { label: 'Download report', icon: Download, onSelect: () => notify(`Progress report for ${row.name} downloaded.`) },
        ]}
        emptyTitle="No students found"
        emptyMessage="Adjust the batch, programme or status filters."
      />
    </>
  )
}
