// PriorityMatrix.jsx
// ─────────────────────────────────────────────
// Full-screen slide-in panel showing the Eisenhower Matrix.
// 4 quadrants, each with task list + add task input + deadline.
// Opened via the checklist icon in the capsule menu.
// ─────────────────────────────────────────────

import { useState } from "react"
import { QUADRANTS } from "./usePriorityTasks"
import DatePicker from "./DatePicker"
import "./PriorityMatrix.css"

function QuadrantPanel({ qKey, tasks, addTask, toggleTask, deleteTask, updateDeadline, pushTask }) {
  const [input,    setInput]    = useState("")
  const [deadline, setDeadline] = useState("")
  const [expanded, setExpanded] = useState(true)
  const q = QUADRANTS[qKey]

  const handleAdd = () => {
    addTask(qKey, input, deadline)
    setInput("")
    setDeadline("")
  }

  const doneCount = tasks.filter(t => t.done).length

  return (
    <div className="pm-quadrant" style={{ "--q-color": q.color }}>
      {/* Header */}
      <div className="pm-q-header" onClick={() => setExpanded(v => !v)}>
        <span className="pm-q-emoji">{q.emoji}</span>
        <div className="pm-q-title-group">
          <span className="pm-q-title">{q.label}</span>
          <span className="pm-q-desc">{q.desc}</span>
        </div>
        <span className="pm-q-count">{doneCount}/{tasks.length}</span>
        <span className="pm-q-chevron">{expanded ? "▾" : "▸"}</span>
      </div>

      {expanded && (
        <>
          {/* Task list */}
          <ul className="pm-task-list">
            {tasks.length === 0 && (
              <li className="pm-empty">nothing here, add something</li>
            )}
            {tasks.map(task => (
              <li key={task.id} className={`pm-task ${task.done ? "pm-task-done" : ""}`}>
                <button className="pm-check" onClick={() => toggleTask(qKey, task.id)}>
                  <span className="material-symbols-outlined">
                    {task.done ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </button>
                
                <div className="pm-task-content">
                  <span className="pm-task-text regular-font">{task.text}</span>
                  {/* Inline deadline picker */}
                  <DatePicker
                    value={task.deadline || ""}
                    onChange={(val) => updateDeadline(qKey, task.id, val)}
                    title="set deadline"
                  />
                </div>

                <button
                  className="pm-push"
                  onClick={() => pushTask(task.text)}
                  title="add to current session"
                >
                  <span className="material-symbols-outlined">upload</span>
                </button>

                <button className="pm-delete" onClick={() => deleteTask(qKey, task.id)}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Add task row */}
          <div className="pm-add-row">
            <input
              className="pm-input regular-font"
              placeholder="add a task..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <DatePicker
              value={deadline}
              onChange={(val) => setDeadline(val)}
              title="deadline"
            />
            <button className="pm-add-btn" onClick={handleAdd}>
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function PriorityMatrix({ priorityState, onClose, pushTask }) {
  const { tasks, addTask, toggleTask, deleteTask, updateDeadline } = priorityState

  const totalTasks = Object.values(tasks).flat().length
  const doneTasks  = Object.values(tasks).flat().filter(t => t.done).length

  return (
    <div className="pm-overlay">
      <div className="pm-panel">
        {/* Top bar */}
        <div className="pm-topbar">
          <div className="pm-topbar-left">
            <h2 className="pm-heading">Priority Matrix</h2>
            <p className="pm-subheading">
              {doneTasks} of {totalTasks} tasks complete
            </p>
          </div>
          <button className="pm-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tip */}
        <div className="pm-tip">
          Tip: Tasks in <strong>❤️ Do First</strong> will be suggested when you Clock In
        </div>

        {/* Quadrants */}
        <div className="pm-quadrants-scroll">
          <div className="pm-quadrants">
            {Object.keys(QUADRANTS).map(qKey => (
              <QuadrantPanel
                key={qKey}
                qKey={qKey}
                tasks={tasks[qKey]}
                addTask={addTask}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                updateDeadline={updateDeadline}
                pushTask={pushTask}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}