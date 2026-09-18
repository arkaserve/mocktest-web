export default function NotFoundPage({ onNav }) {
  const nav = onNav || (() => {})

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:'#fff', color:'#111', minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 24px' }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>

        {/* Big 404 */}
        <div style={{ fontSize:120, fontWeight:900, lineHeight:1, letterSpacing:'-6px', color:'#F3F4F6', userSelect:'none' }}>
          404
        </div>

        {/* Icon */}
        <div style={{ width:64, height:64, background:'#FFF3EE', border:'2px solid #fec9b0', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'-24px auto 24px', position:'relative', zIndex:1 }}>
          <span style={{ fontSize:28 }}>🔍</span>
        </div>

        <h1 style={{ fontSize:24, fontWeight:800, color:'#111', marginBottom:10, letterSpacing:'-0.5px' }}>
          Page not found
        </h1>
        <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.7, marginBottom:32 }}>
          The page you're looking for doesn't exist or has been moved.<br />
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button
            onClick={() => nav('home')}
            style={{ background:'#FF653F', color:'#fff', border:'none', borderRadius:10, padding:'11px 24px', fontSize:14, fontWeight:700, cursor:'pointer', transition:'background .15s' }}
            onMouseOver={e => e.currentTarget.style.background='#e5532e'}
            onMouseOut={e => e.currentTarget.style.background='#FF653F'}
          >
            Go Home
          </button>
          <button
            onClick={() => nav('exams')}
            style={{ background:'#F3F4F6', color:'#111', border:'none', borderRadius:10, padding:'11px 24px', fontSize:14, fontWeight:700, cursor:'pointer', transition:'background .15s' }}
            onMouseOver={e => e.currentTarget.style.background='#E5E7EB'}
            onMouseOut={e => e.currentTarget.style.background='#F3F4F6'}
          >
            Browse Exams
          </button>
        </div>

        {/* Quick links */}
        <div style={{ marginTop:40, paddingTop:24, borderTop:'1px solid #F3F4F6' }}>
          <p style={{ fontSize:12, color:'#9ca3af', marginBottom:14 }}>Quick links</p>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { label:'Mock Tests', page:'exams' },
              { label:'About',      page:'about' },
              { label:'Contact',    page:'contact' },
              { label:'Privacy',    page:'privacy' },
              { label:'Terms',      page:'terms' },
            ].map(({ label, page }) => (
              <button key={page} onClick={() => nav(page)}
                style={{ background:'none', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 14px', fontSize:12, color:'#6b7280', cursor:'pointer', transition:'border-color .15s, color .15s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor='#FF653F'; e.currentTarget.style.color='#FF653F' }}
                onMouseOut={e => { e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.color='#6b7280' }}
              >{label}</button>
            ))}
          </div>
        </div>

        <p style={{ marginTop:28, fontSize:11, color:'#d1d5db' }}>by Arkaserve · mocktest.arkaserve.com</p>
      </div>
    </div>
  )
}
