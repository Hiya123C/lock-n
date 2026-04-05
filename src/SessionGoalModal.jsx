// SessionGoalModal.jsx
// ─────────────────────────────────────────────
// Changes in this version:
//   - Accepts `initialGoals` prop (tasks already in checklist)
//     and pre-populates the list with them
//   - onConfirm now only returns the NEWLY added goals
//     (ones not already in the checklist), so Timer can
//     addTask() just those without duplicating or wiping.
//   - Existing goals shown with a subtle "already added" style
//     and cannot be removed here (manage them in the checklist)
// ─────────────────────────────────────────────

import { useState } from "react"
import "./SessionGoalModal.css"

export default function SessionGoalModal({ onConfirm, onCancel, initialGoals = [], urgentSuggestions = [] }) {
  const [input,     setInput]     = useState("")
  // Only track NEW goals added inside this modal
  const [newGoals,  setNewGoals]  = useState([])

  const addGoal = () => {
    if (!input.trim()) return
    setNewGoals(prev => [...prev, input.trim()])
    setInput("")
  }
  const removeNewGoal = (i) => setNewGoals(prev => prev.filter((_, idx) => idx !== i))
  const handleKey = (e) => { if (e.key === "Enter") addGoal() }

  const totalCount = initialGoals.length + newGoals.length

  return (
    <div className="sgm-overlay">
      <div className="sgm-box">
        <h2 className="sgm-title">before you lock in...</h2>
        <p className="sgm-sub regular-font">what do you want to accomplish this session?</p>

        <ul className="sgm-list">
          {totalCount === 0 && (
            <li className="sgm-empty">no goals yet, add some below ✦</li>
          )}

          {/* Urgent suggestions from Priority Matrix — one-click add */}
          {urgentSuggestions.filter(s => !initialGoals.includes(s) && !newGoals.includes(s)).length > 0 && (
            <div className="sgm-suggestions">
              <p className="sgm-suggest-label regular-font">❤️ suggested from Do First:</p>
              {urgentSuggestions
                .filter(s => !initialGoals.includes(s) && !newGoals.includes(s))
                .map((s, i) => (
                  <button key={i} className="sgm-suggest-btn" onClick={() => setNewGoals(prev => [...prev, s])}>
                    + {s}
                  </button>
                ))
              }
            </div>
          )}

        {/* Pre-existing checklist goals — read only */}
          {initialGoals.map((g, i) => (
            <li key={`existing-${i}`} className="sgm-goal sgm-goal-existing">
              <span className="sgm-bullet">✦</span>
              <span className="sgm-gtext regular-font">{g}</span>
              <span className="sgm-existing-tag">from checklist</span>
            </li>
          ))}

          {/* New goals added here in the modal */}
          {newGoals.map((g, i) => (
            <li key={`new-${i}`} className="sgm-goal">
              <span className="sgm-bullet">✦</span>
              <span className="sgm-gtext regular-font">{g}</span>
              <button className="sgm-remove" onClick={() => removeNewGoal(i)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Input */}
        <div className="sgm-input-row">
          <input
            className="sgm-input regular-font"
            placeholder="add more goals..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
          />
          <button className="sgm-add" onClick={addGoal}>
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {/* Coin info */}
        <div className="sgm-coin-info">
          <span className="material-symbols-outlined coin-symbol">copyright</span>
          <span className="regular">1h = 100 · 2h = 250 · 3h+ = 400 coins (all goals done)</span>
        </div>

        {/* Buttons */}
        <div className="sgm-buttons">
          <button className="sgm-cancel" onClick={onCancel}>go back</button>
          <button className="sgm-confirm" onClick={() => onConfirm(newGoals)}>
            {totalCount === 0 ? "start without goals" : "let's go!"}
          </button>
        </div>
      </div>
    </div>
  )
}