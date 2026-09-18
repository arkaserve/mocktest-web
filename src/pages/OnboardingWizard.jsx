import { useState } from 'react'
import { supabase } from '../supabase.js'
import { toast } from '../toast.js'

/* ──────────────────────────────────────────────────────────────
   DATA
────────────────────────────────────────────────────────────── */
const EXAM_OPTIONS = [
  { id:'bank_clerk_prelims', label:'IBPS Clerk Prelims',   icon:'🏦', sub:'100Q · 60 min · 3 sections',  color:'#3B5BDB', bg:'#EEF0FF', live:true  },
  { id:'bank_clerk_mains',   label:'IBPS Clerk Mains',     icon:'🏦', sub:'175Q · 160 min · 4 sections', color:'#3B5BDB', bg:'#EEF0FF', live:true  },
  { id:'bank_po_prelims',    label:'IBPS PO Prelims',      icon:'🏦', sub:'100Q · 60 min · 3 sections',  color:'#3B5BDB', bg:'#EEF0FF', live:true  },
  { id:'bank_po_mains',      label:'IBPS PO Mains',        icon:'🏦', sub:'175Q · 180 min · 5 sections', color:'#3B5BDB', bg:'#EEF0FF', live:true  },
  { id:'sbi_clerk_prelims',  label:'SBI Clerk Prelims',    icon:'🏛', sub:'100Q · 60 min · 3 sections',  color:'#0891B2', bg:'#ECFEFF', live:true  },
  { id:'sbi_po_prelims',     label:'SBI PO Prelims',       icon:'🏛', sub:'100Q · 60 min · 3 sections',  color:'#0891B2', bg:'#ECFEFF', live:true  },
  { id:'rrb_office_assistant_prelims', label:'RRB Office Assistant', icon:'🚂', sub:'80Q · 45 min · 2 sections', color:'#16A34A', bg:'#DCFCE7', live:true  },
  { id:'rrb_officer_scale1_prelims',  label:'RRB Officer Scale-I',  icon:'🚂', sub:'80Q · 45 min · 2 sections', color:'#16A34A', bg:'#DCFCE7', live:true  },
  { id:'ssc_cgl_tier1',      label:'SSC CGL Tier I',       icon:'📋', sub:'100Q · 60 min · 4 sections',   color:'#7C3AED', bg:'#F5F3FF', live:true  },
  { id:'ap_eamcet_engg',     label:'AP EAMCET Engineering', icon:'🔬', sub:'160Q · 180 min · 3 sections',  color:'#7C3AED', bg:'#F5F3FF', live:true  },
  { id:'ts_eamcet_engg',     label:'TS EAMCET Engineering', icon:'🔬', sub:'160Q · 180 min · 3 sections',  color:'#7C3AED', bg:'#F5F3FF', live:true  },
  { id:'jee_mains',          label:'JEE Mains',             icon:'⚙',  sub:'Coming soon',                  color:'#94A3B8', bg:'#F1F5F9', live:false },
]

const LEVELS = [
  { id:'beginner',     label:'Beginner',     sub:'Just starting out',              icon:'🌱', desc:'I need to build basics from scratch' },
  { id:'intermediate', label:'Intermediate', sub:'Know the syllabus',              icon:'📈', desc:'I can attempt questions but need speed' },
  { id:'advanced',     label:'Advanced',     sub:'Appearing soon, need fine-tuning',icon:'🎯', desc:'I want to close weak gaps and ace mocks' },
]

const TOPIC_GROUPS = [
  {
    section: 'Quantitative Aptitude', color:'#3B5BDB', bg:'#EEF0FF',
    topics: ['Simplification','Number Series','Quadratic Equations','Data Interpretation','Percentage','Ratio & Proportion','Profit & Loss','Time & Work','Time & Distance','Simple & Compound Interest','Mensuration'],
  },
  {
    section: 'Reasoning Ability', color:'#7048E8', bg:'#F3F0FF',
    topics: ['Puzzles & Seating','Syllogism','Inequality','Blood Relations','Coding-Decoding','Direction Sense','Order & Ranking','Floor Puzzles','Input-Output'],
  },
  {
    section: 'English Language', color:'#0891B2', bg:'#ECFEFF',
    topics: ['Reading Comprehension','Cloze Test','Error Detection','Para Jumbles','Fill in the Blanks','Sentence Improvement','Word Usage'],
  },
  {
    section: 'General Awareness', color:'#D97706', bg:'#FFF7ED',
    topics: ['Current Affairs','Banking Awareness','RBI & Monetary Policy','Financial Terms','Government Schemes','Static GK'],
  },
]

/* section label → key used when saving weak topics grouped by section */
const SECTION_KEY = {
  'Quantitative Aptitude': 'arithmetic',
  'Reasoning Ability':     'reasoning',
  'English Language':      'english',
  'General Awareness':     'general_awareness',
}

/* turn the flat weakTopics array into { section: [topics] } */
function groupWeakTopics(weakTopics) {
  const grouped = {}
  TOPIC_GROUPS.forEach(g => {
    const picked = g.topics.filter(t => weakTopics.includes(t))
    if (picked.length) grouped[SECTION_KEY[g.section] || g.section] = picked
  })
  return grouped
}

const HOURS_OPTIONS = [
  { val:1, label:'1 hr/day',  sub:'Light schedule' },
  { val:2, label:'2 hrs/day', sub:'Steady pace' },
  { val:3, label:'3 hrs/day', sub:'Focused prep' },
  { val:4, label:'4 hrs/day', sub:'Intensive' },
  { val:5, label:'5+ hrs/day',sub:'Full-time prep' },
]

const STEP_META = [
  { n:1, title:'Choose Exam',       sub:'What are you preparing for?'         },
  { n:2, title:'Your Profile',      sub:'Tell us about your preparation'      },
  { n:3, title:'Weak Topics',       sub:'Where do you need the most help?'    },
  { n:4, title:'Your Study Plan',   sub:'expert-crafted plan just for you'      },
]

/* ──────────────────────────────────────────────────────────────
   PLAN GENERATOR — deterministic, no API needed
────────────────────────────────────────────────────────────── */
function generatePlan({ exam, examDate, hoursPerDay, level, weakTopics }) {
  const today = new Date()
  const target = new Date(examDate)
  const totalDays = Math.max(7, Math.round((target - today) / (1000 * 60 * 60 * 24)))
  const cappedDays = Math.min(totalDays, 60)

  // Distribute days
  const revisionDays = Math.max(3, Math.round(cappedDays * 0.15))
  const mockDays     = Math.max(2, Math.round(cappedDays * 0.20))
  const studyDays    = cappedDays - revisionDays - mockDays

  // Prioritise weak topics, then fill with remaining
  const allTopics = TOPIC_GROUPS.flatMap(g => g.topics)
  const priority  = allTopics.filter(t => weakTopics.includes(t))
  const rest      = allTopics.filter(t => !weakTopics.includes(t))
  const ordered   = [...priority, ...rest]

  // Build day-by-day (first 14 days shown in UI)
  const days = []
  let topicIdx = 0
  for (let i = 0; i < cappedDays; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i)
    const dow = d.getDay()
    const dayNum = i + 1

    // Mock test days: every 5th study day + weekends in later half
    const isMock     = (dayNum % 5 === 0) && dayNum > studyDays * 0.5
    const isRevision = dayNum > studyDays + mockDays

    let type, topics, duration
    if (isRevision) {
      type     = 'revision'
      topics   = ['Full Revision + Mock']
      duration = `${hoursPerDay}h revision`
    } else if (isMock) {
      type     = 'mock'
      topics   = ['Full Mock Test']
      duration = '2h exam + 1h analysis'
    } else {
      type     = 'study'
      const count = level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 2
      topics   = ordered.slice(topicIdx, topicIdx + count)
      topicIdx = (topicIdx + count) % ordered.length
      duration = `${hoursPerDay}h study`
    }

    days.push({ day: dayNum, date: d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}), type, topics, duration })
  }

  return {
    totalDays: cappedDays,
    studyDays,
    mockDays,
    revisionDays,
    topicsPerDay: level === 'beginner' ? 1 : 2,
    hoursPerDay,
    days,
  }
}

/* ──────────────────────────────────────────────────────────────
   MAIN COMPONENT
   Props:
     user     — Supabase user object (from AuthScreen's onAuth)
     onDone   — called when wizard completes → go to Dashboard
     onSkip   — called when user skips → go to Dashboard with no plan
────────────────────────────────────────────────────────────── */
export default function OnboardingWizard({ user, onDone, onSkip, onRouteToPayment }) {
  const [step,        setStep]       = useState(1)
  const [exams,       setExams]      = useState([])   // multi-select array
  const [freeExam,    setFreeExam]   = useState(null) // single exam kept after "Continue with Free"
  const [subPopup,    setSubPopup]   = useState(null) // 'intermediate' | 'advanced' | null
  const [pendingExam, setPendingExam]= useState(null) // exam awaiting popup decision
  const [examDate,    setExamDate]   = useState('')
  const [hoursPerDay, setHoursPerDay]= useState(2)
  const [level,       setLevel]      = useState('')
  const [weakTopics,  setWeakTopics] = useState([])
  const [saving,      setSaving]     = useState(false)
  const [saved,       setSaved]      = useState(false)   // success confirmation
  const [plan,        setPlan]       = useState(null)

  const selectedExam  = EXAM_OPTIONS.find(e => e.id === exams[0]) // primary exam for plan
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 7)
  const minDateStr = minDate.toISOString().split('T')[0]

  const toggleTopic = (t) =>
    setWeakTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  /* Step validation */
  /* Rule: step 1 only passes if exactly 1 exam active on free plan.
     2+ exams with no freeExam set = student dismissed popup without
     upgrading or dropping to free → BLOCK, show force-choice banner. */
  const multiBlocked = step === 1 && exams.length > 1 && !freeExam

  const canNext = () => {
    if (step === 1) {
      if (multiBlocked) return false                      // blocked — must choose
      const active = freeExam ? [freeExam] : exams
      return active.length === 1
        && !!EXAM_OPTIONS.find(e => e.id === active[0])?.live
    }
    if (step === 2) return !!examDate          // level is optional now
    if (step === 3) return true                // weak topics are optional now
    return false
  }

  const goNext = () => {
    if (step === 3) {
      const p = generatePlan({ exam: (freeExam || exams[0]), examDate, hoursPerDay, level, weakTopics })
      setPlan(p)
      setStep(4)
    } else {
      setStep(s => s + 1)
    }
  }

  /* Skip — capture whatever the student has entered so far, then leave */
  const handleSkip = async () => {
    try {
      const primary = freeExam || exams[0] || null
      const { error: obErr } = await supabase.from('student_onboarding').upsert({
        student_id:     user.id,
        phone:          user?.user_metadata?.phone || null,
        exam_id:        primary,
        selected_exams: freeExam ? [freeExam] : exams,
        exam_date:      examDate || null,
        hours_per_day:  hoursPerDay || null,
        level:          level || null,
        weak_topics:    groupWeakTopics(weakTopics),
        onboarding_done:false,
        updated_at:     new Date().toISOString(),
      }, { onConflict: 'student_id' })
      if (obErr) console.error('student_onboarding skip save failed:', obErr.message, obErr.details, obErr.hint)
    } catch (e) { console.error('Onboarding skip save error:', e) }
    onSkip()
  }

  /* Save to Supabase + finish */
  const handleFinish = async () => {
    setSaving(true)
    try {
      // Delete old plan then insert fresh
      await supabase.from('study_plans').delete().eq('user_id', user.id)
      await supabase.from('study_plans').insert({
        user_id:      user.id,
        exam_id:      freeExam || exams[0],
        exam_date:    examDate,
        hours_per_day:hoursPerDay,
        level,
        weak_topics:  weakTopics,
        plan_json:    plan,
        created_at:   new Date().toISOString(),
      })
      // Capture the student's onboarding inputs (one row per student)
      const { error: obErr } = await supabase.from('student_onboarding').upsert({
        student_id:     user.id,
        phone:          user?.user_metadata?.phone || null,
        exam_id:        freeExam || exams[0],
        selected_exams: freeExam ? [freeExam] : exams,
        exam_date:      examDate || null,
        hours_per_day:  hoursPerDay,
        level:          level || null,
        weak_topics:    groupWeakTopics(weakTopics),
        onboarding_done:true,
        updated_at:     new Date().toISOString(),
      }, { onConflict: 'student_id' })
      if (obErr) {
        console.error('student_onboarding save failed:', obErr.message, obErr.details, obErr.hint)
        toast('Onboarding save failed: ' + obErr.message, 'error')
      }

      await supabase.auth.updateUser({
        data: { onboarding_complete: true, target_exam: freeExam || exams[0], selected_exams: freeExam ? [freeExam] : exams, level }
      })
    } catch (e) {
      console.error('Plan save error:', e)
    }
    setSaving(false)
    // Show success confirmation, then route to dashboard
    setSaved(true)
    setTimeout(() => {
      onDone({ exam: freeExam || exams[0], exams: freeExam ? [freeExam] : exams, examDate, hoursPerDay, level, weakTopics, plan })
    }, 1800)
  }

  /* Progress bar width */
  const progress = ((step - 1) / (STEP_META.length - 1)) * 100

  return (
    <div style={{height:'100vh',overflow:'hidden',background:'#ffffff',fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",color:'#1a1a2e',display:'flex',flexDirection:'column'}}>

      {/* ── SUCCESS CONFIRMATION OVERLAY ── */}
      {saved && (
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(255,255,255,.96)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{textAlign:'center',maxWidth:420}}>
            <div style={{width:84,height:84,borderRadius:'50%',background:'#FFF3EE',border:'2px solid #fec9b0',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',animation:'pop .4s ease'}}>
              <span style={{fontSize:42,color:'#FF653F',fontWeight:900,lineHeight:1}}>✓</span>
            </div>
            <h2 style={{fontSize:24,fontWeight:800,color:'#1a1a2e',marginBottom:8,letterSpacing:'-0.5px'}}>
              Your study plan is ready! 🎉
            </h2>
            <p style={{fontSize:14,color:'#6b7280',lineHeight:1.6}}>
              We've saved your exam, schedule and focus topics. Taking you to your dashboard…
            </p>
            <div style={{marginTop:18}}>
              <span style={{display:'inline-block',width:22,height:22,border:'3px solid #fde2d6',borderTopColor:'#FF653F',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div className="ob-topbar" style={{background:'#111',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,background:'#FF653F',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:800}}>MT</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:'#fff',lineHeight:1.1}}>MockTest</div>
            <div style={{fontSize:10,color:'#888'}}>by Arkaserve</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{fontSize:12,color:'rgba(255,255,255,.7)'}}>
            Hi {user?.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋
          </span>
          <button
            onClick={handleSkip}
            style={{fontSize:12,color:'rgba(255,255,255,.6)',background:'none',border:'none',cursor:'pointer'}}
          >Skip for now →</button>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div style={{height:4,background:'#e8eaed',flexShrink:0}}>
        <div style={{height:'100%',background:'#FF653F',width:`${progress}%`,transition:'width .4s ease',borderRadius:'0 2px 2px 0'}}/>
      </div>

      {/* ── STEP INDICATORS ── */}
      <div style={{display:'flex',justifyContent:'center',gap:0,padding:'14px 0 0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:0}}>
          {STEP_META.map((s, i) => (
            <div key={s.n} style={{display:'flex',alignItems:'center'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{
                  width:34,height:34,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:13,fontWeight:700,transition:'all .3s',
                  background: step >= s.n ? '#FF653F' : '#fff',
                  border: step >= s.n ? 'none' : '1.5px solid #e0e3e8',
                  color:      step >= s.n ? '#fff' : '#9ca3af',
                  boxShadow:  step === s.n ? '0 0 0 4px rgba(255,107,53,.18)' : 'none',
                }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="ob-steplabel" style={{fontSize:11,fontWeight:600,color:step===s.n?'#FF653F':step>s.n?'#374151':'#9ca3af',whiteSpace:'nowrap'}}>{s.title}</span>
              </div>
              {i < STEP_META.length - 1 && (
                <div className="ob-connector" style={{width:80,height:2,background:step > s.n ? '#FF653F' : '#e8eaed',margin:'0 8px',marginBottom:18,transition:'background .3s'}}/>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="ob-content" style={{flex:1,minHeight:0,display:'flex',flexDirection:'column',alignItems:'center',padding:'24px 24px 32px',overflowY:'auto'}}>

        {/* Step header — Neil Patel style: big bold, last word orange */}
        <div style={{textAlign:'center',marginBottom:26,maxWidth:600}}>
          <h2 style={{fontSize:34,fontWeight:800,color:'#1a1a2e',marginBottom:8,letterSpacing:'-0.8px',lineHeight:1.1}}>
            {(() => {
              const words = STEP_META[step-1].title.split(' ')
              const last  = words.pop()
              return <>{words.join(' ')} <span style={{color:'#FF653F'}}>{last}</span></>
            })()}
          </h2>
          <p style={{fontSize:16,color:'#6b7280',lineHeight:1.5}}>{STEP_META[step-1].sub}</p>
        </div>

        {/* ─── STEP 1 — Choose Exam ─── */}
        {step === 1 && (
          <div style={{width:'100%',maxWidth:720}}>

            {/* ── Force-choice banner (TOP) — shown when 2+ exams selected on free ── */}
            {multiBlocked && (
              <div style={{
                background:'#FFF7ED',border:'2px solid #FED7AA',borderRadius:16,
                padding:'18px 20px',marginBottom:16,
              }}>
                <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14}}>
                  <span style={{fontSize:22,flexShrink:0}}>⚠️</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:'#92400E',marginBottom:4}}>
                      You've selected {exams.length} exams — choose one option to continue
                    </div>
                    <div style={{fontSize:12,color:'#B45309',lineHeight:1.6}}>
                      The free plan supports 1 exam only. Either upgrade your plan or continue with just 1 exam.
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  <button
                    onClick={() => { const first = exams[0]; setFreeExam(first); setExams([first]) }}
                    style={{flex:'1 1 200px',padding:'11px 0',border:'2px solid #16A34A',borderRadius:11,background:'#F0FDF4',color:'#15803D',fontSize:12,fontWeight:700,cursor:'pointer',lineHeight:1.5}}>
                    ✓ Continue Free<br/>
                    <span style={{fontSize:10,fontWeight:400,color:'#16A34A'}}>Keep "{EXAM_OPTIONS.find(e=>e.id===exams[0])?.label}" only</span>
                  </button>
                  <button
                    onClick={() => { const plan = exams.length >= 3 ? 'advanced' : 'intermediate'; if (onRouteToPayment) onRouteToPayment(plan) }}
                    style={{flex:'1 1 200px',padding:'11px 0',border:'none',borderRadius:11,background:'#FF653F',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',lineHeight:1.5}}>
                    🚀 Upgrade Plan<br/>
                    <span style={{fontSize:10,fontWeight:400,opacity:.85}}>
                      {exams.length >= 3 ? 'Advanced — ₹1,199/3mo' : 'Intermediate — ₹499/mo'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Tier info bar */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12,marginBottom:14}}>
              {[
                { tier:'Free',         color:'#16A34A', exams:'1 exam',   desc:'Get started — always free' },
                { tier:'Intermediate', color:'#FF653F', exams:'2 exams',  desc:'Dual-exam preparation' },
                { tier:'Advanced',     color:'#7048E8', exams:'3+ exams', desc:'Full multi-exam mastery' },
              ].map(t => {
                const activeCount = freeExam ? 1 : exams.length
                const isActive =
                  (t.tier==='Free'         && activeCount <= 1) ||
                  (t.tier==='Intermediate' && activeCount === 2) ||
                  (t.tier==='Advanced'     && activeCount >= 3)
                return (
                  <div key={t.tier} style={{
                    background:'#fff', border:`1.5px solid ${isActive?t.color:'#eceef1'}`,
                    borderRadius:12, padding:'13px 16px', textAlign:'center',
                    transition:'all .2s',
                    boxShadow: isActive ? `0 8px 20px ${t.color}22` : '0 2px 10px rgba(17,17,17,.05)',
                  }}>
                    <div style={{fontSize:12,fontWeight:700,color:t.color,marginBottom:2}}>{t.tier}</div>
                    <div style={{fontSize:14,fontWeight:800,color:'#1a1a2e',marginBottom:2}}>{t.exams}</div>
                    <div style={{fontSize:11,color:'#6b7280',lineHeight:1.35}}>{t.desc}</div>
                  </div>
                )
              })}
            </div>

            {/* Status bar */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,padding:'10px 14px',background:'#fff',borderRadius:10,border:'1px solid #eceef1',boxShadow:'0 2px 10px rgba(17,17,17,.05)'}}>
              <span style={{fontSize:12.5,color:'#374151',fontWeight:600}}>
                {freeExam
                  ? `✓ Free plan — 1 exam selected (others locked)`
                  : exams.length === 0
                    ? 'Select at least 1 exam to continue'
                    : exams.length === 1
                      ? '✓ 1 exam — Free tier'
                      : exams.length === 2
                        ? '2 exams selected — Intermediate plan required'
                        : `${exams.length} exams — Advanced plan required`
                }
              </span>
              {(exams.length > 0 || freeExam) && (
                <button onClick={() => { setExams([]); setFreeExam(null) }}
                  style={{fontSize:11,color:'#ef4444',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>
                  Clear
                </button>
              )}
            </div>

            {/* Exam cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}>
              {EXAM_OPTIONS.map(e => {
                const selected  = exams.includes(e.id) || freeExam===e.id
                // If student chose "Continue with Free", lock all except freeExam
                const locked    = !!freeExam && freeExam !== e.id
                const isDisabled = !e.live || locked

                return (
                  <button
                    key={e.id}
                    onClick={() => {
                      if (!e.live) return
                      if (locked) {
                        // user changed their mind — unlock and add this exam too
                        setFreeExam(null)
                        setExams(prev => [...prev, e.id])
                        return
                      }

                      if (selected) {
                        // Deselect — remove from array, clear freeExam if it was this one
                        setExams(prev => prev.filter(id => id !== e.id))
                        if (freeExam === e.id) setFreeExam(null)
                        return
                      }
                      // Add exam. The inline banner at the top handles the
                      // upgrade / continue-free choice when 2+ are selected.
                      setFreeExam(null)
                      setExams(prev => [...prev, e.id])
                    }}
                    onMouseOver={ev => {
                      if (isDisabled || selected) return
                      ev.currentTarget.style.borderColor = '#FF653F'
                      ev.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,53,.16)'
                      ev.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseOut={ev => {
                      if (isDisabled || selected) return
                      ev.currentTarget.style.borderColor = '#e8eaed'
                      ev.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,.04)'
                      ev.currentTarget.style.transform = 'translateY(0)'
                    }}
                    style={{
                      display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
                      border:'1.5px solid',
                      borderColor: locked ? '#eef0f3' : selected ? '#FF653F' : '#e8eaed',
                      borderRadius:14,
                      background: locked ? '#ffffff' : selected ? '#FFF3EE' : '#fff',
                      cursor: !e.live ? 'not-allowed' : 'pointer',
                      opacity: !e.live ? 0.5 : locked ? 0.55 : 1,
                      transition:'all .18s ease',
                      textAlign:'left',
                      position:'relative',
                      boxShadow: selected ? '0 8px 22px rgba(255,107,53,.20)' : '0 2px 10px rgba(17,17,17,.06)',
                    }}
                  >
                    <div style={{width:40,height:40,borderRadius:11,background: selected?'#fff':'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,border:'1px solid #e8eaed'}}>
                      {e.icon}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color: locked?'#9ca3af':'#1a1a2e',marginBottom:2}}>{e.label}</div>
                      <div style={{fontSize:12,color:'#6b7280'}}>{locked ? 'Locked — upgrade to unlock' : e.sub}</div>
                    </div>
                    {selected && !locked && (
                      <div style={{width:22,height:22,borderRadius:'50%',background:'#FF653F',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <span style={{color:'#fff',fontSize:11,fontWeight:700}}>✓</span>
                      </div>
                    )}
                    {locked && (
                      <div style={{width:22,height:22,borderRadius:'50%',background:'#e8eaed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11}}>
                        🔒
                      </div>
                    )}
                    {!e.live && (
                      <span style={{position:'absolute',top:8,right:8,fontSize:9,fontWeight:700,background:'#FFF4E6',color:'#D4721B',padding:'2px 6px',borderRadius:8}}>Soon</span>
                    )}
                  </button>
                )
              })}
            </div>


          </div>
        )}

        {/* ─── STEP 2 — Profile ─── */}
        {step === 2 && (
          <div style={{width:'100%',maxWidth:560,display:'flex',flexDirection:'column',gap:24}}>

            {/* Exam date */}
            <div>
              <label style={{display:'block',fontSize:14,fontWeight:700,color:'#1a1a2e',marginBottom:10}}>
                📅 When is your exam?
              </label>
              <input
                type="date"
                min={minDateStr}
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                style={{width:'100%',padding:'13px 16px',border:'1.5px solid #e8eaed',borderRadius:12,fontSize:14,color:'#1a1a2e',background:'#fff',outline:'none',cursor:'pointer'}}
              />
              {examDate && (
                <div style={{marginTop:8,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                  <span style={{fontSize:13,color:'#FF653F',fontWeight:700}}>
                    {Math.round((new Date(examDate)-new Date())/(1000*60*60*24))} days to go
                  </span>
                  <span style={{fontSize:13,color:'#9ca3af'}}>— We will build your plan around this</span>
                </div>
              )}
            </div>

            {/* Hours per day */}
            <div>
              <label style={{display:'block',fontSize:14,fontWeight:700,color:'#1a1a2e',marginBottom:10}}>
                ⏱ How many hours can you study per day?
              </label>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {HOURS_OPTIONS.map(h => {
                  const on = hoursPerDay===h.val
                  return (
                  <button
                    key={h.val}
                    onClick={() => setHoursPerDay(h.val)}
                    style={{
                      flex:'1 1 96px',padding:'11px 14px',border:'1.5px solid',
                      borderColor: on ? '#FF653F' : '#e8eaed',
                      borderRadius:12,background: on ? '#FFF3EE' : '#fff',
                      cursor:'pointer',transition:'all .2s',textAlign:'center',
                      boxShadow: on ? '0 4px 14px rgba(255,107,53,.16)' : 'none',
                    }}
                  >
                    <div style={{fontSize:14,fontWeight:700,color: on ? '#FF653F' : '#1a1a2e'}}>{h.label}</div>
                    <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>{h.sub}</div>
                  </button>
                )})}
              </div>
            </div>

            {/* Level */}
            <div>
              <label style={{display:'block',fontSize:14,fontWeight:700,color:'#1a1a2e',marginBottom:10}}>
                🎓 What's your current preparation level? <span style={{color:'#9ca3af',fontWeight:500}}>(optional)</span>
              </label>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {LEVELS.map(l => {
                  const on = level===l.id
                  return (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    style={{
                      display:'flex',alignItems:'center',gap:14,padding:'15px 18px',
                      border:'1.5px solid', borderColor: on ? '#FF653F' : '#e8eaed',
                      borderRadius:14,background: on ? '#FFF3EE' : '#fff',
                      cursor:'pointer',transition:'all .2s',textAlign:'left',
                      boxShadow: on ? '0 4px 14px rgba(255,107,53,.16)' : 'none',
                    }}
                  >
                    <span style={{fontSize:24,flexShrink:0}}>{l.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color: on ? '#FF653F' : '#1a1a2e'}}>{l.label}</div>
                      <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>{l.desc}</div>
                    </div>
                    {on && (
                      <div style={{width:22,height:22,borderRadius:'50%',background:'#FF653F',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <span style={{color:'#fff',fontSize:12,fontWeight:700}}>✓</span>
                      </div>
                    )}
                  </button>
                )})}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3 — Weak Topics ─── */}
        {step === 3 && (
          <div style={{width:'100%',maxWidth:720}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <span style={{fontSize:13,color:'#6b7280',fontWeight:600}}>{weakTopics.length} topics selected</span>
              {weakTopics.length > 0 && (
                <button onClick={() => setWeakTopics([])} style={{fontSize:13,color:'#FF653F',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Clear all</button>
              )}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {TOPIC_GROUPS.map(group => (
                <div key={group.section} style={{background:'#fff',border:'1px solid #eceef1',borderRadius:14,overflow:'hidden',boxShadow:'0 2px 10px rgba(17,17,17,.05)'}}>
                  <div style={{padding:'10px 16px',background:group.bg,borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:8,height:8,borderRadius:'50%',background:group.color,display:'inline-block'}}/>
                    <span style={{fontSize:12,fontWeight:700,color:group.color}}>{group.section}</span>
                  </div>
                  <div style={{padding:'12px 16px',display:'flex',flexWrap:'wrap',gap:8}}>
                    {group.topics.map(topic => {
                      const sel = weakTopics.includes(topic)
                      return (
                        <button
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          style={{
                            display:'inline-flex',alignItems:'center',gap:7,
                            padding:'8px 14px',fontSize:12.5,fontWeight:700,
                            border:'1.5px solid', borderColor: sel ? '#1a1a2e' : '#d1d5db',
                            borderRadius:10,
                            background: sel ? '#1a1a2e' : '#fff',
                            color: sel ? '#FF653F' : '#475569',
                            cursor:'pointer',transition:'all .15s',
                            boxShadow: sel ? '0 4px 12px rgba(0,0,0,.25)' : 'none',
                          }}
                        >
                          <span style={{
                            width:16,height:16,borderRadius:5,display:'inline-flex',alignItems:'center',justifyContent:'center',
                            fontSize:11,fontWeight:800,flexShrink:0,
                            background: sel ? '#FF653F' : '#f1f5f9',
                            color: sel ? '#fff' : '#94a3b8',
                          }}>{sel ? '✓' : '+'}</span>
                          {topic}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p style={{fontSize:11,color:'#94a3b8',textAlign:'center',marginTop:12}}>
              Optional — pick any topics you struggle with and they'll get extra days. You can skip this.
            </p>
          </div>
        )}

        {/* ─── STEP 4 — Generated Plan ─── */}
        {step === 4 && plan && (
          <div style={{width:'100%',maxWidth:760}}>

            {/* Summary cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:14}}>
              {[
                { label:'Total Days',      value:plan.totalDays,    icon:'📅', color:'#FF653F', bg:'#FFF3EE' },
                { label:'Study Days',      value:plan.studyDays,    icon:'📖', color:'#7048E8', bg:'#F3F0FF' },
                { label:'Mock Tests',      value:plan.mockDays,     icon:'📝', color:'#0891B2', bg:'#ECFEFF' },
                { label:'Revision Days',   value:plan.revisionDays, icon:'🔁', color:'#16A34A', bg:'#DCFCE7' },
              ].map(c => (
                <div key={c.label} style={{background:'#fff',border:'1px solid #eceef1',borderRadius:14,padding:'14px 16px',textAlign:'center',boxShadow:'0 2px 10px rgba(17,17,17,.05)'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,margin:'0 auto 8px'}}>{c.icon}</div>
                  <div style={{fontSize:22,fontWeight:800,color:c.color,lineHeight:1}}>{c.value}</div>
                  <div style={{fontSize:10,color:'#94a3b8',marginTop:4,fontWeight:500}}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Info bar */}
            <div style={{display:'flex',gap:12,marginBottom:14,flexWrap:'wrap'}}>
              <div style={{flex:1,background:'#FFF3EE',border:'1px solid #fec9b0',borderRadius:10,padding:'10px 14px',minWidth:160}}>
                <span style={{fontSize:11,color:'#64748b'}}>Exam</span>
                <div style={{fontSize:13,fontWeight:700,color:'#FF653F',marginTop:2}}>{selectedExam?.label}</div>
              </div>
              <div style={{flex:1,background:'#FFF7ED',border:'1px solid #FED7AA',borderRadius:10,padding:'10px 14px',minWidth:160}}>
                <span style={{fontSize:11,color:'#64748b'}}>Exam Date</span>
                <div style={{fontSize:13,fontWeight:700,color:'#D97706',marginTop:2}}>{new Date(examDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
              </div>
              <div style={{flex:1,background:'#F0FDF4',border:'1px solid #A7F3D0',borderRadius:10,padding:'10px 14px',minWidth:160}}>
                <span style={{fontSize:11,color:'#64748b'}}>Daily Goal</span>
                <div style={{fontSize:13,fontWeight:700,color:'#16A34A',marginTop:2}}>{plan.hoursPerDay} hrs · {plan.topicsPerDay} topic{plan.topicsPerDay>1?'s':''}/day</div>
              </div>
              <div style={{flex:1,background:'#F5F3FF',border:'1px solid #DDD6FE',borderRadius:10,padding:'10px 14px',minWidth:160}}>
                <span style={{fontSize:11,color:'#64748b'}}>Level</span>
                <div style={{fontSize:13,fontWeight:700,color:'#7048E8',marginTop:2,textTransform:'capitalize'}}>{level}</div>
              </div>
            </div>

            {/* Day-by-day schedule — first 14 days */}
            <div style={{background:'#fff',border:'1px solid #eceef1',borderRadius:16,overflow:'hidden',marginBottom:16,boxShadow:'0 2px 10px rgba(17,17,17,.05)'}}>
              <div style={{padding:'12px 18px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>📅 First 14 Days Preview</span>
                <span style={{fontSize:11,color:'#94a3b8'}}>Full plan saved to your dashboard</span>
              </div>
              <div className="ob-content" style={{maxHeight:230,overflowY:'auto'}}>
                {plan.days.slice(0,14).map(d => (
                  <div key={d.day} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 18px',borderBottom:'1px solid #f8faff'}}>
                    <div style={{
                      width:32,height:32,borderRadius:8,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,
                      background: d.type==='mock' ? '#ECFEFF' : d.type==='revision' ? '#DCFCE7' : '#FFF3EE',
                      color:      d.type==='mock' ? '#0891B2' : d.type==='revision' ? '#16A34A' : '#FF653F',
                    }}>
                      D{d.day}
                    </div>
                    <div style={{width:100,flexShrink:0}}>
                      <div style={{fontSize:11,color:'#64748b'}}>{d.date}</div>
                    </div>
                    <div style={{flex:1,display:'flex',gap:6,flexWrap:'wrap'}}>
                      {d.topics.map(t => (
                        <span key={t} style={{
                          fontSize:11,fontWeight:600,padding:'3px 8px',borderRadius:20,
                          background: d.type==='mock' ? '#ECFEFF' : d.type==='revision' ? '#DCFCE7' : '#EEF0FF',
                          color:      d.type==='mock' ? '#0891B2' : d.type==='revision' ? '#16A34A' : '#3B5BDB',
                        }}>{t}</span>
                      ))}
                    </div>
                    <div style={{fontSize:11,color:'#94a3b8',flexShrink:0,whiteSpace:'nowrap'}}>
                      {d.type==='mock' ? '📝 Mock' : d.type==='revision' ? '🔁 Revision' : '📖 Study'} · {d.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak topics recap */}
            {weakTopics.length > 0 && (
              <div style={{background:'#FFF7ED',border:'1px solid #FED7AA',borderRadius:12,padding:'12px 16px',marginBottom:20}}>
                <div style={{fontSize:12,fontWeight:700,color:'#D97706',marginBottom:8}}>⚡ Extra focus topics in your plan:</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {weakTopics.map(t => (
                    <span key={t} style={{fontSize:11,fontWeight:600,background:'#FEF3C7',color:'#92400E',padding:'3px 8px',borderRadius:20}}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Finish button */}
            <button
              onClick={handleFinish}
              disabled={saving}
              onMouseOver={ev => { if (!saving) ev.currentTarget.style.background='#e5512f' }}
              onMouseOut={ev => { if (!saving) ev.currentTarget.style.background='#FF653F' }}
              style={{
                width:'100%',padding:'15px 0',
                background:'#FF653F',
                color:'#fff',border:'none',borderRadius:14,
                fontSize:15,fontWeight:700,cursor:'pointer',
                boxShadow:'0 6px 20px rgba(255,107,53,.35)',
                display:'flex',alignItems:'center',justifyContent:'center',gap:10,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving
                ? <><span style={{width:16,height:16,border:'2.5px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/>Saving your plan...</>
                : <>🚀 Start My Study Plan →</>
              }
            </button>
            <p style={{textAlign:'center',fontSize:11,color:'#94a3b8',marginTop:10}}>
              Your full {plan.totalDays}-day plan will be available on your dashboard at any time.
            </p>
          </div>
        )}

        {/* ── NAVIGATION BUTTONS (steps 1-3) ── */}
        {step < 4 && (
          <div style={{width:'100%',maxWidth:680,marginTop:28}}>

            {/* Normal prev / dots / next row */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <button
                onClick={() => step > 1 ? setStep(s => s-1) : handleSkip()}
                style={{padding:'12px 26px',border:'1.5px solid #e0e3e8',borderRadius:12,background:'#fff',fontSize:14,fontWeight:600,color:'#6b7280',cursor:'pointer'}}
              >
                {step === 1 ? 'Skip for now' : '← Back'}
              </button>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{width:i===step?22:7,height:7,borderRadius:4,background:i===step?'#FF653F':i<step?'#FFC4AC':'#e8eaed',transition:'all .3s'}}/>
                ))}
              </div>
              <button
                onClick={goNext}
                disabled={!canNext()}
                onMouseOver={ev => { if (canNext()) ev.currentTarget.style.background='#e5512f' }}
                onMouseOut={ev => { if (canNext()) ev.currentTarget.style.background='#FF653F' }}
                style={{
                  padding:'12px 32px',border:'none',borderRadius:12,
                  background: canNext() ? '#FF653F' : '#e8eaed',
                  color: canNext() ? '#fff' : '#9ca3af',
                  fontSize:14,fontWeight:700,
                  cursor: canNext() ? 'pointer' : 'not-allowed',
                  boxShadow: canNext() ? '0 4px 14px rgba(255,107,53,.32)' : 'none',
                  transition:'all .2s',
                }}
              >
                {step === 3 ? 'Generate My Plan →' : 'Next →'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        .ob-content::-webkit-scrollbar{width:8px}
        .ob-content::-webkit-scrollbar-thumb{background:#fec9b0;border-radius:4px}
        .ob-content::-webkit-scrollbar-track{background:transparent}
        @media (max-width: 640px){
          .ob-topbar{padding:0 16px !important}
          .ob-content{padding:18px 14px 28px !important}
          .ob-connector{width:28px !important}
          .ob-steplabel{display:none !important}
        }
      `}</style>
    </div>
  )
}
