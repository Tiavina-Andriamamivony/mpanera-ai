"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

const TYPEWRITER_INTERVAL_MS = 25

type Props = {
  providerName: string
  detail: string
  problem: string
  onContinue: () => void
}

function MissionAnnounce({ providerName, detail, problem, onContinue }: Props) {
  const fullText = `Bonjour ${providerName}, une personne aurait besoin de vous, pour ${detail}.`
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cursor = 0
    intervalRef.current = setInterval(() => {
      cursor += 1
      setDisplayed(fullText.slice(0, cursor))
      if (cursor >= fullText.length && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setDone(true)
      }
    }, TYPEWRITER_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fullText])

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
      <p className="font-display min-h-[6rem] text-3xl leading-snug tracking-tight sm:text-4xl">
        {displayed}
        {!done && (
          <span className="bg-foreground ml-1 inline-block h-7 w-0.5 animate-pulse align-middle" />
        )}
      </p>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex w-full flex-col items-center gap-6"
        >
          <blockquote className="border-accent text-muted-foreground w-full border-l-2 pl-5 text-left font-serif text-lg italic leading-relaxed">
            « {problem} »
          </blockquote>
          <button
            type="button"
            onClick={onContinue}
            className="bg-primary text-primary-foreground group inline-flex items-center gap-3 rounded-full px-7 py-4 text-base font-medium shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-primary/40"
          >
            Continuer
            <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      )}
    </div>
  )
}

export { MissionAnnounce }
