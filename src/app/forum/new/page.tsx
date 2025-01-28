import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EXAMPLE_CATEGORIES } from "@/constants/forum"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const metadata: Metadata = {
  title: "יצירת דיון חדש - פורום הדרך",
  description: "פתיחת דיון חדש בפורום",
}

export default function NewForumPostPage() {
  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">יצירת דיון חדש</h1>

        <Card className="p-6">
          <form className="grid gap-6">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                כותרת
              </label>
              <Input
                id="title"
                placeholder="הכניסו כותרת לדיון"
                className="w-full"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                קטגוריה
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="בחרו קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  {EXAMPLE_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                תוכן
              </label>
              <Textarea
                id="content"
                placeholder="כתבו את תוכן הדיון כאן..."
                className="min-h-[200px]"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="tags" className="text-sm font-medium">
                תגיות
              </label>
              <Input
                id="tags"
                placeholder="הפרידו תגיות בפסיקים (לדוגמה: תקשורת, זוגיות, טיפים)"
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href="/forum">ביטול</Link>
              </Button>
              <Button type="submit">פרסום</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
} 