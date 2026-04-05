import { useState, useRef, useEffect } from "react"
import bgMusic from "./assets/lofi_bgm.mp3"

export const PLAYLISTS = [
  { id: "local",     label: "🎵 My Lofi",    url: bgMusic },
  { id: "chillhop",  label: "☁️ Chillhop",   url: "https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/" },
  { id: "lounge",    label: "🛋️ Lounge",     url: "https://streams.fluxfm.de/lounge/mp3-320/audio/" },
  { id: "jazz",      label: "🎷 Jazz",        url: "https://streams.fluxfm.de/jazzschwarz/mp3-320/audio/" },
  { id: "sleep",     label: "🌙 Sleep",       url: "https://stream.klassikradio.de/dreams/mp3-192/www.klassikradio.de/" },
]

export function useMusic() {
  const audioRef = useRef(null)
  if (!audioRef.current) {
    const audio = new Audio(bgMusic)
    audio.loop = true
    audioRef.current = audio
  }

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentId, setCurrentId] = useState("local")
  const [volume,    setVolume]    = useState(0.6)
  const [error,     setError]     = useState(null)

  const current = PLAYLISTS.find(p => p.id === currentId) ?? PLAYLISTS[0]

  useEffect(() => {
    const audio = audioRef.current
    const onPlay  = () => { setIsPlaying(true);  setError(null) }
    const onPause = () => setIsPlaying(false)
    const onError = () => { setError("stream unavailable"); setIsPlaying(false) }
    audio.addEventListener("play",  onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("error", onError)
    audio.volume = volume
    return () => {
      audio.removeEventListener("play",  onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("error", onError)
    }
  }, [])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  const switchPlaylist = async (id) => {
    const audio = audioRef.current
    const wasPlaying = isPlaying
    audio.pause()
    setError(null)
    setCurrentId(id)
    const playlist = PLAYLISTS.find(p => p.id === id)
    audio.src = playlist.url
    audio.load()
    if (wasPlaying) {
      try { await audio.play() }
      catch { setError("couldn't autoplay — click play") }
    }
  }

  const toggle = async () => {
    const audio = audioRef.current
    try {
      if (audio.paused) await audio.play()
      else              audio.pause()
    } catch {
      setError("playback failed")
    }
  }

  return {
    audioRef,
    isPlaying, error,
    current, currentId,
    volume, setVolume,
    switchPlaylist, toggle,
  }
}