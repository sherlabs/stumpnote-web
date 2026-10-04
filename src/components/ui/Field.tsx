import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  hint?: ReactNode
  error?: string
  id?: string
}

/** Visible label, hint and error text linked with aria-describedby. */
export function Field({ label, hint, error, className, id, ...rest }: Props) {
  const auto = useId()
  const fieldId = id ?? auto
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errId = error ? `${fieldId}-err` : undefined
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={fieldId} className="text-[15px] font-semibold text-text">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
        className={cn(
          'min-h-12 w-full rounded-2 border bg-[var(--hairline-1)] px-4 text-[17px] text-text placeholder:text-tertiary transition-colors duration-[var(--dur-1)] focus-visible:border-accent',
          error ? 'border-error' : 'border-[var(--hairline-3)] hover:border-[color-mix(in_oklab,var(--text)_30%,transparent)]',
        )}
        {...rest}
      />
      {hint && (
        <p id={hintId} className="body-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="body-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}
