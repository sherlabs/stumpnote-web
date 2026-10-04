import 'server-only'
import type { BlockContext } from '@/components/blocks/types'
import { getFaqs, getSettings } from './content'
import type { ReadOpts } from './content'

/** Everything the block renderers need beyond the page document: beta state, FAQs, trial-line switch. */
export async function getBlockContext(o?: ReadOpts): Promise<BlockContext> {
  const [{ settings, beta }, faqs] = await Promise.all([getSettings(), getFaqs(o)])
  return { beta, testimonials: [], faqs, showTrialLine: settings.showTrialLine }
}
