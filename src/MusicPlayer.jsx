// MusicPlayer.jsx
import { useState } from "react"
import { PLAYLISTS } from "./useMusic"
import "./MusicPlayer.css"

export default function MusicPlayer({ musicState, onClose }) {
  const {
    isPlaying, error,
    current, currentId,
    volume, setVolume,
    switchPlaylist, toggle,
  } = musicState

  const [showPlaylists, setShowPlaylists] = useState(false)

  return (
    <div className="mp-panel">
      <div className="mp-top">
        <div className="mp-track-info">
          <span className="mp-now-label">now playing</span>
          <span className="mp-track-name">{current.label}</span>
        </div>
        <button className="mp-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className={`mp-visualiser ${isPlaying ? "mp-vis-playing" : ""}`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="mp-bar" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>

      {error && <p className="mp-error">{error}</p>}

      <div className="mp-controls">
        <button className="mp-play-btn" onClick={toggle}>   {/* ← no disabled */}
          <span className="material-symbols-outlined">
            {isPlaying ? "pause" : "play_arrow"}            {/* ← no hourglass */}
          </span>
        </button>
      </div>

      <div className="mp-volume-row">
        <span className="material-symbols-outlined mp-vol-icon">
          {volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
        </span>
        <input
          type="range" min={0} max={1} step={0.01}
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="mp-volume-slider"
        />
        <span className="mp-vol-pct">{Math.round(volume * 100)}%</span>
      </div>

      <div className="mp-playlist-section">
        <button className="mp-playlist-toggle" onClick={() => setShowPlaylists(v => !v)}>
          <span className="material-symbols-outlined">queue_music</span>
          stations
          <span className="mp-chevron">{showPlaylists ? "▾" : "▸"}</span>
        </button>
        {showPlaylists && (
          <div className="mp-playlist-list">
            {PLAYLISTS.map(p => (
              <button
                key={p.id}
                className={`mp-playlist-item ${p.id === currentId ? "mp-playlist-active" : ""}`}
                onClick={() => switchPlaylist(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}