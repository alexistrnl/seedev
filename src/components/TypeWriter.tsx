"use client"

import { useEffect, useState } from "react"
import "./TypeWriter.css"

interface Props {
  phrases: string[]
  speed?: number
  pause?: number
}

export default function TypeWriter({ phrases, speed = 55, pause = 2200 }: Props) {
  const [displayed, setDisplayed] = useState("")
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIdx]

    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      }, speed + Math.random() * 30)
      return () => clearTimeout(t)
    }

    if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), pause)
      return () => clearTimeout(t)
    }

    if (deleting && charIdx > 0) {
      const t = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx - 1))
        setCharIdx(c => c - 1)
      }, speed / 2)
      return () => clearTimeout(t)
    }

    if (deleting && charIdx === 0) {
      setDeleting(false)
      setPhraseIdx(i => (i + 1) % phrases.length)
    }
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause])

  return (
    <span className="tw">
      <span className="tw__text">{displayed}</span>
      <span className="tw__cursor" aria-hidden="true">|</span>
    </span>
  )
}
