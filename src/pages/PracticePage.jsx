import { useState } from 'react'

/* ─── DATA ─────────────────────────────────────────────────── */

const EXAM_GROUPS = [
  { id:'ibps', label:'IBPS Exams', color:'#FF653F', exams:[
    { id:'bank_clerk_prelims', name:'Clerk Prelims', meta:'100Q · 60 min',  tag:'Popular' },
    { id:'bank_clerk_mains',   name:'Clerk Mains',   meta:'175Q · 160 min' },
    { id:'bank_po_prelims',    name:'PO Prelims',    meta:'100Q · 60 min',  tag:'Popular' },
    { id:'bank_po_mains',      name:'PO Mains',      meta:'175Q · 180 min' },
  ]},
  { id:'sbi', label:'SBI Exams', color:'#1a1a2e', exams:[
    { id:'sbi_clerk_prelims', name:'Clerk Prelims', meta:'100Q · 60 min'  },
    { id:'sbi_clerk_mains',   name:'Clerk Mains',   meta:'170Q · 160 min' },
    { id:'sbi_po_prelims',    name:'PO Prelims',    meta:'100Q · 60 min'  },
    { id:'sbi_po_mains',      name:'PO Mains',      meta:'175Q · 180 min' },
  ]},
  { id:'rrb', label:'RRB Exams', color:'#e5512f', exams:[
    { id:'rrb_office_assistant_prelims', name:'Office Assistant Prelims', meta:'80Q · 45 min',   tag:'New' },
    { id:'rrb_office_assistant_mains',   name:'Office Assistant Mains',   meta:'200Q · 120 min' },
    { id:'rrb_officer_scale1_prelims',   name:'Officer Scale-I Prelims',  meta:'80Q · 45 min',   tag:'New' },
    { id:'rrb_officer_scale1_mains',     name:'Officer Scale-I Mains',    meta:'200Q · 120 min' },
  ]},
  { id:'psu', label:'PSU Exams', color:'#374151', exams:[
    { id:'coal_india_mt', name:'Coal India MT', meta:'100Q · 120 min', tag:'New' },
  ]},
]

const TOPICS = [
  { section:'Quantitative Aptitude', color:'text-orange-700', bg:'bg-orange-50', border:'border-orange-200', items:[
    { label:'Simplification',          topic:'simplification'          },
    { label:'Number Series',           topic:'number_series'           },
    { label:'Data Interpretation',     topic:'data_interpretation'     },
    { label:'Quadratic Equations',     topic:'quadratic_equations'     },
    { label:'Percentage',              topic:'percentage'              },
    { label:'Profit & Loss',           topic:'profit_loss'             },
    { label:'Simple & Compound Interest', topic:'simple_compound_interest' },
    { label:'Time & Work',             topic:'time_work'               },
    { label:'Time, Speed & Distance',  topic:'time_speed_distance'     },
    { label:'Ratio & Proportion',      topic:'ratio_proportion'        },
    { label:'Average',                 topic:'average'                 },
    { label:'Problems on Ages',        topic:'problems_on_ages'        },
    { label:'Mixture & Alligation',    topic:'mixture_alligation'      },
    { label:'Partnership',             topic:'partnership'             },
    { label:'Mensuration',             topic:'mensuration_2d'          },
    { label:'Boats & Streams',         topic:'boat_stream'             },
    { label:'Pipes & Cisterns',        topic:'pipes_cisterns'          },
    { label:'Probability',             topic:'probability'             },
    { label:'Permutation & Combination', topic:'permutation_combination' },
  ]},
  { section:'Reasoning Ability', color:'text-purple-700', bg:'bg-purple-50', border:'border-purple-200', items:[
    { label:'Syllogisms',              topic:'syllogisms'              },
    { label:'Inequalities',            topic:'inequalities'            },
    { label:'Coding-Decoding',         topic:'coding_decoding'         },
    { label:'Blood Relations',         topic:'blood_relations'         },
    { label:'Direction Sense',         topic:'direction_sense'         },
    { label:'Alphanumeric Series',     topic:'alphanumeric_series'     },
    { label:'Circular Seating',        topic:'seating_arrangement_circular' },
    { label:'Linear Seating',          topic:'seating_arrangement_linear'   },
    { label:'Floor / Box Puzzle',      topic:'puzzle_box_floor'        },
    { label:'Order & Ranking',         topic:'order_ranking'           },
  ]},
  { section:'English Language', color:'text-green-700', bg:'bg-green-50', border:'border-green-200', items:[
    { label:'Reading Comprehension',   topic:'reading_comprehension'   },
    { label:'Cloze Test',              topic:'cloze_test'              },
    { label:'Error Detection',         topic:'error_detection'         },
    { label:'Fill in the Blanks',      topic:'fill_in_the_blanks'      },
    { label:'Para Jumbles',            topic:'para_jumbles'            },
    { label:'Vocabulary',              topic:'vocabulary'              },
  ]},
]

const SECTIONS = [
  { id:'english',           label:'English Language',   icon:'📖', bg:'bg-green-600',  light:'bg-green-50',  text:'text-green-700',  desc:'30Q · 20 min' },
  { id:'numerical_ability', label:'Numerical Ability',  icon:'🔢', bg:'bg-orange-500', light:'bg-orange-50', text:'text-orange-700', desc:'35Q · 20 min' },
  { id:'reasoning',         label:'Reasoning Ability',  icon:'🧩', bg:'bg-purple-600', light:'bg-purple-50', text:'text-purple-700', desc:'35Q · 20 min' },
]

const NAV_ITEMS = [
  { id:'dashboard',     label:'Dashboard',      icon:'🏠' },
  { id:'mock',          label:'Full Mock Test',  icon:'📝', isPractice:true },
  { id:'topic',         label:'Topic Practice',  icon:'🎯', isPractice:true },
  { id:'section',       label:'Section Test',    icon:'⏱', isPractice:true },
  { id:'results',       label:'My Results',      icon:'📊' },
  { id:'planner',       label:'Study Planner',   icon:'📅' },
  { id:'subscriptions', label:'Subscriptions',   icon:'💳' },
  { id:'profile',       label:'Profile',         icon:'👤' },
  { id:'settings',      label:'Settings',        icon:'⚙️' },
]

const ALL_PRODUCTS = [
  { cat:'BANKING',     items:[{t:'Bank Clerk Prelims',active:true},'Bank PO','RRB Clerk','RRB PO','Blog'] },
  { cat:'GOVERNMENT',  items:['UPSC Prelims','SSC CGL','SSC CHSL','State PSC','Blog'] },
  { cat:'ENGINEERING', items:['GATE CS','GATE ECE','JEE Mains','JEE Advanced','Blog'] },
  { cat:'MANAGEMENT',  items:['CAT','GMAT','MAT','XAT','Blog'] },
  { cat:'LANGUAGES',   items:['IELTS','TOEFL','PTE','Blog'] },
  { cat:'MEDICAL',     items:['NEET UG','NEET PG','AIIMS','Blog'] },
]

const ADMIN_EMAILS = ['anil.mikkili@stacknexus.io','amikkili@gmail.com','anil.mikkili@gmail.com']

/* ─── TAG STYLES ────────────────────────────────────────────── */
const TAG = { Popular:'bg-amber-100 text-amber-700', New:'bg-emerald-100 text-emerald-700' }

/* ─── MAIN COMPONENT ────────────────────────────────────────── */
export default function PracticePage({ user, onStartTest, onLogout, onNav }) {
  const [activeNav,  setActiveNav]  = useState('mock')
  const [mobileSide, setMobileSide] = useState(false)

  const raw     = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const skip    = ['admin','test','user','testuser','administrator']
  const uName   = skip.includes(raw.toLowerCase()) ? (user?.email?.split('@')[0] || raw) : raw
  const initials= uName.slice(0,2).toUpperCase()
  const isAdmin = ADMIN_EMAILS.includes((user?.email||'').toLowerCase())

  /* registration + subscription → which exams the user may see */
  const plan  = (user?.user_metadata?.plan || user?.user_metadata?.subscription || 'free').toLowerCase()
  const isPro = !['free','','none'].includes(plan)
  const registeredExamIds = (Array.isArray(user?.user_metadata?.selected_exams) && user.user_metadata.selected_exams.length)
    ? user.user_metadata.selected_exams
    : (user?.user_metadata?.target_exam ? [user.user_metadata.target_exam] : [])
  const hasReg = registeredExamIds.length > 0
  // Pro or not-yet-registered (skipped) users see everything so they can pick;
  // a registered free user sees only the exam(s) they registered for.
  const visibleGroups = (isPro || !hasReg)
    ? EXAM_GROUPS
    : EXAM_GROUPS
        .map(g => ({ ...g, exams: g.exams.filter(e => registeredExamIds.includes(e.id)) }))
        .filter(g => g.exams.length > 0)

  function handleNav(id) {
    setMobileSide(false)
    if (id === 'dashboard')  { onNav?.('dashboard'); return }
    if (id === 'results')    { onNav?.('results');   return }
    if (id === 'planner')    { onNav?.('planner');   return }
    if (id === 'subscriptions'){ onNav?.('subscriptions'); return }
    if (id === 'profile')    { onNav?.('profile');   return }
    if (id === 'settings')   { onNav?.('settings');  return }
    setActiveNav(id)
  }

  function handleLaunch(examId) { onStartTest?.('mock', examId) }
  function handleTopic(topic)   { onStartTest?.('topic', topic) }
  function handleSection(secId) { onStartTest?.('section', secId) }

  return (
    <div className="h-screen overflow-hidden flex flex-col text-sm" style={{background:'#ffffff'}}>

      {/* ── TOPBAR ── */}
      <header className="h-14 flex items-center px-4 gap-3 sticky top-0 z-50 shadow-md flex-shrink-0" style={{background:'#111'}}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'#FF653F'}}>
            <span className="text-white text-xs font-black">MT</span>
          </div>
          <div className="hidden sm:block leading-none">
            <div className="text-white font-bold text-sm">MockTest</div>
            <div className="text-xs" style={{color:'#888'}}>by Anil Software Technologies</div>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={()=>onNav?.('admin')} className="w-8 h-8 flex items-center justify-center bg-white/15 hover:bg-white/25 text-white rounded-lg border border-white/20 transition-colors text-xs">⚙</button>
          )}
          <button onClick={onLogout} className="text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors border border-white/20 hidden sm:block">
            Log out
          </button>
          <button onClick={()=>setMobileSide(true)} className="sm:hidden w-8 h-8 flex items-center justify-center text-white bg-white/10 rounded-lg border border-white/20">
            ☰
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <>
          {mobileSide && (
            <div className="fixed inset-0 bg-black/40 z-30 sm:hidden" onClick={()=>setMobileSide(false)} />
          )}
          <aside className={`
            w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0
            fixed sm:relative inset-y-0 left-0 z-30
            transform transition-transform duration-200 ease-in-out
            ${mobileSide ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
          `}>

            {/* Mobile close */}
            <div className="flex items-center justify-between px-4 py-3 sm:hidden border-b border-gray-100">
              <span className="text-gray-900 font-bold text-sm">Menu</span>
              <button onClick={()=>setMobileSide(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-2 overflow-y-auto">

              {/* Dashboard */}
              <button
                onClick={()=>handleNav('dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors mb-0.5"
              >
                <span>🏠</span><span className="text-sm">Dashboard</span>
              </button>

              {/* Practice section header */}
              <div className="px-3 pt-4 pb-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">Practice</div>

              {/* 3 practice modes — grouped segmented block */}
              <div className="mx-1 p-1 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
                {[
                  { id:'mock',    icon:'📝', label:'Full Mock Test'  },
                  { id:'topic',   icon:'🎯', label:'Topic Practice'  },
                  { id:'section', icon:'⏱', label:'Section Test'    },
                ].map(m => {
                  const active = activeNav === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={()=>handleNav(m.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                        active ? 'text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 font-medium'
                      }`}
                      style={active ? {background:'#FF653F'} : {}}
                    >
                      <span>{m.icon}</span>
                      <span className="text-sm">{m.label}</span>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 bg-white/70" />}
                    </button>
                  )
                })}
              </div>

              {/* Other section */}
              <div className="px-3 pt-4 pb-1 text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Account</div>

              {[
                { id:'results',       icon:'📊', label:'My Results'    },
                { id:'planner',       icon:'📅', label:'Study Planner' },
                { id:'subscriptions', icon:'💳', label:'Subscriptions' },
                { id:'profile',       icon:'👤', label:'Profile'       },
                { id:'settings',      icon:'⚙️', label:'Settings'      },
              ].map(n => (
                <button
                  key={n.id}
                  onClick={()=>handleNav(n.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors mb-0.5"
                >
                  <span>{n.icon}</span><span className="text-sm">{n.label}</span>
                </button>
              ))}

            </nav>

            {/* Bottom: user block + logout */}
            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-3 px-1 py-2 mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#FF653F'}}>
                  <span className="text-white text-sm font-bold">{initials}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-gray-900 text-sm font-semibold truncate">{uName}</div>
                  <div className="text-gray-400 text-xs truncate">{user?.email||''}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold border border-red-200"
              >
                <span>→</span><span>Log out</span>
              </button>
            </div>

          </aside>
        </>

        {/* ── MAIN ── */}
        <main className="flex-1 overflow-y-auto min-w-0">

          {/* Page header */}
          <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10">
            <h1 className="text-lg font-bold text-gray-900">
              { activeNav==='mock'    ? '📝 Full Mock Test'
              : activeNav==='topic'   ? '🎯 Topic Practice'
              : activeNav==='section' ? '⏱ Section Test'
              : 'Practice' }
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              { activeNav==='mock'    ? 'Choose an exam and launch a full 100-question mock test'
              : activeNav==='topic'   ? 'Select any topic for focused practice — any difficulty, any count'
              : activeNav==='section' ? 'Practice a single section — 20 minutes, full scoring'
              : 'Choose a mode to start practising' }
            </p>
          </div>

          <div className="p-6">

            {/* ── FULL MOCK TEST ── */}
            {activeNav === 'mock' && (
              <div className="space-y-6">
                {!isPro && hasReg && (
                  <div className="rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3" style={{background:'#1a1a2e'}}>
                    <div className="text-center sm:text-left">
                      <div className="text-sm font-bold text-white">You're on the Free plan</div>
                      <div className="text-xs text-gray-300 mt-0.5">Showing only your registered exam. Upgrade to Pro to unlock all exams.</div>
                    </div>
                    <button onClick={()=>onNav?.('subscriptions')}
                      className="text-white text-xs font-bold px-5 py-2.5 rounded-xl flex-shrink-0"
                      style={{background:'#FF653F'}}>⭐ Upgrade to Pro</button>
                  </div>
                )}
                {visibleGroups.map(g => (
                  <div key={g.id}>
                    <div
                      className="flex items-center px-4 py-2.5 rounded-xl mb-3 text-white text-sm font-bold"
                      style={{ background: g.color }}
                    >
                      {g.label}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {g.exams.map(e => (
                        <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 hover:border-blue-300 hover:shadow-sm transition-all">
                          {e.tag && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${TAG[e.tag]||'bg-gray-100 text-gray-600'}`}>{e.tag}</span>
                          )}
                          <div className="font-semibold text-gray-800">{e.name}</div>
                          <div className="text-xs text-gray-400">{e.meta}</div>
                          <button
                            onClick={()=>handleLaunch(e.id)}
                            className="mt-auto text-xs font-bold rounded-lg py-1.5 transition-all"
                            style={{color:'#FF653F',border:'1px solid #fec9b0'}}
                            onMouseOver={e=>{e.currentTarget.style.background='#FF653F';e.currentTarget.style.color='#fff'}}
                            onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#FF653F'}}
                          >
                            Launch
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── TOPIC PRACTICE ── */}
            {activeNav === 'topic' && (
              <div className="space-y-6">
                {TOPICS.map(sec => (
                  <div key={sec.section}>
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border mb-3 ${sec.bg} ${sec.color} ${sec.border}`}>
                      {sec.section}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {sec.items.map(t => (
                        <button
                          key={t.topic}
                          onClick={()=>handleTopic(t.topic)}
                          className="text-left px-3 py-2.5 bg-white rounded-lg border border-gray-200 text-gray-700 font-medium transition-all"
                          onMouseOver={e=>{e.currentTarget.style.borderColor='#FF653F';e.currentTarget.style.background='#FFF3EE';e.currentTarget.style.color='#FF653F'}}
                          onMouseOut={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.background='#fff';e.currentTarget.style.color='#374151'}}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── SECTION TEST ── */}
            {activeNav === 'section' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={()=>handleSection(s.id)}
                    className="flex flex-col items-center gap-3 p-8 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform`}>
                      {s.icon}
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">{s.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{s.desc}</div>
                    </div>
                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${s.light} ${s.text}`}>
                      Start Test →
                    </span>
                  </button>
                ))}
              </div>
            )}

          </div>


        </main>
      </div>
    </div>
  )
}
