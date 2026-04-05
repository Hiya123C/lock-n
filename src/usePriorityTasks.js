// usePriorityTasks.js
// ─────────────────────────────────────────────
// Manages the Eisenhower Matrix task system.
// 4 quadrants, each task has: id, text, deadline, done, quadrant
// Persists to localStorage. Separate from session checklist (useTasks).
// The "Do First" quadrant feeds suggestions into the Clock In modal.
// ─────────────────────────────────────────────

import { useState } from "react"

const KEY = "lockin_priority_tasks"

const load = () => {
  try {
    const v = localStorage.getItem(KEY)
    return v ? JSON.parse(v) : { doFirst: [], schedule: [], minimise: [], hobbies: [] }
  } catch {
    return { doFirst: [], schedule: [], minimise: [], hobbies: [] }
  }
}

let nextId = Date.now()

export const QUADRANTS = {
  doFirst:  { label: "Do First",   emoji: "❤️", desc: "Urgent + Important",          color: "#ff5f57" },
  schedule: { label: "Schedule",   emoji: "💛", desc: "Not Urgent + Important",       color: "#febc2e" },
  minimise: { label: "Minimise",   emoji: "💚", desc: "Urgent + Not Important",       color: "#28c840" },
  hobbies:  { label: "Hobbies",    emoji: "💙", desc: "Not Urgent + Not Important",   color: "#599ef2" },
}

export function usePriorityTasks() {
  const [tasks, setTasks] = useState(load)

  const save = (next) => {
    setTasks(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  const addTask = (quadrant, text, deadline = "") => {
    if (!text.trim()) return
    const task = { id: nextId++, text: text.trim(), deadline, done: false, quadrant }
    save({ ...tasks, [quadrant]: [...tasks[quadrant], task] })
  }

  const toggleTask = (quadrant, id) => {
    const task = tasks[quadrant].find(t => t.id === id)
    const next = {
      ...tasks,
      [quadrant]: tasks[quadrant].map(t => t.id === id ? { ...t, done: !t.done } : t)
    }
    save(next)
    if (task) onToggle?.(task.text, !task.done)
  }

  const deleteTask = (quadrant, id) => {
    const task = tasks[quadrant].find(t => t.id === id)
    save({ ...tasks, [quadrant]: tasks[quadrant].filter(t => t.id !== id) })
    if (task) onDelete?.(task.text)
  }

  const updateDeadline = (quadrant, id, deadline) => {
    save({
      ...tasks,
      [quadrant]: tasks[quadrant].map(t => t.id === id ? { ...t, deadline } : t)
    })
  }

  const urgentSuggestions = tasks.doFirst.filter(t => !t.done).map(t => t.text)

  const completeByText = (text, done = true) => {
    const normalised = text.trim().toLowerCase()
    const next = {}
    Object.keys(tasks).forEach(q => {
      next[q] = tasks[q].map(t =>
        t.text.trim().toLowerCase() === normalised ? { ...t, done } : t
      )
    })
    save(next)
  }

  return { tasks, addTask, toggleTask, deleteTask, updateDeadline, urgentSuggestions, completeByText }
}