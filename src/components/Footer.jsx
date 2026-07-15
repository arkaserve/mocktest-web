const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)
const IconTwitter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
  </svg>
)
const IconYouTube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0d1117"/>
  </svg>
)

const EXAM_CATS = [
  {
    head: 'Banking', live: true, dest: 'mocktest',
    items: ['IBPS Clerk','IBPS PO','SBI Clerk','SBI PO','RRB Assistant','Coal India MT'],
  },
  {
    head: 'SSC', live: false, dest: null,
    items: ['SSC CGL','SSC CHSL','SSC MTS'],
  },
  {
    head: 'Railway', live: false, dest: null,
    items: ['RRB NTPC','RRB Group D','RRB ALP'],
  },
  {
    head: 'Government', live: false, dest: null,
    items: ['UPSC Prelims','State PSC','NABARD'],
  },
  {
    head: 'Engineering', live: false, dest: null,
    items: ['GATE CS','GATE ECE','JEE Mains','JEE Advanced'],
  },
  {
    head: 'Medical', live: false, dest: null,
    items: ['NEET UG','NEET PG','AIIMS'],
  },
]

const COMPANY_LINKS = [
  ['About Us','about'],['Contact','contact'],['Courses','courses'],
  ['Privacy Policy','privacy'],['Terms of Use','terms'],
]

const PRACTICE_LINKS = [
  ['Full Mock Test','mock'],['Topic-wise Practice','mock'],
  ['Section Test','mock'],['Adaptive Mode','mock'],
]

const SOCIAL = [
  { Icon: IconLinkedIn, label:'LinkedIn' },
  { Icon: IconTwitter,  label:'Twitter'  },
  { Icon: IconYouTube,  label:'YouTube'  },
]

import { useState, useEffect } from 'react'
import api from '../api'

export default function Footer({ onNav }) {
  const nav = (id) => id && onNav(id)
  const [visitorCount, setVisitorCount] = useState(null)

  useEffect(() => {
    api.get('/visitor/count').then(r => setVisitorCount(r.data.count)).catch(() => {})
  }, [])

  return (
    <footer style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>

      <style>{`
        .ft-explore-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 32px 24px;
        }
        @media(max-width:900px){
          .ft-explore-grid{ grid-template-columns: repeat(3,1fr); }
        }
        @media(max-width:560px){
          .ft-explore-grid{ grid-template-columns: repeat(2,1fr); gap:24px 16px; }
        }
        .ft-bottom-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
        }
        @media(max-width:760px){
          .ft-bottom-grid{ grid-template-columns: 1fr 1fr; gap:28px; }
          .ft-brand-col{ grid-column: span 2; }
        }
        @media(max-width:480px){
          .ft-bottom-grid{ grid-template-columns: 1fr 1fr; gap:24px 16px; }
        }
      `}</style>

      {/* ── TOP: Explore All Mock Tests ── */}
      <div style={{ background:'#0d1117', padding:'52px 32px 44px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <h3 style={{ textAlign:'center', fontSize:22, fontWeight:800, color:'#fff', marginBottom:6, letterSpacing:'-0.3px' }}>
            Explore All Mock Tests
          </h3>
          <p style={{ textAlign:'center', fontSize:13, color:'#6b7280', marginBottom:40 }}>
            Choose your exam — Banking is live now, more coming soon
          </p>
          <div className="ft-explore-grid">
            {EXAM_CATS.map(cat => (
              <div key={cat.head}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{cat.head}</span>
                  {cat.live
                    ? <span style={{ fontSize:9, fontWeight:700, background:'#FF653F', color:'#fff', borderRadius:4, padding:'2px 6px', textTransform:'uppercase', letterSpacing:'.04em' }}>Live</span>
                    : <span style={{ fontSize:9, fontWeight:600, background:'rgba(255,255,255,.1)', color:'#9ca3af', borderRadius:4, padding:'2px 6px', textTransform:'uppercase', letterSpacing:'.04em' }}>Soon</span>
                  }
                </div>
                <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                  {cat.items.map(label => (
                    <li key={label} style={{ marginBottom:8 }}>
                      {cat.live
                        ? <button onClick={() => nav(cat.dest)}
                            style={{ background:'none', border:'none', padding:0, fontSize:12.5, color:'#FF653F', cursor:'pointer', transition:'color .12s', textAlign:'left' }}
                            onMouseOver={e => e.currentTarget.style.color='#ffa07a'}
                            onMouseOut={e => e.currentTarget.style.color='#FF653F'}
                          >{label}</button>
                        : <span style={{ fontSize:12.5, color:'#4b5563' }}>{label}</span>
                      }
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAND ── */}
      <div style={{ background:'#111', borderTop:'1px solid rgba(255,255,255,.06)', padding:'44px 32px 0' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div className="ft-bottom-grid">

            {/* Brand */}
            <div className="ft-brand-col">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:34, height:34, background:'#FF653F', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:800, flexShrink:0 }}>MT</div>
                <span style={{ fontSize:17, fontWeight:800, color:'#fff' }}>MockTest</span>
              </div>
              <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.8, marginBottom:6, maxWidth:300 }}>
                Expert-crafted mock tests for every major competitive exam. Banking, SSC, Railway and more — free for 7 days, no credit card required.
              </p>
              <p style={{ fontSize:12, color:'#374151' }}>by Anil Software Technologies</p>
            </div>

            {/* Company */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>Company</div>
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {COMPANY_LINKS.map(([label, dest]) => (
                  <li key={label} style={{ marginBottom:10 }}>
                    <button onClick={() => nav(dest)}
                      style={{ background:'none', border:'none', padding:0, fontSize:13, color:'#6b7280', cursor:'pointer', transition:'color .12s', textAlign:'left' }}
                      onMouseOver={e => e.currentTarget.style.color='#FF653F'}
                      onMouseOut={e => e.currentTarget.style.color='#6b7280'}
                    >{label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice Modes */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>Practice</div>
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {PRACTICE_LINKS.map(([label, dest]) => (
                  <li key={label} style={{ marginBottom:10 }}>
                    <button onClick={() => nav(dest)}
                      style={{ background:'none', border:'none', padding:0, fontSize:13, color:'#6b7280', cursor:'pointer', transition:'color .12s', textAlign:'left' }}
                      onMouseOver={e => e.currentTarget.style.color='#FF653F'}
                      onMouseOut={e => e.currentTarget.style.color='#6b7280'}
                    >{label}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>Follow Us</div>
              <div style={{ display:'flex', gap:10 }}>
                {SOCIAL.map(({ Icon, label }) => (
                  <button key={label} aria-label={label}
                    style={{ width:38, height:38, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#9ca3af', transition:'background .15s,color .15s' }}
                    onMouseOver={e => { e.currentTarget.style.background='#FF653F'; e.currentTarget.style.color='#fff' }}
                    onMouseOut={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.color='#9ca3af' }}
                  ><Icon /></button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Copyright */}
        <div style={{ maxWidth:1280, margin:'0 auto', borderTop:'1px solid rgba(255,255,255,.06)', padding:'18px 0', marginTop:36 }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:10 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <span style={{ fontSize:12, color:'#374151' }}>
                © {new Date().getFullYear()} Anil Software Technologies · mocktest.anilsofttech.com · All rights reserved
              </span>
              {visitorCount !== null && (
                <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                  {String(visitorCount).padStart(6,'0').split('').map((d,i) => (
                    <div key={i} style={{ width:20, height:26, background:'#2d2d2d', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #3a3a3a', boxShadow:'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                      <span style={{ fontSize:13, fontWeight:800, color:'#FF653F', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{d}</span>
                    </div>
                  ))}
                  <span style={{ fontSize:11, color:'#6b7280', marginLeft:6 }}>total visitors</span>
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:16 }}>
              {[['privacy','Privacy'],['terms','Terms'],['contact','Contact']].map(([id,label]) => (
                <button key={id} onClick={() => nav(id)}
                  style={{ background:'none', border:'none', padding:0, fontSize:12, color:'#374151', cursor:'pointer', transition:'color .12s' }}
                  onMouseOver={e => e.currentTarget.style.color='#FF653F'}
                  onMouseOut={e => e.currentTarget.style.color='#374151'}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
