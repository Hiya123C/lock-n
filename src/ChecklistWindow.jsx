// ChecklistWindow.jsx
// ─────────────────────────────────────────────
// The draggable checklist panel.
// Receives task state from useTasks (passed down as props).
// ─────────────────────────────────────────────

import { useState } from "react"
import DraggableWindow from "./DraggableWindow"
import "./ChecklistWindow.css"

export default function ChecklistWindow({ tasks, addTask, toggleTask, deleteTask, onClose }) {
  const [input, setInput] = useState("")

  const handleAdd = () => {
    addTask(input)
    setInput("")
  }

  const handleKey = (e) => {
    if (e.key === "Enter") handleAdd()
  }

  const doneCount = tasks.filter(t => t.done).length

  return (
    <DraggableWindow
      title="Today's Goals"
      icon="checklist"
      onClose={onClose}
      defaultPos={{ x: 80, y: 100 }}
      defaultSize={{ w: 340, h: 400 }}
    >
      <div className="cl-inner">
        {/* ── Progress summary ── */}
        <div className="cl-progress">
          <div
            className="cl-progress-fill"
            style={{ width: tasks.length ? `${(doneCount / tasks.length) * 100}%` : "0%" }}
          />
        </div>
        <p className="cl-summary">
          {doneCount} of {tasks.length} done
        </p>

        {/* ── Task list ── */}
        <ul className="cl-list">
          {tasks.length === 0 && (
            <li className="cl-empty">add your goals for this session ✦</li>
          )}
          {tasks.map(task => (
            <li key={task.id} className={`cl-item ${task.done ? "cl-done" : ""}`}>
              <button className="cl-check" onClick={() => toggleTask(task.id)}>
                <span className="material-symbols-outlined">
                  {task.done ? "check_circle" : "radio_button_unchecked"}
                </span>
              </button>
              <span className="cl-text">{task.text}</span>
              <button className="cl-delete" onClick={() => deleteTask(task.id)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </li>
          ))}
        </ul>

        {/* ── Add task ── */}
        <div className="cl-add-row">
          <input
            className="cl-input regular-font"
            placeholder="new goal..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="cl-add-btn" onClick={handleAdd}>
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>
    </DraggableWindow>
  )
}