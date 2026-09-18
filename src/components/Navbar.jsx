import { useState } from 'react'

export default function Navbar({ currentPage, onNav, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { id: 'about',   label: 'About Us'        },
    { id: 'home',    label: 'Home'            },
    { id: 'success', label: 'Success Stories' },
    // { id: 'career',  label: 'Career'          }, // hidden — no open roles currently
    { id: 'blog',    label: 'Blog'            },
    { id: 'exams',   label: 'Exam Patterns'  },
    { id: 'cutoffs', label: 'Cut-off Trends' },
    { id: 'papers',  label: 'Past Papers'    },
  ]

  return (
    <nav className="sticky top-0 z-50 shadow-md" style={{ background:'#111' }}>
      <div className="w-full px-5 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <button onClick={() => onNav('home')} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:'#FF653F' }}>
            <span className="text-white font-bold text-sm">MT</span>
          </div>
          <div className="text-left">
            <div className="font-bold text-white text-sm leading-none">MockTest</div>
            <div className="text-xs" style={{ color:'#FF653F' }}>by arkaserve.com</div>
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-wrap justify-center flex-1">
          {navItems.map(item => {
            const isActive   = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                style={isActive
                  ? { background:'rgba(255,255,255,.16)', color:'#ffffff' }
                  : { color:'#ffffff' }}
                onMouseOver={e => { if (!isActive) { e.currentTarget.style.background='rgba(255,255,255,.12)' } }}
                onMouseOut={e => { if (!isActive) { e.currentTarget.style.background='transparent' } }}
              >
                {item.icon && <span className="mr-1.5">{item.icon}</span>}{item.label}
              </button>
            )
          })}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <button onClick={() => onNav('dashboard')}
                className="text-xs font-bold text-white px-4 py-1.5 rounded-lg transition-all whitespace-nowrap"
                style={{ background:'#FF653F' }}
                onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
                onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
                My Dashboard
              </button>
              <span className="text-sm hidden lg:inline" style={{ color:'rgba(255,255,255,.8)' }}>
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <button onClick={onLogout}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ color:'rgba(255,255,255,.85)', border:'1px solid rgba(255,255,255,.25)' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}
                onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => onNav('auth')}
                className="text-sm px-3 py-1.5 transition-colors"
                style={{ color:'#ffffff' }}>
                Login
              </button>
              <button onClick={() => onNav('auth')}
                className="text-sm text-white px-4 py-1.5 rounded-lg transition-all whitespace-nowrap"
                style={{ background:'#FF653F' }}
                onMouseOver={e => e.currentTarget.style.background='#e5512f'}
                onMouseOut={e => e.currentTarget.style.background='#FF653F'}>
                Start Free Test
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
              : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>
            }
          </svg>
        </button>
      </div>

      {/* Tap-outside backdrop — closes the menu when the user taps the page.
          Sits below the nav (z-40) so menu items (z-50) still work. */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden relative z-50 px-4 py-3 space-y-1" style={{ background:'#111', borderTop:'1px solid rgba(255,255,255,.1)' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNav(item.id); setMenuOpen(false) }}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={currentPage === item.id
                ? { background:'rgba(255,255,255,.16)', color:'#ffffff' }
                : { color:'#ffffff' }}
            >
              {item.icon && <span className="mr-1.5">{item.icon}</span>}{item.label}
            </button>
          ))}
          {user ? (
            <div className="mt-2 space-y-1">
              <button onClick={() => { onNav('dashboard'); setMenuOpen(false) }}
                className="w-full text-white text-sm py-2.5 rounded-lg font-bold"
                style={{ background:'#FF653F' }}>
                My Dashboard
              </button>
              <button onClick={() => { onLogout(); setMenuOpen(false) }}
                className="w-full text-sm py-2.5 rounded-lg font-medium"
                style={{ color:'rgba(255,255,255,.85)', border:'1px solid rgba(255,255,255,.25)' }}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => { onNav('auth'); setMenuOpen(false) }}
              className="w-full mt-2 text-white text-sm py-2.5 rounded-lg font-medium"
              style={{ background:'#FF653F' }}>
              Start Free Test
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
