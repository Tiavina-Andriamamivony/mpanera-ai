"use client"

/**
 * Scène animée partagée par les pages auth (sign-in, sign-up, forgot-password).
 *
 * Les positions des personnages sont calculées en synchrone à partir de refs
 * DOM + mouseX/Y, et certains effets synchronisent un state local au focus
 * de l'input. Ces deux patterns déclenchent `react-hooks/refs` et
 * `react-hooks/set-state-in-effect`, mais ils sont voulus ici (pas de
 * système externe à observer, animation frame-aware). Le disable est
 * centralisé dans ce fichier — c'est le seul endroit où il vit.
 */
/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from "react"

interface PupilProps {
  size?: number
  maxDistance?: number
  pupilColor?: string
  forceLookX?: number
  forceLookY?: number
}

function Pupil({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
}: PupilProps) {
  const [mouseX, setMouseX] = useState<number>(0)
  const [mouseY, setMouseY] = useState<number>(0)
  const pupilRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const position = (() => {
    if (!pupilRef.current) return { x: 0, y: 0 }
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY }
    }

    const rect = pupilRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = mouseX - cx
    const dy = mouseY - cy
    const distance = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance)
    const angle = Math.atan2(dy, dx)
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    }
  })()

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  )
}

interface EyeBallProps {
  size?: number
  pupilSize?: number
  maxDistance?: number
  eyeColor?: string
  pupilColor?: string
  isBlinking?: boolean
  forceLookX?: number
  forceLookY?: number
}

function EyeBall({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) {
  const [mouseX, setMouseX] = useState<number>(0)
  const [mouseY, setMouseY] = useState<number>(0)
  const eyeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const position = (() => {
    if (!eyeRef.current) return { x: 0, y: 0 }
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY }
    }

    const rect = eyeRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = mouseX - cx
    const dy = mouseY - cy
    const distance = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance)
    const angle = Math.atan2(dy, dx)
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    }
  })()

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center rounded-full transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
        overflow: "hidden",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  )
}

export interface AnimatedCharactersSceneProps {
  /** L'utilisateur a le focus sur un input (déclenche le "looking at each other"). */
  isTyping: boolean
  /** Un mot de passe est en cours de saisie (peu importe lequel). */
  hasPassword: boolean
  /** Le mot de passe est affiché en clair (déclenche la "panique" des personnages). */
  passwordVisible: boolean
}

function useRandomBlinking() {
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    const getInterval = () => Math.random() * 4000 + 3000

    const schedule = () => {
      const t = setTimeout(() => {
        setIsBlinking(true)
        setTimeout(() => {
          setIsBlinking(false)
          schedule()
        }, 150)
      }, getInterval())
      return t
    }

    const timeout = schedule()
    return () => clearTimeout(timeout)
  }, [])

  return isBlinking
}

function AnimatedCharactersScene({
  isTyping,
  hasPassword,
  passwordVisible,
}: AnimatedCharactersSceneProps) {
  const [mouseX, setMouseX] = useState<number>(0)
  const [mouseY, setMouseY] = useState<number>(0)
  const isPurpleBlinking = useRandomBlinking()
  const isBlackBlinking = useRandomBlinking()
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false)
  const [isPurplePeeking, setIsPurplePeeking] = useState(false)

  const purpleRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const yellowRef = useRef<HTMLDivElement>(null)
  const orangeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true)
      const timer = setTimeout(() => setIsLookingAtEachOther(false), 800)
      return () => clearTimeout(timer)
    } else {
      setIsLookingAtEachOther(false)
    }
  }, [isTyping])

  useEffect(() => {
    if (hasPassword && passwordVisible) {
      const schedule = () => {
        const t = setTimeout(
          () => {
            setIsPurplePeeking(true)
            setTimeout(() => setIsPurplePeeking(false), 800)
          },
          Math.random() * 3000 + 2000
        )
        return t
      }
      const first = schedule()
      return () => clearTimeout(first)
    } else {
      setIsPurplePeeking(false)
    }
  }, [hasPassword, passwordVisible, isPurplePeeking])

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 }

    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 3
    const dx = mouseX - cx
    const dy = mouseY - cy

    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    }
  }

  const purplePos = calculatePosition(purpleRef)
  const blackPos = calculatePosition(blackRef)
  const yellowPos = calculatePosition(yellowRef)
  const orangePos = calculatePosition(orangeRef)

  const isPanic = hasPassword && passwordVisible
  const isLeaning = isTyping || (hasPassword && !passwordVisible)

  return (
    <div className="relative" style={{ width: "550px", height: "400px" }}>
      {/* Purple — back */}
      <div
        ref={purpleRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: "70px",
          width: "180px",
          height: isLeaning ? "440px" : "400px",
          backgroundColor: "#6C3FF5",
          borderRadius: "10px 10px 0 0",
          zIndex: 1,
          transform: isPanic
            ? `skewX(0deg)`
            : isLeaning
              ? `skewX(${purplePos.bodySkew - 12}deg) translateX(40px)`
              : `skewX(${purplePos.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-700 ease-in-out"
          style={{
            left: isPanic
              ? "20px"
              : isLookingAtEachOther
                ? "55px"
                : `${45 + purplePos.faceX}px`,
            top: isPanic
              ? "35px"
              : isLookingAtEachOther
                ? "65px"
                : `${40 + purplePos.faceY}px`,
          }}
        >
          {[0, 1].map((i) => (
            <EyeBall
              key={i}
              size={18}
              pupilSize={7}
              maxDistance={5}
              eyeColor="white"
              pupilColor="#2D2D2D"
              isBlinking={isPurpleBlinking}
              forceLookX={
                isPanic
                  ? isPurplePeeking
                    ? 4
                    : -4
                  : isLookingAtEachOther
                    ? 3
                    : undefined
              }
              forceLookY={
                isPanic
                  ? isPurplePeeking
                    ? 5
                    : -4
                  : isLookingAtEachOther
                    ? 4
                    : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Black — middle */}
      <div
        ref={blackRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: "240px",
          width: "120px",
          height: "310px",
          backgroundColor: "#2D2D2D",
          borderRadius: "8px 8px 0 0",
          zIndex: 2,
          transform: isPanic
            ? `skewX(0deg)`
            : isLookingAtEachOther
              ? `skewX(${blackPos.bodySkew * 1.5 + 10}deg) translateX(20px)`
              : isLeaning
                ? `skewX(${blackPos.bodySkew * 1.5}deg)`
                : `skewX(${blackPos.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-700 ease-in-out"
          style={{
            left: isPanic
              ? "10px"
              : isLookingAtEachOther
                ? "32px"
                : `${26 + blackPos.faceX}px`,
            top: isPanic
              ? "28px"
              : isLookingAtEachOther
                ? "12px"
                : `${32 + blackPos.faceY}px`,
          }}
        >
          {[0, 1].map((i) => (
            <EyeBall
              key={i}
              size={16}
              pupilSize={6}
              maxDistance={4}
              eyeColor="white"
              pupilColor="#2D2D2D"
              isBlinking={isBlackBlinking}
              forceLookX={
                isPanic ? -4 : isLookingAtEachOther ? 0 : undefined
              }
              forceLookY={
                isPanic ? -4 : isLookingAtEachOther ? -4 : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Orange — front left */}
      <div
        ref={orangeRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: "0px",
          width: "240px",
          height: "200px",
          zIndex: 3,
          backgroundColor: "#FF9B6B",
          borderRadius: "120px 120px 0 0",
          transform: isPanic
            ? `skewX(0deg)`
            : `skewX(${orangePos.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-200 ease-out"
          style={{
            left: isPanic ? "50px" : `${82 + orangePos.faceX}px`,
            top: isPanic ? "85px" : `${90 + orangePos.faceY}px`,
          }}
        >
          {[0, 1].map((i) => (
            <Pupil
              key={i}
              size={12}
              maxDistance={5}
              pupilColor="#2D2D2D"
              forceLookX={isPanic ? -5 : undefined}
              forceLookY={isPanic ? -4 : undefined}
            />
          ))}
        </div>
      </div>

      {/* Yellow — front right */}
      <div
        ref={yellowRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: "310px",
          width: "140px",
          height: "230px",
          backgroundColor: "#E8D754",
          borderRadius: "70px 70px 0 0",
          zIndex: 4,
          transform: isPanic
            ? `skewX(0deg)`
            : `skewX(${yellowPos.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-200 ease-out"
          style={{
            left: isPanic ? "20px" : `${52 + yellowPos.faceX}px`,
            top: isPanic ? "35px" : `${40 + yellowPos.faceY}px`,
          }}
        >
          {[0, 1].map((i) => (
            <Pupil
              key={i}
              size={12}
              maxDistance={5}
              pupilColor="#2D2D2D"
              forceLookX={isPanic ? -5 : undefined}
              forceLookY={isPanic ? -4 : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export { AnimatedCharactersScene }
