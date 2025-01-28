import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ReferralManagement() {
  const [referralLink] = useState('https://haderech.app/ref/123xyz')
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast({
        title: 'הקישור הועתק בהצלחה!',
        description: 'תוכל לשתף אותו עם חברים',
      })
    } catch (err) {
      toast({
        title: 'שגיאה בהעתקת הקישור',
        description: 'נסה שוב מאוחר יותר',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>תכנית ההפניות שלך</CardTitle>
        <CardDescription>
          הזמן חברים להצטרף וקבל הטבות מיוחדות
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="referral-link">קישור הפניה אישי</Label>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Input
              id="referral-link"
              value={referralLink}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyToClipboard}>
              העתק
            </Button>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="space-y-2">
            <h4 className="font-medium">הטבות נוכחיות:</h4>
            <ul className="list-disc space-y-1 rtl:mr-4">
              <li>₪50 קרדיט לכל חבר שמצטרף</li>
              <li>20% הנחה על הקורס הבא שלך</li>
              <li>גישה מוקדמת לתכנים חדשים</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 