import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import natural from 'natural'

const tokenizer = new natural.WordTokenizer()

// Knowledge base with common relationship topics
const knowledgeBase = {
  'קורס': 'הקורס שלנו מיועד לעזור לך לבנות מערכות יחסים טובות יותר. הוא מכסה נושאים כמו תקשורת, אמון ואינטליגנציה רגשית.',
  'דייט': 'דייטים יכולים להיות מרגשים ומאתגרים. זכור להיות אתה עצמך, להקשיב באופן פעיל ולהראות עניין אמיתי בבן/בת הזוג שלך.',
  'ביטחון': 'זה נורמלי להרגיש חוסר ביטחון לפעמים. נסה להתמקד בתכונות החיוביות שלך וזכור שלכולם יש חוסר ביטחון.',
  'תקשורת': 'תקשורת טובה היא הבסיס לכל מערכת יחסים בריאה. נסה להקשיב באמת, לשתף ברגשות שלך ולהימנע משיפוטיות.',
  'אמון': 'בניית אמון לוקחת זמן ודורשת עקביות. היה כנה, אמין ושמור על הבטחות שאתה נותן.',
  'קונפליקט': 'קונפליקטים הם חלק טבעי ממערכות יחסים. המפתח הוא לפתור אותם בצורה בונה, תוך כבוד הדדי והקשבה.',
}

// Helper function to find the most relevant topic
function findRelevantTopic(input: string): string {
  const tokens = tokenizer.tokenize(input.toLowerCase())
  
  if (!tokens || tokens.length === 0) {
    return 'מצטער, לא הצלחתי להבין את השאלה. אנא נסה לנסח אותה מחדש.'
  }
  
  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (tokens.includes(key)) {
      return value
    }
  }
  
  return 'מצטער, לא מצאתי תשובה מתאימה. האם תוכל לנסח את השאלה בצורה אחרת?'
}

// Log chat interaction to the database
async function logChatInteraction(
  supabase: SupabaseClient,
  userId: string,
  input: string,
  response: string
) {
  const { error } = await supabase
    .from('chat_interactions')
    .insert({
      user_id: userId,
      input,
      response,
      created_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error logging chat interaction:', error)
  }
}

/**
 * POST /api/bot
 * 
 * Endpoint for generating bot responses to user messages.
 * Validates the input and returns a response based on the bot's knowledge base.
 */
export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get input from request body
    const { input } = await req.json()
    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      )
    }

    // Generate response
    const response = findRelevantTopic(input)
    
    // Log interaction
    await logChatInteraction(supabase, session.user.id, input, response)

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Error in bot response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 