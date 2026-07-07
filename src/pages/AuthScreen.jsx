import { useState } from 'react'
import { supabase } from '../supabase.js'

/* ── Category data ── */
const CATEGORIES = [
  { value: 'UR',   label: 'General / UR',  desc: 'No reservation benefit' },
  { value: 'OBC',  label: 'OBC',           desc: 'Other Backward Classes' },
  { value: 'EWS',  label: 'EWS',           desc: 'Economically Weaker Section' },
  { value: 'SC',   label: 'SC',            desc: 'Scheduled Caste' },
  { value: 'ST',   label: 'ST',            desc: 'Scheduled Tribe' },
  { value: 'PwBD', label: 'PwBD',          desc: 'Persons with Benchmark Disability' },
]

const EXAMS = [
  { value: 'bank_clerk_prelims', label: 'IBPS Clerk Prelims' },
  { value: 'bank_clerk_mains',   label: 'IBPS Clerk Mains' },
  { value: 'bank_po_prelims',    label: 'IBPS PO Prelims' },
  { value: 'bank_po_mains',      label: 'IBPS PO Mains' },
  { value: 'sbi_clerk_prelims',  label: 'SBI Clerk Prelims' },
  { value: 'sbi_clerk_mains',    label: 'SBI Clerk Mains' },
  { value: 'sbi_po_prelims',     label: 'SBI PO Prelims' },
  { value: 'sbi_po_mains',       label: 'SBI PO Mains' },
  { value: 'rrb_office_assistant_prelims', label: 'RRB Office Assistant Prelims' },
  { value: 'rrb_officer_scale1_prelims',   label: 'RRB Officer Scale-I Prelims' },
  { value: 'rbi_assistant_pre',   label: 'RBI Assistant Prelims' },
  { value: 'rbi_assistant_mains', label: 'RBI Assistant Mains' },
  { value: 'rbi_gradeb_p1',       label: 'RBI Grade B (Phase 1)' },
  { value: 'nabard_gradeA_pre',   label: 'NABARD Grade A Prelims' },
  { value: 'nabard_da_pre',       label: 'NABARD Development Assistant' },
  { value: 'lic_aao_pre',         label: 'LIC AAO Prelims' },
  { value: 'lic_assistant_pre',   label: 'LIC Assistant Prelims' },
  { value: 'lic_ado_pre',         label: 'LIC ADO Prelims' },
  { value: 'niacl_assistant_pre', label: 'NIACL Assistant Prelims' },
  { value: 'nicl_ao_pre',         label: 'NICL AO Prelims' },
  { value: 'ippb_officer',        label: 'IPPB Officer Scale I' },
  { value: 'coal_india_mt',      label: 'Coal India MT' },
]

const SvgBrain  = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3C7 3 5 5 5 8c0 1.5.5 2.5 1 3.5C7 13 7 14 7 15h6c0-1 0-2 1-3.5.5-1 1-2 1-3.5 0-3-2-5-5-5z"/><path d="M7 15h6M8 17h4"/></svg>
const SvgChart  = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="10" width="4" height="8"/><rect x="8" y="6" width="4" height="12"/><rect x="14" y="2" width="4" height="16"/></svg>
const SvgTarget = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r="1" fill="currentColor"/></svg>
const SvgTimer  = () => <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="11" r="7"/><path d="M10 7v4l2.5 2.5"/><path d="M7.5 2h5M10 2v2"/></svg>

export default function AuthScreen({ onAuth, onBack }) {
  const [tab,        setTab]       = useState('login')
  const [loginData,  setLoginData] = useState({ email: '', password: '' })
  const [regData,    setRegData]   = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirm: '', phone: '',
    dob: '', gender: '', referral: '',
    category: '',
    state: '',
  })
  const [loginErr,   setLoginErr]  = useState('')
  const [regErr,     setRegErr]    = useState('')
  const [loginLoad,  setLoginLoad] = useState(false)
  const [regLoad,    setRegLoad]   = useState(false)
  const [forgotSent, setForgotSent]= useState(false)
  const [forgotLoad, setForgotLoad]= useState(false)

  /* ── Login ── */
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) { setLoginErr('Please fill all fields.'); return }
    setLoginErr(''); setLoginLoad(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email, password: loginData.password
    })
    if (error) { setLoginErr(error.message); setLoginLoad(false); return }
    onAuth(data.user)
  }

  /* ── Register ── */
  const handleRegister = async () => {
    if (!regData.firstName || !regData.email || !regData.password)
      { setRegErr('Please fill all required fields.'); return }
    if (!/^\S+@\S+\.\S+$/.test(regData.email))
      { setRegErr('Please enter a valid email address.'); return }
    if (!/^[6-9]\d{9}$/.test(regData.phone || ''))
      { setRegErr('Please enter a valid 10-digit mobile number.'); return }
    if (!regData.dob)
      { setRegErr('Please enter your date of birth.'); return }
    if (!regData.gender)
      { setRegErr('Please select your gender.'); return }
    if (!regData.category)
      { setRegErr('Please select your reservation category.'); return }
    if (regData.password !== regData.confirm)
      { setRegErr('Passwords do not match.'); return }
    if (regData.password.length < 6)
      { setRegErr('Password must be at least 6 characters.'); return }
    setRegErr(''); setRegLoad(true)

    const { data, error } = await supabase.auth.signUp({
      email: regData.email,
      password: regData.password,
      options: {
        data: {
          full_name:       `${regData.firstName} ${regData.lastName}`.trim(),
          phone:           regData.phone || '',
          dob:             regData.dob || '',
          gender:          regData.gender || '',
          referral_source: regData.referral || '',
          category:        regData.category,
          state:           regData.state || '',
          onboarding_complete: false,
        }
      }
    })

    if (error) { setRegErr(error.message); setRegLoad(false); return }

    const uid = data.session?.user?.id || data.user?.id
    if (uid) {
      try {
        await supabase.from('profiles').upsert({
          id:              uid,
          full_name:       `${regData.firstName} ${regData.lastName}`.trim(),
          category:        regData.category,
          state:           regData.state || '',
          phone:           regData.phone || '',
          dob:             regData.dob || null,
          gender:          regData.gender || null,
          referral_source: regData.referral || null,
        }, { onConflict: 'id' })
      } catch (_) { /* ignore — user_metadata + DB trigger are the fallback */ }
    }

    const authedUser = data.session?.user || data.user
    if (authedUser) {
      onAuth(authedUser)
    } else {
      setRegErr('Account created — please check your email to confirm, then log in.')
      setRegLoad(false)
    }
  }

  /* ── Forgot password ── */
  const handleForgotPassword = async () => {
    if (!loginData.email.trim()) {
      setLoginErr('Enter your email address first, then click Forgot Password.')
      return
    }
    setForgotLoad(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.email.trim() })
      })
      setForgotSent(true); setLoginErr('')
    } catch { setLoginErr('Could not send reset email. Please try again.') }
    setForgotLoad(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  /* ── Styles ── */
  const inp = "w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
  const sel = inp + " cursor-pointer"
  const lbl = "block text-[13px] font-semibold text-gray-900 mb-1"

  const stats = [
    { value:'99+',  label:'Exam Questions'   },
    { value:'3',    label:'Exam Sections'  },
    { value:'100%', label:'Free to Start'  },
    { value:'24/7', label:'Available'      },
  ]
  const features = [
    { Svg: SvgBrain,  text: 'expert-crafted questions — unique every test'    },
    { Svg: SvgChart,  text: 'Personalised weakness analysis'               },
    { Svg: SvgTarget, text: 'Category-aware cut-off tracking (SC/ST/OBC)'  },
    { Svg: SvgTimer,  text: 'Real exam simulation with timed sections'      },
  ]

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#ffffff', height:'100vh' }}
      className="flex flex-col md:flex-row overflow-hidden">

      {/* ── LEFT PANEL — warm cream with orange accents ── */}
      <div className="hidden md:flex md:w-[46%] flex-col justify-center p-10 relative overflow-y-auto h-full"
        style={{ background:'#ffffff', borderRight:'1px solid #e8eaed' }}>

        {/* Back to home + brand */}
        <button onClick={onBack}
          className="absolute top-6 left-10 z-20 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background:'#FF653F' }}>
            <span style={{ color:'#fff', fontWeight:900, fontSize:11 }}>MT</span>
          </span>
          ← Back to home
        </button>

        {/* decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_,i) => (
            <div key={i} className="absolute rounded-full"
              style={{ width:`${180+i*100}px`, height:`${180+i*100}px`,
                top:`${-20+i*18}%`, left:`${-20+i*6}%`,
                border:'1px solid rgba(0,0,0,.04)' }} />
          ))}
        </div>

        <div className="relative z-10">
          <h1 style={{ fontSize:34, fontWeight:800, color:'#111', lineHeight:1.18, marginBottom:16 }}>
            Crack your exam<br />with expert-crafted<br />practice tests
          </h1>
          <p style={{ color:'#666', fontSize:14, lineHeight:1.8, marginBottom:32, maxWidth:430 }}>
            India's first fully expert-crafted mock test platform. Category-aware cut-off
            tracking for UR, OBC, SC, ST, EWS and PwBD candidates.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {stats.map(s => (
              <div key={s.label} style={{ background:'#fff', border:'1px solid #e8eaed', borderRadius:12, padding:'14px 16px', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#FF653F' }}>{s.value}</div>
                <div style={{ fontSize:11, color:'#999', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {features.map(({ Svg, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div style={{ width:28, height:28, background:'#fff', border:'1px solid #e8eaed', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#FF653F' }}>
                  <Svg />
                </div>
                <span style={{ color:'#444', fontSize:13 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 mt-10" style={{ background:'#fff', border:'1px solid #e8eaed', borderRadius:12, padding:16, boxShadow:'0 2px 12px rgba(0,0,0,.05)' }}>
          <p style={{ color:'#555', fontSize:13, fontStyle:'italic', lineHeight:1.7 }}>
            "The only platform where the system tells you exactly what to study next — not just your score."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div style={{ width:28, height:28, background:'#FF653F', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#fff', fontSize:10, fontWeight:800 }}>AK</span>
            </div>
            <span style={{ color:'#888', fontSize:11 }}>Anil Kumar Mikkili, Founder</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col min-h-0 h-full" style={{ background:'#ffffff' }}>

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ background:'#111' }}>
          <div className="flex items-center gap-2">
            <div style={{ width:32, height:32, background:'#FF653F', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#fff', fontWeight:900, fontSize:11 }}>MT</span>
            </div>
            <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>MockTest</span>
          </div>
          <button onClick={onBack} style={{ color:'#999', fontSize:13 }} className="hover:text-white transition-colors">Back</button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center overflow-y-auto px-5 sm:px-8 py-8 w-full">

          <div className="w-full max-w-[440px] my-auto">
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200"
            style={{ boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {tab === 'login' ? 'Login to MockTest' : 'Create your account'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {tab === 'login'
                ? 'Resume your tests, reports, and personalised study plan.'
                : 'Set your exam and category once so predictions stay personalised.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg p-1 mb-4 bg-gray-100">
            {[['login','Login'],['register','Register']].map(([id,label]) => (
              <button key={id} onClick={() => { setTab(id); setLoginErr(''); setRegErr('') }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  tab===id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-gray-700 transition-colors mb-4 bg-white hover:bg-gray-50">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-xs text-gray-400 font-medium">or with email</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <div className="space-y-4">
              <div>
                <label className={lbl}>Email address</label>
                <input type="email" placeholder="you@example.com" value={loginData.email}
                  onChange={e => setLoginData(d=>({...d,email:e.target.value}))} className={inp}/>
              </div>
              <div>
                <label className={lbl}>Password</label>
                <input type="password" placeholder="Enter your password" value={loginData.password}
                  onChange={e => setLoginData(d=>({...d,password:e.target.value}))}
                  onKeyDown={e => e.key==='Enter' && handleLogin()} className={inp}/>
              </div>
              {loginErr && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <span className="text-red-600 text-xs">{loginErr}</span>
                </div>
              )}
              {forgotSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700 text-xs">
                  Reset email sent — check your inbox.
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <button onClick={handleForgotPassword} disabled={forgotLoad}
                  className="text-xs hover:underline disabled:opacity-50"
                  style={{ color:'#FF653F' }}>
                  {forgotLoad ? 'Sending…' : 'Forgot password?'}
                </button>
                <button onClick={handleLogin} disabled={loginLoad}
                  className="w-full sm:w-auto justify-center text-white text-sm font-bold px-8 py-2.5 rounded-lg transition-all disabled:opacity-60 flex items-center gap-2"
                  style={{ background:'#FF653F' }}
                  onMouseOver={e => !loginLoad && (e.currentTarget.style.background='#e5512f')}
                  onMouseOut={e => !loginLoad && (e.currentTarget.style.background='#FF653F')}>
                  {loginLoad && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                  {loginLoad ? 'Signing in...' : 'Login'}
                </button>
              </div>
              <p className="text-center text-xs text-gray-500 pt-2">
                Don't have an account?{' '}
                <button onClick={() => setTab('register')} className="font-semibold hover:underline" style={{ color:'#FF653F' }}>Sign up free</button>
              </p>
            </div>
          )}

          {/* ── REGISTER ── */}
          {tab === 'register' && (
            <div className="space-y-3">

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>First name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Anil" value={regData.firstName}
                    onChange={e => setRegData(d=>({...d,firstName:e.target.value}))} className={inp}/>
                </div>
                <div>
                  <label className={lbl}>Last name</label>
                  <input type="text" placeholder="Kumar" value={regData.lastName}
                    onChange={e => setRegData(d=>({...d,lastName:e.target.value}))} className={inp}/>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={lbl}>Email address <span className="text-red-500">*</span></label>
                <input type="email" placeholder="you@example.com" value={regData.email}
                  onChange={e => setRegData(d=>({...d,email:e.target.value}))} className={inp}/>
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Password <span className="text-red-500">*</span></label>
                  <input type="password" placeholder="Min 6 chars" value={regData.password}
                    onChange={e => setRegData(d=>({...d,password:e.target.value}))} className={inp}/>
                </div>
                <div>
                  <label className={lbl}>Confirm <span className="text-red-500">*</span></label>
                  <input type="password" placeholder="Repeat password" value={regData.confirm}
                    onChange={e => setRegData(d=>({...d,confirm:e.target.value}))} className={inp}/>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className={lbl}>
                  Reservation Category <span className="text-red-500">*</span>
                  <span className="ml-1 text-gray-400 font-normal">(for cut-off comparison)</span>
                </label>
                <select
                  value={regData.category}
                  onChange={e => setRegData(d=>({...d,category:e.target.value}))}
                  className={sel + (regData.category ? "" : " text-gray-400")}>
                  <option value="">-- Select your category --</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label} — {cat.desc}
                    </option>
                  ))}
                </select>
                {regData.category && (
                  <p className="text-xs mt-1" style={{ color:'#FF653F' }}>
                    ✓ Tracked against {CATEGORIES.find(c=>c.value===regData.category)?.label} cut-offs.
                  </p>
                )}
              </div>

              {/* DOB + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Date of birth <span className="text-red-500">*</span></label>
                  <input type="date" max={new Date().toISOString().split('T')[0]} value={regData.dob}
                    onChange={e => setRegData(d=>({...d,dob:e.target.value}))} className={inp}/>
                </div>
                <div>
                  <label className={lbl}>Gender <span className="text-red-500">*</span></label>
                  <select value={regData.gender} onChange={e => setRegData(d=>({...d,gender:e.target.value}))}
                    className={sel + (regData.gender ? "" : " text-gray-400")}>
                    <option value="">-- Select --</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="na">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* How did you hear about us */}
              <div>
                <label className={lbl}>How did you hear about us?</label>
                <select value={regData.referral} onChange={e => setRegData(d=>({...d,referral:e.target.value}))}
                  className={sel + (regData.referral ? "" : " text-gray-400")}>
                  <option value="">-- Select (optional) --</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="telegram">Telegram</option>
                  <option value="google">Google Search</option>
                  <option value="friend">Friend / Word of mouth</option>
                  <option value="coaching">College / Coaching</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Mobile */}
              <div>
                <label className={lbl}>
                  Mobile <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-gray-50 border border-gray-300 border-r-0 rounded-l-lg text-sm text-gray-500 flex-shrink-0">+91</span>
                  <input type="tel" maxLength={10} placeholder="10-digit mobile" value={regData.phone}
                    onChange={e => setRegData(d=>({...d,phone:e.target.value.replace(/[^0-9]/g,'')}))}
                    className="flex-1 border border-gray-300 rounded-r-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"/>
                </div>
              </div>

              {/* Error */}
              {regErr && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <span className="text-red-600 text-xs">{regErr}</span>
                </div>
              )}

              <p className="text-xs text-gray-400 leading-snug">
                By registering you agree to our{' '}
                <span className="cursor-pointer hover:underline" style={{ color:'#FF653F' }}>Terms</span>
                {' '}and{' '}
                <span className="cursor-pointer hover:underline" style={{ color:'#FF653F' }}>Privacy Policy</span>.
              </p>

              <button onClick={handleRegister} disabled={regLoad}
                className="w-full text-white text-sm font-bold py-3 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background:'#FF653F' }}
                onMouseOver={e => !regLoad && (e.currentTarget.style.background='#e5512f')}
                onMouseOut={e => !regLoad && (e.currentTarget.style.background='#FF653F')}>
                {regLoad && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                {regLoad ? 'Creating account...' : 'Create free account'}
              </button>

              <p className="text-center text-xs text-gray-500">
                Already have an account?{' '}
                <button onClick={() => setTab('login')} className="font-semibold hover:underline" style={{ color:'#FF653F' }}>Login</button>
              </p>
            </div>
          )}
          </div>
          </div>
        </div>

      </div>
    </div>
  )
}
