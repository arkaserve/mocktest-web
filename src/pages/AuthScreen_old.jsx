import { useState } from 'react'
import { supabase } from '../supabase.js'
import { MockTestLogoNode } from './Logo.jsx'
export default function AuthScreen({ onAuth, onBack }) {
  const [tab, setTab] = useState('login')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [regData, setRegData] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '', phone: '', exam: 'bank_clerk_prelims' })
  const [loginErr, setLoginErr] = useState('')
  const [regErr, setRegErr] = useState('')
  const [loginLoad, setLoginLoad] = useState(false)
  const [regLoad, setRegLoad] = useState(false)

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) { setLoginErr('Please fill all fields.'); return }
    setLoginErr(''); setLoginLoad(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email, password: loginData.password
    })
    if (error) { setLoginErr(error.message); setLoginLoad(false); return }
    onAuth(data.user)
  }

  const handleRegister = async () => {
    if (!regData.firstName || !regData.email || !regData.password) { setRegErr('Please fill all required fields.'); return }
    if (regData.password !== regData.confirm) { setRegErr('Passwords do not match.'); return }
    if (regData.password.length < 6) { setRegErr('Password must be at least 6 characters.'); return }
    setRegErr(''); setRegLoad(true)

    const { data, error } = await supabase.auth.signUp({
      email: regData.email,
      password: regData.password,
      options: {
        data: {
          full_name: `${regData.firstName} ${regData.lastName}`.trim(),
          target_exam: regData.exam,
          phone: regData.phone || '',
        }
      }
    })

    if (error) { setRegErr(error.message); setRegLoad(false); return }

    const authedUser = data.session?.user || data.user
    if (authedUser) {
      onAuth(authedUser)
    } else {
      setRegErr('Account created — please check your email to confirm, then log in.')
      setRegLoad(false)
    }
  }

  // Styles tailored to match the screenshots
  const inputClass = "w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 focus:outline-none"
  const redBtnClass = "w-full bg-[#e61919] hover:bg-red-700 text-white font-bold py-2.5 text-sm transition-colors"
  
  // Dynamic background for the right panel based on screenshot references
  const rightPanelBg = tab === 'login' ? 'bg-[#7babe9]' : 'bg-[#003366]'
  const textColor = tab === 'login' ? 'text-white' : 'text-white'

 return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">

      {/* ── LEFT PANEL ── */}
      <div 
        className="hidden md:flex md:w-1/2 relative flex-col items-center justify-center p-10 text-center"
        style={{ 
          backgroundColor: '#0a192f',
          backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.85), rgba(10, 25, 47, 0.85)), url('/your-office-image.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 flex flex-col items-center">
          
          {/* 2. REPLACE THE RED BOX WITH YOUR NEW LOGO */}
          <div className="mb-6">
            <MockTestLogoNode size={100} />
          </div>

          <h1 className="text-2xl font-bold text-white leading-snug">
            A Premier Institute for<br />
            Bank Coaching and Entrance Exams
          </h1>
        </div>
      </div>
      {/* ── RIGHT PANEL (Dynamic Background) ── */}
      <div className={`flex-1 flex flex-col justify-center items-center px-8 py-10 transition-colors duration-300 ${rightPanelBg}`}>
        
        <div className="w-full max-w-sm">
          
          {/* Form Header */}
          <div className={`text-center mb-6 ${textColor}`}>
            <h2 className="text-lg font-normal mb-4">
              {tab === 'login' ? 'Online Student Login' : 'Student Registration'}
            </h2>
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <div className="space-y-4">
              <div>
                <input 
                  type="email" 
                  placeholder="Email or Mobile Number" 
                  value={loginData.email}
                  onChange={e => setLoginData(d=>({...d,email:e.target.value}))} 
                  className={inputClass}
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={loginData.password}
                  onChange={e => setLoginData(d=>({...d,password:e.target.value}))}
                  onKeyDown={e => e.key==='Enter' && handleLogin()} 
                  className={inputClass}
                />
              </div>

              {loginErr && <div className="text-red-200 text-xs text-center">{loginErr}</div>}

              <div className="flex items-center justify-between text-xs text-white px-1">
                <span>Not having an account yet?</span>
                <button onClick={() => setTab('register')} className="hover:underline">Register Here</button>
              </div>

              <button onClick={handleLogin} disabled={loginLoad} className={redBtnClass}>
                {loginLoad ? 'Logging in...' : 'Login'}
              </button>

              <div className="flex items-center justify-between text-xs text-white px-1 pt-2">
                <button className="hover:underline">Forgot Password</button>
                <button onClick={onBack} className="hover:underline">Home Page</button>
              </div>
            </div>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="First Name" 
                value={regData.firstName}
                onChange={e => setRegData(d=>({...d,firstName:e.target.value}))} 
                className={inputClass}
              />
              <input 
                type="text" 
                placeholder="Last Name" 
                value={regData.lastName}
                onChange={e => setRegData(d=>({...d,lastName:e.target.value}))} 
                className={inputClass}
              />
              <input 
                type="email" 
                placeholder="Email ID" 
                value={regData.email}
                onChange={e => setRegData(d=>({...d,email:e.target.value}))} 
                className={inputClass}
              />
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                value={regData.phone}
                onChange={e => setRegData(d=>({...d,phone:e.target.value.replace(/[^0-9]/g,'')}))}
                className={inputClass}
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={regData.password}
                onChange={e => setRegData(d=>({...d,password:e.target.value}))} 
                className={inputClass}
              />
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={regData.confirm}
                onChange={e => setRegData(d=>({...d,confirm:e.target.value}))} 
                className={inputClass}
              />

              {/* Mimicking the screenshot's checkbox text */}
              <div className="flex items-start gap-2 text-white text-xs mt-4">
                <input type="checkbox" className="mt-1" />
                <label className="leading-tight">
                  I read the <span className="text-blue-400 cursor-pointer">Terms and Conditions</span> and accept the <span className="text-blue-400 cursor-pointer">Privacy Policy</span>.
                </label>
              </div>

              {regErr && <div className="text-red-300 text-xs text-center">{regErr}</div>}

              <button onClick={handleRegister} disabled={regLoad} className={`${redBtnClass} mt-2`}>
                {regLoad ? 'Registering...' : 'Register Now'}
              </button>

              <div className="text-center text-xs text-white pt-3">
                <button onClick={() => setTab('login')} className="hover:underline">Already have an account? Login</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}