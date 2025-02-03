import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/env.mjs'
import type { ChatCompletionMessageParam } from 'openai/resources/chat'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
})

// Initialize Supabase client
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Types
interface SimulationState {
  context: string
  messages: Message[]
  currentSpeaker: 'user' | 'partner'
  emotionalState: EmotionalState
}

interface Message {
  speaker: 'user' | 'partner'
  content: string
  timestamp: string
}

interface EmotionalState {
  mood: 'positive' | 'neutral' | 'negative'
  interest: number // 0-100
  comfort: number // 0-100
}

/**
 * Starts a new dating simulation with initial context
 */
export async function startSimulation(context: string): Promise<SimulationState> {
  const initialState: SimulationState = {
    context,
    messages: [] as Message[],
    currentSpeaker: 'partner',
    emotionalState: {
      mood: 'neutral',
      interest: 50,
      comfort: 50
    }
  }

  try {
    const response = await generatePartnerResponse(initialState)
    return response
  } catch (error) {
    console.error('Error starting simulation:', error)
    throw new Error('Failed to start simulation')
  }
}

/**
 * Processes user message and generates partner's response
 */
export async function processUserMessage(
  state: SimulationState,
  message: string
): Promise<SimulationState> {
  try {
    // Add user message to state
    const newMessage: Message = {
      speaker: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    const updatedState: SimulationState = {
      ...state,
      messages: [...state.messages, newMessage],
      currentSpeaker: 'partner'
    }

    // Generate partner response
    return await generatePartnerResponse(updatedState)
  } catch (error) {
    console.error('Error processing message:', error)
    throw new Error('Failed to process message')
  }
}

/**
 * Generates partner's response based on conversation history and context
 */
async function generatePartnerResponse(state: SimulationState): Promise<SimulationState> {
  try {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `אתה משתתף בסימולציית דייט. 
        הקונטקסט הוא: ${state.context}
        עליך להגיב כבן/בת הזוג בצורה טבעית ואותנטית.
        התשובות צריכות להיות קצרות (2-3 משפטים) ולשקף את מצב הרוח הנוכחי:
        מצב רוח: ${state.emotionalState.mood}
        רמת עניין: ${state.emotionalState.interest}
        רמת נוחות: ${state.emotionalState.comfort}`,
        name: 'system'
      },
      ...state.messages.map(msg => ({
        role: msg.speaker === 'user' ? 'user' : 'assistant',
        content: msg.content,
        name: msg.speaker === 'user' ? 'user' : 'assistant'
      }))
    ]

    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 150
    })

    const response = completion.choices[0]?.message?.content || 'אני לא בטוח מה להגיד...'

    // Update emotional state based on conversation
    const newEmotionalState = await updateEmotionalState(state, response)

    // Add partner response to state
    return {
      ...state,
      messages: [
        ...state.messages,
        {
          speaker: 'partner',
          content: response,
          timestamp: new Date().toISOString()
        }
      ],
      currentSpeaker: 'user' as const,
      emotionalState: newEmotionalState
    }
  } catch (error) {
    console.error('Error generating response:', error)
    throw new Error('Failed to generate response')
  }
}

/**
 * Updates the emotional state based on the conversation
 */
async function updateEmotionalState(
  state: SimulationState,
  lastResponse: string
): Promise<EmotionalState> {
  try {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `נתח את השיחה האחרונה וקבע את המצב הרגשי החדש.
        התייחס למצב הקודם:
        מצב רוח: ${state.emotionalState.mood}
        רמת עניין: ${state.emotionalState.interest}
        רמת נוחות: ${state.emotionalState.comfort}
        
        החזר תשובה בפורמט הבא בדיוק:
        mood: positive/neutral/negative
        interest: 0-100
        comfort: 0-100`,
        name: 'system'
      },
      {
        role: 'user',
        content: `התגובה האחרונה הייתה: ${lastResponse}`,
        name: 'user'
      }
    ]

    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-4',
      temperature: 0.3,
      max_tokens: 50
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // Parse response
    const mood = response.match(/mood: (positive|neutral|negative)/)?.[1] || 'neutral'
    const interest = parseInt(response.match(/interest: (\d+)/)?.[1] || '50')
    const comfort = parseInt(response.match(/comfort: (\d+)/)?.[1] || '50')

    return {
      mood: mood as 'positive' | 'neutral' | 'negative',
      interest: Math.min(100, Math.max(0, interest)),
      comfort: Math.min(100, Math.max(0, comfort))
    }
  } catch (error) {
    console.error('Error updating emotional state:', error)
    // Return current state if update fails
    return state.emotionalState
  }
}

/**
 * Saves simulation results to the database
 */
export async function saveSimulationResults(state: SimulationState): Promise<void> {
  try {
    const { error } = await supabase
      .from('simulation_history')
      .insert({
        context: state.context,
        messages: state.messages,
        final_emotional_state: state.emotionalState,
        created_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error saving simulation results:', error)
    throw new Error('Failed to save simulation results')
  }
} 