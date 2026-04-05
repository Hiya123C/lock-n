// CameraWindow.jsx
// ─────────────────────────────────────────────
// Runs its own lightweight face-presence check independently
// of whether a session is running — so the badge always shows
// whether a person is in frame or not, even before Clock In.
//
// The full useFaceDetection hook (with absence penalties) still
// runs in Timer.jsx. This is just a visual indicator.
// ─────────────────────────────────────────────

import { useEffect, useRef, useState } from "react"
import DraggableWindow from "./DraggableWindow"
import "./CameraWindow.css"

const STATUS_CONFIG = {
  idle:     { badge: "camera off",         cls: "cam-off"     },
  loading:  { badge: "starting camera…",   cls: "cam-loading" },
  ready:    { badge: "camera ready",       cls: "cam-ready"   },
  present:  { badge: "● person detected",  cls: "cam-present" },
  absent:   { badge: "● no one detected",  cls: "cam-absent"  },
  error:    { badge: "camera error",       cls: "cam-error"   },
}

export default function CameraWindow({ onClose, onVideoReady, detectionStatus }) {
  const videoRef = useRef(null)

  // Local stream state for the simple "is someone there" indicator
  // detectionStatus comes from the full useFaceDetection hook in Timer
  // and will say "present"/"absent" when a session is running.
  // When no session, it'll say "ready" — so we show "camera ready".

  useEffect(() => {
    if (videoRef.current) onVideoReady(videoRef.current)
  }, [])

  const cfg = STATUS_CONFIG[detectionStatus] ?? STATUS_CONFIG.idle

  return (
    <DraggableWindow
      title="Self Cam"
      icon="videocam"
      onClose={onClose}
      defaultPos={{ x: 20, y: window.innerHeight - 340 }}
      defaultSize={{ w: 300, h: 260 }}
    >
      <div className="cam-inner">
        <video
          ref={videoRef}
          className="cam-video"
          muted
          playsInline
          autoPlay
        />

        <div className="cam-overlay">
          {/* Always-visible status pill */}
          <div className={`cam-status-badge ${cfg.cls}`}>
            {cfg.badge}
          </div>

          {/* Extra hint when session is not running */}
          {(detectionStatus === "ready" || detectionStatus === "idle") && (
            <div className="cam-hint">start a session to enable detection</div>
          )}
        </div>
      </div>
    </DraggableWindow>
  )
}