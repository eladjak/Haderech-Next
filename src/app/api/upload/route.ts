import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type FileType = 'avatar' | 'lesson' | 'attachment'

const allowedTypes: Record<FileType, readonly string[]> = {
  'avatar': ['image/jpeg', 'image/png', 'image/gif'],
  'lesson': ['video/mp4', 'audio/mpeg', 'application/pdf'],
  'attachment': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
} as const

const maxSizes: Record<FileType, number> = {
  'avatar': 5 * 1024 * 1024, // 5MB
  'lesson': 500 * 1024 * 1024, // 500MB
  'attachment': 50 * 1024 * 1024 // 50MB
} as const

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // וידוא שהמשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'יש להתחבר כדי להעלות קבצים' },
        { status: 401 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as FileType
    
    if (!file) {
      return NextResponse.json(
        { error: 'לא נבחר קובץ' },
        { status: 400 }
      )
    }
    
    // וידוא סוג הקובץ
    if (!type || !(allowedTypes[type] as string[]).includes(file.type)) {
      return NextResponse.json(
        { error: 'סוג קובץ לא נתמך' },
        { status: 400 }
      )
    }
    
    // הגבלת גודל הקובץ
    if (file.size > maxSizes[type]) {
      return NextResponse.json(
        { error: 'הקובץ גדול מדי' },
        { status: 400 }
      )
    }
    
    // יצירת שם ייחודי לקובץ
    const fileExt = file.name.split('.').pop()
    const fileName = `${type}/${session.user.id}/${Date.now()}.${fileExt}`
    
    // העלאת הקובץ ל-Storage
    const { data, error } = await supabase
      .storage
      .from('uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    // יצירת URL ציבורי לקובץ
    const { data: { publicUrl } } = supabase
      .storage
      .from('uploads')
      .getPublicUrl(fileName)
    
    // שמירת רשומה של הקובץ
    const { error: dbError } = await supabase
      .from('uploads')
      .insert({
        user_id: session.user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: fileName,
        public_url: publicUrl,
        type,
        created_at: new Date().toISOString()
      })
    
    if (dbError) throw dbError
    
    return NextResponse.json({
      url: publicUrl,
      path: fileName
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'שגיאה בהעלאת הקובץ' },
      { status: 500 }
    )
  }
} 