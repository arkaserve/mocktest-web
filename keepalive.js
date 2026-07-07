/**
 * keepalive.js — Pings Render every 10 mins to prevent cold starts.
 */
const RENDER_URL = 'https://mocktest-platform-6vra.onrender.com'

export function startKeepAlive() {
  const ping = () => fetch(`${RENDER_URL}/`).catch(() => {})
  ping()
  setInterval(ping, 10 * 60 * 1000)
}
