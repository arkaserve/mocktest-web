import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'

export default function ResetPasswordPage({ onBack }) {
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState(false)
  const [hasToken,setHasToken]=useState(false)
  const S={
    wrap:{minHeight:'100vh',background:'#F8F8F8',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif"},
    card:{background:'#fff',borderRadius:16,padding:36,maxWidth:400,width:'100%',border:'1.5px solid #EBEBEB'},
    inp:{width:'100%',border:'1.5px solid #EBEBEB',borderRadius:9,padding:'11px 14px',fontSize:14,outline:'none',transition:'border-color .12s'},
    label:{display:'block',fontSize:12,fontWeight:600,color:'#444',marginBottom:6},
    btn:{width:'100%',padding:'13px 0',background:'#FF653F',color:'#fff',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:'pointer'},
    btnGhost:{width:'100%',marginTop:10,padding:'10px 0',background:'transparent',color:'#999',border:'none',fontSize:13,cursor:'pointer'},
  }

  useEffect(()=>{
    const hash=window.location.hash
    if(hash.includes('access_token')||hash.includes('type=recovery')){
      setHasToken(true)
      supabase.auth.getSession().then(({data})=>{if(!data.session)setHasToken(false)})
    }
  },[])

  const handleReset=async()=>{
    if(!password||!confirm){setError('Please fill both fields');return}
    if(password!==confirm){setError('Passwords do not match');return}
    if(password.length<6){setError('Password must be at least 6 characters');return}
    setError('');setLoading(true)
    const{error:err}=await supabase.auth.updateUser({password})
    if(err){setError(err.message);setLoading(false);return}
    setSuccess(true);setLoading(false)
    setTimeout(async()=>{await supabase.auth.signOut();onBack()},3000)
  }

  if(success) return (
    <div style={S.wrap}>
      <div style={{...S.card,textAlign:'center'}}>
        <div style={{width:52,height:52,background:'#ECFDF5',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11l5 5 9-9" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </div>
        <h2 style={{fontSize:20,fontWeight:700,color:'#111',marginBottom:8}}>Password updated!</h2>
        <p style={{fontSize:14,color:'#666'}}>Redirecting you to login...</p>
      </div>
    </div>
  )

  if(!hasToken) return (
    <div style={S.wrap}>
      <div style={{...S.card,textAlign:'center'}}>
        <div style={{width:52,height:52,background:'#FFF3EE',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 8l9-5 9 5v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#FF653F" strokeWidth="1.5"/><path d="M9 22V12h4v10" stroke="#FF653F" strokeWidth="1.5"/></svg>
        </div>
        <h2 style={{fontSize:20,fontWeight:700,color:'#111',marginBottom:8}}>Check your email</h2>
        <p style={{fontSize:14,color:'#666',marginBottom:20}}>We sent a password reset link to your email. Click the link in the email to reset your password.</p>
        <button onClick={onBack} style={{...S.btn,background:'#111'}}>Back to Login</button>
      </div>
    </div>
  )

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={{width:40,height:40,background:'#FF653F',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:900,marginBottom:20}}>MT</div>
        <h2 style={{fontSize:22,fontWeight:800,color:'#111',marginBottom:6}}>Set new password</h2>
        <p style={{fontSize:14,color:'#666',marginBottom:24}}>Choose a strong password for your account.</p>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <label style={S.label}>New password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 characters" style={S.inp} onFocus={e=>e.target.style.borderColor='#FF653F'} onBlur={e=>e.target.style.borderColor='#EBEBEB'}/>
          </div>
          <div>
            <label style={S.label}>Confirm password</label>
            <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleReset()} placeholder="Repeat your password" style={S.inp} onFocus={e=>e.target.style.borderColor='#FF653F'} onBlur={e=>e.target.style.borderColor='#EBEBEB'}/>
          </div>
          {error&&<div style={{padding:'10px 14px',background:'#FFF3EE',border:'1px solid #fec9b0',borderRadius:8,fontSize:13,color:'#c0392b'}}>{error}</div>}
          <button onClick={handleReset} disabled={loading} style={{...S.btn,opacity:loading?.7:1}}>
            {loading?'Updating...':'Update Password →'}
          </button>
          <button onClick={onBack} style={S.btnGhost}>Back to login</button>
        </div>
      </div>
    </div>
  )
}
