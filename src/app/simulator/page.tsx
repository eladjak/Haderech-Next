import { Metadata } from 'next'
import { SimulatorChat } from '@/components/simulator/chat'

export const metadata: Metadata = {
  title: 'סימולטור דייטינג',
  description: 'תרגל את כישורי הדייטינג שלך בסביבה בטוחה ומבוקרת',
}

export default function SimulatorPage() {
  return (
    <div className="container relative min-h-screen">
      <div className="mx-auto max-w-2xl py-4">
        <div className="rounded-lg border bg-background p-8">
          <div className="flex flex-col space-y-1.5 pb-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              סימולטור דייטינג
            </h2>
            <p className="text-sm text-muted-foreground">
              תרגל את כישורי הדייטינג שלך בסביבה בטוחה ומבוקרת
            </p>
          </div>
          <SimulatorChat />
        </div>
      </div>
    </div>
  )
} 