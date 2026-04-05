import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import "./DatePicker.css"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"]
function fmt2(n) { return n.toString().padStart(2,"0") }

export default function DatePicker({ value, onChange, title }) {
  const [open, setOpen]         = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })
  const today  = new Date()
  const parsed = value ? new Date(value + "T00:00:00") : null

  const [viewYear,  setViewYear]  = useState((parsed || today).getFullYear())
  const [viewMonth, setViewMonth] = useState((parsed || today).getMonth())

  const triggerRef = useRef(null)
  const popoverRef = useRef(null)

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect    = triggerRef.current.getBoundingClientRect()
      const popW    = 220   // matches dp-popover width
      const popH    = 280   // approximate popover height

      // Flip left if overflows right edge
      const left = rect.left + popW > window.innerWidth
        ? rect.right - popW          // align to right edge of trigger
        : rect.left

      // Flip up if overflows bottom edge
      const top = rect.bottom + popH > window.innerHeight
        ? rect.top - popH - 6        // open upward
        : rect.bottom + 6

      setPopoverPos({
        top:  top  + window.scrollY,
        left: Math.max(8, left + window.scrollX),  // never go off left edge
      })
    }
    setOpen(v => !v)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        popoverRef.current && !popoverRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const selectDate = (y, m, d) => {
    onChange(`${y}-${fmt2(m + 1)}-${fmt2(d)}`)
    setOpen(false)
  }
  const clearDate = (e) => { e.stopPropagation(); onChange("") }

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isSelected = (d) => parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === d
  const isToday    = (d) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d

  const label = parsed ? `${MONTHS[parsed.getMonth()]} ${parsed.getDate()}` : title || "date"

  return (
    <>
      <button
        ref={triggerRef}
        className={`dp-trigger ${parsed ? "dp-has-value" : ""}`}
        onClick={handleOpen}
        title={title}
        type="button"
      >
        <span className="material-symbols-outlined dp-cal-icon">calendar_today</span>
        <span className="dp-label">{label}</span>
        {parsed && <span className="dp-clear" onClick={clearDate}>✕</span>}
      </button>

      {open && createPortal(
        <div ref={popoverRef} className="dp-popover"
          style={{
            position: "absolute",
            top:  popoverPos.top,
            left: popoverPos.left,
            maxWidth: "calc(100vw - 16px)",
          }}
        >
          <div className="dp-nav">
            <button className="dp-nav-btn" type="button" onClick={() => {
              if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
              else setViewMonth(m => m - 1)
            }}>‹</button>
            <span className="dp-month-label">{MONTHS[viewMonth]} {viewYear}</span>
            <button className="dp-nav-btn" type="button" onClick={() => {
              if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
              else setViewMonth(m => m + 1)
            }}>›</button>
          </div>
          <div className="dp-grid">
            {DAYS.map(d => <span key={d} className="dp-day-hdr">{d}</span>)}
            {cells.map((d, i) =>
              d === null ? <span key={`e${i}`} /> :
              <button
                key={d} type="button"
                className={`dp-day ${isSelected(d) ? "dp-selected" : ""} ${isToday(d) ? "dp-today" : ""}`}
                onClick={() => selectDate(viewYear, viewMonth, d)}
              >{d}</button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}