// DraggableWindow.jsx
// ─────────────────────────────────────────────
// Fix: children are now always mounted (never unmounted on minimise).
// Minimise just hides the body via CSS visibility/height instead of
// removing it from the DOM. This prevents the camera video element
// from being destroyed and losing its srcObject stream.
// ─────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react"
import "./DraggableWindow.css"

const MIN_W      = 280
const MIN_H      = 200
const TITLEBAR_H = 42

export default function DraggableWindow({
  title,
  onClose,
  children,
  defaultPos  = { x: 120, y: 120 },
  defaultSize = { w: 360, h: 420 },
  icon,
}) {
  const [pos,       setPos]       = useState(defaultPos)
  const [size,      setSize]      = useState(defaultSize)
  const [minimised, setMinimised] = useState(false)

  const dragging  = useRef(false)
  const resizing  = useRef(false)
  const dragStart = useRef({})

  const clampPos = useCallback((x, y, w, h) => ({
    x: Math.max(0, Math.min(x, window.innerWidth  - w)),
    y: Math.max(0, Math.min(y, window.innerHeight - TITLEBAR_H)),
  }), [])

  const onDragMouseDown = useCallback((e) => {
    dragging.current  = true
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y }
    e.preventDefault()
  }, [pos])

  const onResizeMouseDown = useCallback((e) => {
    resizing.current  = true
    dragStart.current = { mx: e.clientX, my: e.clientY, ow: size.w, oh: size.h }
    e.preventDefault()
    e.stopPropagation()
  }, [size])

  useEffect(() => {
    const onMove = (e) => {
      if (dragging.current) {
        const dx = e.clientX - dragStart.current.mx
        const dy = e.clientY - dragStart.current.my
        setPos(clampPos(dragStart.current.ox + dx, dragStart.current.oy + dy, size.w, size.h))
      }
      if (resizing.current) {
        setSize({
          w: Math.max(MIN_W, dragStart.current.ow + (e.clientX - dragStart.current.mx)),
          h: Math.max(MIN_H, dragStart.current.oh + (e.clientY - dragStart.current.my)),
        })
      }
    }
    const onUp = () => { dragging.current = false; resizing.current = false }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup",   onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup",   onUp)
    }
  }, [size, clampPos])

  const handleMinimise = () => {
    if (minimised) {
      setPos(clampPos(
        window.innerWidth  / 2 - size.w / 2,
        window.innerHeight / 2 - size.h / 2,
        size.w, size.h
      ))
      setMinimised(false)
      return
    }

    const cx = pos.x + size.w / 2
    const cy = pos.y + size.h / 2
    const dL = cx, dR = window.innerWidth - cx
    const dT = cy, dB = window.innerHeight - cy
    const nearest = Math.min(dL, dR, dT, dB)
    const PW = 160, PH = 38

    if      (nearest === dL) setPos({ x: 0,                          y: Math.max(0, cy - PH / 2) })
    else if (nearest === dR) setPos({ x: window.innerWidth  - PW,    y: Math.max(0, cy - PH / 2) })
    else if (nearest === dT) setPos({ x: Math.max(0, cx - PW / 2),   y: 0 })
    else                     setPos({ x: Math.max(0, cx - PW / 2),   y: window.innerHeight - PH - 8 })

    setMinimised(true)
  }

  return (
    <div
      className={`dw-window ${minimised ? "dw-minimised" : ""}`}
      style={{ left: pos.x, top: pos.y, width: minimised ? "auto" : size.w }}
    >
      <div className="dw-titlebar" onMouseDown={onDragMouseDown}>
        <div className="dw-controls">
          <button className="dw-dot dw-close"    onClick={onClose} />
          <button className="dw-dot dw-minimise" onClick={handleMinimise} />
        </div>
        <span className="dw-title">
          {icon && <span className="dw-title-icon material-symbols-outlined">{icon}</span>}
          {minimised ? <span className="dw-pill-label">{title}</span> : title}
        </span>
      </div>

      {/*
        KEY FIX for camera black screen:
        Body is ALWAYS in the DOM — we just hide it with CSS when minimised.
        This keeps the <video> element alive with its srcObject intact.
        Previously we used {!minimised && children} which destroyed + recreated
        the video element on restore, losing the camera stream.
      */}
      <div
        className="dw-body"
        style={{
          height:     minimised ? 0          : size.h,
          overflow:   minimised ? "hidden"   : "auto",
          visibility: minimised ? "hidden"   : "visible",
        }}
      >
        {children}
      </div>

      {!minimised && (
        <div className="dw-resize-handle" onMouseDown={onResizeMouseDown} />
      )}
    </div>
  )
}