import { useEffect, useState } from 'react'
import { subscribeToast } from '../toast.js'

const STYLES = {
  success: { bg: '#ecfdf5', border: '#a7f3d0', color: '#065f46', icon: '✓' },
  error:   { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: '⚠' },
  info:    { bg: '#FFF3EE', border: '#fed7c2', color: '#9a3412', icon: 'ℹ' },
}

export default function ToastHost() {
  const [items, setItems] = useState([])
  useEffect(() => subscribeToast((t) => {
    setItems((p) => [...p, t])
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== t.id)), 5000)
  }), [])

  if (!items.length) return null
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {items.map((t) => {
        const s = STYLES[t.type] || STYLES.info
        return (
          <div key={t.id} role="status"
            onClick={() => setItems((p) => p.filter((x) => x.id !== t.id))}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer',
              background: s.bg, border: `1px solid ${s.border}`, color: s.color,
              padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500,
              boxShadow: '0 6px 24px rgba(0,0,0,.12)', animation: 'fadeIn .15s ease-out',
            }}>
            <span style={{ flexShrink: 0 }}>{s.icon}</span>
            <span>{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
