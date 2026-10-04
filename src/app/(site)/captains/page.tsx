import { PersonaRoute, personaMetadata } from '@/components/pages/PersonaRoute'

export const revalidate = 300
export const generateMetadata = () => personaMetadata('captains')

export default function Page() {
  return <PersonaRoute slug="captains" />
}
