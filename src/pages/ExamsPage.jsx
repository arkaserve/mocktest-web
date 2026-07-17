import { useState } from 'react'

/* ──────────────────────────────────────────────────────────────
   Public "Exams" page — left sidebar of exams, right pane shows
   the full pattern: sections, per-section question counts & topics.
────────────────────────────────────────────────────────────── */

const T = {
  numerical: ['Simplification','Number Series','Data Interpretation','Quadratic Equations','Percentage','Profit & Loss','Ratio & Proportion','Time & Work','Time & Distance','Average','Mensuration','Simple & Compound Interest','Probability','Permutation & Combination'],
  reasoning: ['Puzzles & Seating','Syllogism','Inequality','Blood Relations','Coding-Decoding','Direction Sense','Order & Ranking','Alphanumeric Series','Input-Output','Data Sufficiency'],
  english:   ['Reading Comprehension','Cloze Test','Error Detection','Para Jumbles','Fill in the Blanks','Sentence Improvement','Vocabulary','Word Usage'],
  ga:        ['Current Affairs (6 months)','Banking Awareness','RBI & Monetary Policy','Financial & Economic Terms','Government Schemes','Static GK'],
  computer:  ['Computer Fundamentals','MS Office','Internet & Networking','Hardware & Software','Security Basics','Shortcut Keys'],
}

const SEC_COLOR = {
  English:'#16a34a', 'Numerical Ability':'#f59e0b', 'Quantitative Aptitude':'#f59e0b',
  'Reasoning Ability':'#7048e8', 'Reasoning & Computer Aptitude':'#7048e8',
  'General/Financial Awareness':'#0891b2', 'General Awareness':'#0891b2',
  'Data Analysis & Interpretation':'#f59e0b', 'Computer Knowledge':'#7048e8',
}

const EXAMS = [
  { group:'IBPS', id:'ibps_clerk_pre', name:'IBPS Clerk', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
    ]},
  { group:'IBPS', id:'ibps_clerk_mains', name:'IBPS Clerk', level:'Mains', total:190, duration:'160 min', negative:0.25,
    sections:[
      { label:'General/Financial Awareness', q:50, mins:35, topics:T.ga },
      { label:'English', q:40, mins:35, topics:T.english },
      { label:'Reasoning & Computer Aptitude', q:50, mins:45, topics:[...T.reasoning, ...T.computer] },
      { label:'Quantitative Aptitude', q:50, mins:45, topics:T.numerical },
    ]},
  { group:'IBPS', id:'ibps_po_pre', name:'IBPS PO', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Quantitative Aptitude', q:35, mins:20, topics:T.numerical },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
    ]},
  { group:'IBPS', id:'ibps_po_mains', name:'IBPS PO', level:'Mains', total:155, duration:'180 min', negative:0.25,
    sections:[
      { label:'Reasoning & Computer Aptitude', q:45, mins:60, topics:[...T.reasoning, ...T.computer] },
      { label:'Data Analysis & Interpretation', q:35, mins:45, topics:T.numerical },
      { label:'General/Financial Awareness', q:40, mins:35, topics:T.ga },
      { label:'English', q:35, mins:40, topics:T.english },
    ]},
  { group:'SBI', id:'sbi_clerk_pre', name:'SBI Clerk', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
    ]},
  { group:'SBI', id:'sbi_clerk_mains', name:'SBI Clerk', level:'Mains', total:190, duration:'160 min', negative:0.25,
    sections:[
      { label:'General/Financial Awareness', q:50, mins:35, topics:T.ga },
      { label:'English', q:40, mins:35, topics:T.english },
      { label:'Quantitative Aptitude', q:50, mins:45, topics:T.numerical },
      { label:'Reasoning & Computer Aptitude', q:50, mins:45, topics:[...T.reasoning, ...T.computer] },
    ]},
  { group:'SBI', id:'sbi_po_pre', name:'SBI PO', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Quantitative Aptitude', q:35, mins:20, topics:T.numerical },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
    ]},
  { group:'SBI', id:'sbi_po_mains', name:'SBI PO', level:'Mains', total:155, duration:'180 min', negative:0.25,
    sections:[
      { label:'Reasoning & Computer Aptitude', q:40, mins:50, topics:[...T.reasoning, ...T.computer] },
      { label:'Data Analysis & Interpretation', q:30, mins:45, topics:T.numerical },
      { label:'General/Financial Awareness', q:40, mins:35, topics:T.ga },
      { label:'English', q:35, mins:40, topics:T.english },
    ]},
  { group:'RRB', id:'rrb_office_assistant_prelims', name:'RRB Office Assistant', level:'Prelims', total:80, duration:'45 min', negative:0.25,
    sections:[
      { label:'Numerical Ability', q:40, mins:'—', topics:T.numerical },
      { label:'Reasoning Ability', q:40, mins:'—', topics:T.reasoning },
    ]},
  { group:'RRB', id:'rrb_office_assistant_mains', name:'RRB Office Assistant', level:'Mains', total:200, duration:'120 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:40, mins:'—', topics:T.reasoning },
      { label:'Numerical Ability', q:40, mins:'—', topics:T.numerical },
      { label:'General Awareness', q:40, mins:'—', topics:T.ga },
      { label:'English / Hindi', q:40, mins:'—', topics:T.english },
      { label:'Computer Knowledge', q:40, mins:'—', topics:T.computer },
    ]},
  { group:'RRB', id:'rrb_officer_scale1_prelims', name:'RRB Officer Scale I', level:'Prelims', total:80, duration:'45 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:40, mins:'—', topics:T.reasoning },
      { label:'Quantitative Aptitude', q:40, mins:'—', topics:T.numerical },
    ]},
  { group:'RRB', id:'rrb_officer_scale1_mains', name:'RRB Officer Scale I', level:'Mains', total:200, duration:'120 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:40, mins:'—', topics:T.reasoning },
      { label:'Quantitative Aptitude', q:40, mins:'—', topics:T.numerical },
      { label:'General Awareness', q:40, mins:'—', topics:T.ga },
      { label:'English', q:40, mins:'—', topics:T.english },
      { label:'Computer Knowledge', q:40, mins:'—', topics:T.computer },
    ]},

  // ── RBI ──
  { group:'RBI', id:'rbi_assistant_pre', name:'RBI Assistant', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
    ]},
  { group:'RBI', id:'rbi_assistant_mains', name:'RBI Assistant', level:'Mains', total:200, duration:'135 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:40, mins:30, topics:T.reasoning },
      { label:'English', q:40, mins:30, topics:T.english },
      { label:'Numerical Ability', q:40, mins:30, topics:T.numerical },
      { label:'General Awareness', q:40, mins:25, topics:T.ga },
      { label:'Computer Knowledge', q:40, mins:20, topics:T.computer },
    ]},
  { group:'RBI', id:'rbi_gradeb_p1', name:'RBI Grade B', level:'Phase 1', total:200, duration:'120 min', negative:0.25,
    sections:[
      { label:'General Awareness', q:80, mins:25, topics:T.ga },
      { label:'English', q:30, mins:25, topics:T.english },
      { label:'Quantitative Aptitude', q:30, mins:25, topics:T.numerical },
      { label:'Reasoning Ability', q:60, mins:45, topics:T.reasoning },
    ]},

  // ── NABARD ──
  { group:'NABARD', id:'nabard_gradeA_pre', name:'NABARD Grade A', level:'Prelims', total:200, duration:'120 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:20, mins:'—', topics:T.reasoning },
      { label:'English', q:40, mins:'—', topics:T.english },
      { label:'Quantitative Aptitude', q:20, mins:'—', topics:T.numerical },
      { label:'General Awareness', q:20, mins:'—', topics:T.ga },
      { label:'Computer Knowledge', q:20, mins:'—', topics:T.computer },
    ]},
  { group:'NABARD', id:'nabard_da_pre', name:'NABARD Development Assistant', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:20, mins:'—', topics:T.reasoning },
      { label:'English', q:40, mins:'—', topics:T.english },
      { label:'Numerical Ability', q:20, mins:'—', topics:T.numerical },
      { label:'General Awareness', q:20, mins:'—', topics:T.ga },
    ]},

  // ── LIC ──
  { group:'LIC', id:'lic_aao_pre', name:'LIC AAO', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'Quantitative Aptitude', q:35, mins:20, topics:T.numerical },
      { label:'English', q:30, mins:20, topics:T.english },
    ]},
  { group:'LIC', id:'lic_assistant_pre', name:'LIC Assistant', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
    ]},
  { group:'LIC', id:'lic_ado_pre', name:'LIC ADO', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
      { label:'English', q:30, mins:20, topics:T.english },
    ]},

  // ── Insurance ──
  { group:'Insurance', id:'niacl_assistant_pre', name:'NIACL Assistant', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
    ]},
  { group:'Insurance', id:'nicl_ao_pre', name:'NICL AO', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Quantitative Aptitude', q:35, mins:20, topics:T.numerical },
    ]},

  // ── India Post / IPPB ──
  { group:'India Post', id:'ippb_officer', name:'IPPB Officer (Scale I)', level:'Prelims', total:100, duration:'60 min', negative:0.25,
    sections:[
      { label:'English', q:30, mins:20, topics:T.english },
      { label:'Reasoning Ability', q:35, mins:20, topics:T.reasoning },
      { label:'Numerical Ability', q:35, mins:20, topics:T.numerical },
    ]},
]

const GROUPS = ['IBPS','SBI','RRB','RBI','NABARD','LIC','Insurance','India Post']
// group → families (e.g. "IBPS Clerk") → their level variants
const TREE = GROUPS.map(g => ({
  group: g,
  families: [...new Set(EXAMS.filter(e=>e.group===g).map(e=>e.name))].map(name => ({
    name,
    short: name.replace(g + ' ', ''),
    exams: EXAMS.filter(e => e.name === name),
  })),
}))

export default function ExamsPage({ onNav }) {
  const [sel, setSel] = useState(EXAMS[0].id)
  const [openGroups, setOpenGroups] = useState({})
  const exam = EXAMS.find(e => e.id === sel) || EXAMS[0]
  // accordion: opening a group closes the others
  const toggle = g => setOpenGroups(p => ({ [g]: !p[g] }))

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row" style={{ fontFamily:"'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }}>

      {/* LEFT RAIL — full height, hugs the left edge */}
      <aside className="hidden md:block md:w-72 flex-shrink-0 bg-white md:border-r border-gray-200 md:sticky md:top-[58px] md:self-start md:h-[calc(100vh-58px)] overflow-y-auto">
        <div className="px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#FF653F' }}>Choose an exam</div>
          {TREE.map(({ group, families }) => {
            const open = !!openGroups[group]
            return (
              <div key={group} className="mb-1.5">
                {/* Group dropdown header */}
                <button onClick={()=>toggle(group)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors">
                  <span>{group} Exams</span>
                  <span className={`text-gray-400 text-xs transition-transform ${open?'rotate-180':''}`}>▼</span>
                </button>
                {open && (
                  <div className="pl-2 pt-0.5 pb-1">
                    {families.map(fam => (
                      <div key={fam.name} className="mb-2">
                        {/* Family = category header (not clickable) */}
                        <div className="flex items-center gap-1.5 px-3 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:'#FF653F' }}/>
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color:'#FF653F' }}>{fam.short}</span>
                        </div>
                        {/* Levels = clickable, indented under the family with a tree line */}
                        <div className="flex flex-col gap-0.5 ml-3 pl-2 border-l-2 border-gray-100">
                          {fam.exams.map(e => {
                            const active = e.id===sel
                            return (
                              <button key={e.id} onClick={()=>setSel(e.id)}
                                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${active?'text-white font-bold':'text-gray-700 hover:bg-gray-100 font-medium'}`}
                                style={active?{background:'#FF653F'}:{}}>
                                <span>{e.level}</span>
                                <span className={`text-xs ${active?'text-white/80':'text-gray-400'}`}>{e.total}Q</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <div className="mt-3 px-3 text-xs text-gray-400">More exams (SSC, RRB NTPC, Insurance) coming soon.</div>
        </div>
      </aside>

      {/* RIGHT — exam details */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-4 sm:px-6 py-5">

          <div className="mb-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Explore <span style={{color:'#FF653F'}}>Bank &amp; Govt Exams</span></h1>
            <p className="text-gray-500 text-sm mt-1">IBPS · SBI · RBI · RRB · NABARD · LIC · Insurance · India Post — pick an exam to see its full pattern: sections, question counts, timing and topic-wise syllabus.</p>
          </div>

          {/* Mobile selectors (desktop uses the left rail) */}
          <div className="md:hidden mb-4">
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'#FF653F' }}>Choose an exam</div>
            <div className="grid grid-cols-1 gap-2">
              <select value={exam.group}
                onChange={e => { const first = EXAMS.find(x => x.group === e.target.value); if (first) setSel(first.id) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400">
                {GROUPS.filter(g => EXAMS.some(x => x.group === g)).map(g => <option key={g} value={g}>{g} Exams</option>)}
              </select>
              <select value={sel} onChange={e => setSel(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400">
                {EXAMS.filter(x => x.group === exam.group).map(x => <option key={x.id} value={x.id}>{x.name} — {x.level}</option>)}
              </select>
            </div>
          </div>

          <main className="flex-1 min-w-0">
            {/* Overview — compact, single line */}
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between flex-wrap gap-3" style={{ boxShadow:'0 2px 10px rgba(17,17,17,.05)' }}>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-900">{exam.name}</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:'#FFF3EE', color:'#FF653F' }}>{exam.level}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[[`${exam.total}`,'Questions'],[exam.duration,'Duration'],[exam.negative>0?`-${exam.negative}`:'None','Negative']].map(([v,l])=>(
                  <div key={l} className="flex items-baseline gap-1.5 rounded-lg px-3 py-1" style={{ background:'#FFF8F4', border:'1px solid #fde8dc' }}>
                    <span className="text-sm font-black" style={{ color:'#FF653F' }}>{v}</span>
                    <span className="text-[11px] text-gray-500">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section-wise pattern + topics — larger cards */}
            <div className="space-y-3">
              {exam.sections.map(s=>{
                const c = SEC_COLOR[s.label] || '#FF653F'
                return (
                  <div key={s.label} className="bg-white border border-gray-200 rounded-2xl px-5 py-4" style={{ boxShadow:'0 2px 8px rgba(17,17,17,.05)' }}>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background:c }}/>
                        <span className="font-bold text-gray-900 text-base">{s.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-black" style={{ color:c }}>{s.q} Q</span>
                        {s.mins!=='—' && <span className="text-gray-400">{s.mins} min</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.topics.map(t=>(
                        <span key={t} className="text-[13px] px-3 py-1 rounded-full font-medium"
                          style={{ background:`${c}14`, color:c }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA — centered, matching Cut-off Trends page */}
            <div className="mt-8 rounded-2xl p-6 sm:p-8 text-center" style={{ background:'#1a1a2e' }}>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                Ready to attempt <span style={{ color:'#FF653F' }}>{exam.name} {exam.level}</span>?
              </h2>
              <p className="text-sm mb-5" style={{ color:'rgba(255,255,255,.7)' }}>
                Take a free mock test with sectional timing, instant explanations and category-wise cut-off comparison.
              </p>
              <button onClick={()=>onNav?.('auth')}
                className="text-white text-sm font-bold px-7 py-3 rounded-xl transition-all" style={{ background:'#FF653F' }}
                onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
                onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
                🚀 Start Free Mock →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
