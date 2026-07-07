import { useState } from 'react'
import { supabase } from '../supabase.js'

const COMING_EXAMS = {
  ssc:        { label:'SSC',         icon:'📋', exams:['SSC CGL','SSC CHSL','SSC MTS','SSC Stenographer','SSC CPO'] },
  railway:    { label:'Railway',     icon:'🚂', exams:['RRB NTPC','RRB Group D','RRB ALP','RRB JE','RRB MI'] },
  engineering:{ label:'Engineering', icon:'⚙', exams:['JEE Main','JEE Advanced','GATE CS','GATE ECE','GATE ME'] },
  medical:    { label:'Medical',     icon:'🏥', exams:['NEET UG','NEET PG','AIIMS','JIPMER','FMGE'] },
  state_psc:  { label:'State PSC',   icon:'🏛', exams:['UPSC Prelims','MPSC','TNPSC','UPPSC','KPSC'] },
  teaching:   { label:'Teaching',    icon:'📚', exams:['CTET Paper I','CTET Paper II','KVS PRT','DSSSB TGT','TET'] },
  defence:    { label:'Defence',     icon:'🎖', exams:['NDA','CDS','AFCAT','Agniveer Army','Agniveer Navy'] },
}

export default function ComingSoonPage({ user, category, onNav }) {
  const [email,   setEmail]   = useState(user?.email || '')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const cat = COMING_EXAMS[category] || { label: category, icon:'📘', exams:[] }
  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Student'

  const notify = async () => {
    if (!email) return
    setLoading(true)
    // Save interest — store in user metadata
    await supabase.auth.updateUser({ data: { notify_category: category, notify_email: email } })
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#ffffff',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      {/* Nav */}
      <nav style={{background:'linear-gradient(135deg,#1e3a8a,#3B5BDB,#7048E8)',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>onNav('home')}>
          <div style={{width:34,height:34,background:'rgba(255,255,255,.18)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:800,border:'1.5px solid rgba(255,255,255,.3)'}}>MT</div>
          <span style={{fontSize:16,fontWeight:800,color:'#fff'}}>MockTest</span>
        </div>
        <button onClick={()=>onNav('dashboard')} style={{fontSize:12,fontWeight:600,color:'#fff',background:'rgba(255,255,255,.12)',border:'1.5px solid rgba(255,255,255,.3)',borderRadius:8,padding:'7px 16px',cursor:'pointer'}}>
          Go to Dashboard
        </button>
      </nav>

      <div style={{maxWidth:700,margin:'0 auto',padding:'52px 24px',textAlign:'center'}}>
        {/* Coming soon card */}
        <div style={{fontSize:56,marginBottom:16}}>{cat.icon}</div>
        <div style={{display:'inline-block',background:'#FFF4E6',color:'#D4721B',border:'1px solid #FDDCB0',borderRadius:20,padding:'4px 14px',fontSize:12,fontWeight:700,marginBottom:16}}>Coming Soon</div>
        <h1 style={{fontSize:30,fontWeight:800,color:'#0f172a',marginBottom:10,letterSpacing:'-0.3px'}}>
          {cat.label} Exams are almost here!
        </h1>
        <p style={{fontSize:14,color:'#475569',lineHeight:1.7,marginBottom:28,maxWidth:480,margin:'0 auto 28px'}}>
          We're building smart engines for {cat.label} exams. Every question will be expert-crafted, unique and at exam level — just like our Banking platform.
        </p>

        {/* Exams list */}
        <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:36}}>
          {cat.exams.map(e=>(
            <span key={e} style={{fontSize:12,fontWeight:600,background:'#fff',border:'1.5px solid #e2e8f0',borderRadius:20,padding:'5px 14px',color:'#374151'}}>{e}</span>
          ))}
        </div>

        {/* Notify form */}
        {!sent ? (
          <div style={{background:'#fff',border:'1.5px solid #e2e8f0',borderRadius:16,padding:24,maxWidth:440,margin:'0 auto 32px'}}>
            <div style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:6}}>🔔 Get notified when {cat.label} launches</div>
            <p style={{fontSize:12,color:'#64748b',marginBottom:14}}>We'll email you the moment {cat.label} exams go live.</p>
            <div style={{display:'flex',gap:8}}>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address"
                style={{flex:1,padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:9,fontSize:13,outline:'none'}}/>
              <button onClick={notify} disabled={loading}
                style={{padding:'10px 18px',background:'linear-gradient(135deg,#3B5BDB,#7048E8)',color:'#fff',border:'none',borderRadius:9,fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
                {loading ? '...' : 'Notify Me'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{background:'#DCFCE7',border:'1.5px solid #86EFAC',borderRadius:14,padding:20,maxWidth:440,margin:'0 auto 32px'}}>
            <div style={{fontSize:20,marginBottom:6}}>✅</div>
            <div style={{fontSize:14,fontWeight:700,color:'#15803D',marginBottom:4}}>You're on the list!</div>
            <div style={{fontSize:12,color:'#166534'}}>We'll email you at {email} when {cat.label} exams launch.</div>
          </div>
        )}

        {/* Banking CTA */}
        <div style={{background:'linear-gradient(135deg,#EEF0FF,#F3F0FF)',border:'1.5px solid #C5CAF0',borderRadius:16,padding:24,maxWidth:480,margin:'0 auto'}}>
          <div style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:6}}>🏦 Try Banking — it's fully live!</div>
          <p style={{fontSize:12,color:'#475569',lineHeight:1.6,marginBottom:14}}>
            While we build {cat.label} exams, our Banking platform is 100% live — IBPS PO, Clerk, SBI PO, Clerk, RRB exams with expert-crafted questions. Completely free.
          </p>
          <button onClick={()=>onNav('dashboard')}
            style={{width:'100%',padding:'11px 0',background:'linear-gradient(135deg,#3B5BDB,#7048E8)',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer'}}>
            Explore Banking Mock Tests →
          </button>
        </div>
      </div>
    </div>
  )
}
