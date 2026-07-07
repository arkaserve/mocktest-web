/**
 * keepalive.js
 * Pings the Render backend every 10 minutes to prevent cold starts.
 * Render free tier sleeps after 15 mins of inactivity.
 * This keeps it warm — students never wait 60 seconds.
 */
const BACKEND = import.meta.env.VITE_API_URL || ''

export function startKeepAlive() {
  if (!BACKEND) return  // local dev — not needed

  const ping = () => {
    fetch(`${BACKEND}/`)
      .catch(() => {})  // silent — just keeping warm
  }

  // Ping immediately on app load
  ping()

  // Then every 10 minutes
  setInterval(ping, 10 * 60 * 1000)
}
