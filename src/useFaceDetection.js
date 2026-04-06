// useFaceDetection.js
// ─────────────────────────────────────────────
// ✏️  CHANGE THRESHOLDS HERE:
const ABSENT_WARNING_MS = 0.25 * 60 * 1000   // 1 min  (production: 5 * 60 * 1000)
const ABSENT_PENALTY_MS = 0.5 * 60 * 1000   // 2 min  (production: 10 * 60 * 1000)
const DETECTION_INTERVAL_MS = 3000        // check every 3 seconds
// ─────────────────────────────────────────────
//
// SETUP (needed for real face detection):
//   npm install face-api.js
//   Put in /public/models/:
//     tiny_face_detector_model-weights_manifest.json
//     tiny_face_detector_model-shard1
//   https://github.com/justadudewhohacks/face-api.js/tree/master/weights
//
// WITHOUT models: hook still works, always reports "present" (no penalty mode)
// ─────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react"

// Try to import face-api — if not installed, gracefully degrade
let faceapi = null
try {
  faceapi = await import("face-api.js")
} catch {
  console.warn("face-api.js not installed — running in no-detection mode")
}

export function useFaceDetection({ enabled, onWarning, onPenalty, onStatusChange }) {
  const [status, setStatusState] = useState("idle")

  const setStatus = useCallback((s) => {
    setStatusState(s)
    onStatusChange?.(s)
  }, [onStatusChange])

  // Track whether models loaded successfully
  const modelsLoadedRef = useRef(false)
  const [modelsLoaded,  setModelsLoaded]  = useState(false)

  const absentSinceRef  = useRef(null)
  const warningFiredRef = useRef(false)
  const penaltyFiredRef = useRef(false)
  const videoRef        = useRef(null)
  const intervalRef     = useRef(null)
  const streamRef       = useRef(null)
  const enabledRef      = useRef(enabled)  // ← ref so interval always sees latest value

  // Keep enabledRef in sync — this is the key fix for "detection not knowing session started"
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const onWarningRef = useRef(onWarning)
  const onPenaltyRef = useRef(onPenalty)
  useEffect(() => { onWarningRef.current = onWarning }, [onWarning])
  useEffect(() => { onPenaltyRef.current = onPenalty }, [onPenalty])

  const resetAbsence = () => {
    absentSinceRef.current  = null
    warningFiredRef.current = false
    penaltyFiredRef.current = false
  }

  //load model
  useEffect(() => {
    if (!faceapi) {
      // face-api not installed — skip detection entirely, never penalise
      setStatus("idle")
      return
    }
    if (modelsLoadedRef.current) return
    setStatus("loading")
    faceapi.nets.tinyFaceDetector.loadFromUri("/models")
      .then(() => {
        modelsLoadedRef.current = true
        setModelsLoaded(true)
        setStatus("ready")
      })
      .catch((e) => {
        console.warn("Model load failed:", e)
        setStatus("error")
      })
  }, [])

  // ── Start camera ──────────────────────────────────────
  const startCamera = useCallback(async (videoEl) => {
    videoRef.current = videoEl
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      videoEl.srcObject = stream
      await videoEl.play()
      setStatus(modelsLoadedRef.current ? "ready" : "ready")
    } catch {
      setStatus("error")
    }
  }, [setStatus])

  // ── Stop camera ───────────────────────────────────────
  const stopCamera = useCallback(() => {
    clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    resetAbsence()
    setStatus("idle")
  }, [setStatus])

  // ── Detection loop ────────────────────────────────────
  useEffect(() => {
    if (!modelsLoaded) return

    intervalRef.current = setInterval(async () => {
      if (!faceapi) return
      const video = videoRef.current
      if (!video || video.readyState < 2) return

      // If session not running, just keep camera alive but don't penalise
      if (!enabledRef.current) {
        // Still run detection to show present/absent badge
        try {
          const d = await faceapi.detectAllFaces(
            video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 })
          )
          setStatus(d.length > 0 ? "present" : "absent")
        } catch {}
        resetAbsence() // never penalise outside a session
        return
      }

      // Session is running — full detection with absence tracking
      let detections = []
      try {
        detections = await faceapi.detectAllFaces(
          video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 })
        )
      } catch { return }

      if (detections.length > 0) {
        setStatus("present")
        resetAbsence()
      } else {
        setStatus("absent")
        if (absentSinceRef.current === null) absentSinceRef.current = Date.now()
        const absentMs = Date.now() - absentSinceRef.current

        // ✏️  THRESHOLD CHECKS
        if (absentMs >= ABSENT_PENALTY_MS && !penaltyFiredRef.current) {
          penaltyFiredRef.current = true
          onPenaltyRef.current?.()
        } else if (absentMs >= ABSENT_WARNING_MS && !warningFiredRef.current) {
          warningFiredRef.current = true
          onWarningRef.current?.()
        }
      }
    }, DETECTION_INTERVAL_MS)

    return () => clearInterval(intervalRef.current)
  }, [modelsLoaded]) // ← only restart if models change; enabled read via ref

  return { status, startCamera, stopCamera }
}