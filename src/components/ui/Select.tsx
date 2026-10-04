import { useId } from 'react'
import type { ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: string
  hint?: ReactNode
  error?: string
  id?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

/** Native select with the same label/hint/error contract as Field. */
export function Select({
  label,
  hint,
  error,
  className,
  id,
  options,
  placeholder,
  ...rest
}: Props) {
  const auto = useId()
  const fieldId = id ?? auto
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errId = error ? `${fieldId}-err` : undefined
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={fieldId} className="text-[15px] font-semibold text-text">
        {label}
      </label>
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
        className={cn(
          'min-h-12 w-full appearance-none rounded-2 border bg-[var(--hairline-1)] bg-no-repeat px-4 pr-10 text-[17px] text-text transition-colors duration-[var(--dur-1)] focus-visible:border-accent',
          error
            ? 'border-error'
            : 'border-[var(--hairline-3)] hover:border-[color-mix(in_oklab,var(--text)_30%,transparent)]',
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2396A1AB' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: 'right 14px center',
        }}
        {...rest}
      >
        {placeholder && (
          <option value="" className="bg-surface text-text">
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface text-text">
            {o.label}
          </option>
        ))}
      </select>
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
