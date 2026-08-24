import { useState } from 'react'
import { BarChart3, Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Badge, Button, Field, Input, Modal, PageHeader, Select, StatusBadge, Textarea,
} from '../components/ui/Primitives.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { useApp } from '../context/AppContext.jsx'
import { BATCHES, QUIZZES, SUBJECTS } from '../data/mockData.js'

const BLANK = {
  title: '', subject: SUBJECTS[0], batch: BATCHES[0],
  questions: 20, minutes: 30, passMark: 60, attemptsAllowed: 1,
  opensAt: '', closesAt: '', shuffle: true, showAnswers: false,
  description: '',
}

export default function Quizzes() {
  const { notify } = useApp()
  const [rows, setRows] = useState(QUIZZES)
  const [batch, setBatch] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)

  const setField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const openCreate = () => {
    setEditing(null)
    setForm(BLANK)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({ ...BLANK, ...row })
    setModalOpen(true)
  }

  const save = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      notify('A quiz needs a title before it can be saved.', 'info')
      return
    }
    if (form.closesAt && form.opensAt && form.closesAt < form.opensAt) {
      notify('The closing deadline cannot fall before the opening date.', 'info')
      return
    }

    const numeric = {
      questions: Number(form.questions),
      minutes: Number(form.minutes),
      passMark: Number(form.passMark),
      attemptsAllowed: Number(form.attemptsAllowed),
    }

    if (editing) {
      setRows((list) => list.map((r) => (r.id === editing.id ? { ...r, ...form, ...numeric } : r)))
      notify(`“${form.title}” updated.`)
    } else {
      setRows((list) => [
        { ...form, ...numeric, id: `QZ-${String(list.length + 1).padStart(2, '0')}`, attempts: 0, avgScore: 0, status: 'Pending' },
        ...list,
      ])
      notify(`“${form.title}” scheduled for ${form.batch}.`)
    }
    setModalOpen(false)
  }

  const filtered = rows.filter(
    (r) => (!batch || r.batch === batch) && (!status || r.status === status)
  )

  const columns = [
    {
      key: 'title',
      header: 'Quiz',
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-neutral-900">{r.title}</p>
          <p className="truncate text-[12px] text-neutral-500">{r.subject}</p>
        </div>
      ),
    },
    { key: 'batch', header: 'Batch', sortable: true, render: (r) => <Badge tone="neutral">{r.batch}</Badge> },
    {
      key: 'questions',
      header: 'Format',
      align: 'right',
      render: (r) => (
        <span className="tnum text-neutral-600">
          {r.questions} Q · {r.minutes} min
        </span>
      ),
    },
    { key: 'attempts', header: 'Attempts', sortable: true, align: 'right', render: (r) => <span className="tnum">{r.attempts}</span> },
    {
      key: 'avgScore',
      header: 'Avg. score',
      sortable: true,
      align: 'right',
      render: (r) =>
        r.attempts === 0 ? (
          <span className="text-neutral-400">—</span>
        ) : (
          <span className="tnum font-medium text-neutral-900">{r.avgScore}%</span>
        ),
    },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <>
      <PageHeader
        title="Quizzes"
        subtitle="Timed assessments with automatic grading and per-batch analytics."
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>New quiz</Button>}
      />

      <DataTable
        columns={columns}
        rows={filtered}
        searchKeys={['title', 'subject', 'batch']}
        searchPlaceholder="Search quizzes…"
        filters={[
          { key: 'batch', label: 'Batch', options: BATCHES, value: batch, onChange: setBatch },
          { key: 'status', label: 'Status', options: ['Active', 'Pending', 'Completed'], value: status, onChange: setStatus },
        ]}
        actions={(row) => [
          { label: 'View results', icon: BarChart3, onSelect: () => notify(`${row.attempts} attempts recorded for “${row.title}”.`, 'info') },
          { label: 'Preview', icon: Eye, onSelect: () => notify(`Previewing “${row.title}”.`, 'info') },
          { label: 'Edit', icon: Pencil, onSelect: () => openEdit(row) },
          {
            label: 'Delete',
            icon: Trash2,
            tone: 'danger',
            onSelect: () => {
              setRows((list) => list.filter((r) => r.id !== row.id))
              notify(`“${row.title}” deleted.`, 'info')
            },
          },
        ]}
        emptyTitle="No quizzes found"
        emptyMessage="Create a quiz or clear the active filters."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        title={editing ? 'Edit quiz' : 'Create quiz'}
        description="Set the window, the timer and how attempts are graded."
        footer={
          <>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={save}>
              {editing ? 'Save changes' : 'Schedule quiz'}
            </Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Title" htmlFor="qz-title" required>
            <Input id="qz-title" value={form.title} onChange={setField('title')} placeholder="e.g. React fundamentals — week 4" />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Subject" htmlFor="qz-subject">
              <Select id="qz-subject" value={form.subject} onChange={setField('subject')}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Batch" htmlFor="qz-batch">
              <Select id="qz-batch" value={form.batch} onChange={setField('batch')}>
                {BATCHES.map((b) => <option key={b}>{b}</option>)}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Questions" htmlFor="qz-questions">
              <Input id="qz-questions" type="number" min={1} max={100} value={form.questions} onChange={setField('questions')} />
            </Field>
            <Field label="Time limit" htmlFor="qz-minutes" hint="minutes">
              <Input id="qz-minutes" type="number" min={5} max={180} value={form.minutes} onChange={setField('minutes')} />
            </Field>
            <Field label="Pass mark" htmlFor="qz-pass" hint="percent">
              <Input id="qz-pass" type="number" min={0} max={100} value={form.passMark} onChange={setField('passMark')} />
            </Field>
            <Field label="Attempts" htmlFor="qz-attempts">
              <Input id="qz-attempts" type="number" min={1} max={5} value={form.attemptsAllowed} onChange={setField('attemptsAllowed')} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Opens" htmlFor="qz-opens">
              <Input id="qz-opens" type="datetime-local" value={form.opensAt} onChange={setField('opensAt')} />
            </Field>
            <Field label="Closes" htmlFor="qz-closes">
              <Input id="qz-closes" type="datetime-local" value={form.closesAt} onChange={setField('closesAt')} />
            </Field>
          </div>

          <Field label="Description" htmlFor="qz-desc">
            <Textarea id="qz-desc" rows={3} value={form.description} onChange={setField('description')} placeholder="What the quiz covers." />
          </Field>

          <div className="space-y-2.5 rounded-lg bg-neutral-50 p-3.5">
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.shuffle}
                onChange={setField('shuffle')}
                className="h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-2 focus:ring-brand-500/30"
              />
              <span className="text-[13px] text-neutral-700">Shuffle question order per attempt</span>
            </label>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.showAnswers}
                onChange={setField('showAnswers')}
                className="h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-2 focus:ring-brand-500/30"
              />
              <span className="text-[13px] text-neutral-700">Reveal correct answers after the window closes</span>
            </label>
          </div>
        </form>
      </Modal>
    </>
  )
}
