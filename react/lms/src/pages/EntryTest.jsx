import { useState } from 'react'
import { CalendarPlus, CheckCheck, Download, Eye, MapPin } from 'lucide-react'
import { Badge, Button, Card, PageHeader, StatusBadge } from '../components/ui/Primitives.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ENTRY_TESTS, SUBJECTS } from '../data/mockData.js'

const CENTRES = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad']

export default function EntryTest() {
  const { notify } = useApp()
  const [centre, setCentre] = useState('')
  const [result, setResult] = useState('')
  const [subject, setSubject] = useState('')

  const rows = ENTRY_TESTS.filter(
    (t) =>
      (!centre || t.centre === centre) &&
      (!result || t.result === result) &&
      (!subject || t.appliedFor === subject)
  )

  const counts = ENTRY_TESTS.reduce((acc, t) => {
    acc[t.result] = (acc[t.result] ?? 0) + 1
    return acc
  }, {})

  const passRate = ((counts.Passed / ENTRY_TESTS.length) * 100).toFixed(1)

  const columns = [
    {
      key: 'candidate',
      header: 'Candidate',
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-neutral-900">{r.candidate}</p>
          <p className="tnum truncate text-[12px] text-neutral-500">{r.id}</p>
        </div>
      ),
    },
    { key: 'appliedFor', header: 'Applied for', sortable: true },
    {
      key: 'centre',
      header: 'Centre',
      sortable: true,
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-neutral-600">
          <MapPin size={13} className="text-neutral-400" aria-hidden="true" />
          {r.centre}
        </span>
      ),
    },
    {
      key: 'scheduled',
      header: 'Scheduled',
      sortable: true,
      render: (r) => <span className="tnum text-neutral-600">{r.scheduled}</span>,
    },
    {
      key: 'score',
      header: 'Score',
      sortable: true,
      align: 'right',
      render: (r) => <span className="tnum font-medium text-neutral-900">{r.score}</span>,
    },
    { key: 'result', header: 'Result', sortable: true, render: (r) => <StatusBadge status={r.result} /> },
  ]

  return (
    <>
      <PageHeader
        title="Entry test"
        subtitle="Admission screening across all examination centres."
        actions={
          <>
            <Button icon={Download} onClick={() => notify('Results exported as CSV.')}>Export results</Button>
            <Button variant="primary" icon={CalendarPlus} onClick={() => notify('New test session scheduled.', 'info')}>
              Schedule session
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Candidates', value: ENTRY_TESTS.length, tone: 'neutral' },
          { label: 'Passed', value: counts.Passed ?? 0, tone: 'good' },
          { label: 'Waitlisted', value: counts.Waitlisted ?? 0, tone: 'warning' },
          { label: 'Pass rate', value: `${passRate}%`, tone: 'neutral' },
        ].map((tile) => (
          <Card key={tile.label} className="p-3.5">
            <p className="text-[12px] font-medium text-neutral-500">{tile.label}</p>
            <p className="tnum mt-1.5 text-xl font-semibold text-neutral-900">{tile.value}</p>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['candidate', 'id', 'appliedFor', 'centre']}
        searchPlaceholder="Search candidates…"
        pageSize={10}
        filters={[
          { key: 'centre', label: 'Centre', options: CENTRES, value: centre, onChange: setCentre },
          { key: 'subject', label: 'Programme', options: SUBJECTS, value: subject, onChange: setSubject },
          { key: 'result', label: 'Result', options: ['Passed', 'Waitlisted', 'Failed'], value: result, onChange: setResult },
        ]}
        actions={(row) => [
          { label: 'View answer sheet', icon: Eye, onSelect: () => notify(`Opening answer sheet for ${row.candidate}.`, 'info') },
          { label: 'Offer a seat', icon: CheckCheck, onSelect: () => notify(`Offer sent to ${row.candidate}.`) },
          { label: 'Download result', icon: Download, onSelect: () => notify(`Result slip for ${row.candidate} downloaded.`) },
        ]}
        emptyTitle="No candidates found"
        emptyMessage="Adjust the centre, programme or result filters."
      />
    </>
  )
}
