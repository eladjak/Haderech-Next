"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Message {
  speaker: 'user' | 'partner'
  content: string
  timestamp: string
}

interface EmotionalState {
  mood: 'positive' | 'neutral' | 'negative'
  interest: number
  comfort: number
}

interface SimulationState {
  context: string
  messages: Message[]
  currentSpeaker: 'user' | 'partner'
  emotionalState: EmotionalState
}

export function SimulatorChat() {
  const { toast } = useToast()
  const [context, setContext] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<SimulationState | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Start a new simulation
  async function startSimulation() {
    if (!context) {
      toast({
        title: 'שגיאה',
        description: 'יש להזין קונטקסט לסימולציה',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/simulator/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      })

      if (!response.ok) throw new Error('Failed to start simulation')

      const newState = await response.json()
      setState(newState)
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להתחיל את הסימולציה',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Send a message in the simulation
  async function sendMessage() {
    if (!state || !message) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/simulator/message', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, message }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const newState = await response.json()
      setState(newState)
      setMessage('')
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשלוח את ההודעה',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save simulation results
  async function saveResults() {
    if (!state) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/simulator/save', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      })

      if (!response.ok) throw new Error('Failed to save results')

      toast({
        title: 'נשמר בהצלחה',
        description: 'תוצאות הסימולציה נשמרו',
      })
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשמור את התוצאות',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset the simulation
  function resetSimulation() {
    setState(null)
    setContext('')
    setMessage('')
  }

  if (!state) {
    return (
      <div className="space-y-4">
        <Textarea
          placeholder="תאר את הסיטואציה והקונטקסט לדייט..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="min-h-[100px]"
        />
        <Button
          onClick={startSimulation}
          disabled={isLoading || !context}
          className="w-full"
        >
          התחל סימולציה
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted p-4">
        <h3 className="font-semibold">קונטקסט</h3>
        <p className="text-sm text-muted-foreground">{state.context}</p>
      </div>

      <div className="space-y-4">
        {state.messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex w-max max-w-[80%] items-end gap-2 rounded-lg p-4',
              msg.speaker === 'user'
                ? 'mr-auto bg-primary text-primary-foreground'
                : 'bg-muted'
            )}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={msg.speaker === 'user' ? '/avatars/user.png' : '/avatars/partner.png'}
                alt={msg.speaker}
              />
              <AvatarFallback>
                {msg.speaker === 'user' ? 'א' : 'ב'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs text-muted-foreground">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="הקלד הודעה..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button
          onClick={sendMessage}
          disabled={isLoading || !message || state.currentSpeaker !== 'user'}
        >
          שלח
        </Button>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={resetSimulation}
          disabled={isLoading}
        >
          סימולציה חדשה
        </Button>
        <Button
          variant="secondary"
          onClick={saveResults}
          disabled={isLoading}
        >
          שמור תוצאות
        </Button>
      </div>

      <div className="rounded-lg border bg-muted p-4">
        <h3 className="font-semibold">מצב רגשי</h3>
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>מצב רוח:</span>
            <span>
              {state.emotionalState.mood === 'positive'
                ? '😊 חיובי'
                : state.emotionalState.mood === 'negative'
                ? '😟 שלילי'
                : '😐 ניטרלי'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>רמת עניין:</span>
            <span>{state.emotionalState.interest}%</span>
          </div>
          <div className="flex justify-between">
            <span>רמת נוחות:</span>
            <span>{state.emotionalState.comfort}%</span>
          </div>
        </div>
      </div>
    </div>
  )
} 