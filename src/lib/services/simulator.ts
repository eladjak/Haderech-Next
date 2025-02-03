import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { SimulationState, Message, EmotionalState, SimulationResponse } from '@/types/simulator'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * מתחיל סימולציה חדשה עם הקשר נתון
 */
export async function startSimulation(context: string): Promise<SimulationState> {
  try {
    const initialState: SimulationState = {
      context,
      messages: [],
      currentSpeaker: 'user',
      emotionalState: {
        mood: 'neutral',
        interest: 50,
        comfort: 50
      }
    }

    const { data: response } = await supabase.functions.invoke<SimulationResponse>('start-simulation', {
      body: { context }
    })

    if (response?.message) {
      initialState.messages.push({
        speaker: 'partner',
        content: response.message,
        timestamp: new Date().toISOString()
      })
      initialState.currentSpeaker = 'user'
    }

    return initialState
  } catch (error) {
    console.error('Error starting simulation:', error)
    throw error
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

    return await generatePartnerResponse(updatedState)
  } catch (error) {
    console.error('Error processing user message:', error)
    throw error
  }
}

/**
 * Generates partner's response based on conversation history and context
 */
async function generatePartnerResponse(state: SimulationState): Promise<SimulationState> {
  try {
    const { data: response } = await supabase.functions.invoke<SimulationResponse>('generate-response', {
      body: { state }
    })

    if (!response?.message) {
      throw new Error('No response generated')
    }

    const newMessage: Message = {
      speaker: 'partner',
      content: response.message,
      timestamp: new Date().toISOString()
    }

    const updatedEmotionalState = await updateEmotionalState(state, response.message)

    return {
      ...state,
      messages: [...state.messages, newMessage],
      currentSpeaker: 'user',
      emotionalState: updatedEmotionalState
    }
  } catch (error) {
    console.error('Error generating partner response:', error)
    throw error
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
    const { data: response } = await supabase.functions.invoke<SimulationResponse>('analyze-emotion', {
      body: { text: lastResponse }
    })

    if (!response) {
      return state.emotionalState
    }

    return {
      mood: response.mood || state.emotionalState.mood,
      interest: Math.max(0, Math.min(100, response.interest || state.emotionalState.interest)),
      comfort: Math.max(0, Math.min(100, response.comfort || state.emotionalState.comfort))
    }
  } catch (error) {
    console.error('Error updating emotional state:', error)
    return state.emotionalState
  }
}

/**
 * Saves simulation results to the database
 */
export async function saveSimulationResults(state: SimulationState): Promise<void> {
  try {
    const { error } = await supabase.from('simulation_results').insert({
      context: state.context,
      messages: state.messages,
      emotional_state: state.emotionalState,
      created_at: new Date().toISOString()
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error saving simulation results:', error)
    throw error
  }
}

export function resetSimulation(): SimulationState {
  return {
    context: '',
    messages: [],
    currentSpeaker: 'user',
    emotionalState: {
      mood: 'neutral',
      interest: 50,
      comfort: 50
    }
  }
} 