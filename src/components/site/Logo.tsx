import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/cn'

export function Logo({ className, size = 30 }: { className?: string; size?: number }) {
  return (
    <Link href="/" aria-label="StumpNote home" className={cn('inline-flex items-center gap-2.5', className)}>
      <Image src="/brand/stumpnote-mark.svg" alt="" width={size} height={Math.round(size * 1.017)} priority />
      <span className="font-display text-[22px] font-black tracking-[-0.045em] text-text">StumpNote</span>
    </Link>
  )
}
