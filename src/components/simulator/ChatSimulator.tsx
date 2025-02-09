"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Send,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { SimulationState } from "@/types/simulator";

interface ChatSimulatorProps {
  state: SimulationState;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  showFeedback: boolean;
}

export function ChatSimulator({
  state,
  onSendMessage,
  isLoading,
  showFeedback,
}: ChatSimulatorProps): React.ReactNode {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<string[]>([]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const toggleFeedback = (messageId: string): void => {
    setExpandedFeedback((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId],
    );
  };

  return (
    <Card className="flex h-[600px] flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-lg font-semibold">{state.scenario.title}</h2>
          <p className="text-sm text-muted-foreground">
            {state.scenario.description}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {state.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] space-y-2 ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.content}</p>
                </div>

                {showFeedback &&
                  message.feedback &&
                  message.role === "user" && (
                    <div className="w-full space-y-2">
                      <Alert
                        className={`cursor-pointer ${
                          message.feedback.score >= 80
                            ? "border-green-500"
                            : message.feedback.score >= 60
                              ? "border-yellow-500"
                              : "border-red-500"
                        }`}
                        onClick={() => toggleFeedback(message.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {message.feedback.score >= 80 ? (
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                            ) : message.feedback.score >= 60 ? (
                              <MessageCircle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <ThumbsDown className="h-4 w-4 text-red-500" />
                            )}
                            <AlertTitle>
                              ציון: {message.feedback.score}
                            </AlertTitle>
                          </div>
                          {expandedFeedback.includes(message.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                        <AlertDescription>
                          {message.feedback.message}
                        </AlertDescription>

                        {expandedFeedback.includes(message.id) &&
                          message.feedback.details && (
                            <div className="mt-4 space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>אמפתיה</span>
                                  <span>
                                    {message.feedback.details.empathy}%
                                  </span>
                                </div>
                                <Progress
                                  value={message.feedback.details.empathy}
                                  className="h-2"
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>בהירות</span>
                                  <span>
                                    {message.feedback.details.clarity}%
                                  </span>
                                </div>
                                <Progress
                                  value={message.feedback.details.clarity}
                                  className="h-2"
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>אפקטיביות</span>
                                  <span>
                                    {message.feedback.details.effectiveness}%
                                  </span>
                                </div>
                                <Progress
                                  value={message.feedback.details.effectiveness}
                                  className="h-2"
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>התאמה</span>
                                  <span>
                                    {message.feedback.details.appropriateness}%
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    message.feedback.details.appropriateness
                                  }
                                  className="h-2"
                                />
                              </div>

                              {message.feedback.details.strengths.length >
                                0 && (
                                <div>
                                  <h4 className="mb-2 font-semibold">חוזקות</h4>
                                  <ul className="list-inside list-disc">
                                    {message.feedback.details.strengths.map(
                                      (strength, index) => (
                                        <li key={index}>{strength}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                              {message.feedback.details.improvements.length >
                                0 && (
                                <div>
                                  <h4 className="mb-2 font-semibold">
                                    נקודות לשיפור
                                  </h4>
                                  <ul className="list-inside list-disc">
                                    {message.feedback.details.improvements.map(
                                      (improvement, index) => (
                                        <li key={index}>{improvement}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}

                              {message.feedback.details.tips.length > 0 && (
                                <div>
                                  <h4 className="mb-2 font-semibold">טיפים</h4>
                                  <ul className="list-inside list-disc">
                                    {message.feedback.details.tips.map(
                                      (tip, index) => (
                                        <li key={index}>{tip}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                      </Alert>
                    </div>
                  )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t p-4"
      >
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="הקלד/י הודעה..."
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!message.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
