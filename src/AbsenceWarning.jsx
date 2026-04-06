// AbsenceWarning.jsx
// ─────────────────────────────────────────────
// Two modes:
//   "warning" — shown at 5 min absence: soft reminder, dismissible
//   "penalty" — shown at 10 min absence: session cancelled, -100 coins
// ─────────────────────────────────────────────

import "./AbsenceWarning.css"

export default function AbsenceWarning({ mode, onDismiss, onAcceptPenalty }) {
  if (mode === "warning") {
    return (
      <div className="aw-overlay aw-warning-overlay">
        <div className="aw-box">
          <span className="aw-emoji">👀</span>
          <h2 className="aw-title bold-font">where'd you go?</h2>
          <p className="aw-msg regular-font">
            you've been away for <strong>5 minutes</strong>.<br />
            come back before the 10 minute mark or your session will be cancelled.
          </p>
          <button className="aw-btn" onClick={onDismiss}>i'm back! 👋</button>
        </div>
      </div>
    )
  }

  if (mode === "penalty") {
    return (
      <div className="aw-overlay aw-penalty-overlay">
        <div className="aw-box">
          <span className="aw-emoji">😔</span>
          <h2 className="aw-title bold-font">session cancelled</h2>
          <p className="aw-msg regular-font">
            you were away for <strong>10+ minutes</strong>.<br />
            your session has been ended and <strong>-100 coins</strong> have been deducted.
          </p>
          <button className="aw-btn" onClick={onAcceptPenalty}>okay...</button>
        </div>
      </div>
    )
  }

  return null
}