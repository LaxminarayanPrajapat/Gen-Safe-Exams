import { useState } from 'react'
import { Building2, Cpu, KeyRound, Bell, Save } from 'lucide-react'
import { Card, CardHeader, CardBody, Tabs, Button, FormField, Input, Select, Textarea, StatusBadge, SecurityBadge } from '@/components/ui'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/data/nav'

export default function SettingsPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [tab, setActive] = useState('organization')

  const canManagePlatform = user?.role === 'SUPER_ADMIN'

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Settings</h1>
          <p className="page-desc">Configuration visible to your role. Platform-wide settings require Super Admin authority; changes are audited.</p>
        </div>
      </div>

      <Tabs active={tab} onChange={setActive} tabs={[
        { id: 'organization', label: 'Organization' },
        ...(canManagePlatform ? [{ id: 'ai', label: 'AI providers' }] : []),
        { id: 'policies', label: 'Exam policies' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'api', label: 'API & secrets' },
      ]} />

      {tab === 'organization' && (
        <Card style={{ maxWidth: 720 }}>
          <CardHeader title="Institution profile" sub={<span className="u-flex"><Building2 size={13} /> {user?.organizationName}</span>} />
          <CardBody>
            <div className="form-row">
              <FormField label="Display name"><Input defaultValue={user?.organizationName} /></FormField>
              <FormField label="Tenant ID" hint="Immutable — used for data isolation">
                <Input readOnly value={user?.organizationId ?? ''} />
              </FormField>
            </div>
            <div className="form-row">
              <FormField label="Examination controller of record">
                <Select options={['Dr. Nilesh Jadhav', 'Dr. Manisha Khot']} aria-label="Controller" />
              </FormField>
              <FormField label="Academic cycle">
                <Select options={['2026–27 Winter', '2026–27 Summer']} aria-label="Cycle" />
              </FormField>
            </div>
            <Button onClick={() => toast.push('success', 'Profile saved', 'SETTINGS_CHANGED audit event recorded.')}><Save size={14} /> Save changes</Button>
          </CardBody>
        </Card>
      )}

      {tab === 'ai' && canManagePlatform && (
        <div className="dash-grid">
          <Card flush>
            <CardHeader title={<span className="u-flex"><Cpu size={15} /> AI provider configuration</span>}
              sub="Provider abstraction — swap vendors without touching business logic" />
            <table className="data-table" style={{ minWidth: 0 }}>
              <thead><tr><th>Capability</th><th>Active provider</th><th>Model</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td className="cell-main">LLM (generation & extraction)</td><td>OpenAIProvider</td><td className="u-mono u-xs">gpt-4.1 (configurable)</td><td><StatusBadge tone="green">CONNECTED</StatusBadge></td></tr>
                <tr><td className="cell-main">Embeddings</td><td>OpenAIProvider</td><td className="u-mono u-xs">text-embedding-3-small</td><td><StatusBadge tone="green">CONNECTED</StatusBadge></td></tr>
                <tr><td className="cell-main">Fallback provider</td><td>GeminiProvider</td><td className="u-mono u-xs">gemini-2.0-flash</td><td><StatusBadge tone="blue">STANDBY</StatusBadge></td></tr>
                <tr><td className="cell-main">Vector store</td><td>pgvector (PostgreSQL)</td><td className="u-mono u-xs">HNSW · cosine</td><td><StatusBadge tone="green">HEALTHY</StatusBadge></td></tr>
              </tbody>
            </table>
          </Card>
          <Card>
            <CardHeader title="Guardrails" />
            <CardBody className="u-stack-2 u-sm">
              <SecurityBadge label="Structured JSON output enforced by schema" />
              <SecurityBadge label="Rules engine validates every AI response" />
              <SecurityBadge label="No AI decision without human review" locked={false} />
              <p className="u-xs u-muted">API keys are held only in backend environment variables. The React bundle contains no secret material.</p>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'policies' && (
        <Card style={{ maxWidth: 760 }}>
          <CardHeader title="Examination policy defaults" sub="Applied to new blueprints in your institution" />
          <CardBody>
            <div className="form-row">
              <FormField label="Default total marks">
                <Select options={['70', '80', '100']} aria-label="Total marks" />
              </FormField>
              <FormField label="Default duration (min)">
                <Select options={['120', '150', '180']} aria-label="Duration" />
              </FormField>
              <FormField label="Release offset before exam">
                <Select options={['5 minutes', '10 minutes', '15 minutes']} aria-label="Offset" />
              </FormField>
            </div>
            <FormField label="Approval chain" hint="Fixed by platform governance — shown for transparency">
              <Textarea readOnly rows={3} value={'Staff → Department Head → College Exam Officer → University Exam Controller → Secure Vault → Scheduled release'} />
            </FormField>
            <div className="alert-banner info">
              The final release step cannot be delegated to any staff or department role.
            </div>
          </CardBody>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card style={{ maxWidth: 620 }}>
          <CardHeader title={<span className="u-flex"><Bell size={15} /> Notification preferences</span>} />
          <CardBody>
            {['Paper submitted for my approval', 'Security event at HIGH or above', 'Vault release activated', 'Syllabus extraction completed'].map(label => (
              <label key={label} className="checkbox-row" style={{ marginBottom: 10 }}>
                <input type="checkbox" defaultChecked /> {label}
              </label>
            ))}
            <Button onClick={() => toast.push('success', 'Preferences saved')}>Save preferences</Button>
          </CardBody>
        </Card>
      )}

      {tab === 'api' && (
        <div className="dash-grid">
          <Card>
            <CardHeader title={<span className="u-flex"><KeyRound size={15} /> Secret handling</span>} />
            <CardBody className="u-stack-2 u-sm">
              <div className="hash-line">VITE_API_BASE_URL=http://localhost:4000/api</div>
              <p className="u-xs u-muted">Only non-sensitive configuration lives in the frontend environment. Database credentials, JWT secrets and LLM API keys exist solely in the backend environment and are never shipped to browsers.</p>
              <SecurityBadge label="Frontend bundle scanned: no secret material found" />
            </CardBody>
          </Card>
          <Card flush>
            <CardHeader title="Recent SETTINGS_CHANGED events" />
            <table className="data-table" style={{ minWidth: 0 }}>
              <thead><tr><th>When</th><th>Actor</th><th>Target</th></tr></thead>
              <tbody>
                <tr><td>15 Aug 2026</td><td>Arjun Mehta</td><td className="u-mono u-xs">ai-provider</td></tr>
                <tr><td>02 Jul 2026</td><td>Dr. Anil Patil</td><td className="u-mono u-xs">exam-policy-defaults</td></tr>
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </>
  )
}
