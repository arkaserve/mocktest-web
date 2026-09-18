import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { supabase }        from './supabase.js'
import { useSEO }          from './useSEO.js'

import { handleCheckoutReturn } from './payments.js'
import { checkHealth, syncSubscriptions } from './api.js'
import { toast }            from './toast.js'
import Navbar              from './components/Navbar.jsx'
import Footer              from './components/Footer.jsx'
import ToastHost           from './components/ToastHost.jsx'
import CookieConsent       from './components/CookieConsent.jsx'

// Landing page loads eagerly (first paint); everything else is code-split and
// loaded on demand so the initial bundle stays tiny and the site loads fast.
import LandingPage         from './pages/LandingPage.jsx'
const AboutPage          = lazy(() => import('./pages/AboutPage.jsx'))
const CoursesPage        = lazy(() => import('./pages/CoursesPage.jsx'))
const ContactPage        = lazy(() => import('./pages/ContactPage.jsx'))
const PrivacyPage        = lazy(() => import('./pages/PrivacyPage.jsx'))
const TermsPage          = lazy(() => import('./pages/TermsPage.jsx'))
const CutoffsPage        = lazy(() => import('./pages/CutoffsPage.jsx'))
const PreviousPapersPage = lazy(() => import('./pages/PreviousPapersPage.jsx'))
const ExamsPage          = lazy(() => import('./pages/ExamsPage.jsx'))
const AuthScreen         = lazy(() => import('./pages/AuthScreen.jsx'))
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage.jsx'))
const AdminPage          = lazy(() => import('./pages/AdminPage.jsx'))
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage.jsx'))
const Dashboard          = lazy(() => import('./pages/Dashboard.jsx'))
const PracticePage       = lazy(() => import('./pages/PracticePage.jsx'))
const PredictionExplainer= lazy(() => import('./pages/PredictionExplainer.jsx'))
const HomeScreen         = lazy(() => import('./pages/HomeScreen.jsx'))
const ExamScreen         = lazy(() => import('./pages/ExamScreen.jsx'))
const ResultScreen       = lazy(() => import('./pages/ResultScreen.jsx'))
const OnboardingWizard   = lazy(() => import('./pages/OnboardingWizard.jsx'))
const PaymentComingSoon  = lazy(() => import('./pages/PaymentComingSoon.jsx'))

// Sections rendered by the LandingPage (single-page tabs)
const LANDING_TABS  = ['home','about','success','career','blog']
const PUBLIC_PAGES  = [...LANDING_TABS,'courses','contact','privacy','terms','auth','cutoffs','papers','exams']
const IDLE_TIMEOUT  = 15 * 60 * 1000
const IDLE_WARNING  = 60 * 1000

export default function App() {
  const [page,        setPage]        = useState('home')
  useSEO(page)
  const [user,        setUser]        = useState(null)
  const [testData,    setTestData]    = useState(null)
  const [resultData,  setResultData]  = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [startMode,   setStartMode]   = useState('mock')
  const [startExamId, setStartExamId] = useState('')
  const [planData,    setPlanData]    = useState(null)
  const [paymentPlan, setPaymentPlan] = useState(null)
  const [dashTab,     setDashTab]     = useState('home')

  const [idleWarning, setIdleWarning] = useState(false)
  const idleTimer    = useRef(null)
  const warningTimer = useRef(null)
  const skipPushRef    = useRef(false)   // true when a page change came from Back (popstate)
  const historyMounted = useRef(false)

  const clearTimers = useCallback(() => {
    if (idleTimer.current)    clearTimeout(idleTimer.current)
    if (warningTimer.current) clearTimeout(warningTimer.current)
  }, [])

  const handleLogout = useCallback(async () => {
    clearTimers()
    setIdleWarning(false)
    await supabase.auth.signOut()
    setUser(null)
    setPlanData(null)
    setDashTab('home')
    setPage('home')
  }, [clearTimers])

  const resetIdleTimer = useCallback(() => {
    if (!user) return
    clearTimers()
    setIdleWarning(false)
    warningTimer.current = setTimeout(() => setIdleWarning(true), IDLE_TIMEOUT - IDLE_WARNING)
    idleTimer.current    = setTimeout(() => handleLogout(),       IDLE_TIMEOUT)
  }, [user, clearTimers, handleLogout])

  // Warm up the backend on first load (Render free tier sleeps). Fire-and-forget
  // so the cold start overlaps with the user reading the page, not their first action.
  useEffect(() => { checkHealth().catch(() => {}) }, [])

  useEffect(() => {
    if (!user) { clearTimers(); setIdleWarning(false); return }
    const EVENTS = ['mousemove','mousedown','keydown','scroll','touchstart','click']
    EVENTS.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }))
    resetIdleTimer()
    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, resetIdleTimer))
      clearTimers()
    }
  }, [user, resetIdleTimer, clearTimers])

  useEffect(() => {
    const hash = window.location.hash
    // ONLY a password-recovery link should open the reset page. A normal
    // login/OAuth redirect also carries access_token in the hash — treating
    // that as recovery wrongly forced the reset page (and re-fired on Back).
    if (hash.includes('type=recovery')) {
      setPage('reset-password')
      setAuthChecked(true)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user
        setUser(u)
        setDashTab('home')
        setPage(resolvePostAuthPage(u))
      }
      setAuthChecked(true)
      // Strip any leftover auth token from the URL so pressing Back can't
      // re-trigger auth handling / show a stale page.
      if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error'))) {
        try { window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search) } catch {}
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user)
        if (page === 'auth') setPage(resolvePostAuthPage(session.user))
      } else {
        setUser(null)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const resolvePostAuthPage = (_u) => {
    // Everyone → Dashboard. Users browse and pick exams from the dashboard's
    // "Explore Exams" view whenever they're ready (no forced onboarding step).
    return 'dashboard'
  }

  // Reconcile the plan from the authoritative subscriptions table (the DB is the
  // source of truth). If there's an active, non-expired subscription → stamp it
  // into the user's metadata; if there is NONE but metadata still claims a plan
  // → clear it (so an expired/removed subscription downgrades correctly).
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        // Self-heal: verify any paid-but-pending sessions against Stripe first.
        try { await syncSubscriptions(user.id) } catch {}
        const { data, error } = await supabase
          .from('subscriptions')
          .select('plan, period_end')
          .eq('user_id', user.id).eq('status', 'active')
          .order('period_end', { ascending: false }).limit(1)
        if (cancelled || error) return   // on a read error, never change the plan

        const row    = data && data[0]
        const active = row && (!row.period_end || new Date(row.period_end) > new Date())
        const meta   = user.user_metadata || {}
        const curPlan = (meta.plan || meta.subscription || '').toLowerCase()
        const isProNow = curPlan && !['free', '', 'none'].includes(curPlan)

        if (active) {
          // Stamp only if it differs (avoids needless updates / loops).
          if (curPlan !== row.plan || meta.plan_expires !== row.period_end) {
            const { data: upd } = await supabase.auth.updateUser({ data: {
              plan: row.plan, subscription: row.plan, plan_expires: row.period_end,
            }})
            if (!cancelled && upd?.user) setUser(upd.user)
          }
        } else if (isProNow) {
          // No active subscription in the DB → downgrade the cached metadata.
          const { data: upd } = await supabase.auth.updateUser({ data: {
            plan: 'free', subscription: 'free', plan_expires: null,
          }})
          if (!cancelled && upd?.user) setUser(upd.user)
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [user])

  // After returning from Stripe Checkout, verify the session and activate the plan.
  useEffect(() => {
    if (!user) return
    if (!window.location.search.includes('sub=')) return
    handleCheckoutReturn(user).then(res => {
      if (res?.ok) {
        setDashTab('subscriptions')
        setPage('dashboard')
        toast(`Payment successful! Your ${res.plan} plan is now active. 🎉`, 'success')
      } else if (res?.cancelled) {
        setDashTab('subscriptions')
        setPage('dashboard')
        toast('Payment cancelled — no charge was made. You can try again anytime.', 'info')
      } else if (res?.pending) {
        setDashTab('subscriptions')
        setPage('dashboard')
        toast('Payment received! Your plan is being activated — this can take a minute. Refresh if it doesn’t appear shortly.', 'info')
      } else if (res?.error) {
        toast(res.error, 'error')
      }
    })
  }, [user])

  // ── Browser Back/Forward support ─────────────────────────────────────
  // The app is a single-URL state machine, so without this the browser Back
  // button just leaves the site. We push a history entry on each page change
  // and restore the page on popstate. Data-dependent screens (exam/result)
  // fall back to a safe page so Back can never land on a blank/crashing view.
  useEffect(() => {
    const onPop = (e) => {
      const target = e.state?.appPage
      skipPushRef.current = true
      // Logged in: Back always returns to the Dashboard (never a blank/loading
      // page or a stranded public/test screen).
      if (user) { setPage('dashboard'); return }
      // Logged out: restore the previous page, else Home.
      setPage(target || 'home')
    }
    window.addEventListener('popstate', onPop)
    // seed state on the current entry so the first Back has somewhere to go
    try { window.history.replaceState({ appPage: page }, '') } catch {}
    return () => window.removeEventListener('popstate', onPop)
  }, [user, testData, resultData])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!historyMounted.current) { historyMounted.current = true; return }
    if (skipPushRef.current) { skipPushRef.current = false; return }  // change came from Back
    try { window.history.pushState({ appPage: page }, '') } catch {}
  }, [page])

  // ── Free-trial gating ───────────────────────────────────────────────
  // After 7 days, a non-subscribed user can browse but cannot take tests.
  const userPlan     = (user?.user_metadata?.plan || user?.user_metadata?.subscription || 'free').toLowerCase()
  const isProUser    = !['free','','none'].includes(userPlan)
  const trialDaysUsed= user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000) : 0
  const trialExpired = !!user && !isProUser && trialDaysUsed >= 7
  const guardTrial = () => {
    if (trialExpired) {
      setDashTab('subscriptions'); setPage('dashboard'); window.scrollTo(0,0)
      toast('Your 7-day free trial has ended. Subscribe to Pro or Ultimate to keep taking tests.', 'info')
      return false
    }
    return true
  }

  const nav = (target, examId) => {
    const publicList = [...LANDING_TABS,'courses','contact','privacy','terms','auth','practice','cutoffs','papers','exams']
    if (!user && !publicList.includes(target)) { setPage('auth'); return }
    if (target === 'mocktest' && !guardTrial()) return

    // Dashboard inner tabs reached from other pages (e.g. Practice sidebar)
    const DASH_TABS = { results:'results', planner:'studyplan', studyplan:'studyplan',
                        subscriptions:'subscriptions', profile:'profile', settings:'settings',
                        explore:'explore', billing:'billing' }
    if (DASH_TABS[target]) {
      setDashTab(DASH_TABS[target]); setPage('dashboard'); window.scrollTo(0, 0); return
    }
    if (target === 'dashboard') { setDashTab('home') }

    if (target === 'mocktest') {
      if (user) {
        setStartMode('mock')
        setStartExamId(examId || '')
        setPage('examhome')
      } else {
        setPage('auth')
      }
      window.scrollTo(0, 0)
      return
    }
    window.scrollTo(0, 0)
    setPage(target)
  }

  const handleAuth = (u) => {
    setUser(u)
    setDashTab('home')
    setPage(resolvePostAuthPage(u))
  }

  const handleOnboardingDone = (wizardOutput) => {
    setPlanData(wizardOutput)
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
    setPage('dashboard')
  }

  const handleOnboardingSkip = () => setPage('dashboard')

  const startTest  = (data) => { if (!guardTrial()) return; setTestData(data); setPage('exam') }
  const showResult = async (data) => {
    setResultData(data)
    setPage('result')
    if (user) {
      try {
        const payload = {
          student_id:    user.id,
          exam:          data.exam          || 'bank_clerk_prelims',
          total_score:   Number(data.score         || 0),
          max_score:     Number(data.max_score      || 0),
          percentage:    Number(data.percentage     || 0),
          correct_count: Number(data.correct_count  || 0),
          wrong_count:   Number(data.wrong_count    || 0),
          skipped_count: Number(data.skipped_count  || 0),
          section_scores: data.section_stats || {},
          topic_scores:   {},
          weak_topics:    data.weak_topics   || [],
          strong_topics:  data.strong_topics || [],
          ai_feedback:    data.ai_feedback   || '',
          exam_readiness: Number(data.exam_readiness || 0),
          test_id_str:    data.test_id       || '',
          result_json:    data,               // full result for re-opening later
        }
        let { error } = await supabase.from('results').insert(payload)
        if (error && /result_json/.test(error.message || '')) {
          // DB doesn't have result_json yet — save the summary so history isn't lost
          const { result_json, ...summary } = payload
          ;({ error } = await supabase.from('results').insert(summary))
          if (!error) console.warn('Saved result WITHOUT result_json — run the migration to enable question review.')
        }
        if (error) console.error('Save result error:', error.message)
        else if (import.meta.env.DEV) console.log('✓ Result saved:', data.exam)
      } catch(e) {
        console.error('Save result exception:', e.message)
      }
    }
  }

  // Re-open a previously saved attempt (review mode) from history
  const openSavedResult = (row) => {
    const full = row?.result_json
    if (full && typeof full === 'object') {
      setResultData(full)
    } else {
      // Old attempts saved before result_json existed — show summary only
      setResultData({
        exam: row.exam, score: row.total_score, max_score: row.max_score,
        percentage: row.percentage, correct_count: row.correct_count,
        wrong_count: row.wrong_count, skipped_count: row.skipped_count,
        weak_topics: row.weak_topics || [], strong_topics: row.strong_topics || [],
        ai_feedback: row.ai_feedback || '', exam_readiness: row.exam_readiness || 0,
        question_results: [], _noDetail: true,
      })
    }
    window.scrollTo(0, 0)
    setPage('result')
  }

  const goHome = () => { setTestData(null); setResultData(null); setPage('dashboard') }

  const userName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0] || 'Student'

  const isPublic = PUBLIC_PAGES.includes(page)

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{background:'#FF653F'}}>
            <span className="text-white font-bold text-sm">MT</span>
          </div>
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{borderColor:'#FF653F',borderTopColor:'transparent'}}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* Idle warning banner */}
      {idleWarning && user && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-5 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-lg">⏱</span>
            <span className="text-sm font-semibold">
              You've been inactive for a while. You'll be logged out in 60 seconds to keep your account secure.
            </span>
          </div>
          <button onClick={resetIdleTimer}
            className="flex-shrink-0 bg-white text-amber-600 text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-amber-50 transition-colors ml-4">
            Stay Logged In
          </button>
        </div>
      )}

      {isPublic && page !== 'auth' && (
        <Navbar currentPage={page} onNav={nav} user={user} onLogout={handleLogout} />
      )}

      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 rounded-full animate-spin"
              style={{ borderColor:'#fed7c2', borderTopColor:'#FF653F' }}/>
          </div>
        }>
        {LANDING_TABS.includes(page) && <LandingPage key={page} onNav={nav} initialTab={page} />}
        {page === 'courses'        && <CoursesPage        onNav={nav} />}
        {page === 'contact'        && <ContactPage />}
        {page === 'privacy'        && <PrivacyPage />}
        {page === 'terms'          && <TermsPage />}
        {page === 'cutoffs'        && <CutoffsPage onNav={nav} />}
        {page === 'papers'         && <PreviousPapersPage onNav={nav} />}
        {page === 'exams'          && <ExamsPage onNav={nav} />}
        {page === 'auth'           && <AuthScreen onAuth={handleAuth} onBack={() => setPage('home')} />}
        {page === 'reset-password' && <ResetPasswordPage onBack={() => setPage('auth')} />}
        {page === 'payment'        && (
          <PaymentComingSoon
            plan={paymentPlan || 'intermediate'}
            onBack={() => setPage('dashboard')}
          />
        )}
        {page === 'dashboard'      && (
          <Dashboard
            user={user}
            planData={planData}
            initialTab={dashTab}
            onStartTest={(mode, examId) => {
              if (!guardTrial()) return
              setStartMode(mode || 'mock')
              setStartExamId(examId || '')
              setPage('examhome')
            }}
            onLogout={handleLogout}
            onNav={nav}
            onOpenResult={openSavedResult}
          />
        )}
		{page === 'practice'       && (
          <PracticePage
            user={user}
            onStartTest={(mode, examId) => {
              if (!guardTrial()) return
              setStartMode(mode || 'mock')
              setStartExamId(examId || '')
              setPage('examhome')
            }}
            onLogout={handleLogout}
            onNav={nav}
          />
        )}
        {page === 'examhome'       && (
          <HomeScreen
            studentName={userName}
            user={user}
            onStart={startTest}
            onBack={() => setPage('dashboard')}
            onNav={nav}
            onLogout={handleLogout}
            startMode={startMode}
            startExamId={startExamId}
          />
        )}
        {page === 'exam'           && (
          <ExamScreen
            testData={testData}
            studentName={userName}
            onResult={showResult}
            onExit={goHome}
          />
        )}
        {page === 'result'         && (
          <ResultScreen
            result={resultData}
            studentName={userName}
            onRetry={() => setPage('examhome')}
            onHome={() => setPage('dashboard')}
            onStartTest={startTest}
            user={user}
          />
        )}
        {page === 'admin'          && <AdminPage onBack={() => setPage('dashboard')} />}
		{page === 'how-prediction-works' && <PredictionExplainer />}
        {![
          ...LANDING_TABS,
          'courses','contact','privacy','terms','cutoffs','papers','exams',
          'auth','reset-password','payment','dashboard','examhome','exam',
          'result','admin','how-prediction-works',
        ].includes(page) && <NotFoundPage onNav={nav} />}
        </Suspense>
      </main>

      {isPublic && page !== 'auth' && <Footer onNav={nav} />}
      <CookieConsent />
      <ToastHost />
    </div>
  )
}
