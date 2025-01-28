import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  earnings: number
}

const EXAMPLE_STATS: ReferralStats = {
  totalReferrals: 15,
  activeReferrals: 8,
  earnings: 450,
}

export function ReferralManagement() {
  const [referralLink] = useState('https://haderech.co.il/ref/123456')
  const { showSuccess } = useToast()
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      showSuccess('הקישור הועתק בהצלחה!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8">ניהול הפניות</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>סטטיסטיקות הפניות</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">סה"כ הפניות</span>
                <span className="font-semibold">{EXAMPLE_STATS.totalReferrals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">הפניות פעילות</span>
                <span className="font-semibold">{EXAMPLE_STATS.activeReferrals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">סה"כ רווחים</span>
                <span className="font-semibold">₪{EXAMPLE_STATS.earnings}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>קישור הפניה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={referralLink} readOnly />
                <Button onClick={copyToClipboard}>העתק</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                שתף את הקישור הזה עם חברים וקבל 10% מכל רכישה שהם יבצעו!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
} 