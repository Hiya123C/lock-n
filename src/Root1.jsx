// Root.jsx
// ─────────────────────────────────────────────
// Music fix: removed the global click listener that auto-played
// music on any click anywhere. Music now only starts when the
// user explicitly clicks the music note icon (via toggleMusic).
// The audio starts paused by default — user opts in.
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import App from "./App"
import LockInView from "./LockInView"
import bgMusic from "./assets/lofi_bgm.mp3"

function Root() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Keep isPlaying state in sync with actual audio play/pause events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handlePlay  = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    audio.addEventListener("play",  handlePlay)
    audio.addEventListener("pause", handlePause)
    return () => {
      audio.removeEventListener("play",  handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [])

  // toggleMusic is the ONLY way music starts — called by the icon button
  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (audio.paused) {
        await audio.play()
      } else {
        audio.pause()
      }
    } catch (err) {
      console.log("bgm error:", err)
    }
  }

  return (
    <BrowserRouter>
      {/* audio starts with no autoplay — user clicks the icon to begin */}
      <audio ref={audioRef} src={bgMusic} loop />
      <Routes>
        <Route path="/"       element={<App         audioRef={audioRef} isPlaying={isPlaying} toggleMusic={toggleMusic} />} />
        <Route path="/lockin" element={<LockInView  audioRef={audioRef} isPlaying={isPlaying} toggleMusic={toggleMusic} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Root