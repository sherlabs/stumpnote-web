import {
  Ban,
  Brain,
  GalleryHorizontal,
  Headphones,
  KeyRound,
  Landmark,
  MessageCircle,
  Mic,
  Target,
  TrendingUp,
  Users,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

// Lucide names allowed in CMS fields. Only listed icons are bundled (no dynamic import of the whole set).
const ICONS: Record<string, LucideIcon> = {
  Ban,
  Brain,
  GalleryHorizontal,
  Headphones,
  KeyRound,
  Landmark,
  MessageCircle,
  Mic,
  Target,
  TrendingUp,
  Users,
  ShieldCheck,
}

export function BlockIcon({
  name,
  size = 22,
  className,
}: {
  name?: string | null
  size?: number
  className?: string
}) {
  const Icon = (name && ICONS[name]) || ShieldCheck
  return <Icon aria-hidden size={size} strokeWidth={1.75} className={className} />
}
