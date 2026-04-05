// Onboarding.jsx
import { useState, useEffect } from "react"
import "./Onboarding.css"

const STEPS = [
  {
    icon: "lock_open",
    title: "welcome to lock'n",
    desc: "your personal focus companion. \n let's brief you real quick.",
    tip: null,
  },
  {
    icon: "timer",
    title: "clock in to focus",
    desc: "set your focus duration, then hit Clock In. \n set session goals before the timer starts to keep you on track.",
    tip: "coins are earned when you complete goals at the end of a session.",
  },
  {
    icon: "grid_view",
    title: "priority matrix",
    desc: "organise your tasks by urgency and importance across 4 quadrants. \n urgent and important tasks get suggested automatically when you clock in.",
    tip: "you can push tasks directly into your session from the matrix.",
  },
  {
    icon: "copyright",
    title: "earn coins",
    desc: "finish sessions with completed goals to earn coins. the more goals you hit, the more you earn.",
    tip: "spend coins in the store on themes, decorations, and pets.",
  },
  {
    icon: "videocam",
    title: "turn on your camera",
    desc: "lock'n uses your camera to check if you're actually at your desk. go absent for too long and you'll lose coins :(",
    tip: "5 min away = warning, 10 min away = 300 coin penalty.",
    highlight: true,
  },
  {
    icon: "storefront",
    title: "store & rewards",
    desc: "spend your coins on themes to change the look, decorations to personalise your space, and pets to keep you company.",
    tip: "feed your pets to keep them happy. (they can leave if neglected for too long)",
  },
]

const STORAGE_KEY = "lockin_onboarded"

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [exiting, setExiting] = useState(false)

  const isLast = step === STEPS.length - 1
  const s = STEPS[step]

  const next = () => {
    if (isLast) {
      finish()
    } else {
      setStep(v => v + 1)
    }
  }

  const finish = () => {
    setExiting(true)
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "true")
      onDone()
    }, 400)
  }

  return (
    <div className={`ob-overlay ${exiting ? "ob-exit" : ""}`}>
      <div className="ob-card">
        {/* Progress dots */}
        <div className="ob-dots">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`ob-dot ${i === step ? "ob-dot-active" : ""} ${i < step ? "ob-dot-done" : ""}`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`ob-icon-wrap ${s.highlight ? "ob-icon-highlight" : ""}`}>
          <span className="material-symbols-outlined ob-icon">{s.icon}</span>
        </div>

        {/* Content */}
        <h2 className="ob-title">{s.title}</h2>
        <p className="ob-desc">{s.desc}</p>
        {s.tip && <div className="ob-tip">{s.tip}</div>}

        {/* Buttons */}
        <div className="ob-btns">
          {step > 0 && (
            <button className="ob-btn ob-btn-ghost" onClick={() => setStep(v => v - 1)}>
              back
            </button>
          )}
          <button className="ob-btn ob-btn-primary" onClick={next}>
            {isLast ? "let's go!" : "next"}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button className="ob-skip" onClick={finish}>skip</button>
        )}
      </div>
    </div>
  )
}

// Helper hook — returns true if user hasn't been onboarded
export function useOnboarding() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShow(true)
    }
  }, [])

  const complete = () => setShow(false)
  return { show, complete }
}