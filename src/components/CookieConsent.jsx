import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [visible,  setVisible]  = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Show after 2 seconds so it doesn't block first impression
      const t = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = (analytics = true) => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      essential: true,
      analytics,
      timestamp: new Date().toISOString()
    }))
    setVisible(false)
    // Enable GA4 if analytics accepted
    if (analytics && window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' })
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="text-2xl flex-shrink-0">🍪</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm mb-1">We use cookies</h3>
            <p className="text-gray-300 text-xs leading-relaxed">
              We use <strong>essential cookies</strong> to keep you logged in and save your test progress.
              We also use <strong>analytics cookies</strong> (Google Analytics) to understand how students 
              use the platform — so we can improve it.{' '}
              <button onClick={() => setExpanded(!expanded)}
                className="text-blue-400 hover:underline text-xs">
                {expanded ? 'Show less' : 'Learn more'}
              </button>
            </p>

            {expanded && (
              <div className="mt-3 space-y-2 text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <div><strong className="text-white">Essential cookies</strong> — Required for login, session, and test saving. Cannot be disabled.</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">○</span>
                  <div><strong className="text-white">Analytics cookies</strong> — Google Analytics 4. Tells us which pages students visit. You can opt out.</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <div>We do <strong className="text-white">NOT</strong> use advertising, tracking, or third-party marketing cookies.</div>
                </div>
                <a href="/privacy" className="text-blue-400 hover:underline block mt-1">
                  Read our full Privacy Policy →
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button onClick={() => accept(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
            Accept all cookies
          </button>
          <button onClick={() => accept(false)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2.5 rounded-xl transition-colors">
            Essential only
          </button>
          <button onClick={() => accept(false)}
            className="sm:w-auto text-gray-400 hover:text-white text-xs px-4 py-2.5 transition-colors">
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
