import { useState, memo } from 'react'

/* ─── DATA — outside component, created once ─── */
const ALL_EXAMS = [
  { id:'banking',     org:'🏦', name:'Banking',    sub:'IBPS, SBI, RRB',      status:'live',  tag:'Live Now'    },
  { id:'ssc',         org:'📋', name:'SSC',         sub:'CGL, CHSL, MTS',      status:'soon',  tag:'Coming Soon' },
  { id:'railway',     org:'🚂', name:'Railway',     sub:'NTPC, Group D, ALP',  status:'soon',  tag:'Coming Soon' },
  { id:'engineering', org:'⚙',  name:'Engineering', sub:'JEE, GATE, BITSAT',   status:'soon',  tag:'Coming Soon' },
  { id:'medical',     org:'🏥', name:'Medical',     sub:'NEET, AIIMS, JIPMER', status:'soon',  tag:'Coming Soon' },
  { id:'teaching',    org:'📚', name:'Teaching',    sub:'CTET, KVS, DSSSB',    status:'soon',  tag:'Coming Soon' },
  { id:'state_psc',   org:'🏛', name:'State PSC',  sub:'UPSC, MPSC, TNPSC',   status:'soon',  tag:'Coming Soon' },
  { id:'defence',     org:'🎖', name:'Defence',     sub:'NDA, CDS, AFCAT',     status:'soon',  tag:'Coming Soon' },
]

const EXAM_GROUPS = [
  { id:'ibps', label:'IBPS', color:'#FF653F', exams:[
    { id:'bank_clerk_prelims', name:'IBPS Clerk Prelims', meta:'100Q · 60 min',  tag:'Popular' },
    { id:'bank_clerk_mains',   name:'IBPS Clerk Mains',   meta:'175Q · 160 min' },
    { id:'bank_po_prelims',    name:'IBPS PO Prelims',    meta:'100Q · 60 min',  tag:'Popular' },
    { id:'bank_po_mains',      name:'IBPS PO Mains',      meta:'175Q · 180 min' },
  ]},
  { id:'sbi', label:'SBI', color:'#222', exams:[
    { id:'sbi_clerk_prelims', name:'SBI Clerk Prelims', meta:'100Q · 60 min'  },
    { id:'sbi_clerk_mains',   name:'SBI Clerk Mains',   meta:'170Q · 160 min' },
    { id:'sbi_po_prelims',    name:'SBI PO Prelims',    meta:'100Q · 60 min'  },
    { id:'sbi_po_mains',      name:'SBI PO Mains',      meta:'175Q · 180 min' },
  ]},
  { id:'rrb', label:'RRB', color:'#059669', exams:[
    { id:'rrb_office_assistant_prelims', name:'RRB Office Assistant Prelims', meta:'80Q · 45 min',   tag:'New' },
    { id:'rrb_office_assistant_mains',   name:'RRB Office Assistant Mains',   meta:'200Q · 120 min' },
    { id:'rrb_officer_scale1_prelims',   name:'RRB Officer Scale-I Prelims',  meta:'80Q · 45 min',   tag:'New' },
    { id:'rrb_officer_scale1_mains',     name:'RRB Officer Scale-I Mains',    meta:'200Q · 120 min' },
  ]},
  { id:'psu', label:'PSU', color:'#5D4037', exams:[
    { id:'coal_india_mt', name:'Coal India MT', meta:'100Q · 120 min', tag:'New' },
  ]},
]

const AI_FEATURES = [
  { icon:'∞',  title:'Infinite Unique Questions',  desc:'smart engines create fresh questions every session. Zero repetition — ever.',                tag:'Only on MockTest', ic:'#FF653F', bg:'#FFF3EE' },
  { icon:'🧠', title:'Adaptive Difficulty',         desc:'Tracks accuracy per topic. Starts easy, pushes to hard as you improve.',                  tag:'Smart Engine',    ic:'#059669', bg:'#ECFDF5' },
  { icon:'⏱', title:'Per-Section 20-Min Timers',   desc:'Each section has its own countdown. Auto-advances on expiry. Exact IBPS/SBI format.',     tag:'Real Exam Feel',     ic:'#D97706', bg:'#FFFBEB' },
  { icon:'📄', title:'PDF with Charts & Solutions', desc:'Download solutions with bar/pie charts, step-by-step working and all wrong answers.',      tag:'Post-Exam Review',   ic:'#7C3AED', bg:'#F5F3FF' },
  { icon:'🎯', title:'35-Topic Practice Mode',      desc:'Pick any topic — Simplification, Puzzles, Syllogism — any count, any difficulty.',        tag:'Targeted Prep',      ic:'#FF653F', bg:'#FFF3EE' },
]

const PLANS = [
  { days:'10', label:'10 Days Plan', sub:'Quick revision & high-score boost',    points:['High-weightage topics only','Smart revision strategy','Mock tests & analysis','Daily targets'],          popular:false },
  { days:'20', label:'20 Days Plan', sub:'Structured tracking & full syllabus',  points:['Complete syllabus coverage','Practice + revision balance','Topic tests & mocks','Performance tracking'], popular:true  },
  { days:'30', label:'30 Days Plan', sub:'Strong foundation & top performance',  points:['In-depth topic learning','Concept clarity practice','Regular mock tests','Doubt solving & analysis'],    popular:false },
]

const HOW_IT_WORKS = [
  { n:'01', title:'Choose Your Exam',   desc:'Pick from IBPS, SBI, RRB and more.', icon:'🎓' },
  { n:'02', title:'Select Your Plan',   desc:'Pick 10, 20 or 30 days prep plan.',  icon:'📋' },
  { n:'03', title:'Follow Daily Plan',  desc:'Get your personalised schedule.',     icon:'📅' },
  { n:'04', title:'Practice & Analyse', desc:'Attempt mocks, analyse & improve.',  icon:'📊' },
  { n:'05', title:'Achieve Your Goal',  desc:'Succeed with confidence.',            icon:'🏆' },
]

const STATS = [
  { num:'10,000+', label:'Mock Tests Attempted' },
  { num:'5,000+',  label:'Aspirants Trust Us'   },
  { num:'1M+',     label:'Questions Available'  },
  { num:'50+',     label:'Exams Covered'        },
]

const TESTIMONIALS = [
  { text:'The expert-crafted questions are genuinely at exam level. I took 12 tests and not a single question repeated. The section timers made the real exam feel familiar.', name:'Priya S.',   exam:'IBPS Clerk 2024 — Selected', init:'PS', c:'#FF653F' },
  { text:'MockTest mock tests are closest to the real exam. The adaptive difficulty kept pushing me harder each day. Cleared IBPS PO in my first attempt.',              name:'Rahul M.',   exam:'IBPS PO 2023',               init:'RM', c:'#059669' },
  { text:'I followed the 20-days plan and cleared RRB PO. I highly recommend MockTest for the DI charts — they look exactly like the real screen.',                      name:'Amit Singh', exam:'RRB PO 2023',                 init:'AS', c:'#0891B2' },
]

const CAREER_TIPS = [
  { category:'Exam Strategy',    icon:'🗺', tips:['Attempt all easy questions first — go back to hard ones later','Never spend more than 90 seconds on a single question','80% accuracy beats 100% attempts — negative marking is real','Section cut-offs matter more than total score'] },
  { category:'Numerical Ability',icon:'🔢', tips:['Master simplification (BODMAS) — 10Q in Clerk, free marks','DI sets: read all 5 questions before you start calculating','Approximate to nearest 10 for percentage questions','Quadratic: always check both roots before comparing'] },
  { category:'Reasoning',        icon:'🧩', tips:['Draw seating arrangements on paper — never in your head','Floor puzzles: make a 7-row table and fill clues one by one','Syllogism: draw Venn diagrams for each statement','Blood relations: always draw a family tree first'] },
  { category:'English Language', icon:'📝', tips:['Error detection: read each underlined part as a standalone sentence','Cloze test: read the full passage once before filling any blank','Para jumbles: find the opening sentence first','RC: factual questions first, inference questions last'] },
  { category:'Time Management',  icon:'⏰', tips:['Prelims split: English 12min · Quant 20min · Reasoning 18min','Practise with a timer from Day 1 — speed is a learnable skill','Take 2 full mocks per week — review wrong answers same day','Identify your safe topics (90%+ accuracy) — attempt these first'] },
  { category:'GK & Banking',     icon:'🏦', tips:['RBI policy: Repo Rate, Reverse Repo, CRR, SLR — must know','Current RBI Governor, Finance Minister, budget allocations','Key Acts: RBI Act 1934, Banking Regulation Act 1949','Last 6 months current affairs sufficient for Mains GK'] },
]

const JOURNEY_STEPS = [
  { title:'Choose Exam',       sub:'Select Your Goal',     icon:'🎯', color:'#FF653F', bg:'#FFF3EE' },
  { title:'Tell Us About You', sub:'Time, Date & Level',   icon:'👤', color:'#D97706', bg:'#FFFBEB' },
  { title:'We Build Your Plan',   sub:'Personalized Journey', icon:'⚙️', color:'#7C3AED', bg:'#F5F3FF' },
  { title:'Daily Mission',     sub:'Stay On Track',        icon:'📅', color:'#0891B2', bg:'#ECFEFF' },
  { title:'Exam Ready',        sub:'Goal Achieved',        icon:'✅', color:'#059669', bg:'#ECFDF5', done:true },
]

const NAV_TABS = [
  ['about','About Us'],['home','Home'],['mock','Mock Tests'],
  ['success','Success Stories'],['career','Career'],['blog','Blog'],
]
// Items that navigate to dedicated public pages (not internal landing tabs)
const NAV_LINKS = [
  ['exams','Exams'],['cutoffs','Cut-offs'],['papers','Previous Papers'],
]

/* ─── COMPONENT ─── */
function LandingPage({ onNav, initialTab='home' }) {
  const [tab,     setTab]    = useState(initialTab)
  const [openTip, setOpenTip]= useState(null)
  const [examTab, setExamTab]= useState(0)
  const go = (examId) => examId ? onNav('mocktest', examId) : onNav('auth')

  return (
    <div style={{fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",background:'#fff',minHeight:'100vh',color:'#1a1a1a'}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}
        /* NAV */
        .nav-link{font-size:14px;font-weight:500;color:#ffffff;background:transparent;border:none;padding:8px 14px;cursor:pointer;border-radius:6px;transition:color .12s,background .12s;white-space:nowrap}
        .nav-link:hover,.nav-link.active{color:#fff;background:rgba(255,255,255,.12)}
        /* BUTTONS */
        .btn-orange{display:inline-flex;align-items:center;gap:8px;background:#FF653F;color:#fff;border:none;border-radius:8px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;transition:background .15s,transform .15s,box-shadow .15s;box-shadow:0 4px 16px rgba(255,107,53,.35)}
        .btn-orange:hover{background:#e5512f;transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,107,53,.45)}
        .btn-dark{display:inline-flex;align-items:center;gap:8px;background:#1a1a1a;color:#fff;border:none;border-radius:8px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;transition:background .15s,transform .15s}
        .btn-dark:hover{background:#333;transform:translateY(-2px)}
        .btn-outline-dark{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#1a1a1a;border:2px solid #1a1a1a;border-radius:8px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s,color .15s}
        .btn-outline-dark:hover{background:#1a1a1a;color:#fff}
        /* CARDS */
        .feat-card{background:#fff;border:1.5px solid #f0f0f0;border-radius:16px;padding:28px;transition:transform .15s,box-shadow .15s,border-color .15s}
        .feat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.08);border-color:#FF653F}
        /* MISC */
        .tip-acc{border:1.5px solid #f0f0f0;border-radius:12px;overflow:hidden;transition:border-color .12s}
        .tip-acc:hover{border-color:#FF653F}
        .exam-chip{display:flex;align-items:center;gap:12px;padding:12px 20px;border-radius:12px;border:1.5px solid;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:transform .12s,box-shadow .12s;background:rgba(255,255,255,.06)}
        .exam-chip:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.2)}
        .scroll-btn{width:40px;height:40px;border-radius:50%;border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;flex-shrink:0;transition:background .12s}
        .scroll-btn:hover{background:rgba(255,255,255,.22)}
        #exam-scroll::-webkit-scrollbar{display:none}
        button:active{transform:translateY(0)!important;opacity:.9}
        section{contain:layout style}
      `}</style>

      {/* NAV is now the shared <Navbar/> rendered by App.jsx (consistent across all pages) */}

      {/* ══ HOME ══ */}
      {tab==='home' && <>

        {/* HERO — white bg, bold black, orange accent */}
        <section style={{background:'#fff',padding:'96px 32px 80px',borderBottom:'1px solid #f0f0f0'}}>
          <div style={{maxWidth:860,margin:'0 auto',textAlign:'center'}}>

            <div className="fu" style={{display:'inline-flex',alignItems:'center',gap:8,background:'#FFF3EE',border:'1px solid #fec9b0',color:'#FF653F',borderRadius:24,padding:'6px 18px',fontSize:13,fontWeight:600,marginBottom:28}}>
              <span style={{width:7,height:7,background:'#FF653F',borderRadius:'50%',display:'inline-block',animation:'pulse 2s infinite'}}/>
              Expert-Crafted Banking Exam Preparation · Trusted by 5,000+ Aspirants
            </div>

            <h1 className="fu" style={{fontSize:'clamp(30px,5vw,54px)',fontWeight:900,color:'#111',lineHeight:1.12,marginBottom:22,letterSpacing:'-1.5px',animationDelay:'.05s'}}>
              Your Study Coach for <span style={{color:'#FF653F'}}>Every Competitive Exam Goal</span>
            </h1>

            <p className="fu" style={{fontSize:18,color:'#555',lineHeight:1.75,marginBottom:36,animationDelay:'.1s'}}>
              Personalised study plans, mock tests and performance insights.<br/>
              Banking, SSC, Railway, JEE and more — <strong style={{color:'#111'}}>completely free.</strong>
            </p>

            {/* Free-trial badge */}
            <div className="fu" style={{display:'flex',justifyContent:'center',marginBottom:18,animationDelay:'.12s'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:8,background:'#FFF3EE',border:'1.5px solid #fec9b0',color:'#FF653F',fontWeight:700,fontSize:13.5,padding:'8px 16px',borderRadius:999}}>
                🎁 7-day free trial · No credit card required · Cancel anytime
              </span>
            </div>

            <div className="fu" style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:14,animationDelay:'.15s'}}>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'16px 40px',fontSize:16}}>
                🚀 Start 7-Day Free Trial →
              </button>
            </div>
            <p className="fu" style={{textAlign:'center',fontSize:13,color:'#888',marginBottom:48,animationDelay:'.18s'}}>
              Full access to mock tests, study planner &amp; explanations free for 7 days.
            </p>

            {/* Social proof numbers */}
            <div className="fu" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:'20px 0',marginBottom:44,padding:'28px 0',borderTop:'1px solid #f0f0f0',borderBottom:'1px solid #f0f0f0',animationDelay:'.2s'}}>
              {STATS.map((s,i)=>(
                <div key={s.num} style={{textAlign:'center',padding:'0 16px'}}>
                  <div style={{fontSize:28,fontWeight:800,color:'#FF653F',letterSpacing:'-0.5px',whiteSpace:'nowrap'}}>{s.num}</div>
                  <div style={{fontSize:13,color:'#888',marginTop:4,fontWeight:500}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Feature pills */}
            <div className="fu" style={{display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap',animationDelay:'.25s'}}>
              {[['🧠','Study Plan'],['📅','Smart Timetable'],['📝','Infinite Mock Tests'],['📊','Performance Insights'],['🎯','35-Topic Practice']].map(([ic,lbl])=>(
                <div key={lbl} style={{display:'inline-flex',alignItems:'center',gap:7,background:'#f8f8f8',border:'1px solid #e5e5e5',borderRadius:24,padding:'7px 16px'}}>
                  <span style={{fontSize:14}}>{ic}</span>
                  <span style={{fontSize:13,fontWeight:500,color:'#444'}}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EXAMS STRIP — dark with orange accent */}
        <section style={{padding:'44px 0',background:'#111'}}>
          <div style={{maxWidth:1400,margin:'0 auto',padding:'0 32px'}}>
            <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.12em',textAlign:'center',marginBottom:6}}>Exams We Cover</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,.5)',textAlign:'center',marginBottom:22}}>Click any exam to get started — Banking, SSC, Railway and more</div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <button className="scroll-btn" onClick={()=>document.getElementById('exam-scroll').scrollBy({left:-300,behavior:'smooth'})}>‹</button>
              <div id="exam-scroll" style={{display:'flex',gap:12,overflowX:'auto',scrollbarWidth:'none',flex:1,padding:'4px 2px',willChange:'scroll-position'}}>
                {ALL_EXAMS.map(e=>(
                  <button key={e.id} className="exam-chip" onClick={()=>onNav('auth')}
                    style={{borderColor:e.status==='live'?'#FF653F':'rgba(255,255,255,.15)'}}>
                    <span style={{fontSize:22}}>{e.org}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{e.name}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.45)'}}>{e.sub}</div>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,background:e.status==='live'?'#FF653F':'rgba(255,255,255,.1)',color:'#fff',flexShrink:0}}>{e.tag}</span>
                  </button>
                ))}
                <button className="exam-chip" onClick={()=>setTab('exams')} style={{borderColor:'rgba(255,255,255,.2)',borderStyle:'dashed',fontSize:13,fontWeight:700,color:'#fff'}}>More Exams →</button>
              </div>
              <button className="scroll-btn" onClick={()=>document.getElementById('exam-scroll').scrollBy({left:300,behavior:'smooth'})}>›</button>
            </div>
          </div>
        </section>

        {/* SMART FEATURES — clean white */}
        <section style={{padding:'80px 32px',background:'#fafafa'}}>
          <div style={{maxWidth:1300,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:52}}>
              <div style={{fontSize:12,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>What Makes Us Different</div>
              <h2 style={{fontSize:38,fontWeight:800,color:'#111',marginBottom:12,letterSpacing:'-0.5px'}}>Study Smart with <span style={{color:'#FF653F'}}>Expert-Crafted</span> Features</h2>
              <p style={{fontSize:16,color:'#666',maxWidth:520,margin:'0 auto'}}>Not a question bank. 38 smart engines that create questions fresh every time.</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
              {AI_FEATURES.map((f,i)=>(
                <div key={i} className="feat-card">
                  <div style={{width:52,height:52,borderRadius:14,background:f.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:18}}>{f.icon}</div>
                  <div style={{fontSize:17,fontWeight:700,color:'#111',marginBottom:8}}>{f.title}</div>
                  <div style={{fontSize:14,color:'#666',lineHeight:1.7,marginBottom:14}}>{f.desc}</div>
                  <span style={{fontSize:11,fontWeight:700,color:f.ic,background:f.bg,padding:'4px 10px',borderRadius:20}}>{f.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STUDY PLANS */}
        <section style={{padding:'80px 32px',background:'#fff'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:52}}>
              <div style={{fontSize:12,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>Study Plans</div>
              <h2 style={{fontSize:38,fontWeight:800,color:'#111',marginBottom:10,letterSpacing:'-0.5px'}}>Whether you have <span style={{color:'#FF653F'}}>10, 20 or 30 days</span>,<br/>we can create the perfect plan</h2>
              <p style={{fontSize:16,color:'#666'}}>Based on your target exam and available time</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
              {PLANS.map((p,i)=>(
                <div key={p.days} style={{border:'2px solid',borderColor:p.popular?'#FF653F':'#e5e5e5',borderRadius:18,overflow:'hidden',background:'#fff',boxShadow:p.popular?'0 12px 40px rgba(255,107,53,.15)':'none',position:'relative',transition:'transform .15s,box-shadow .15s'}}
                  onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=p.popular?'0 20px 48px rgba(255,107,53,.22)':'0 8px 28px rgba(0,0,0,.07)'}}
                  onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=p.popular?'0 12px 40px rgba(255,107,53,.15)':'none'}}>
                  {p.popular && <div style={{position:'absolute',top:14,right:14,background:'#FF653F',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:12}}>Most Popular</div>}
                  <div style={{padding:'24px 24px 20px',background:p.popular?'#FF653F':'#fafafa',borderBottom:'1px solid',borderBottomColor:p.popular?'rgba(255,255,255,.15)':'#e5e5e5'}}>
                    <div style={{fontSize:32,fontWeight:900,color:p.popular?'#fff':'#FF653F',lineHeight:1}}>{p.days} Days</div>
                    <div style={{fontSize:15,fontWeight:700,color:p.popular?'rgba(255,255,255,.9)':'#111',marginTop:3}}>{p.label}</div>
                    <div style={{fontSize:13,color:p.popular?'rgba(255,255,255,.7)':'#888',marginTop:5,lineHeight:1.5}}>{p.sub}</div>
                  </div>
                  <div style={{padding:'20px 24px 24px'}}>
                    {p.points.map((pt,j)=>(
                      <div key={j} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                        <span style={{width:18,height:18,borderRadius:'50%',background:p.popular?'#FFF3EE':'#FFF3EE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{color:'#FF653F',fontSize:9,fontWeight:800}}>✓</span>
                        </span>
                        <span style={{fontSize:14,color:'#374151'}}>{pt}</span>
                      </div>
                    ))}
                    <button onClick={()=>onNav('auth')} style={{width:'100%',marginTop:12,padding:'12px 0',background:p.popular?'#111':'transparent',color:p.popular?'#fff':'#FF653F',border:p.popular?'none':'2px solid #FF653F',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',transition:'background .12s,color .12s'}}
                      onMouseOver={e=>{if(!p.popular){e.currentTarget.style.background='#FF653F';e.currentTarget.style.color='#fff'}}}
                      onMouseOut={e=>{if(!p.popular){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#FF653F'}}}>
                      {p.popular?'Get Started →':'Choose Plan →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{padding:'80px 32px',background:'#fafafa'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:52}}>
              <div style={{fontSize:12,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>How It Works</div>
              <h2 style={{fontSize:38,fontWeight:800,color:'#111',letterSpacing:'-0.5px'}}>5 Steps to Your Success</h2>
            </div>
            <div style={{display:'flex',position:'relative'}}>
              {HOW_IT_WORKS.map((s,i)=>(
                <div key={s.n} style={{flex:1,textAlign:'center',padding:'0 16px',position:'relative'}}>
                  {i < HOW_IT_WORKS.length-1 && (
                    <div style={{position:'absolute',top:26,left:'60%',width:'80%',height:2,background:'linear-gradient(90deg,#FF653F,#fec9b0)',zIndex:0}}/>
                  )}
                  <div style={{width:52,height:52,background:'#FF653F',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',position:'relative',zIndex:1,boxShadow:'0 6px 16px rgba(255,107,53,.3)'}}>
                    <span style={{fontSize:22}}>{s.icon}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:'#FF653F',marginBottom:5}}>{s.n}</div>
                  <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:5}}>{s.title}</div>
                  <div style={{fontSize:13,color:'#666',lineHeight:1.55}}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{padding:'80px 32px',background:'#fff'}}>
          <div style={{maxWidth:1200,margin:'0 auto'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:36}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#FF653F',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Success Stories</div>
                <h2 style={{fontSize:32,fontWeight:800,color:'#111',letterSpacing:'-0.4px'}}>What Aspirants Say</h2>
              </div>
              <button onClick={()=>setTab('success')} className="btn-outline-dark">View All Stories →</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
              {TESTIMONIALS.map((t,i)=>(
                <div key={i} className="feat-card">
                  <div style={{color:'#FF653F',fontSize:16,letterSpacing:3,marginBottom:14}}>★★★★★</div>
                  <p style={{fontSize:14,color:'#444',lineHeight:1.75,marginBottom:20}}>{t.text}</p>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:40,height:40,borderRadius:'50%',background:t.c,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:700,flexShrink:0}}>{t.init}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'#111'}}>{t.name}</div>
                      <div style={{fontSize:12,color:'#888'}}>{t.exam}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section style={{background:'#111',padding:'64px 32px'}}>
          <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
            <h2 style={{fontSize:38,fontWeight:800,color:'#fff',marginBottom:12,letterSpacing:'-0.5px'}}>Ready to Start Your Preparation?</h2>
            <p style={{fontSize:16,color:'rgba(255,255,255,.6)',lineHeight:1.65,marginBottom:32}}>Create your personalised 10/20/30 days plan and take the first step towards success.</p>
            <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'16px 36px',fontSize:16}}>🚀 Start Free Mock Test Now →</button>
              <button onClick={()=>setTab('exams')} style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.08)',color:'#fff',border:'1.5px solid rgba(255,255,255,.2)',borderRadius:8,padding:'15px 28px',fontSize:15,fontWeight:600,cursor:'pointer',transition:'background .12s'}}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.14)'}
                onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}>
                📚 Explore All Exams
              </button>
            </div>
          </div>
        </section>
      </>}

      {/* ══ EXAMS TAB ══ */}
      {tab==='exams' && (
        <section style={{padding:'56px 32px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <h2 style={{fontSize:32,fontWeight:800,color:'#111',marginBottom:6,letterSpacing:'-0.4px'}}>All Available Exams</h2>
            <p style={{fontSize:15,color:'#666',marginBottom:28}}>IBPS, SBI and Regional Rural Banks — Prelims and Mains</p>
            <div style={{display:'flex',gap:10,marginBottom:28,flexWrap:'wrap'}}>
              {EXAM_GROUPS.map((g,i)=>(
                <button key={g.id} onClick={()=>setExamTab(i)}
                  style={{fontSize:13,fontWeight:700,padding:'8px 20px',borderRadius:22,border:'1.5px solid',borderColor:examTab===i?'#FF653F':'#e5e5e5',background:examTab===i?'#FF653F':'#fff',color:examTab===i?'#fff':'#444',cursor:'pointer',transition:'all .12s'}}>
                  {g.label}
                </button>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}>
              {EXAM_GROUPS[examTab]?.exams.map(e=>(
                <div key={e.id} style={{border:'1.5px solid #e5e5e5',borderRadius:14,padding:18,background:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,transition:'border-color .12s,box-shadow .12s'}}
                  onMouseOver={e2=>{e2.currentTarget.style.borderColor='#FF653F';e2.currentTarget.style.boxShadow='0 4px 16px rgba(255,107,53,.1)'}}
                  onMouseOut={e2=>{e2.currentTarget.style.borderColor='#e5e5e5';e2.currentTarget.style.boxShadow='none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:44,height:44,borderRadius:11,background:'#FFF3EE',border:'1.5px solid #fec9b0',display:'flex',alignItems:'center',justifyContent:'center',color:'#FF653F',fontSize:13,fontWeight:800,flexShrink:0}}>
                      {EXAM_GROUPS[examTab].id.toUpperCase().slice(0,3)}
                    </div>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                        <span style={{fontSize:14,fontWeight:700,color:'#111'}}>{e.name}</span>
                        {e.tag && <span style={{fontSize:10,fontWeight:700,background:'#FFF3EE',color:'#FF653F',padding:'2px 8px',borderRadius:8}}>{e.tag}</span>}
                      </div>
                      <div style={{fontSize:12,color:'#888'}}>{e.meta} · Negative: -0.25</div>
                    </div>
                  </div>
                  <button onClick={()=>go(e.id)} className="btn-orange" style={{flexShrink:0,padding:'9px 20px',fontSize:13}}>Launch</button>
                </div>
              ))}
            </div>
            <div style={{marginTop:32,textAlign:'center'}}>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'14px 32px',fontSize:15}}>Log in to start any exam →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ CAREER TAB ══ */}
      {tab==='career' && (
        <section style={{padding:'56px 32px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:980,margin:'0 auto'}}>

            {/* Hero */}
            <div style={{textAlign:'center',marginBottom:40}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'#FFF3EE',color:'#FF653F',border:'1px solid #fec9b0',borderRadius:22,padding:'6px 16px',fontSize:13,fontWeight:700,marginBottom:14}}>🚀 Careers at MockTest</div>
              <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:10,letterSpacing:'-0.5px'}}>Build the future of <span style={{color:'#FF653F'}}>exam prep</span> with us</h2>
              <p style={{fontSize:16,color:'#666',maxWidth:560,margin:'0 auto',lineHeight:1.7}}>We're a small, fast-moving team working to make quality exam preparation free for every aspirant in India. Come help us scale it to millions.</p>
            </div>

            {/* What We Do */}
            <div style={{marginBottom:36}}>
              <h3 style={{fontSize:22,fontWeight:800,color:'#111',marginBottom:14}}>What We Do</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14}}>
                {[{icon:'⚙️',t:'Smart question engines',d:'38 engines that generate fresh, exam-accurate questions with zero repetition.'},{icon:'📊',t:'Smart analytics',d:'Automated weakness detection and category-aware cut-off prediction.'},{icon:'🎯',t:'Personalised prep',d:'Adaptive study planners that adjust to each student in real time.'}].map((c,i)=>(
                  <div key={i} className="feat-card" style={{textAlign:'left'}}>
                    <div style={{fontSize:28,marginBottom:10}}>{c.icon}</div>
                    <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:6}}>{c.t}</div>
                    <div style={{fontSize:13,color:'#666',lineHeight:1.6}}>{c.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Life + Benefits */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16,marginBottom:36}}>
              <div style={{background:'#fafafa',border:'1.5px solid #e5e5e5',borderRadius:16,padding:24}}>
                <h3 style={{fontSize:18,fontWeight:800,color:'#111',marginBottom:12}}>Life at MockTest</h3>
                {['Small team, big ownership — your work ships fast','Remote-friendly with flexible hours','Direct impact on lakhs of aspirants','Learn across product & ed-tech'].map((t,i)=>(
                  <div key={i} style={{display:'flex',gap:10,marginBottom:10,fontSize:14,color:'#444'}}>
                    <span style={{color:'#FF653F',fontWeight:800}}>✓</span>{t}
                  </div>
                ))}
              </div>
              <div style={{background:'#fafafa',border:'1.5px solid #e5e5e5',borderRadius:16,padding:24}}>
                <h3 style={{fontSize:18,fontWeight:800,color:'#111',marginBottom:12}}>Benefits & Perks</h3>
                {['Competitive pay + ESOPs','Annual learning & upskilling budget','Health coverage','Latest hardware & tools','Generous leave policy'].map((t,i)=>(
                  <div key={i} style={{display:'flex',gap:10,marginBottom:10,fontSize:14,color:'#444'}}>
                    <span style={{color:'#FF653F',fontWeight:800}}>★</span>{t}
                  </div>
                ))}
              </div>
            </div>

            {/* Open Roles */}
            <h3 style={{fontSize:22,fontWeight:800,color:'#111',marginBottom:14}}>Open Roles</h3>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32}}>
              {[
                {role:'Frontend Engineer (React)', loc:'Remote / Hyderabad', type:'Full-time'},
                {role:'Backend Engineer (FastAPI/Python)', loc:'Remote / Hyderabad', type:'Full-time'},
                {role:'Software Engineer', loc:'Remote', type:'Full-time'},
                {role:'Banking Subject-Matter Expert', loc:'Remote', type:'Contract'},
                {role:'Growth & Content Marketer', loc:'Remote', type:'Full-time'},
              ].map((j,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,background:'#fff',border:'1.5px solid #e5e5e5',borderRadius:14,padding:'16px 20px'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:700,color:'#111'}}>{j.role}</div>
                    <div style={{fontSize:13,color:'#888',marginTop:2}}>📍 {j.loc} · {j.type}</div>
                  </div>
                  <button onClick={()=>onNav('contact')} className="btn-orange" style={{padding:'10px 22px',fontSize:14,flexShrink:0,whiteSpace:'nowrap'}}>Apply →</button>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{background:'#111',borderRadius:18,padding:32,textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:8}}>Don't see your role?</div>
              <div style={{fontSize:14,color:'rgba(255,255,255,.6)',marginBottom:22}}>We're always keen to meet talented people. Write to us and tell us how you can help.</div>
              <button onClick={()=>onNav('contact')} className="btn-orange" style={{padding:'14px 32px',fontSize:15}}>Get in touch →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ ABOUT TAB (now includes Mock Tests content) ══ */}
      {tab==='about' && (
        <section style={{padding:'56px 32px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            {/* Headline — single line */}
            <div style={{textAlign:'center',marginBottom:40}}>
              <div style={{width:60,height:60,background:'#FF653F',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:22,fontWeight:900,margin:'0 auto 20px'}}>MT</div>
              <h2 style={{fontSize:44,fontWeight:800,color:'#111',lineHeight:1.15,letterSpacing:'-1px'}}>
                Study Coach for <span style={{color:'#FF653F'}}>Every Competitive Exam Goal</span>
              </h2>
              <p style={{fontSize:15,color:'#888',marginTop:14}}>India's first fully expert-crafted mock test platform · by Anil Software Technologies</p>
            </div>

            {/* Two columns spread to the edges */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(360px,1fr))',gap:48,alignItems:'start'}}>

              {/* LEFT — Why / About */}
              <div>
                <h3 style={{fontSize:22,fontWeight:800,color:'#111',marginBottom:14,letterSpacing:'-0.3px'}}>Why <span style={{color:'#FF653F'}}>MockTest</span></h3>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[{t:'Our Mission',d:'To make quality bank exam preparation accessible to every student — free, with no repeated questions and expert-crafted personalisation that was previously only available in expensive coaching centres.'},{t:'How It Works',d:'We built 38 smart engines — one per topic — that generate mathematically valid questions using unique seeds. Every test is completely new. Same student, same exam: zero repetition guaranteed.'},{t:'Exams Covered',d:'IBPS Clerk & PO (Prelims + Mains), SBI Clerk & PO (Prelims + Mains), RRB Office Assistant & Officer Scale-I, and Coal India MT. More exams being added continuously.'},{t:'What Makes Us Unique',d:'No other platform generates questions on the fly. Our adaptive difficulty engine tracks per-topic accuracy and adjusts in real time.'}].map((it,i)=>(
                    <div key={i} style={{background:'#fafafa',border:'1.5px solid #e5e5e5',borderRadius:14,padding:18}}>
                      <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:6}}>{it.t}</div>
                      <div style={{fontSize:14,color:'#555',lineHeight:1.7}}>{it.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — mock tests */}
              <div>
                <h3 style={{fontSize:22,fontWeight:800,color:'#111',marginBottom:14,letterSpacing:'-0.3px'}}>Expert-Crafted <span style={{color:'#FF653F'}}>Mock Tests</span></h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
                  {[{icon:'∞',t:'Zero Repetition',d:'38 smart engines generate unique questions every session.'},{icon:'🧠',t:'Adaptive Difficulty',d:'Starts easy, progresses to hard as your accuracy improves.'},{icon:'📊',t:'Real DI Charts',d:'Interactive bar, pie, line charts in exam and PDF.'},{icon:'⏱',t:'Section Timers',d:'Per-section 20-minute countdown — exact IBPS/SBI format.'},{icon:'📄',t:'PDF Solutions',d:'Full solution PDF with charts and step-by-step working.'},{icon:'🎯',t:'Topic Practice',d:'35 topics. Practice 5–50 questions at any difficulty.'}].map((f,i)=>(
                    <div key={i} className="feat-card" style={{textAlign:'left',padding:18}}>
                      <div style={{fontSize:24,marginBottom:8}}>{f.icon}</div>
                      <div style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:5}}>{f.t}</div>
                      <div style={{fontSize:12.5,color:'#666',lineHeight:1.55}}>{f.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Our Leadership ── */}
            <div style={{marginTop:48,marginBottom:8,textAlign:'center'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'#FFF3EE',color:'#FF653F',border:'1px solid #fec9b0',borderRadius:22,padding:'6px 16px',fontSize:12,fontWeight:700,marginBottom:12}}>OUR LEADERSHIP</div>
              <h3 style={{fontSize:28,fontWeight:800,color:'#111',letterSpacing:'-0.4px'}}>The minds behind <span style={{color:'#FF653F'}}>MockTest</span></h3>
              <p style={{fontSize:14,color:'#888',marginTop:6,maxWidth:560,margin:'6px auto 0'}}>Engineers and educators on a mission to make world-class exam prep free for every aspirant.</p>
            </div>

            <div style={{marginTop:24,background:'#fafafa',border:'1.5px solid #e5e5e5',borderRadius:20,padding:28,display:'flex',gap:24,flexWrap:'wrap',alignItems:'center'}}>
              <div style={{width:96,height:96,borderRadius:'50%',background:'linear-gradient(135deg,#FF653F,#e5512f)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:34,fontWeight:900,flexShrink:0,boxShadow:'0 8px 24px rgba(255,101,63,.3)'}}>AK</div>
              <div style={{flex:1,minWidth:260}}>
                <div style={{fontSize:20,fontWeight:800,color:'#111'}}>Anil Kumar Mikkili</div>
                <div style={{fontSize:14,fontWeight:700,color:'#FF653F',marginBottom:10}}>Founder &amp; CEO</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
                  <span style={{fontSize:12,fontWeight:600,background:'#fff',border:'1px solid #e5e5e5',borderRadius:20,padding:'5px 12px',color:'#444'}}>🎓 Post Graduate — NIT Durgapur</span>
                  <span style={{fontSize:12,fontWeight:600,background:'#fff',border:'1px solid #e5e5e5',borderRadius:20,padding:'5px 12px',color:'#444'}}>💼 10+ years in IT</span>
                </div>
                <p style={{fontSize:14,color:'#555',lineHeight:1.8}}>
                  Anil brings over a decade of experience building scalable software and data systems across the IT industry.
                  A Post Graduate from NIT Durgapur, he founded MockTest to bridge the gap between expensive coaching and
                  quality preparation — using smart engines to generate unlimited, exam-accurate practice for every student, for free.
                  He leads the platform's product vision, engine architecture and overall direction.
                </p>
              </div>
            </div>

            <div style={{marginTop:28,background:'#111',borderRadius:18,padding:32,textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:10}}>Ready to start?</div>
              <div style={{fontSize:14,color:'rgba(255,255,255,.6)',marginBottom:24}}>Create a free account and take your first expert-crafted mock test right now.</div>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'14px 32px',fontSize:15}}>Create Free Account →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ STUDY COACH TAB ══ */}
      {tab==='ai-coach' && (
        <section style={{padding:'64px 32px',minHeight:'70vh',background:'#fafafa'}}>
          <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
            <div style={{fontSize:44,marginBottom:18}}>🧠</div>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:12,letterSpacing:'-0.5px'}}>Study Coach</h2>
            <p style={{fontSize:16,color:'#555',lineHeight:1.75,maxWidth:520,margin:'0 auto 36px'}}>Your personal study coach tracks your performance, identifies weak areas, and builds a customised study plan that adapts as you improve.</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18,marginBottom:36}}>
              {[{icon:'📊',t:'Performance Tracking',d:'Detailed accuracy reports per topic, section and difficulty level after every test.'},{icon:'🎯',t:'Weak Area Detection',d:'The system pinpoints exactly which topics need more practice and generates targeted questions.'},{icon:'📅',t:'Smart Study Plan',d:'10, 20 or 30-day personalised plans that adjust based on your daily performance.'}].map((f,i)=>(
                <div key={i} className="feat-card" style={{textAlign:'left'}}>
                  <div style={{fontSize:30,marginBottom:12}}>{f.icon}</div>
                  <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:8}}>{f.t}</div>
                  <div style={{fontSize:14,color:'#666',lineHeight:1.65}}>{f.d}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'16px 36px',fontSize:16}}>Get Your Free Study Plan →</button>
          </div>
        </section>
      )}

      {/* ══ MOCK TESTS TAB ══ */}
      {tab==='mock' && (
        <section style={{padding:'64px 32px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:40}}>
              <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:10,letterSpacing:'-0.5px'}}>Expert-Crafted Mock Tests</h2>
              <p style={{fontSize:16,color:'#555'}}>Every question generated fresh by our engines — no repeats, adaptive difficulty, real DI charts</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18,marginBottom:36}}>
              {[{icon:'∞',t:'Zero Repetition',d:'38 smart engines generate unique questions every session.'},{icon:'🧠',t:'Adaptive Difficulty',d:'Starts easy, progresses to hard as your accuracy improves.'},{icon:'📊',t:'Real DI Charts',d:'Interactive bar, pie, line charts in exam and PDF.'},{icon:'⏱',t:'Section Timers',d:'Per-section 20-minute countdown — exact IBPS/SBI format.'},{icon:'📄',t:'PDF Solutions',d:'Full solution PDF with charts and step-by-step working.'},{icon:'🎯',t:'Topic Practice',d:'35 topics. Practice 5–50 questions at any difficulty.'}].map((f,i)=>(
                <div key={i} className="feat-card" style={{textAlign:'left'}}>
                  <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
                  <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:7}}>{f.t}</div>
                  <div style={{fontSize:13,color:'#666',lineHeight:1.6}}>{f.d}</div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center'}}>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'15px 36px',fontSize:16}}>Start Free Mock Test →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ COURSES TAB ══ */}
      {tab==='courses' && (
        <section style={{padding:'64px 32px',minHeight:'70vh',background:'#fafafa'}}>
          <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:10,letterSpacing:'-0.5px'}}>Courses</h2>
            <p style={{fontSize:15,color:'#555',marginBottom:36}}>Comprehensive expert-led courses for every exam category</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
              {[{icon:'🏦',t:'Banking Courses',d:'IBPS, SBI, RRB — Prelims & Mains complete prep',status:'Live'},{icon:'📋',t:'SSC Courses',d:'CGL, CHSL, MTS — complete syllabus coverage',status:'Soon'},{icon:'🚂',t:'Railway Courses',d:'NTPC, Group D, ALP — all zones covered',status:'Soon'},{icon:'⚙',t:'Engineering',d:'JEE Main, JEE Advanced, GATE — all streams',status:'Soon'}].map((c,i)=>(
                <div key={i} style={{border:'2px solid',borderColor:c.status==='Live'?'#FF653F':'#e5e5e5',borderRadius:16,padding:22,background:'#fff',textAlign:'left',opacity:c.status==='Soon'?0.7:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <span style={{fontSize:30}}>{c.icon}</span>
                    <span style={{fontSize:11,fontWeight:700,background:c.status==='Live'?'#FFF3EE':'#f5f5f5',color:c.status==='Live'?'#FF653F':'#888',padding:'3px 10px',borderRadius:10}}>{c.status}</span>
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:7}}>{c.t}</div>
                  <div style={{fontSize:13,color:'#666',marginBottom:16}}>{c.d}</div>
                  {c.status==='Live' && <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'9px 20px',fontSize:13}}>Explore →</button>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ FEATURES TAB ══ */}
      {tab==='features' && (
        <section style={{padding:'64px 32px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1100,margin:'0 auto',textAlign:'center'}}>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:10,letterSpacing:'-0.5px'}}>Platform Features</h2>
            <p style={{fontSize:15,color:'#555',marginBottom:36}}>Everything you need for complete exam preparation</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
              {[{icon:'⚙️',t:'Question Engines',d:'38 topic-specific engines generating infinite unique questions'},{icon:'🎯',t:'Adaptive Learning',d:'Per-topic difficulty tracking with real-time adjustments'},{icon:'📊',t:'DI Chart Engine',d:'Interactive bar, pie, line charts in exam and PDF'},{icon:'⏱',t:'Exam Simulation',d:'Per-section timers, question palette, mark for review'},{icon:'📈',t:'Performance Analytics',d:'Section-wise, topic-wise accuracy and time analysis'},{icon:'📄',t:'Solution PDF',d:'Download full solutions with charts and explanations'},{icon:'🧠',t:'Study Planner',d:'10/20/30 day personalised study plans'},{icon:'🔔',t:'Progress Tracking',d:'Daily targets, streaks and achievement badges'},{icon:'💬',t:'Step-by-Step Solutions',d:'Every question explained with working shown'}].map((f,i)=>(
                <div key={i} className="feat-card" style={{textAlign:'left'}}>
                  <div style={{fontSize:26,marginBottom:10}}>{f.icon}</div>
                  <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:5}}>{f.t}</div>
                  <div style={{fontSize:13,color:'#666',lineHeight:1.55}}>{f.d}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:36}}>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'15px 36px',fontSize:16}}>Try All Features Free →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ SUCCESS STORIES TAB ══ */}
      {tab==='success' && (
        <section style={{padding:'64px 32px',minHeight:'70vh',background:'#fafafa'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:36}}>
              <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:8,letterSpacing:'-0.5px'}}>Success Stories</h2>
              <p style={{fontSize:15,color:'#555'}}>Students who cracked their exams with MockTest</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18}}>
              {[{n:'Priya S.',e:'IBPS Clerk 2024',t:'12 tests, zero repeated questions. The adaptive difficulty pushed me from easy to hard. Cleared cut-off in first attempt.',i:'PS',c:'#FF653F'},{n:'Rahul M.',e:'SBI PO 2024',t:'The section timers made the real exam feel very familiar. The DI charts look exactly like the actual SBI screen. Best free platform.',i:'RM',c:'#059669'},{n:'Deepa K.',e:'IBPS PO Mains',t:'The PDF solution is brilliant — actual bar charts with step-by-step working. I could identify every mistake before the real exam.',i:'DK',c:'#0891B2'},{n:'Amit S.',e:'RRB PO 2023',t:'I tried Adda247 and Oliveboard. MockTest questions are harder and more varied. And it is completely free — no subscription.',i:'AS',c:'#D97706'},{n:'Neha V.',e:'SBI Clerk 2024',t:'Career Tan tips are gold. The 60-day plan kept me on track. The adaptive mode knew exactly when to push me harder.',i:'NV',c:'#7C3AED'},{n:'Kiran P.',e:'IBPS Clerk 2024',t:'The puzzle and syllogism questions are at actual IBPS level. This platform really prepares you for the hard questions.',i:'KP',c:'#059669'}].map((t,i)=>(
                <div key={i} className="feat-card">
                  <div style={{color:'#FF653F',fontSize:15,letterSpacing:3,marginBottom:12}}>★★★★★</div>
                  <p style={{fontSize:14,color:'#444',lineHeight:1.75,marginBottom:18}}>{t.t}</p>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:38,height:38,borderRadius:'50%',background:t.c,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>{t.i}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'#111'}}>{t.n}</div>
                      <div style={{fontSize:12,color:'#888'}}>{t.e}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:36,textAlign:'center'}}>
              <button onClick={()=>onNav('auth')} className="btn-orange" style={{padding:'15px 36px',fontSize:16}}>Start Your Success Story →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══ BLOG TAB ══ */}
      {tab==='blog' && (
        <section style={{padding:'64px 32px',minHeight:'70vh',background:'#fff'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:36}}>
              <h2 style={{fontSize:36,fontWeight:800,color:'#111',marginBottom:8,letterSpacing:'-0.5px'}}>Blog & Resources</h2>
              <p style={{fontSize:15,color:'#555'}}>Study tips, exam updates and strategy guides</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18}}>
              {[{tag:'Strategy',t:'How to clear IBPS PO cut-off in Numerical Ability',d:'Section cut-offs are tougher than the overall cut-off. A topic-wise strategy that works.',date:'May 2026',c:'#FF653F'},{tag:'Exam Tips',t:'DI Sets: How to attempt 5 questions in under 4 minutes',d:'With the right approach, DI sets are free marks. Exactly how to tackle them.',date:'Apr 2026',c:'#059669'},{tag:'Smart Features',t:'How our 38 smart engines generate questions',d:'Behind-the-scenes look at how MockTest creates unique questions every session.',date:'Apr 2026',c:'#0891B2'},{tag:'Reasoning',t:'Floor puzzles solved: the 7-row table method',d:'Master floor puzzles in 10 minutes using this systematic approach.',date:'Mar 2026',c:'#D97706'},{tag:'GK',t:'RBI Monetary Policy 2026 — What you need to know',d:'Repo rate, reverse repo, CRR, SLR — complete update for IBPS Mains.',date:'Mar 2026',c:'#7C3AED'},{tag:'Career Tan',t:'60-day study plan for IBPS Clerk Prelims',d:'A day-by-day schedule with recommended question counts and revision checkpoints.',date:'Feb 2026',c:'#FF653F'}].map((p,i)=>(
                <div key={i} style={{border:'1.5px solid #e5e5e5',borderRadius:14,overflow:'hidden',background:'#fff',transition:'transform .15s,box-shadow .15s'}}
                  onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,.08)'}}
                  onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='none'}}>
                  <div style={{height:5,background:p.c}}/>
                  <div style={{padding:20}}>
                    <span style={{fontSize:11,fontWeight:700,background:`${p.c}18`,color:p.c,padding:'3px 10px',borderRadius:8,display:'inline-block',marginBottom:10}}>{p.tag}</span>
                    <div style={{fontSize:14,fontWeight:700,color:'#111',lineHeight:1.4,marginBottom:7}}>{p.t}</div>
                    <div style={{fontSize:12,color:'#666',lineHeight:1.6,marginBottom:10}}>{p.d}</div>
                    <div style={{fontSize:12,color:'#aaa'}}>{p.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


    </div>
  )
}

export default memo(LandingPage)
