import { useState } from 'react'
import { Camera, Mail, MapPin, Phone, Save, Briefcase } from 'lucide-react'
import {
  Badge, Button, Card, CardHeader, Field, Input, PageHeader, Select, Textarea,
} from '../components/ui/Primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { CURRENT_USER, SUBJECTS } from '../data/mockData.js'

export default function Profile() {
  const { notify } = useApp()
  const [form, setForm] = useState({
    fullName: CURRENT_USER.fullName,
    displayName: CURRENT_USER.name,
    email: CURRENT_USER.email,
    phone: '+92 300 1234567',
    role: CURRENT_USER.role,
    campus: CURRENT_USER.campus,
    speciality: SUBJECTS[0],
    employeeId: 'EMP-2041',
    bio: 'Lead instructor for the web development track. Teaches React, TypeScript and front-end architecture across the 42 and 43 intakes.',
  })

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = (e) => {
    e.preventDefault()
    if (!form.fullName.trim() || !form.email.trim()) {
      notify('Name and email are both required.', 'info')
      return
    }
    notify('Profile updated.')
  }

  return (
    <>
      <PageHeader title="Profile" subtitle="Your details as they appear to students and colleagues." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ---------------------------- Summary card --------------------------- */}
        <Card className="p-5 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-neutral-900 text-xl font-semibold text-white">
                {CURRENT_USER.initials}
              </div>
              <button
                type="button"
                onClick={() => notify('Photo upload opened.', 'info')}
                aria-label="Change profile photo"
                className="absolute right-0 bottom-0 grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-white ring-2 ring-white transition-colors hover:bg-brand-600"
              >
                <Camera size={13} />
              </button>
            </div>

            <h2 className="mt-3 text-[16px] font-semibold text-neutral-900">{form.fullName}</h2>
            <p className="mt-0.5 text-[13px] text-neutral-500">{form.role}</p>
            <div className="mt-2.5">
              <Badge tone="brand">{form.speciality}</Badge>
            </div>
          </div>

          <dl className="mt-5 space-y-3 border-t border-neutral-100 pt-4 text-[13px]">
            {[
              { icon: Mail, label: 'Email', value: form.email },
              { icon: Phone, label: 'Phone', value: form.phone },
              { icon: MapPin, label: 'Campus', value: form.campus },
              { icon: Briefcase, label: 'Employee ID', value: form.employeeId },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-2.5">
                <row.icon size={15} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-[11.5px] text-neutral-500">{row.label}</dt>
                  <dd className="truncate text-neutral-800">{row.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>

        {/* ----------------------------- Edit form ----------------------------- */}
        <Card className="lg:col-span-2">
          <CardHeader title="Edit details" subtitle="Changes are visible to students immediately." />
          <form onSubmit={save}>
            <div className="space-y-4 p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="pf-name" required>
                  <Input id="pf-name" value={form.fullName} onChange={setField('fullName')} />
                </Field>
                <Field label="Display name" htmlFor="pf-display">
                  <Input id="pf-display" value={form.displayName} onChange={setField('displayName')} />
                </Field>
                <Field label="Email" htmlFor="pf-email" required>
                  <Input id="pf-email" type="email" value={form.email} onChange={setField('email')} />
                </Field>
                <Field label="Phone" htmlFor="pf-phone">
                  <Input id="pf-phone" value={form.phone} onChange={setField('phone')} />
                </Field>
                <Field label="Role" htmlFor="pf-role">
                  <Select id="pf-role" value={form.role} onChange={setField('role')}>
                    {['Lead Instructor', 'Instructor', 'Teaching Assistant', 'Programme Coordinator'].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Speciality" htmlFor="pf-speciality">
                  <Select id="pf-speciality" value={form.speciality} onChange={setField('speciality')}>
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Campus" htmlFor="pf-campus">
                  <Input id="pf-campus" value={form.campus} onChange={setField('campus')} />
                </Field>
                <Field label="Employee ID" htmlFor="pf-emp" hint="Read-only, issued by HR.">
                  <Input id="pf-emp" value={form.employeeId} disabled />
                </Field>
              </div>

              <Field label="Bio" htmlFor="pf-bio" hint="Shown on your instructor card in the student portal.">
                <Textarea id="pf-bio" rows={4} value={form.bio} onChange={setField('bio')} />
              </Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-neutral-200 bg-neutral-50/70 px-5 py-3.5">
              <Button type="button" onClick={() => notify('Changes discarded.', 'info')}>Discard</Button>
              <Button type="submit" variant="primary" icon={Save}>Save profile</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
