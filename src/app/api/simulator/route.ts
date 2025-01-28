import { NextResponse } from 'next/server'
import { z } from 'zod'
import { startSimulation, processUserMessage, saveSimulationResults } from '@/lib/services/simulator'

// Validation schemas
const startSchema = z.object({
  context: z.string().min(1).max(1000),
})

const messageSchema = z.object({
  state: z.object({
    context: z.string(),
    messages: z.array(z.object({
      speaker: z.enum(['user', 'partner']),
      content: z.string(),
      timestamp: z.string()
    })),
    currentSpeaker: z.enum(['user', 'partner']),
    emotionalState: z.object({
      mood: z.enum(['positive', 'neutral', 'negative']),
      interest: z.number().min(0).max(100),
      comfort: z.number().min(0).max(100)
    })
  }),
  message: z.string().min(1).max(1000)
})

/**
 * POST /api/simulator/start
 * 
 * Starts a new dating simulation
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { context } = startSchema.parse(body)

    const state = await startSimulation(context)
    return NextResponse.json(state)
  } catch (error) {
    console.error('Error starting simulation:', error)
    return NextResponse.json(
      { error: 'Failed to start simulation' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/simulator/message
 * 
 * Processes a user message in the simulation
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { state, message } = messageSchema.parse(body)

    const newState = await processUserMessage(state, message)
    return NextResponse.json(newState)
  } catch (error) {
    console.error('Error processing message:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/simulator/save
 * 
 * Saves the simulation results
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { state } = messageSchema.parse(body)

    await saveSimulationResults(state)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving simulation:', error)
    return NextResponse.json(
      { error: 'Failed to save simulation' },
      { status: 500 }
    )
  }
} 