import { AiMark } from '@/components/signature/MStroke'
import { cn } from '@/lib/cn'

/** Required on every AI surface (docs/spec/05-content-brief.md claims policy 2). */
export function AiDisclosure({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-center gap-2.5 text-[14px] leading-[1.4] text-muted', className)}>
      <AiMark size={14} className="text-accent-text" />
      <span>AI can make mistakes. Not medical or psychological advice.</span>
    </p>
  )
}
