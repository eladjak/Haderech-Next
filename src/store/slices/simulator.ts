import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Message {
  id: string
  content: string
  speaker: 'user' | 'partner'
  timestamp: string
  sentiment: 'positive' | 'neutral' | 'negative'
}

interface EmotionalState {
  happiness: number
  trust: number
  understanding: number
  connection: number
}

interface SimulationState {
  isActive: boolean
  scenario: {
    id: string
    title: string
    description: string
    difficulty: 'easy' | 'medium' | 'hard'
    tags: string[]
  } | null
  messages: Message[]
  partnerState: EmotionalState
  feedback: {
    score: number
    strengths: string[]
    improvements: string[]
    suggestions: string[]
  } | null
  isLoading: boolean
  error: string | null
}

const initialState: SimulationState = {
  isActive: false,
  scenario: null,
  messages: [],
  partnerState: {
    happiness: 50,
    trust: 50,
    understanding: 50,
    connection: 50,
  },
  feedback: null,
  isLoading: false,
  error: null,
}

export const simulatorSlice = createSlice({
  name: 'simulator',
  initialState,
  reducers: {
    startSimulation: (state: SimulationState, action: PayloadAction<SimulationState['scenario']>) => {
      state.isActive = true
      state.scenario = action.payload
      state.messages = []
      state.partnerState = initialState.partnerState
      state.feedback = null
      state.error = null
    },
    addMessage: (state: SimulationState, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    updatePartnerState: (state: SimulationState, action: PayloadAction<Partial<EmotionalState>>) => {
      state.partnerState = { ...state.partnerState, ...action.payload }
    },
    setFeedback: (state: SimulationState, action: PayloadAction<SimulationState['feedback']>) => {
      state.feedback = action.payload
      state.isActive = false
    },
    setLoading: (state: SimulationState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state: SimulationState, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetSimulation: (state: SimulationState) => {
      return initialState
    },
  },
})

export const {
  startSimulation,
  addMessage,
  updatePartnerState,
  setFeedback,
  setLoading,
  setError,
  resetSimulation,
} = simulatorSlice.actions

export const simulatorReducer = simulatorSlice.reducer 