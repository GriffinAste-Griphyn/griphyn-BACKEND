"use client"

import { useEffect, useRef, useState } from "react"
import { X, Send } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/loading-spinner"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I’m your Griphyn assistant. Ask me about brand deals, outreach, tasks, or payments.",
}

export function AssistantPanel() {
  const [isOpen, setIsOpen] = useState(true)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) {
      return
    }

    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const historyPayload = messages.map(({ role, content }) => ({ role, content }))
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? "Assistant request failed.")
      }

      const data = (await response.json()) as { reply?: string }
      const replyContent = data.reply?.trim() || "I’m not sure how to respond to that."

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: replyContent,
        },
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: "I couldn’t reach the assistant service. Please try again shortly.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <span className="text-lg font-semibold">N</span>
      </button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] border border-border bg-card shadow-xl flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Assistant</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading ? (
          <div className="flex justify-start">
            <div className="rounded-lg px-3 py-2 bg-muted text-foreground text-sm inline-flex items-center gap-2">
              <LoadingSpinner className="h-4 w-4" />
              Thinking...
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="text-xs text-destructive/80">{error}</p>
        ) : null}

        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 border-t border-border">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSend()
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your pipeline..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-muted hover:bg-muted/80 text-foreground"
          >
            {isLoading ? <LoadingSpinner className="h-4 w-4" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </Card>
  )
}
