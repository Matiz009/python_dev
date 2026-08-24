import { useState } from 'react'
import { Bell, Building2, Palette, Save, ShieldCheck } from 'lucide-react'
import {
  Button, Card, CardHeader, Field, Input, PageHeader, Select, Tabs, Textarea,
} from '../components/ui/Primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { CURRENT_USER } from '../data/mockData.js'

const TABS = [
  { id: 'institution', label: 'Institution' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
  { id: 'appearance', label: 'Appearance' },
]

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-b border-neutral-100 py-3.5 last:border-0">
      <span className="min-w-0">
        <span className="block text-[13.5px] font-medium text-neutral-800">{label}</span>
        {description && <span className="mt-0.5 block text-[12.5px] text-neutral-500">{description}</span>}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
        <span className="block h-5 w-9 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600" />
        <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  )
}

export default function Settings() {
  const { notify } = useApp()
  const [tab, setTab] = useState('institution')

  const [institution, setInstitution] = useState({
    name: 'iCAMPUS Institute of Technology',
    campus: CURRENT_USER.campus,
    email: 'registrar@icampus.edu',
    phone: '+92 42 111 000 222',
    address: '12 Main Boulevard, Gulberg III, Lahore',
    timezone: 'Asia/Karachi (UTC+5)',
    academicYear: '2026 - 2027',
  })

  const [alerts, setAlerts] = useState({
    lowAttendance: true,
    newSubmission: true,
    weeklyDigest: false,
    leaveDecisions: true,
    systemMaintenance: false,
  })

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: '30 minutes',
    ipAllowlist: false,
    passwordRotation: '90 days',
  })

  const [appearance, setAppearance] = useState({
    density: 'Comfortable',
    startPage: 'Dashboard',
    weekStart: 'Monday',
    numberFormat: 'en-PK',
  })

  const save = (section) => notify(`${section} settings saved.`)

  const setInst = (key) => (e) => setInstitution((s) => ({ ...s, [key]: e.target.value }))
  const setApp = (key) => (e) => setAppearance((s) => ({ ...s, [key]: e.target.value }))
  const setSec = (key) => (e) => setSecurity((s) => ({ ...s, [key]: e.target.value }))

  return (
    <>
      <PageHeader title="Settings" subtitle="Institution profile, alerting, security and display preferences." />

      <div className="mb-4 max-w-lg">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === 'institution' && (
        <Card className="max-w-3xl">
          <CardHeader
            title="Institution profile"
            subtitle="Appears on vouchers, transcripts and result slips."
            actions={<Building2 size={18} className="text-neutral-400" aria-hidden="true" />}
          />
          <div className="space-y-4 p-4 sm:p-5">
            <Field label="Institution name" htmlFor="st-name">
              <Input id="st-name" value={institution.name} onChange={setInst('name')} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Campus" htmlFor="st-campus">
                <Input id="st-campus" value={institution.campus} onChange={setInst('campus')} />
              </Field>
              <Field label="Academic year" htmlFor="st-year">
                <Input id="st-year" value={institution.academicYear} onChange={setInst('academicYear')} />
              </Field>
              <Field label="Registrar email" htmlFor="st-email">
                <Input id="st-email" type="email" value={institution.email} onChange={setInst('email')} />
              </Field>
              <Field label="Phone" htmlFor="st-phone">
                <Input id="st-phone" value={institution.phone} onChange={setInst('phone')} />
              </Field>
            </div>
            <Field label="Address" htmlFor="st-address">
              <Textarea id="st-address" rows={2} value={institution.address} onChange={setInst('address')} />
            </Field>
            <Field label="Timezone" htmlFor="st-tz">
              <Select id="st-tz" value={institution.timezone} onChange={setInst('timezone')}>
                {['Asia/Karachi (UTC+5)', 'Asia/Dubai (UTC+4)', 'Europe/London (UTC+0)', 'America/New_York (UTC-5)'].map((tz) => (
                  <option key={tz}>{tz}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex justify-end border-t border-neutral-200 bg-neutral-50/70 px-5 py-3.5">
            <Button variant="primary" icon={Save} onClick={() => save('Institution')}>Save changes</Button>
          </div>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card className="max-w-3xl">
          <CardHeader
            title="Notification preferences"
            subtitle="Choose what reaches your inbox and what stays in-app."
            actions={<Bell size={18} className="text-neutral-400" aria-hidden="true" />}
          />
          <div className="px-4 py-1 sm:px-5">
            <Toggle
              label="Low attendance alerts"
              description="Email me when a student drops below the 70% threshold."
              checked={alerts.lowAttendance}
              onChange={(e) => setAlerts((a) => ({ ...a, lowAttendance: e.target.checked }))}
            />
            <Toggle
              label="New submissions"
              description="Notify me each time coursework is handed in."
              checked={alerts.newSubmission}
              onChange={(e) => setAlerts((a) => ({ ...a, newSubmission: e.target.checked }))}
            />
            <Toggle
              label="Weekly digest"
              description="A Monday summary of batch performance and attendance."
              checked={alerts.weeklyDigest}
              onChange={(e) => setAlerts((a) => ({ ...a, weeklyDigest: e.target.checked }))}
            />
            <Toggle
              label="Leave decisions"
              description="Tell me as soon as a leave request is approved or rejected."
              checked={alerts.leaveDecisions}
              onChange={(e) => setAlerts((a) => ({ ...a, leaveDecisions: e.target.checked }))}
            />
            <Toggle
              label="Maintenance windows"
              description="Advance notice of planned platform downtime."
              checked={alerts.systemMaintenance}
              onChange={(e) => setAlerts((a) => ({ ...a, systemMaintenance: e.target.checked }))}
            />
          </div>
          <div className="flex justify-end border-t border-neutral-200 bg-neutral-50/70 px-5 py-3.5">
            <Button variant="primary" icon={Save} onClick={() => save('Notification')}>Save preferences</Button>
          </div>
        </Card>
      )}

      {tab === 'security' && (
        <Card className="max-w-3xl">
          <CardHeader
            title="Security"
            subtitle="Access controls applied to every account on this campus."
            actions={<ShieldCheck size={18} className="text-neutral-400" aria-hidden="true" />}
          />
          <div className="px-4 py-1 sm:px-5">
            <Toggle
              label="Two-factor authentication"
              description="Require a one-time code at every sign-in."
              checked={security.twoFactor}
              onChange={(e) => setSecurity((s) => ({ ...s, twoFactor: e.target.checked }))}
            />
            <Toggle
              label="Restrict to campus IP range"
              description="Block sign-ins from outside the campus network."
              checked={security.ipAllowlist}
              onChange={(e) => setSecurity((s) => ({ ...s, ipAllowlist: e.target.checked }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="Idle session timeout" htmlFor="st-timeout">
              <Select id="st-timeout" value={security.sessionTimeout} onChange={setSec('sessionTimeout')}>
                {['15 minutes', '30 minutes', '1 hour', '4 hours'].map((v) => <option key={v}>{v}</option>)}
              </Select>
            </Field>
            <Field label="Password rotation" htmlFor="st-rotation">
              <Select id="st-rotation" value={security.passwordRotation} onChange={setSec('passwordRotation')}>
                {['30 days', '60 days', '90 days', 'Never'].map((v) => <option key={v}>{v}</option>)}
              </Select>
            </Field>
          </div>
          <div className="flex justify-end border-t border-neutral-200 bg-neutral-50/70 px-5 py-3.5">
            <Button variant="primary" icon={Save} onClick={() => save('Security')}>Save security settings</Button>
          </div>
        </Card>
      )}

      {tab === 'appearance' && (
        <Card className="max-w-3xl">
          <CardHeader
            title="Appearance"
            subtitle="How the console lays out and formats information for you."
            actions={<Palette size={18} className="text-neutral-400" aria-hidden="true" />}
          />
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="Density" htmlFor="st-density">
              <Select id="st-density" value={appearance.density} onChange={setApp('density')}>
                {['Comfortable', 'Compact'].map((v) => <option key={v}>{v}</option>)}
              </Select>
            </Field>
            <Field label="Start page" htmlFor="st-start">
              <Select id="st-start" value={appearance.startPage} onChange={setApp('startPage')}>
                {['Dashboard', 'My Lectures', 'Daily Planner', 'Students'].map((v) => <option key={v}>{v}</option>)}
              </Select>
            </Field>
            <Field label="Week starts on" htmlFor="st-week">
              <Select id="st-week" value={appearance.weekStart} onChange={setApp('weekStart')}>
                {['Monday', 'Sunday'].map((v) => <option key={v}>{v}</option>)}
              </Select>
            </Field>
            <Field label="Number format" htmlFor="st-number">
              <Select id="st-number" value={appearance.numberFormat} onChange={setApp('numberFormat')}>
                {['en-PK', 'en-GB', 'en-US'].map((v) => <option key={v}>{v}</option>)}
              </Select>
            </Field>
          </div>
          <div className="flex justify-end border-t border-neutral-200 bg-neutral-50/70 px-5 py-3.5">
            <Button variant="primary" icon={Save} onClick={() => save('Appearance')}>Save appearance</Button>
          </div>
        </Card>
      )}
    </>
  )
}
