// BreakButton.jsx
// ─────────────────────────────────────────────
// Shown during an active timer session.
// Displays break credit remaining + start/end break.
// During a break, shows a countdown and "end break early" button.
// Timer parent is responsible for PAUSING the countdown during a break.
// ─────────────────────────────────────────────

import "./BreakButton.css"

function fmt(n) { return n.toString().padStart(2, "0") }

export default function BreakButton({
  onBreak,
  breakSecsLeft,
  breakCreditDisplay,
  canBreak,
  startBreak,
  endBreak,
}) {
  const breakMins = fmt(Math.floor(breakSecsLeft / 60))
  const breakSecs = fmt(breakSecsLeft % 60)

  if (onBreak) {
    return (
      <div className="brk-container brk-active">
        <p className="brk-label">☕ on a break</p>
        <div className="brk-countdown">{breakMins}:{breakSecs}</div>
        <button className="brk-end-btn" onClick={endBreak}>
          end break early
        </button>
      </div>
    )
  }

  return (
    <div className="brk-container">
      <button
        className={`brk-btn ${!canBreak ? "brk-btn-disabled" : ""}`}
        onClick={startBreak}
        disabled={!canBreak}
        title={!canBreak ? "no break credit left" : `${breakCreditDisplay} min remaining`}
      >
        Break
      </button>
      <span className="brk-credit">
        {breakCreditDisplay} min left
      </span>
    </div>
  )
}