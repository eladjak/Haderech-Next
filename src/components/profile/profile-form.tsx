"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { updateProfile } from '@/lib/api'

const profileFormSchema = z.object({
  username: z.string().min(2).max(30),
  full_name: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  profile: {
    username: string
    full_name: string
    bio: string | null
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { toast } = useToast()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile.username,
      full_name: profile.full_name,
      bio: profile.bio || '',
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateProfile(data)
      toast({
        title: 'הפרופיל עודכן בהצלחה',
        description: 'השינויים נשמרו בהצלחה',
      })
    } catch (error) {
      toast({
        title: 'שגיאה בעדכון הפרופיל',
        description: 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם משתמש</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                השם שיוצג לאחרים בפלטפורמה
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם מלא</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ביוגרפיה</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                ספר לנו קצת על עצמך
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">שמור שינויים</Button>
      </form>
    </Form>
  )
} 