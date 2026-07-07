const IconLinkedIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)
const IconTwitter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
  </svg>
)
const IconYouTube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#111"/>
  </svg>
)

const EXAM_COLS = [
  { head:'Banking',     items:[{ label:'Bank Clerk Prelims', live:true },{ label:'Bank PO', live:false },{ label:'RRB Clerk', live:false },{ label:'RRB PO', live:false },{ label:'Blog', live:false }] },
  { head:'Government',  items:[{ label:'UPSC Prelims', live:false },{ label:'SSC CGL', live:false },{ label:'SSC CHSL', live:false },{ label:'State PSC', live:false },{ label:'Blog', live:false }] },
  { head:'Engineering', items:[{ label:'GATE CS', live:false },{ label:'GATE ECE', live:false },{ label:'JEE Mains', live:false },{ label:'JEE Advanced', live:false },{ label:'Blog', live:false }] },
  { head:'Management',  items:[{ label:'CAT', live:false },{ label:'GMAT', live:false },{ label:'MAT', live:false },{ label:'XAT', live:false },{ label:'Blog', live:false }] },
  { head:'Languages',   items:[{ label:'IELTS', live:false },{ label:'TOEFL', live:false },{ label:'PTE', live:false },{ label:'Blog', live:false }] },
  { head:'Medical',     items:[{ label:'NEET UG', live:false },{ label:'NEET PG', live:false },{ label:'AIIMS', live:false },{ label:'Blog', live:false }] },
]

const QUICK_LINKS = {
  Exams:    [['IBPS Clerk','mocktest'],['IBPS PO','mocktest'],['SBI Clerk','mocktest'],['SBI PO','mocktest'],['RRB Assistant','mocktest'],['Coal India MT','mocktest']],
  Practice: [['Full Mock Test','mock'],['Topic Practice','mock'],['Section Test','mock'],['Adaptive Mode','mock']],
  Company:  [['About Us','about'],['Contact','contact'],['Courses','courses'],['Privacy Policy','privacy'],['Terms of Use','terms']],
}

export default function Footer({ onNav }) {
  const nav = (id) => id && onNav(id)

  return (
    <footer style={{ background:'#111', color:'#d1d5db', fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>

      {/* ── Brand + Quick Links ── */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,.07)', padding:'52px 24px 40px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:40 }}>

          {/* Brand */}
          <div style={{ gridColumn:'span 1' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:34, height:34, background:'#FF653F', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:800, flexShrink:0 }}>MT</div>
              <span style={{ fontSize:17, fontWeight:800, color:'#fff' }}>MockTest</span>
            </div>
            <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.8, marginBottom:8, maxWidth:280 }}>
              India's first expert-built bank mock test platform. 38 engines generate fresh questions every session — IBPS, SBI and RRB covered. Completely free.
            </p>
            <p style={{ fontSize:12, color:'#4b5563' }}>by Anil Software Technologies</p>
          </div>

          {/* Quick Links */}
          {Object.entries(QUICK_LINKS).map(([title, links]) => (
            <div key={title}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16 }}>{title}</div>
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {links.map(([label, dest]) => (
                  <li key={label} style={{ marginBottom:10 }}>
                    <button
                      onClick={() => nav(dest)}
                      style={{ background:'none', border:'none', padding:0, fontSize:13, color:'#6b7280', cursor:'pointer', transition:'color .12s', textAlign:'left' }}
                      onMouseOver={e => e.currentTarget.style.color='#FF653F'}
                      onMouseOut={e => e.currentTarget.style.color='#6b7280'}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Follow Us */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16 }}>Follow Us</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {[
                { Icon: IconLinkedIn, label:'LinkedIn' },
                { Icon: IconTwitter,  label:'Twitter'  },
                { Icon: IconYouTube,  label:'YouTube'  },
              ].map(({ Icon, label }) => (
                <button key={label} aria-label={label}
                  style={{ width:36, height:36, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#9ca3af', transition:'background .15s,color .15s' }}
                  onMouseOver={e => { e.currentTarget.style.background='#FF653F'; e.currentTarget.style.color='#fff' }}
                  onMouseOut={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.color='#9ca3af' }}
                >
                  <Icon />
                </button>
              ))}
            </div>
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Resources</div>
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {['System Requirements','Accessibility','Privacy Policy','Terms of Use'].map(item => (
                  <li key={item} style={{ marginBottom:8, fontSize:12, color:'#4b5563' }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── All Exam Categories ── */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,.07)', padding:'32px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:20 }}>Explore All Mock Tests</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'16px 24px' }}>
            {EXAM_COLS.map(col => (
              <div key={col.head}>
                <div style={{ fontSize:11, fontWeight:700, color:'#fff', marginBottom:10, textTransform:'uppercase', letterSpacing:'.06em' }}>{col.head}</div>
                <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                  {col.items.map(item => (
                    <li key={item.label} style={{ marginBottom:6 }}>
                      {item.live ? (
                        <button
                          onClick={() => onNav('mocktest')}
                          style={{ background:'none', border:'none', padding:0, fontSize:12, color:'#FF653F', cursor:'pointer', transition:'color .12s' }}
                          onMouseOver={e => e.currentTarget.style.color='#ffa07a'}
                          onMouseOut={e => e.currentTarget.style.color='#FF653F'}
                        >
                          {item.label}
                        </button>
                      ) : (
                        <span style={{ fontSize:12, color:'#4b5563' }}>{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{ padding:'20px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <span style={{ fontSize:12, color:'#4b5563' }}>
            © {new Date().getFullYear()} Anil Software Technologies · mocktest.anilsofttech.com · All rights reserved
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            {[['privacy','Privacy'],['terms','Terms'],['contact','Contact']].map(([id,label]) => (
              <button key={id} onClick={() => nav(id)}
                style={{ background:'none', border:'none', padding:0, fontSize:12, color:'#4b5563', cursor:'pointer', transition:'color .12s' }}
                onMouseOver={e => e.currentTarget.style.color='#FF653F'}
                onMouseOut={e => e.currentTarget.style.color='#4b5563'}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

    </footer>
  )
}
