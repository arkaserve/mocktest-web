import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'

/* ──────────────────────────────────────────────────────────────
   Public "Previous Year Papers" — left dropdown rail + right list.
   Browsing is public; attempting requires sign-up. Add new exams
   to FAMILIES below (future-proof).
────────────────────────────────────────────────────────────── */

// Most-recent-year papers for every bank exam. Each has a `pdf` slot
// (null for now) — insert real PDFs via the `previous_papers` table later.
const YR = 2025
const FAMILIES = [
  { group:'IBPS', id:'ibps_clerk', name:'IBPS Clerk', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:190, mins:160, neg:0.25, pdf:null },
  ]},
  { group:'IBPS', id:'ibps_po', name:'IBPS PO', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:155, mins:180, neg:0.25, pdf:null },
  ]},
  { group:'SBI', id:'sbi_clerk', name:'SBI Clerk', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:190, mins:160, neg:0.25, pdf:null },
  ]},
  { group:'SBI', id:'sbi_po', name:'SBI PO', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:155, mins:180, neg:0.25, pdf:null },
  ]},
  { group:'RRB', id:'rrb_clerk', name:'RRB Office Assistant', papers:[
    { year:YR, stage:'Prelims', q:80,  mins:45,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:200, mins:120, neg:0.25, pdf:null },
  ]},
  { group:'RRB', id:'rrb_po', name:'RRB Officer Scale I', papers:[
    { year:YR, stage:'Prelims', q:80,  mins:45,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:200, mins:120, neg:0.25, pdf:null },
  ]},
  { group:'RBI', id:'rbi_assistant', name:'RBI Assistant', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
    { year:YR, stage:'Mains',   q:200, mins:135, neg:0.25, pdf:null },
  ]},
  { group:'RBI', id:'rbi_gradeb', name:'RBI Grade B', papers:[
    { year:YR, stage:'Phase 1', q:200, mins:120, neg:0.25, pdf:null },
  ]},
  { group:'NABARD', id:'nabard_gradeA', name:'NABARD Grade A', papers:[
    { year:YR, stage:'Prelims', q:200, mins:120, neg:0.25, pdf:null },
  ]},
  { group:'NABARD', id:'nabard_da', name:'NABARD Development Assistant', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'LIC', id:'lic_aao', name:'LIC AAO', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'LIC', id:'lic_assistant', name:'LIC Assistant', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'LIC', id:'lic_ado', name:'LIC ADO', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'Insurance', id:'niacl_assistant', name:'NIACL Assistant', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'Insurance', id:'nicl_ao', name:'NICL AO', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
  { group:'India Post', id:'ippb_officer', name:'IPPB Officer (Scale I)', papers:[
    { year:YR, stage:'Prelims', q:100, mins:60,  neg:0.25, pdf:null },
  ]},
]

const GROUPS = ['IBPS', 'SBI', 'RRB', 'RBI', 'NABARD', 'LIC', 'Insurance', 'India Post']

// Build the {group → families} tree from whichever paper list is active.
const buildTree = fams =>
  GROUPS.map(g => ({ group: g, families: fams.filter(f => f.group === g) }))
        .filter(node => node.families.length)

// Turn DB rows from `previous_papers` into the FAMILIES shape used here.
function rowsToFamilies(rows) {
  const byExam = {}
  rows.forEach(r => {
    const key = r.exam_id
    if (!byExam[key]) byExam[key] = { group: r.exam_group, id: r.exam_id, name: r.exam_name, papers: [] }
    byExam[key].papers.push({
      year: r.year, stage: r.stage, q: r.total_questions,
      mins: r.duration_mins, neg: r.negative_mark, pdf: r.pdf_url || null,
    })
  })
  return Object.values(byExam)
}

export default function PreviousPapersPage({ onNav }) {
  // Start with the built-in list; replace with DB rows if any exist.
  const [families, setFamilies] = useState(FAMILIES)
  const [sel, setSel] = useState(FAMILIES[0].id)
  const [openGroups, setOpenGroups] = useState({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('previous_papers')
          .select('*')
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .order('year', { ascending: false })
        if (error || !data?.length || cancelled) return   // keep built-in list
        // MERGE per exam: if the DB has papers for an exam, use them (real years +
        // pdf links); otherwise keep the built-in catalog entry. This avoids any
        // brittle year/stage matching — the DB is the source of truth per exam.
        const dbFams  = rowsToFamilies(data)
        const dbById  = Object.fromEntries(dbFams.map(f => [f.id, f]))
        const merged  = FAMILIES.map(f => (dbById[f.id] ? { ...f, papers: dbById[f.id].papers } : f))
        const known   = new Set(FAMILIES.map(f => f.id))
        const extra   = dbFams.filter(f => !known.has(f.id))   // DB-only exams
        if (!cancelled) setFamilies([...merged, ...extra])
      } catch { /* offline / table missing → keep built-in list */ }
    })()
    return () => { cancelled = true }
  }, [])

  const [mobileYear, setMobileYear] = useState('')   // mobile year filter (desktop ignores)
  const TREE = buildTree(families)
  const fam = families.find(f => f.id === sel) || families[0]
  // accordion: opening a group closes the others
  const toggle = g => setOpenGroups(p => ({ [g]: !p[g] }))

  // Mobile dropdown helpers
  const groupFamilies = families.filter(f => f.group === fam?.group)
  const famYears = [...new Set((fam?.papers || []).map(p => p.year))].sort((a, b) => b - a)
  const shownPapers = mobileYear
    ? (fam?.papers || []).filter(p => String(p.year) === String(mobileYear))
    : (fam?.papers || [])
  const onPickGroup = (g) => {
    const first = families.find(f => f.group === g)
    if (first) { setSel(first.id); setMobileYear('') }
  }
  const selStyle = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-orange-400"

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row" style={{ fontFamily: "'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }}>

      {/* LEFT RAIL — desktop/tablet only (mobile uses dropdowns below) */}
      <aside className="hidden md:block md:w-72 flex-shrink-0 bg-white md:border-r border-gray-200 md:sticky md:top-[58px] md:self-start md:h-[calc(100vh-58px)] overflow-y-auto">
        <div className="px-4 py-4">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#FF653F' }}>Choose an exam</div>
          {TREE.map(({ group, families }) => {
            const open = !!openGroups[group]
            return (
              <div key={group} className="mb-1.5">
                <button onClick={() => toggle(group)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors">
                  <span>{group} Exams</span>
                  <span className={`text-gray-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {open && (
                  <div className="pl-2 pt-1 pb-1 flex flex-col gap-1">
                    {families.map(f => {
                      const active = f.id === sel
                      return (
                        <button key={f.id} onClick={() => setSel(f.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${active ? 'text-white font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}
                          style={active ? { background: '#FF653F' } : {}}>
                          <span>{f.name.replace(group + ' ', '')}</span>
                          <span className={`text-xs ${active ? 'text-white/80' : 'text-gray-400'}`}>{f.papers.length}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          <div className="mt-3 px-3 text-xs text-gray-400">More exams (SSC, RRB NTPC, Insurance) coming soon.</div>
        </div>
      </aside>

      {/* RIGHT */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6">

          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Bank Exam <span style={{ color: '#FF653F' }}>Previous Year Papers</span></h1>
            <p className="text-gray-500 text-sm mt-1">Real exam patterns from past years — full sectional structure, timing and negative marking. Pick an exam on the left.</p>
          </div>

          {/* Mobile selectors — Exam · Type · Year (desktop uses the left rail) */}
          <div className="md:hidden mb-4">
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'#FF653F' }}>Choose an exam</div>
            <div className="grid grid-cols-1 gap-2">
              <select value={fam?.group || ''} onChange={e => onPickGroup(e.target.value)} className={selStyle}>
                {GROUPS.filter(g => families.some(f => f.group === g)).map(g => (
                  <option key={g} value={g}>{g} Exams</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select value={sel} onChange={e => { setSel(e.target.value); setMobileYear('') }} className={selStyle}>
                  {groupFamilies.map(f => (
                    <option key={f.id} value={f.id}>{f.name.replace(f.group + ' ', '')}</option>
                  ))}
                </select>
                <select value={mobileYear} onChange={e => setMobileYear(e.target.value)} className={selStyle}>
                  <option value="">All years</option>
                  {famYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-black text-gray-900 mb-3">{fam.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shownPapers.map((p, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
                style={{ boxShadow: '0 2px 10px rgba(17,17,17,.05)' }}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#FFF3EE' }}>📄</div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900">{fam.name} {p.year} · {p.stage}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.q} questions · {p.mins} min · -{p.neg} negative</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-stretch sm:self-auto">
                  {p.pdf && (
                    <a href={p.pdf} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold rounded-lg px-3 py-2 text-white whitespace-nowrap"
                      style={{ background: '#FF653F' }}
                      onMouseOver={e => e.currentTarget.style.background = '#e5512f'}
                      onMouseOut={e => e.currentTarget.style.background = '#FF653F'}>
                      ⬇ PDF
                    </a>
                  )}
                  <button onClick={() => onNav?.('auth')}
                    className="text-xs font-bold rounded-lg px-4 py-2 border transition-all whitespace-nowrap"
                    style={{ color: '#FF653F', borderColor: '#fec9b0' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#FF653F'; e.currentTarget.style.color = '#fff' }}
                    onMouseOut={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#FF653F' }}>
                    Sign up to attempt
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-4">🔒 Attempting papers, full solutions and PDF downloads are free after sign-up.</p>

          {/* CTA */}
          <div className="mt-8 rounded-2xl p-6 sm:p-8 text-center" style={{ background: '#1a1a2e' }}>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Attempt any paper <span style={{ color: '#FF653F' }}>free</span></h2>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,.7)' }}>
              Create a free account to attempt previous-year papers as timed mocks with instant step-by-step explanations and category-wise cut-off comparison.
            </p>
            <button onClick={() => onNav?.('auth')}
              className="text-white text-sm font-bold px-7 py-3 rounded-xl transition-all"
              style={{ background: '#FF653F' }}
              onMouseOver={e => e.currentTarget.style.background = '#e5512f'}
              onMouseOut={e => e.currentTarget.style.background = '#FF653F'}>
              🚀 Start Free →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
