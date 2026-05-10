"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

import { ChatBubble } from "@/components/ai/chat-bubble"
import { MpaneraPromptBox } from "@/components/ai/mpanera-prompt-box"
import { SiriOrb } from "@/components/ui/siri-orb"

type ChatRole = "user" | "ai"

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
}

type Phase = "intro" | "chat"

const ORB_LAYOUT_ID = "mpanera-orb"
const ORB_TRANSITION = { type: "spring" as const, stiffness: 200, damping: 26 }

const STARTER_PROMPTS = [
  "Mon robinet fuit",
  "Cours particuliers en maths",
  "Couturière près d'Ambohibao",
]

const AI_REPLY =
  "D'accord. Pour mieux vous aider, dites-moi dans quelle ville vous êtes et quand vous souhaitez que ça se passe."

const THINKING_DELAY_MS = 700
const TYPEWRITER_INTERVAL_MS = 25

function createId() {
  return crypto.randomUUID()
}

export default function DiscussionPage() {
  const [phase, setPhase] = useState<Phase>("intro")
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)

  const typewriterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  )
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current)
      }
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  const streamReply = (replyId: string, fullText: string) => {
    let cursor = 0
    typewriterIntervalRef.current = setInterval(() => {
      cursor += 1
      setMessages((prev) =>
        prev.map((message) =>
          message.id === replyId
            ? { ...message, text: fullText.slice(0, cursor) }
            : message
        )
      )
      if (cursor >= fullText.length && typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current)
        typewriterIntervalRef.current = null
        setIsThinking(false)
      }
    }, TYPEWRITER_INTERVAL_MS)
  }

  const handleSend = (text: string) => {
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text,
    }
    setMessages((prev) => [...prev, userMessage])

    if (phase === "intro") {
      setPhase("chat")
    }

    setIsThinking(true)
    thinkingTimeoutRef.current = setTimeout(() => {
      const replyId = createId()
      setMessages((prev) => [...prev, { id: replyId, role: "ai", text: "" }])
      streamReply(replyId, AI_REPLY)
    }, THINKING_DELAY_MS)
  }

  if (phase === "intro") {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 px-6 py-12">
        <motion.div layoutId={ORB_LAYOUT_ID} transition={ORB_TRANSITION}>
          <SiriOrb
            size="min(33vmin, 380px)"
            animationDuration={22}
            className="drop-shadow-2xl"
          />
        </motion.div>

        <div className="flex flex-col items-center gap-3">
          <h1 className="max-w-2xl text-center font-display text-4xl tracking-tight sm:text-5xl">
            Que puis-je faire pour vous aujourd&apos;hui&nbsp;?
          </h1>
          <p className="max-w-xl text-center font-serif text-lg text-muted-foreground italic">
            Trouvons le prestataire parfait pour votre besoin.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
              className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm backdrop-blur transition hover:bg-card"
            >
              {prompt}
            </button>
          ))}
        </div>

        <MpaneraPromptBox
          value={draft}
          onValueChange={setDraft}
          onSend={handleSend}
          autoFocus
          className="w-full max-w-2xl"
        />
      </main>
    )
  }

  return (
    <main>
      <div className="sticky top-16 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur">
        <motion.div layoutId={ORB_LAYOUT_ID} transition={ORB_TRANSITION}>
          <SiriOrb size="40px" animationDuration={20} />
        </motion.div>
        <div>
          <p className="font-display text-base leading-none">mpanera</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isThinking ? "réfléchit…" : "en ligne"}
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-6 py-6 pb-32">
        {messages.map((message) => {
          if (message.role === "ai" && message.text === "") {
            return (
              <ChatBubble key={message.id} role="ai" pending>
                {" "}
              </ChatBubble>
            )
          }
          return (
            <ChatBubble key={message.id} role={message.role}>
              {message.text}
            </ChatBubble>
          )
        })}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent px-6 pt-6 pb-4">
        <div className="mx-auto max-w-2xl">
          <MpaneraPromptBox
            value={draft}
            onValueChange={setDraft}
            onSend={handleSend}
            isLoading={isThinking}
          />
        </div>
      </div>
    </main>
  )
}
