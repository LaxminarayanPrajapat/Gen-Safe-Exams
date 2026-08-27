import { useRef, useState } from 'react'
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react'

interface FileUploaderProps {
  accept?: string
  hint?: string
  onFileSelected: (file: File) => void
}

/** Drag-and-drop uploader (demo mode: file never leaves the browser). */
export function FileUploader({ accept = '.pdf,.docx,.txt', hint = 'PDF, DOCX or TXT up to 25 MB', onFileSelected }: FileUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    setFile(f)
    onFileSelected(f)
  }

  if (file) {
    return (
      <div className="u-flex-between" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', background: 'var(--surface-2)' }}>
        <span className="u-flex">
          <CheckCircle2 size={16} color="var(--success)" aria-hidden />
          <span className="u-bold">{file.name}</span>
          <span className="u-xs u-muted">({Math.round(file.size / 1024)} KB)</span>
        </span>
        <button className="icon-btn" aria-label="Remove file" onClick={() => { setFile(null); inputRef.current && (inputRef.current.value = '') }}>
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload syllabus document"
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      onMouseOver={() => setDragging(true)}
      onMouseOut={() => setDragging(false)}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      style={{
        border: `1.5px dashed ${dragging ? 'var(--blue)' : 'var(--border-strong)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '26px 16px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? 'var(--blue-soft)' : 'var(--surface)',
        transition: 'border-color 0.12s, background 0.12s',
      }}
    >
      <UploadCloud size={22} color="var(--muted)" style={{ marginBottom: 6 }} aria-hidden />
      <div className="u-bold" style={{ fontSize: 'var(--fs-base)' }}>Drag & drop the syllabus document</div>
      <div className="u-xs u-muted" style={{ marginTop: 3 }}>{hint}</div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={e => handleFiles(e.target.files)}
      />
      <div className="u-flex" style={{ justifyContent: 'center', marginTop: 8, color: 'var(--muted)' }}>
        <FileText size={13} /> <span className="u-xs">Documents are processed by the institutional AI service only.</span>
      </div>
    </div>
  )
}
