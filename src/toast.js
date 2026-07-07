// toast.js — tiny global toast pub/sub (no dependency, no context wiring).
// Usage: import { toast } from './toast'; toast('Saved!', 'success')
let _listeners = []

export function toast(message, type = 'info') {
  const item = { id: Date.now() + Math.random(), message, type }
  _listeners.forEach((fn) => fn(item))
}

export function subscribeToast(fn) {
  _listeners.push(fn)
  return () => { _listeners = _listeners.filter((x) => x !== fn) }
}
