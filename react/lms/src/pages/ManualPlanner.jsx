import { useMemo, useState } from 'react'
import { CalendarRange, Save, Trash2, Wand2 } from 'lucide-react'
import {
  Badge, Button, Card, CardHeader, Field, PageHeader, Select,
} from '../components/ui/Primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { BATCHES, SUBJECTS } from '../data/mockData.js'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const SLOTS = ['09:00 - 10:30', '10:45 - 12:15', '13:00 - 14:30', '14:45 - 16:15']
const ROOMS = ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Studio']

const SUBJECT_TONES = {
  'Web Development': 'info',
  'Data Science': 'warning',
  'Cloud & DevOps': 'good',
  'UI/UX Design': 'violet',
  'Cyber Security': 'critical',
}

/** Seeded starting timetable so the grid opens with something to edit. */
const INITIAL = {
  'Monday|09:00 - 10:30': { subject: 'Web Development', batch: 'Batch 42-A', room: 'Lab 3' },
  'Monday|13:00 - 14:30': { subject: 'Cloud & DevOps', batch: 'Batch 42-B', room: 'Lab 2' },
  'Tuesday|10:45 - 12:15': { subject: 'Data Science', batch: 'Batch 41-B', room: 'Lab 1' },
  'Wednesday|09:00 - 10:30': { subject: 'Web Development', batch: 'Batch 43-A', room: 'Lab 3' },
  'Wednesday|14:45 - 16:15': { subject: 'Cyber Security', batch: 'Batch 41-A', room: 'Lab 4' },
  'Thursday|10:45 - 12:15': { subject: 'UI/UX Design', batch: 'Batch 43-A', room: 'Studio' },
  'Friday|13:00 - 14:30': { subject: 'Data Science', batch: 'Batch 42-A', room: 'Lab 1' },
}

export default function ManualPlanner() {
  const { notify } = useApp()
  const [grid, setGrid] = useState(INITIAL)
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [batch, setBatch] = useState(BATCHES[0])
  const [room, setRoom] = useState(ROOMS[0])

  const assign = (day, slot) => {
    const key = `${day}|${slot}`
    setGrid((g) => ({ ...g, [key]: { subject, batch, room } }))
    notify(`${subject} assigned to ${day}, ${slot}.`)
  }

  const clear = (day, slot) => {
    const key = `${day}|${slot}`
    setGrid((g) => {
      const next = { ...g }
      delete next[key]
      return next
    })
    notify(`${day} ${slot} cleared.`, 'info')
  }

  /** A room booked twice in the same slot is the one conflict worth flagging. */
  const conflicts = useMemo(() => {
    const seen = new Map()
    const clashing = new Set()
    for (const [key, cell] of Object.entries(grid)) {
      const slot = key.split('|')[1]
      const day = key.split('|')[0]
      const roomKey = `${day}|${slot}|${cell.room}`
      if (seen.has(roomKey)) {
        clashing.add(key)
        clashing.add(seen.get(roomKey))
      } else {
        seen.set(roomKey, key)
      }
    }
    return clashing
  }, [grid])

  const filled = Object.keys(grid).length
  const capacity = DAYS.length * SLOTS.length

  return (
    <>
      <PageHeader
        title="Manual planner"
        subtitle="Build the weekly timetable slot by slot, then publish it to the batches."
        actions={
          <>
            <Button icon={Wand2} onClick={() => notify('Auto-fill suggested 4 placements.', 'info')}>
              Auto-fill
            </Button>
            <Button variant="primary" icon={Save} onClick={() => notify('Timetable published to all batches.')}>
              Publish timetable
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardHeader
          title="Placement tool"
          subtitle="Pick what you are placing, then click any empty slot in the grid."
        />
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:p-5">
          <Field label="Subject" htmlFor="mp-subject">
            <Select id="mp-subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Batch" htmlFor="mp-batch">
            <Select id="mp-batch" value={batch} onChange={(e) => setBatch(e.target.value)}>
              {BATCHES.map((b) => <option key={b}>{b}</option>)}
            </Select>
          </Field>
          <Field label="Room" htmlFor="mp-room">
            <Select id="mp-room" value={room} onChange={(e) => setRoom(e.target.value)}>
              {ROOMS.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
        </div>
      </Card>

      {conflicts.size > 0 && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <CalendarRange size={17} className="mt-0.5 shrink-0 text-red-700" aria-hidden="true" />
          <p className="text-[13px] text-red-900">
            <span className="font-semibold">{conflicts.size / 2} room conflict(s)</span> — the same room is
            double-booked in one slot. Conflicting cells are outlined in red.
          </p>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader
          title="Weekly timetable"
          subtitle={`${filled} of ${capacity} slots assigned`}
        />
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/70">
                <th scope="col" className="w-32 px-4 py-2.5 text-left text-[11.5px] font-semibold tracking-wide text-neutral-500 uppercase">
                  Slot
                </th>
                {DAYS.map((day) => (
                  <th key={day} scope="col" className="px-3 py-2.5 text-left text-[11.5px] font-semibold tracking-wide text-neutral-500 uppercase">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot) => (
                <tr key={slot} className="border-b border-neutral-100 last:border-0">
                  <th scope="row" className="tnum px-4 py-2.5 text-left text-[12.5px] font-medium whitespace-nowrap text-neutral-600">
                    {slot}
                  </th>
                  {DAYS.map((day) => {
                    const key = `${day}|${slot}`
                    const cell = grid[key]
                    const clashing = conflicts.has(key)

                    if (!cell) {
                      return (
                        <td key={key} className="p-1.5 align-top">
                          <button
                            type="button"
                            onClick={() => assign(day, slot)}
                            className="h-full min-h-[72px] w-full rounded-lg border border-dashed border-neutral-300 text-[12px] text-neutral-400 transition-colors hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-700"
                          >
                            + Assign
                          </button>
                        </td>
                      )
                    }

                    return (
                      <td key={key} className="p-1.5 align-top">
                        <div
                          className={`group min-h-[72px] rounded-lg border bg-white p-2.5 ${
                            clashing ? 'border-red-400 ring-1 ring-red-300' : 'border-neutral-200'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <p className="flex-1 text-[12.5px] leading-snug font-medium text-neutral-900">
                              {cell.subject}
                            </p>
                            <button
                              type="button"
                              onClick={() => clear(day, slot)}
                              aria-label={`Clear ${day} ${slot}`}
                              className="-m-1 rounded p-1 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600 focus:opacity-100"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p className="mt-1 text-[11.5px] text-neutral-500">{cell.batch}</p>
                          <div className="mt-1.5">
                            <Badge tone={clashing ? 'critical' : SUBJECT_TONES[cell.subject] ?? 'neutral'}>
                              {cell.room}
                            </Badge>
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
