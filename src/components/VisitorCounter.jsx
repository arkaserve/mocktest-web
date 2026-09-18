import { useState, useEffect } from 'react'
import api from '../api'

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K+'
  return n.toString()
}

export default function VisitorCounter() {
  const [count, setCount] = useState(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    api.get('/visitor/count')
      .then(r => setCount(r.data?.count ?? r.data?.total ?? null))
      .catch(() => {})
  }, [])

  // Subtle live pulse every 30s to feel real-time
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
      api.get('/visitor/count')
        .then(r => setCount(r.data?.count ?? r.data?.total ?? null))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [])

  if (count === null) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '10px 20px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 40,
      width: 'fit-content',
      margin: '0 auto',
    }}>
      {/* Live dot */}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#22c55e',
          display: 'block',
          boxShadow: pulse ? '0 0 0 4px rgba(34,197,94,0.3)' : '0 0 0 0px rgba(34,197,94,0)',
          transition: 'box-shadow 0.4s ease',
        }} />
      </span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
        <span style={{
          fontSize: 15,
          fontWeight: 800,
          color: '#fff',
          marginRight: 4,
          fontVariantNumeric: 'tabular-nums',
        }}>{formatCount(count)}</span>
        students have practiced on MockTest
      </span>
    </div>
  )
}
