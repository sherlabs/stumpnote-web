import { useId } from 'react'
import { Check } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> & {
  label: ReactNode
  error?: string
  id?: string
}

/** Native checkbox, custom skin. Never pre-checked by the caller (consent). 44px hit area via the label. */
export function Checkbox({ label, error, className, id, ...rest }: Props) {
  const auto = useId()
  const cid = id ?? auto
  const errId = error ? `${cid}-err` : undefined
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={cid} className="group/cb flex min-h-11 cursor-pointer items-start gap-3 py-2">
        <span className="relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center">
          <input
            id={cid}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={errId}
            className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[7px] border border-[var(--hairline-3)] bg-[var(--hairline-1)] transition-colors checked:border-accent checked:bg-accent group-hover/cb:border-[color-mix(in_oklab,var(--text)_40%,transparent)]"
            {...rest}
          />
          <Check
            aria-hidden
            size={16}
            strokeWidth={3}
            className="pointer-events-none relative text-canvas opacity-0 transition-opacity peer-checked:opacity-100"
          />
        </span>
        <span className="body-sm text-body">{label}</span>
      </label>
      {error && (
        <p id={errId} className="body-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}
