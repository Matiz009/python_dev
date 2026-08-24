import { useState } from 'react'
import {
  Download, FileArchive, FileSpreadsheet, FileText, LayoutGrid, List, Pencil,
  Plus, Trash2, Upload,
} from 'lucide-react'
import {
  Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, SearchInput, Select,
} from '../components/ui/Primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { BATCHES, STUDY_MATERIAL, SUBJECTS } from '../data/mockData.js'

const TYPE_ICONS = { PDF: FileText, DOCX: FileText, XLSX: FileSpreadsheet, ZIP: FileArchive }
const TYPE_TONES = { PDF: 'critical', DOCX: 'info', XLSX: 'good', ZIP: 'warning' }

const BLANK = { title: '', subject: SUBJECTS[0], batch: BATCHES[0], type: 'PDF', file: '' }

export default function StudyMaterial() {
  const { notify } = useApp()
  const [rows, setRows] = useState(STUDY_MATERIAL)
  const [view, setView] = useState('grid')
  const [query, setQuery] = useState('')
  const [batch, setBatch] = useState('')
  const [subject, setSubject] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(BLANK)

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const filtered = rows.filter((r) => {
    const needle = query.trim().toLowerCase()
    return (
      (!needle || `${r.title} ${r.subject}`.toLowerCase().includes(needle)) &&
      (!batch || r.batch === batch) &&
      (!subject || r.subject === subject)
    )
  })

  const upload = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      notify('Give the material a title before uploading.', 'info')
      return
    }
    setRows((list) => [
      {
        ...form,
        id: `SM-${String(list.length + 1).padStart(2, '0')}`,
        size: '2.0 MB',
        updated: new Date().toISOString().slice(0, 10),
        downloads: 0,
      },
      ...list,
    ])
    notify(`“${form.title}” uploaded to ${form.batch}.`)
    setModalOpen(false)
    setForm(BLANK)
  }

  const remove = (row) => {
    setRows((list) => list.filter((r) => r.id !== row.id))
    notify(`“${row.title}” removed.`, 'info')
  }

  return (
    <>
      <PageHeader
        title="Study material"
        subtitle="Handbooks, workbooks and reference packs, categorised by batch and subject."
        actions={<Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Upload material</Button>}
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search material…"
            className="min-w-[200px] flex-1 sm:max-w-xs"
          />
          <Select value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Filter by batch" className="w-auto min-w-[9.5rem]">
            <option value="">Batch: All</option>
            {BATCHES.map((b) => <option key={b}>{b}</option>)}
          </Select>
          <Select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter by subject" className="w-auto min-w-[10rem]">
            <option value="">Subject: All</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </Select>

          <div className="ml-auto flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
            {[
              { id: 'grid', icon: LayoutGrid, label: 'Grid view' },
              { id: 'list', icon: List, label: 'List view' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-label={v.label}
                aria-pressed={view === v.id}
                className={`rounded-md p-1.5 transition-colors ${
                  view === v.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <v.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No material matches those filters"
            message="Try a different batch or subject, or clear the search."
            icon={FileText}
            action={<Button onClick={() => { setQuery(''); setBatch(''); setSubject('') }}>Clear filters</Button>}
          />
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const Icon = TYPE_ICONS[item.type] ?? FileText
            return (
              <Card key={item.id} className="flex flex-col p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-500">
                    <Icon size={18} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-semibold text-neutral-900">{item.title}</h3>
                    <p className="mt-0.5 truncate text-[12.5px] text-neutral-500">{item.subject}</p>
                  </div>
                  <Badge tone={TYPE_TONES[item.type] ?? 'neutral'}>{item.type}</Badge>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-[12px]">
                  <div>
                    <dt className="text-neutral-500">Size</dt>
                    <dd className="tnum mt-0.5 font-medium text-neutral-800">{item.size}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Downloads</dt>
                    <dd className="tnum mt-0.5 font-medium text-neutral-800">{item.downloads}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Updated</dt>
                    <dd className="tnum mt-0.5 font-medium text-neutral-800">{item.updated}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3">
                  <Badge tone="neutral">{item.batch}</Badge>
                  <div className="ml-auto flex items-center gap-1">
                    <Button size="icon" variant="ghost" aria-label={`Download ${item.title}`} onClick={() => notify(`${item.title} downloaded.`)}>
                      <Download size={15} />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label={`Edit ${item.title}`} onClick={() => notify(`Editing “${item.title}”.`, 'info')}>
                      <Pencil size={15} />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label={`Delete ${item.title}`} onClick={() => remove(item)}>
                      <Trash2 size={15} className="text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-neutral-100">
            {filtered.map((item) => {
              const Icon = TYPE_ICONS[item.type] ?? FileText
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50/70 sm:px-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-500">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div className="min-w-[180px] flex-1">
                    <p className="truncate text-[13.5px] font-medium text-neutral-900">{item.title}</p>
                    <p className="truncate text-[12px] text-neutral-500">
                      {item.subject} · {item.batch}
                    </p>
                  </div>
                  <Badge tone={TYPE_TONES[item.type] ?? 'neutral'}>{item.type}</Badge>
                  <span className="tnum hidden w-16 text-right text-[12.5px] text-neutral-500 sm:block">{item.size}</span>
                  <span className="tnum hidden w-24 text-right text-[12.5px] text-neutral-500 md:block">{item.updated}</span>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" aria-label={`Download ${item.title}`} onClick={() => notify(`${item.title} downloaded.`)}>
                      <Download size={15} />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label={`Delete ${item.title}`} onClick={() => remove(item)}>
                      <Trash2 size={15} className="text-red-600" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload study material"
        description="Files are made available to the selected batch immediately."
        footer={
          <>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={upload}>Upload</Button>
          </>
        }
      >
        <form onSubmit={upload} className="space-y-4">
          <Field label="Title" htmlFor="sm-title" required>
            <Input id="sm-title" value={form.title} onChange={setField('title')} placeholder="e.g. React hooks handbook" />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Subject" htmlFor="sm-subject">
              <Select id="sm-subject" value={form.subject} onChange={setField('subject')}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Batch" htmlFor="sm-batch">
              <Select id="sm-batch" value={form.batch} onChange={setField('batch')}>
                {BATCHES.map((b) => <option key={b}>{b}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="File type" htmlFor="sm-type">
            <Select id="sm-type" value={form.type} onChange={setField('type')}>
              {Object.keys(TYPE_ICONS).map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>

          <Field label="File" hint="Up to 50 MB per upload.">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40">
              <Upload size={18} className="text-neutral-400" aria-hidden="true" />
              <span className="text-[13px] font-medium text-neutral-700">
                {form.file || 'Click to choose a file'}
              </span>
              <span className="text-[12px] text-neutral-500">or drag and drop it here</span>
              <input
                type="file"
                className="sr-only"
                onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0]?.name ?? '' }))}
              />
            </label>
          </Field>
        </form>
      </Modal>
    </>
  )
}
