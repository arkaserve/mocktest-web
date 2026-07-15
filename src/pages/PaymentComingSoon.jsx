/* ──────────────────────────────────────────────────────────────
   PaymentComingSoon.jsx
   Shown when student clicks "Upgrade Now" from OnboardingWizard
   or from Dashboard → Subscriptions.

   Props:
     plan     — 'intermediate' | 'advanced'
     onBack   — go back to wizard / dashboard
──────────────────────────────────────────────────────────────── */
export default function PaymentComingSoon({ plan = 'intermediate', onBack }) {
  const isAdv = plan === 'advanced'

  const details = {
    intermediate: {
      icon: '⭐',
      label: 'Intermediate Plan',
      price: '₹499',
      period: '/month',
      color: '#FF653F',
      bg: '#FFF3EE',
      border: '#fec9b0',
      features: [
        'Prepare for 2 exams simultaneously',
        'Combined day-by-day study schedule',
        'Dual-exam full mock tests',
        'Cross-exam performance analytics',
        'PDF solutions with charts',
        'Priority email support',
      ],
    },
    advanced: {
      icon: '🚀',
      label: 'Advanced Plan',
      price: '₹1,199',
      period: '/3 months',
      color: '#FF653F',
      bg: '#FFF3EE',
      border: '#fec9b0',
      features: [
        'Unlimited exam combinations',
        'Full multi-exam study planner',
        'All exam mock tests included',
        'Priority coaching & weak analysis',
        'WhatsApp daily reminders',
        'Early access to all new exams',
        'Dedicated support',
      ],
    },
  }

  const d = details[plan] || details.intermediate

  return (
    <div style={{
      minHeight:'100vh',
      background:'#ffffff',
      fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif",
      display:'flex', flexDirection:'column',
    }}>

      {/* ── HEADER NAV BAR ── */}
      <div style={{background:'#111',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,background:'#FF653F',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:800}}>MT</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:'#fff',lineHeight:1.1}}>MockTest</div>
            <div style={{fontSize:10,color:'#888'}}>by Anil Software Technologies</div>
          </div>
        </div>
        <button onClick={onBack} style={{fontSize:13,fontWeight:600,color:'#fff',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',borderRadius:10,padding:'8px 16px',cursor:'pointer'}}>
          ← Back
        </button>
      </div>

      <style>{`
        @media(max-width:480px){
          .pcs-card{padding:28px 20px!important}
          .pcs-notify-row{flex-direction:column!important}
          .pcs-notify-row input,.pcs-notify-row button{border-radius:9px!important;width:100%}
        }
      `}</style>
      {/* Card area */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 16px'}}>

      {/* Card */}
      <div className="pcs-card" style={{
        background:'#fff', borderRadius:24, padding:'40px 36px',
        maxWidth:480, width:'100%',
        boxShadow:'0 16px 48px rgba(255,101,63,.14)',
        border:`2px solid ${d.border}`,
        textAlign:'center',
      }}>

        {/* Icon */}
        <div style={{
          width:72, height:72, borderRadius:20, background:d.bg,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:32, margin:'0 auto 20px',
          border:`2px solid ${d.border}`,
        }}>{d.icon}</div>

        {/* Coming soon badge */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:6,
          background:'#FFF4E6', border:'1.5px solid #FED7AA',
          color:'#D97706', borderRadius:20, padding:'4px 14px',
          fontSize:11, fontWeight:700, marginBottom:16,
        }}>
          🔧 Payment Integration — Coming Soon
        </div>

        <h1 style={{fontSize:22, fontWeight:800, color:'#0f172a', marginBottom:6}}>
          {d.label}
        </h1>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'center', gap:4, marginBottom:8}}>
          <span style={{fontSize:32, fontWeight:800, color:d.color}}>{d.price}</span>
          <span style={{fontSize:13, color:'#94a3b8'}}>{d.period}</span>
        </div>
        <p style={{fontSize:13, color:'#64748b', lineHeight:1.65, marginBottom:24}}>
          We're integrating Razorpay / UPI payment gateway. You'll be notified as soon as it's live — it won't be long!
        </p>

        {/* Features */}
        <div style={{
          background:d.bg, border:`1.5px solid ${d.border}`,
          borderRadius:14, padding:'16px 20px', marginBottom:24, textAlign:'left',
        }}>
          <div style={{fontSize:12, fontWeight:700, color:d.color, marginBottom:10, textTransform:'uppercase', letterSpacing:'.05em'}}>
            What you'll get
          </div>
          {d.features.map(f => (
            <div key={f} style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
              <span style={{width:18, height:18, borderRadius:'50%', background:d.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                <span style={{color:'#fff', fontSize:10, fontWeight:700}}>✓</span>
              </span>
              <span style={{fontSize:12, color:'#374151'}}>{f}</span>
            </div>
          ))}
        </div>

        {/* Notify me form */}
        <div style={{
          background:'#f8faff', border:'1.5px solid #e2e8f0',
          borderRadius:12, padding:'16px 18px', marginBottom:24, textAlign:'left',
        }}>
          <div style={{fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:8}}>
            🔔 Notify me when payment is live
          </div>
          <div className="pcs-notify-row" style={{display:'flex', gap:8}}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex:1, padding:'9px 14px', border:'1.5px solid #e2e8f0',
                borderRadius:9, fontSize:12, color:'#0f172a', outline:'none',
              }}
            />
            <button style={{
              padding:'9px 16px', background:'#FF653F',
              color:'#fff', border:'none', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
            }}>
              Notify Me
            </button>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            width:'100%', padding:'12px 0',
            background:'#fff', color:'#64748b',
            border:'1.5px solid #e2e8f0', borderRadius:12,
            fontSize:13, fontWeight:600, cursor:'pointer',
          }}
        >
          ← Go Back
        </button>

        <p style={{fontSize:11, color:'#94a3b8', marginTop:14}}>
          Your free plan is still active. You can upgrade anytime from the dashboard.
        </p>
      </div>
      </div>
    </div>
  )
}
