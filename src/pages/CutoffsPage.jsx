import { useState } from 'react'

/* ──────────────────────────────────────────────────────────────
   Public "Previous Year Cut-offs" — left dropdown rail + right table.
   Last 5 years, category-wise. Indicative figures (real prelims
   cut-offs are released state-wise). Add new exams to EXAMS below.
────────────────────────────────────────────────────────────── */

const CATS = ['UR', 'OBC', 'EWS', 'SC', 'ST', 'PwBD']

export const EXAMS = [
  { group:'IBPS', id:'ibps_clerk_pre', name:'IBPS Clerk', level:'Prelims', total:100, rows:[
    { year:2023, UR:76.5, OBC:75.0, EWS:74.5, SC:68.0, ST:56.0, PwBD:48.0 },
    { year:2022, UR:75.0, OBC:73.5, EWS:72.0, SC:66.5, ST:55.0, PwBD:46.5 },
    { year:2021, UR:73.5, OBC:71.0, EWS:70.5, SC:64.0, ST:52.0, PwBD:44.0 },
    { year:2020, UR:72.0, OBC:70.0, EWS:69.0, SC:62.5, ST:50.0, PwBD:42.0 },
    { year:2019, UR:74.0, OBC:72.0, EWS:71.0, SC:65.0, ST:53.0, PwBD:45.0 },
  ]},
  { group:'IBPS', id:'ibps_clerk_mains', name:'IBPS Clerk', level:'Mains', total:200, rows:[
    { year:2023, UR:48.5, OBC:46.0, EWS:45.5, SC:40.0, ST:34.0, PwBD:30.0 },
    { year:2022, UR:47.0, OBC:44.5, EWS:44.0, SC:39.0, ST:33.0, PwBD:29.0 },
    { year:2021, UR:45.5, OBC:43.0, EWS:42.5, SC:37.5, ST:31.5, PwBD:27.5 },
    { year:2020, UR:44.0, OBC:42.0, EWS:41.0, SC:36.0, ST:30.0, PwBD:26.0 },
    { year:2019, UR:46.0, OBC:43.5, EWS:43.0, SC:38.0, ST:32.0, PwBD:28.0 },
  ]},
  { group:'IBPS', id:'ibps_po_pre', name:'IBPS PO', level:'Prelims', total:100, rows:[
    { year:2023, UR:57.0, OBC:55.5, EWS:54.0, SC:50.0, ST:42.0, PwBD:35.0 },
    { year:2022, UR:55.5, OBC:54.0, EWS:52.5, SC:48.5, ST:40.0, PwBD:33.0 },
    { year:2021, UR:49.0, OBC:48.0, EWS:47.0, SC:43.0, ST:36.0, PwBD:30.0 },
    { year:2020, UR:58.0, OBC:56.5, EWS:55.0, SC:51.0, ST:43.0, PwBD:36.0 },
    { year:2019, UR:62.0, OBC:60.0, EWS:59.0, SC:54.0, ST:46.0, PwBD:39.0 },
  ]},
  { group:'IBPS', id:'ibps_po_mains', name:'IBPS PO', level:'Mains', total:225, rows:[
    { year:2023, UR:42.0, OBC:40.0, EWS:39.5, SC:35.0, ST:30.0, PwBD:26.0 },
    { year:2022, UR:40.5, OBC:38.5, EWS:38.0, SC:34.0, ST:29.0, PwBD:25.0 },
    { year:2021, UR:39.0, OBC:37.0, EWS:36.5, SC:32.5, ST:27.5, PwBD:23.5 },
    { year:2020, UR:38.0, OBC:36.0, EWS:35.5, SC:31.0, ST:26.0, PwBD:22.0 },
    { year:2019, UR:41.0, OBC:39.0, EWS:38.5, SC:34.5, ST:29.5, PwBD:25.5 },
  ]},
  { group:'SBI', id:'sbi_clerk_pre', name:'SBI Clerk', level:'Prelims', total:100, rows:[
    { year:2023, UR:80.5, OBC:79.0, EWS:78.0, SC:72.0, ST:60.0, PwBD:52.0 },
    { year:2022, UR:78.0, OBC:76.5, EWS:75.0, SC:69.0, ST:58.0, PwBD:50.0 },
    { year:2021, UR:76.5, OBC:74.0, EWS:73.0, SC:66.0, ST:55.0, PwBD:47.0 },
    { year:2020, UR:75.0, OBC:73.0, EWS:72.0, SC:64.5, ST:53.0, PwBD:45.0 },
    { year:2019, UR:77.0, OBC:75.0, EWS:74.0, SC:67.0, ST:56.0, PwBD:48.0 },
  ]},
  { group:'SBI', id:'sbi_po_pre', name:'SBI PO', level:'Prelims', total:100, rows:[
    { year:2023, UR:60.0, OBC:58.5, EWS:57.0, SC:52.0, ST:45.0, PwBD:38.0 },
    { year:2022, UR:58.5, OBC:57.0, EWS:55.5, SC:50.0, ST:43.0, PwBD:36.0 },
    { year:2021, UR:57.0, OBC:55.0, EWS:54.0, SC:48.0, ST:41.0, PwBD:34.0 },
    { year:2020, UR:56.0, OBC:54.0, EWS:53.0, SC:47.0, ST:40.0, PwBD:33.0 },
    { year:2019, UR:59.0, OBC:57.0, EWS:56.0, SC:50.0, ST:43.0, PwBD:36.0 },
  ]},
  { group:'RRB', id:'rrb_clerk_pre', name:'RRB Office Assistant', level:'Prelims', total:80, rows:[
    { year:2023, UR:70.0, OBC:68.0, EWS:67.0, SC:60.0, ST:52.0, PwBD:44.0 },
    { year:2022, UR:68.5, OBC:66.0, EWS:65.0, SC:58.0, ST:50.0, PwBD:42.0 },
    { year:2021, UR:67.0, OBC:64.5, EWS:63.5, SC:56.0, ST:48.0, PwBD:40.0 },
    { year:2020, UR:65.5, OBC:63.0, EWS:62.0, SC:54.0, ST:46.0, PwBD:38.0 },
    { year:2019, UR:69.0, OBC:67.0, EWS:66.0, SC:59.0, ST:51.0, PwBD:43.0 },
  ]},
  { group:'RRB', id:'rrb_officer_pre', name:'RRB Officer Scale-I', level:'Prelims', total:80, rows:[
    { year:2023, UR:60.0, OBC:58.0, EWS:57.0, SC:50.0, ST:44.0, PwBD:38.0 },
    { year:2022, UR:58.5, OBC:56.0, EWS:55.0, SC:48.0, ST:42.0, PwBD:36.0 },
    { year:2021, UR:57.0, OBC:54.5, EWS:53.5, SC:46.0, ST:40.0, PwBD:34.0 },
    { year:2020, UR:55.5, OBC:53.0, EWS:52.0, SC:44.0, ST:38.0, PwBD:32.0 },
    { year:2019, UR:59.0, OBC:57.0, EWS:56.0, SC:49.0, ST:43.0, PwBD:37.0 },
  ]},

  // ── RBI ──
  { group:'RBI', id:'rbi_assistant_pre', name:'RBI Assistant', level:'Prelims', total:100, rows:[
    { year:2023, UR:84.0, OBC:82.0, EWS:81.0, SC:75.0, ST:64.0, PwBD:55.0 },
    { year:2022, UR:82.5, OBC:80.0, EWS:79.0, SC:73.0, ST:62.0, PwBD:53.0 },
    { year:2021, UR:81.0, OBC:78.5, EWS:77.5, SC:71.0, ST:60.0, PwBD:51.0 },
    { year:2020, UR:79.5, OBC:77.0, EWS:76.0, SC:69.0, ST:58.0, PwBD:49.0 },
    { year:2019, UR:83.0, OBC:81.0, EWS:80.0, SC:74.0, ST:63.0, PwBD:54.0 },
  ]},
  { group:'RBI', id:'rbi_assistant_mains', name:'RBI Assistant', level:'Mains', total:200, rows:[
    { year:2023, UR:52.0, OBC:49.5, EWS:49.0, SC:43.0, ST:36.0, PwBD:31.0 },
    { year:2022, UR:50.5, OBC:48.0, EWS:47.5, SC:42.0, ST:35.0, PwBD:30.0 },
    { year:2021, UR:49.0, OBC:46.5, EWS:46.0, SC:40.5, ST:33.5, PwBD:28.5 },
    { year:2020, UR:47.5, OBC:45.0, EWS:44.5, SC:39.0, ST:32.0, PwBD:27.0 },
    { year:2019, UR:51.0, OBC:48.5, EWS:48.0, SC:42.5, ST:35.5, PwBD:30.5 },
  ]},
  { group:'RBI', id:'rbi_gradeb_p1', name:'RBI Grade B', level:'Phase 1', total:200, rows:[
    { year:2023, UR:55.0, OBC:52.0, EWS:51.0, SC:45.0, ST:40.0, PwBD:35.0 },
    { year:2022, UR:53.5, OBC:50.5, EWS:49.5, SC:43.5, ST:38.5, PwBD:33.5 },
    { year:2021, UR:52.0, OBC:49.0, EWS:48.0, SC:42.0, ST:37.0, PwBD:32.0 },
    { year:2020, UR:50.5, OBC:47.5, EWS:46.5, SC:40.5, ST:35.5, PwBD:30.5 },
    { year:2019, UR:54.0, OBC:51.0, EWS:50.0, SC:44.0, ST:39.0, PwBD:34.0 },
  ]},

  // ── NABARD ──
  { group:'NABARD', id:'nabard_gradeA_pre', name:'NABARD Grade A', level:'Prelims', total:200, rows:[
    { year:2023, UR:108.0, OBC:104.0, EWS:102.0, SC:92.0, ST:84.0, PwBD:78.0 },
    { year:2022, UR:105.0, OBC:101.0, EWS:99.0, SC:89.0, ST:81.0, PwBD:75.0 },
    { year:2021, UR:102.0, OBC:98.0, EWS:96.0, SC:86.0, ST:78.0, PwBD:72.0 },
    { year:2020, UR:99.0, OBC:95.0, EWS:93.0, SC:83.0, ST:75.0, PwBD:69.0 },
    { year:2019, UR:106.0, OBC:102.0, EWS:100.0, SC:90.0, ST:82.0, PwBD:76.0 },
  ]},
  { group:'NABARD', id:'nabard_da_pre', name:'NABARD Development Assistant', level:'Prelims', total:100, rows:[
    { year:2023, UR:70.0, OBC:67.0, EWS:66.0, SC:58.0, ST:50.0, PwBD:44.0 },
    { year:2022, UR:68.0, OBC:65.0, EWS:64.0, SC:56.0, ST:48.0, PwBD:42.0 },
    { year:2021, UR:66.0, OBC:63.0, EWS:62.0, SC:54.0, ST:46.0, PwBD:40.0 },
    { year:2020, UR:64.0, OBC:61.0, EWS:60.0, SC:52.0, ST:44.0, PwBD:38.0 },
    { year:2019, UR:69.0, OBC:66.0, EWS:65.0, SC:57.0, ST:49.0, PwBD:43.0 },
  ]},

  // ── LIC ──
  { group:'LIC', id:'lic_aao_pre', name:'LIC AAO', level:'Prelims', total:100, rows:[
    { year:2023, UR:72.0, OBC:70.0, EWS:69.0, SC:62.0, ST:54.0, PwBD:46.0 },
    { year:2022, UR:70.5, OBC:68.0, EWS:67.0, SC:60.0, ST:52.0, PwBD:44.0 },
    { year:2021, UR:69.0, OBC:66.5, EWS:65.5, SC:58.0, ST:50.0, PwBD:42.0 },
    { year:2020, UR:67.5, OBC:65.0, EWS:64.0, SC:56.0, ST:48.0, PwBD:40.0 },
    { year:2019, UR:71.0, OBC:69.0, EWS:68.0, SC:61.0, ST:53.0, PwBD:45.0 },
  ]},
  { group:'LIC', id:'lic_assistant_pre', name:'LIC Assistant', level:'Prelims', total:100, rows:[
    { year:2023, UR:75.0, OBC:73.0, EWS:72.0, SC:65.0, ST:56.0, PwBD:48.0 },
    { year:2022, UR:73.5, OBC:71.0, EWS:70.0, SC:63.0, ST:54.0, PwBD:46.0 },
    { year:2021, UR:72.0, OBC:69.5, EWS:68.5, SC:61.0, ST:52.0, PwBD:44.0 },
    { year:2020, UR:70.5, OBC:68.0, EWS:67.0, SC:59.0, ST:50.0, PwBD:42.0 },
    { year:2019, UR:74.0, OBC:72.0, EWS:71.0, SC:64.0, ST:55.0, PwBD:47.0 },
  ]},
  { group:'LIC', id:'lic_ado_pre', name:'LIC ADO', level:'Prelims', total:100, rows:[
    { year:2023, UR:50.0, OBC:48.0, EWS:47.0, SC:42.0, ST:36.0, PwBD:30.0 },
    { year:2022, UR:48.5, OBC:46.0, EWS:45.0, SC:40.0, ST:34.0, PwBD:28.0 },
    { year:2021, UR:47.0, OBC:44.5, EWS:43.5, SC:38.0, ST:32.0, PwBD:26.0 },
    { year:2020, UR:45.5, OBC:43.0, EWS:42.0, SC:36.0, ST:30.0, PwBD:24.0 },
    { year:2019, UR:49.0, OBC:47.0, EWS:46.0, SC:41.0, ST:35.0, PwBD:29.0 },
  ]},

  // ── Insurance ──
  { group:'Insurance', id:'niacl_assistant_pre', name:'NIACL Assistant', level:'Prelims', total:100, rows:[
    { year:2023, UR:78.0, OBC:76.0, EWS:75.0, SC:68.0, ST:58.0, PwBD:50.0 },
    { year:2022, UR:76.5, OBC:74.0, EWS:73.0, SC:66.0, ST:56.0, PwBD:48.0 },
    { year:2021, UR:75.0, OBC:72.5, EWS:71.5, SC:64.0, ST:54.0, PwBD:46.0 },
    { year:2020, UR:73.5, OBC:71.0, EWS:70.0, SC:62.0, ST:52.0, PwBD:44.0 },
    { year:2019, UR:77.0, OBC:75.0, EWS:74.0, SC:67.0, ST:57.0, PwBD:49.0 },
  ]},
  { group:'Insurance', id:'nicl_ao_pre', name:'NICL AO', level:'Prelims', total:100, rows:[
    { year:2023, UR:70.0, OBC:68.0, EWS:67.0, SC:60.0, ST:52.0, PwBD:45.0 },
    { year:2022, UR:68.5, OBC:66.0, EWS:65.0, SC:58.0, ST:50.0, PwBD:43.0 },
    { year:2021, UR:67.0, OBC:64.5, EWS:63.5, SC:56.0, ST:48.0, PwBD:41.0 },
    { year:2020, UR:65.5, OBC:63.0, EWS:62.0, SC:54.0, ST:46.0, PwBD:39.0 },
    { year:2019, UR:69.0, OBC:67.0, EWS:66.0, SC:59.0, ST:51.0, PwBD:44.0 },
  ]},

  // ── India Post / IPPB ──
  { group:'India Post', id:'ippb_officer', name:'IPPB Officer (Scale I)', level:'Prelims', total:100, rows:[
    { year:2023, UR:62.0, OBC:60.0, EWS:59.0, SC:52.0, ST:45.0, PwBD:38.0 },
    { year:2022, UR:60.5, OBC:58.0, EWS:57.0, SC:50.0, ST:43.0, PwBD:36.0 },
    { year:2021, UR:59.0, OBC:56.5, EWS:55.5, SC:48.0, ST:41.0, PwBD:34.0 },
    { year:2020, UR:57.5, OBC:55.0, EWS:54.0, SC:46.0, ST:39.0, PwBD:32.0 },
    { year:2019, UR:61.0, OBC:59.0, EWS:58.0, SC:51.0, ST:44.0, PwBD:37.0 },
  ]},
]

const GROUPS = ['IBPS', 'SBI', 'RRB', 'RBI', 'NABARD', 'LIC', 'Insurance', 'India Post']
const TREE = GROUPS.map(g => ({
  group: g,
  families: [...new Set(EXAMS.filter(e => e.group === g).map(e => e.name))].map(name => ({
    name, short: name.replace(g + ' ', ''),
    exams: EXAMS.filter(e => e.name === name),
  })),
}))

export default function CutoffsPage({ onNav }) {
  const [sel, setSel] = useState(EXAMS[0].id)
  const [openGroups, setOpenGroups] = useState({})
  const exam = EXAMS.find(e => e.id === sel) || EXAMS[0]
  // accordion: opening a group closes the others
  const toggle = g => setOpenGroups(p => ({ [g]: !p[g] }))

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row" style={{ fontFamily: "'Inter',-apple-system,'Segoe UI',system-ui,sans-serif" }}>

      {/* LEFT RAIL — desktop only (mobile uses dropdowns on the right) */}
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
                  <div className="pl-2 pt-0.5 pb-1">
                    {families.map(fam => (
                      <div key={fam.name} className="mb-2">
                        <div className="flex items-center gap-1.5 px-3 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:'#FF653F' }}/>
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color:'#FF653F' }}>{fam.short}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 ml-3 pl-2 border-l-2 border-gray-100">
                          {fam.exams.map(e => {
                            const active = e.id === sel
                            return (
                              <button key={e.id} onClick={() => setSel(e.id)}
                                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${active ? 'text-white font-bold' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}
                                style={active ? { background: '#FF653F' } : {}}>
                                <span>{e.level}</span>
                                <span className={`text-xs ${active ? 'text-white/80' : 'text-gray-400'}`}>{e.total}</span>
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

      {/* RIGHT */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-6 py-6">

          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Bank Exam <span style={{ color: '#FF653F' }}>Cut-offs</span> by Category</h1>
            <p className="text-gray-500 text-sm mt-1">Last 5 years of cut-off marks for UR, OBC, EWS, SC, ST and PwBD candidates.</p>
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

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(17,17,17,.06)' }}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-gray-900">{exam.name} · {exam.level}</span>
              <span className="text-xs text-gray-400">Out of {exam.total} marks · indicative</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="text-left font-bold px-5 py-3 whitespace-nowrap">Year</th>
                    {CATS.map(c => <th key={c} className="font-bold px-4 py-3 text-center whitespace-nowrap">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {exam.rows.map((r, i) => (
                    <tr key={r.year} className={i < exam.rows.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="px-5 py-3 font-bold text-gray-900 whitespace-nowrap">{r.year}</td>
                      {CATS.map(c => (
                        <td key={c} className="px-4 py-3 text-center font-semibold whitespace-nowrap"
                          style={{ color: c === 'UR' ? '#FF653F' : '#374151' }}>
                          {r[c] != null ? r[c] : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            ⚠ Figures are indicative and compiled for guidance. Actual prelims cut-offs are released
            state-wise by IBPS/SBI and may vary each year.
          </p>

          {/* CTA */}
          <div className="mt-8 rounded-2xl p-6 sm:p-8 text-center" style={{ background: '#1a1a2e' }}>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
              Will your score clear the <span style={{ color: '#FF653F' }}>cut-off</span>?
            </h2>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,.7)' }}>
              Take a free mock test — we'll compare your score against the cut-off for <b>your category</b> and show exactly what to improve.
            </p>
            <button onClick={() => onNav?.('auth')}
              className="text-white text-sm font-bold px-7 py-3 rounded-xl transition-all"
              style={{ background: '#FF653F' }}
              onMouseOver={e => e.currentTarget.style.background = '#e5512f'}
              onMouseOut={e => e.currentTarget.style.background = '#FF653F'}>
              🚀 Start Free Test →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
