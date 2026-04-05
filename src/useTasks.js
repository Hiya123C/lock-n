import { useState } from "react"
let nextId = 1

export function useTasks(onTaskCompleted, onTaskUncompleted) {
  const [tasks, setTasks] = useState([])

  const addTask = (text, fromPriority = false) => {
    if (!text.trim()) return
    setTasks(prev => {
      // Don't add duplicate if already in session
      if (prev.some(t => t.text.trim().toLowerCase() === text.trim().toLowerCase())) return prev
      return [...prev, { id: nextId++, text: text.trim(), done: false, fromPriority }]
    })
  }

  const toggleTask = (id) => {
    setTasks(prev => {
      const next    = prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
      const toggled = next.find(t => t.id === id)
      if (toggled?.done)  onTaskCompleted?.(toggled.text)
      if (!toggled?.done) onTaskUncompleted?.(toggled.text)
      return next
    })
  }

  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id))

  // Called when priority matrix marks a task done/undone — syncs into session list
  const syncFromPriority = (text, done) => {
    setTasks(prev => prev.map(t =>
      t.text.trim().toLowerCase() === text.trim().toLowerCase() ? { ...t, done } : t
    ))
  }

  // Called when a priority task is deleted — removes matching session task
  const deleteByText = (text) => {
    setTasks(prev => prev.filter(t =>
      t.text.trim().toLowerCase() !== text.trim().toLowerCase()
    ))
  }

  const clearAll       = () => setTasks([])
  const completedCount = tasks.filter(t => t.done).length
  const totalCount     = tasks.length

  return { tasks, addTask, toggleTask, deleteTask, deleteByText, syncFromPriority, clearAll, completedCount, totalCount }
}