"use client"

import { useEffect, useState } from "react"
import { GooeyLoader } from "@/components/ui/loader-10"

const VISIBLE_MS = 1200
const FADE_MS = 600

function Preloader() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible")

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), VISIBLE_MS)
    const goneTimer = setTimeout(() => setPhase("gone"), VISIBLE_MS + FADE_MS)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(goneTimer)
    }
  }, [])

  if (phase === "gone") return null

  return (
    <div
      aria-hidden={phase !== "visible"}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary text-primary-foreground transition-opacity duration-[600ms] ease-out"
      style={{ opacity: phase === "fading" ? 0 : 1 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.62_0.12_165)_0%,transparent_60%),radial-gradient(circle_at_70%_80%,oklch(0.769_0.188_70.08/0.4)_0%,transparent_55%)]" />
      <div className="relative flex flex-col items-center gap-8">
        <GooeyLoader
          primaryColor="oklch(0.879 0.169 91.605)"
          secondaryColor="oklch(0.666 0.179 58.318)"
          borderColor="oklch(1 0 0 / 0.25)"
        />
        <p className="font-display text-xl tracking-wide opacity-80">
          mpanera<span className="text-[oklch(0.879_0.169_91.605)]">.</span>ai
        </p>
      </div>
    </div>
  )
}

export { Preloader }
