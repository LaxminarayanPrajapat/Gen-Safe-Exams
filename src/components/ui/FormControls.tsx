import type { ReactNode } from 'react'
import type { SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FormFieldProps {
  label?: ReactNode
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
  htmlFor?: string
}

export function FormField({ label, required, hint, error, children, htmlFor }: FormFieldProps) {
  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={htmlFor}>
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />
}

export interface Option { value: string; label: string }

export function Select({ options, placeholder, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { options: (Option | string)[]; placeholder?: string }) {
  return (
    <select className="select" {...rest}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map(o =>
        typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>,
      )}
    </select>
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="textarea" {...props} />
}

/** Native date/datetime picker styled to the design system. */
export function DatePicker({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <input
      className="input"
      type="date"
      aria-label={label}
      {...rest}
    />
  )
}
