import { useState } from 'react'
import { BookOpen, Plus, Eye, FileCheck2 } from 'lucide-react'
import { StatusBadge, statusTone, DataTable, Card, CardBody } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { FormField, Input, Select } from '@/components/ui/FormControls'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { subjects as seed, syllabi, departments } from '@/data/demo'
import type { Subject, SyllabusUnit } from '@/types'

export default function SubjectsPage() {
  const toast = useToast()
  const { user } = useAuth()
  const isDeptScoped = user?.role === 'DEPARTMENT_HEAD' || user?.role === 'DEPARTMENT_STAFF'
  const visible = isDeptScoped ? seed.filter(s => s.departmentId === user!.organizationId) : seed

  const [rows] = useState<Subject[]>(visible)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<Subject | null>(null)

  const columns: Column<Subject>[] = [
    {
      key: 'name', header: 'Subject',
      render: s => <span className="cell-main">{s.name}<div className="cell-sub">{s.course}</div></span>,
    },
    { key: 'code', header: 'Code', render: s => <span className="u-mono">{s.code}</span> },
    {
      key: 'dept', header: 'Department',
      render: s => s.departmentName.length > 30 ? s.departmentName.split(' ').map(w => w[0]).join('') : s.departmentName,
    },
    { key: 'sem', header: 'Semester', render: s => `Sem ${s.semester}` },
    { key: 'year', header: 'Academic year', render: s => s.academicYear },
    { key: 'credits', header: 'Credits', render: s => String(s.credits) },
    { key: 'assigned', header: 'Assigned to', render: s => s.assignedTo ?? <span className="u-muted">—</span> },
    { key: 'bank', header: 'Bank size', render: s => String(s.questionCount) },
    {
      key: 'syllabus', header: 'Syllabus',
      render: s => (
        <StatusBadge tone={statusTone(s.syllabusStatus)}>
          {s.syllabusStatus.replaceAll('_', ' ')}
        </StatusBadge>
      ),
    },
    {
      key: 'actions', header: '', align: 'right',
      render: s => (
        <div className="row-actions">
          <button className="icon-btn" title="View subject & approved syllabus" onClick={() => setDetail(s)}><Eye size={15} /></button>
        </div>
      ),
    },
  ]

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    toast.push('success', 'Subject created', 'Subject registered. Upload the official syllabus to enable AI question generation.')
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Subjects</h1>
          <p className="page-desc">
            Hierarchy: University → College → Department → Course → Semester → Subject.
            Question generation requires an approved syllabus.
          </p>
        </div>
        {['SUPER_ADMIN', 'DEPARTMENT_HEAD'].includes(user?.role ?? '') && (
          <Button onClick={() => setOpen(true)}><Plus size={14} /> Add subject</Button>
        )}
      </div>

      <DataTable columns={columns} rows={rows} rowKey={s => s.id} />

      {/* Subject detail */}
      <Drawer open={!!detail} onClose={() => setDetail(null)}
        title={detail ? `${detail.code} — ${detail.name}` : ''} sub={`${detail?.course ?? ''} · Semester ${detail?.semester ?? ''} · ${detail?.academicYear ?? ''}`}>
        {detail && <SyllabusView subjectId={detail.id} />}
      </Drawer>

      <Modal open={open} onClose={() => setOpen(false)} title="Add subject"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" type="submit" form="add-subject">Create subject</Button></>}>
        <form id="add-subject" onSubmit={create}>
          <div className="form-row">
            <FormField label="Subject code" required>
              <Input required placeholder="CSC502" maxLength={10} />
            </FormField>
            <FormField label="Credits" required>
              <Input type="number" min={1} max={8} defaultValue={4} required />
            </FormField>
          </div>
          <FormField label="Subject name" required>
            <Input required placeholder="Machine Learning" />
          </FormField>
          <div className="form-row">
            <FormField label="Course" required>
              <Select options={['B.Tech CSE', 'B.Tech IT', 'B.Tech E&TC', 'MCA']} aria-label="Course" />
            </FormField>
            <FormField label="Semester" required>
              <Select options={['1', '2', '3', '4', '5', '6', '7', '8']} aria-label="Semester" />
            </FormField>
          </div>
          <FormField label="Department">
            <Select options={departments.map(d => ({ value: d.id, label: d.name }))} aria-label="Department" disabled={!!user?.organizationId && user.role !== 'UNIVERSITY_ADMIN'} />
          </FormField>
          <FormField label="Assign to staff member" hint="Only assigned staff may generate questions for this subject.">
            <Select options={['Prof. Amit Chavan', 'Prof. Sneha Kadam']} aria-label="Assign to" />
          </FormField>
        </form>
      </Modal>

      <Card style={{ marginTop: 'var(--sp-4)' }}>
        <CardBody className="u-xs u-muted u-flex">
          <FileCheck2 size={13} aria-hidden /> A subject becomes generation-ready only when its syllabus status is APPROVED — AI output is validated against that approved structure, not raw documents.
        </CardBody>
      </Card>
    </>
  )
}

function SyllabusView({ subjectId }: { subjectId: string }) {
  const syl = syllabi.find(s => s.subjectId === subjectId)
  if (!syl) return <p className="u-muted">No syllabus uploaded for this subject yet.</p>
  return (
    <>
      <div className="kv-list" style={{ marginBottom: 14 }}>
        <dt>Syllabus version</dt><dd>v{syl.version}</dd>
        <dt>Status</dt><dd><StatusBadge tone={statusTone(syl.status)}>{syl.status.replaceAll('_', ' ')}</StatusBadge></dd>
        <dt>Source document</dt><dd>{syl.sourceFile ?? 'Structured entry'}</dd>
        {syl.approvedBy && <><dt>Approved by</dt><dd>{syl.approvedBy}</dd></>}
      </div>
      <h4 style={{ marginBottom: 8 }}>Approved structure</h4>
      <div className="syllabus-tree">
        {(syl.units as SyllabusUnit[]).map(u => (
          <div key={u.id} className="syllabus-unit">
            <strong>Unit {u.number}: {u.title}</strong>
            <span className="chip" style={{ marginLeft: 6 }}>{u.hours} hrs</span>
            <span className="chip">{u.weightage}% weightage</span>
            {u.topics.map(t => (
              <div key={t.id} className="syllabus-topic">
                <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>{t.title}</div>
                {t.subtopics.map(st => <span key={st} className="chip">{st}</span>)}
                {t.learningOutcomes.map(lo => (
                  <div key={lo} className="u-xs u-flex" style={{ color: 'var(--blue)', marginTop: 3 }}>
                    <BookOpen size={11} aria-hidden /> {lo}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
