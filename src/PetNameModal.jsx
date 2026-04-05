// PetNameModal.jsx
// ─────────────────────────────────────────────
// Shown the first time a pet is placed on screen.
// Student gives the pet a name.
// ─────────────────────────────────────────────

import { useState } from "react"
import "./PetNameModal.css"

export default function PetNameModal({ pet, onConfirm, onSkip }) {
  const [name, setName] = useState("")

  return (
    <div className="pnm-overlay">
      <div className="pnm-box">
        <span className="pnm-icon">{pet.icon}</span>
        <h2 className="pnm-title">name your {pet.name.toLowerCase()}!</h2>
        <input
          className="pnm-input regular-font"
          placeholder={`e.g. "Mochi"`}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && name.trim() && onConfirm(name.trim())}
          autoFocus
          maxLength={20}
        />
        <div className="pnm-buttons">
          <button className="pnm-skip"    onClick={onSkip}>skip</button>
          <button
            className="pnm-confirm"
            onClick={() => name.trim() && onConfirm(name.trim())}
            disabled={!name.trim()}
          >
            name them!
          </button>
        </div>
      </div>
    </div>
  )
}