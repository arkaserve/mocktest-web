// TopicPractice.jsx  v3.0  — Full Tailwind, matches Dashboard style
// Props:
//   onStartTest(mode, engineKey, options)
//   onBack()
//   studentScores  { topic_id: { best, last, sessions } }
//   defaultExam    string

import { useState, useMemo } from 'react'

// ── Topic catalog ──────────────────────────────────────────────────────────────
const TOPIC_CATALOG = [
  {
    section: 'Numerical Ability',
    sectionKey: 'numerical_ability',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    topics: [
      { id: 'simplification',         name: 'Simplification',            icon: '🔢', exam: 'Clerk Prelims · 10–15 Qs', engineKey: 'simplification'          },
      { id: 'number_series',           name: 'Number Series',             icon: '🔁', exam: 'All exams · 5 Qs',         engineKey: 'number_series'           },
      { id: 'data_interpretation',     name: 'Data Interpretation',       icon: '📊', exam: 'All exams · 5–20 Qs',      engineKey: 'data_interpretation'     },
      { id: 'quadratic_equations',     name: 'Quadratic Equations',       icon: '📐', exam: 'PO Prelims · 5 Qs',        engineKey: 'quadratic_equations'     },
      { id: 'profit_loss',             name: 'Profit & Loss',             icon: '💹', exam: 'All exams · 1–3 Qs',       engineKey: 'profit_loss'             },
      { id: 'simple_interest',         name: 'Simple Interest',           icon: '🏦', exam: 'All exams · 1–2 Qs',       engineKey: 'simple_interest'         },
      { id: 'percentage',              name: 'Percentage',                icon: '📈', exam: 'All exams · 1–3 Qs',       engineKey: 'percentage'              },
      { id: 'time_work',               name: 'Time & Work',               icon: '⚙️', exam: 'All exams · 1–3 Qs',       engineKey: 'time_work'               },
      { id: 'time_distance',           name: 'Time & Distance',           icon: '🚀', exam: 'All exams · 1–2 Qs',       engineKey: 'time_distance'           },
      { id: 'average',                 name: 'Average',                   icon: '⚖️', exam: 'All exams · 1–2 Qs',       engineKey: 'average'                 },
      { id: 'ages',                    name: 'Problems on Ages',          icon: '👤', exam: 'Clerk Prelims · 1–2 Qs',   engineKey: 'ages'                    },
      { id: 'ratio_proportion',        name: 'Ratio & Proportion',        icon: '⚡', exam: 'All exams · 1–2 Qs',       engineKey: 'ratio_proportion'        },
      { id: 'mixture_alligation',      name: 'Mixture & Alligation',      icon: '🧪', exam: 'Clerk Prelims · 1 Q',      engineKey: 'mixture_alligation'      },
      { id: 'mensuration',             name: 'Mensuration',               icon: '📏', exam: 'Clerk Mains · 1–2 Qs',     engineKey: 'mensuration'             },
      { id: 'partnership',             name: 'Partnership',               icon: '🤝', exam: 'Clerk Prelims · 1 Q',      engineKey: 'partnership'             },
      { id: 'probability',             name: 'Probability',               icon: '🎲', exam: 'Clerk Prelims · 1 Q',      engineKey: 'probability'             },
      { id: 'permutation_combination', name: 'Permutation & Combination', icon: '🔣', exam: 'Clerk Prelims · 1 Q',      engineKey: 'permutation_combination' },
      { id: 'pipes_cisterns',          name: 'Pipes & Cisterns',          icon: '🔧', exam: 'Clerk Prelims · 1 Q',      engineKey: 'pipes_cisterns'          },
      { id: 'boats_streams',           name: 'Boats & Streams',           icon: '🚢', exam: 'Clerk Prelims · 1 Q',      engineKey: 'boats_streams'           },
    ],
  },
  {
    section: 'Reasoning Ability',
    sectionKey: 'reasoning',
    dot: 'bg-violet-500',
    badge: 'bg-violet-100 text-violet-700',
    topics: [
      { id: 'seating_arrangement',  name: 'Seating Arrangement',  icon: '🪑', exam: 'All exams · 5–10 Qs',    engineKey: 'seating_arrangement'  },
      { id: 'puzzles',              name: 'Puzzles',              icon: '🧩', exam: 'All exams · 5–10 Qs',    engineKey: 'puzzles'              },
      { id: 'syllogisms',           name: 'Syllogisms',           icon: '💬', exam: 'All exams · 3–5 Qs',     engineKey: 'syllogisms'           },
      { id: 'inequalities',         name: 'Inequalities',         icon: '🔃', exam: 'All exams · 3–5 Qs',     engineKey: 'inequality'           },
      { id: 'coding_decoding',      name: 'Coding-Decoding',      icon: '🔑', exam: 'All exams · 3–5 Qs',     engineKey: 'coding_decoding'      },
      { id: 'blood_relations',      name: 'Blood Relations',      icon: '🩸', exam: 'All exams · 2–3 Qs',     engineKey: 'blood_relations'      },
      { id: 'direction_sense',      name: 'Direction Sense',      icon: '🧭', exam: 'All exams · 2 Qs',       engineKey: 'direction_sense'      },
      { id: 'alphanumeric_series',  name: 'Alphanumeric Series',  icon: '🔤', exam: 'Clerk Prelims · 2–4 Qs', engineKey: 'alphanumeric_series'  },
      { id: 'order_ranking',        name: 'Order & Ranking',      icon: '🏅', exam: 'Clerk Prelims · 2–3 Qs', engineKey: 'order_ranking'        },
      { id: 'machine_input_output', name: 'Machine Input-Output', icon: '🖥️', exam: 'Clerk Mains · 5 Qs',    engineKey: 'machine_input_output' },
    ],
  },
  {
    section: 'English Language',
    sectionKey: 'english',
    dot: 'bg-cyan-500',
    badge: 'bg-cyan-100 text-cyan-700',
    topics: [
      { id: 'reading_comprehension', name: 'Reading Comprehension', icon: '📖', exam: 'All exams · 5–10 Qs',    engineKey: 'reading_comprehension' },
      { id: 'cloze_test',            name: 'Cloze Test',            icon: '✍️', exam: 'All exams · 5 Qs',        engineKey: 'cloze_test'            },
      { id: 'error_detection',       name: 'Error Detection',       icon: '🔍', exam: 'All exams · 5–10 Qs',    engineKey: 'error_detection'       },
      { id: 'para_jumbles',          name: 'Para Jumbles',          icon: '🔀', exam: 'All exams · 5 Qs',        engineKey: 'para_jumbles'          },
      { id: 'fill_in_the_blanks',    name: 'Fill in the Blanks',    icon: '📝', exam: 'Clerk Prelims · 4–5 Qs', engineKey: 'fill_in_the_blanks'    },
      { id: 'vocabulary',            name: 'Vocabulary',            icon: '📚', exam: 'Clerk Prelims · 2 Qs',   engineKey: 'vocabulary'            },
      { id: 'sentence_improvement',  name: 'Sentence Improvement',  icon: '✒️', exam: 'PO Mains · 5–10 Qs',    engineKey: 'sentence_improvement'  },
    ],
  },
]

const DIFFICULTIES = [
  { id: 'easy',     label: 'Easy',     desc: 'Clerk Prelims level — build confidence'     },
  { id: 'medium',   label: 'Medium',   desc: 'PO Prelims level — exam-realistic'          },
  { id: 'hard',     label: 'Hard',     desc: 'PO Mains level — challenge yourself'        },
  { id: 'mixed',    label: 'Mixed',    desc: 'All sub-types cycling — see full range'     },
  { id: 'adaptive', label: 'Adaptive', desc: 'Based on your past score performance'       },
]

const Q_COUNTS = [5, 10, 15, 20, 25, 30]

// ── Toggle ──────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function TopicPractice({
  onStartTest,
  onBack,
  studentScores = {},
  defaultExam = 'bank_clerk_prelims',
}) {
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState(null)
  const [difficulty, setDifficulty] = useState('easy')
  const [qCount,     setQCount]     = useState(10)
  const [timed,      setTimed]      = useState(false)
  const [showExpl,   setShowExpl]   = useState(true)
  const [negMark,    setNegMark]    = useState(true)
  const [launching,  setLaunching]  = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return TOPIC_CATALOG
    return TOPIC_CATALOG.map(sec => ({
      ...sec,
      topics: sec.topics.filter(t =>
        t.name.toLowerCase().includes(q) || t.exam.toLowerCase().includes(q)
      ),
    })).filter(sec => sec.topics.length > 0)
  }, [search])

  const sc              = selected ? (studentScores[selected.id] || null) : null
  const selectedSection = selected ? TOPIC_CATALOG.find(s => s.topics.some(t => t.id === selected.id)) : null
  const diffObj         = DIFFICULTIES.find(d => d.id === difficulty)

  const handleStart = async () => {
    if (!selected || launching) return
    setLaunching(true)
    try {
      onStartTest('topic', selected.engineKey || selected.id, {
        difficulty,
        count:             qCount,
        timed,
        show_explanations: showExpl,
        negative_marking:  negMark,
        exam:              defaultExam,
      })
    } finally {
      setLaunching(false)
    }
  }

  // Quick-start topics shown on empty state
  const quickTopics = [
    TOPIC_CATALOG[0].topics[0],  // Simplification
    TOPIC_CATALOG[0].topics[1],  // Number Series
    TOPIC_CATALOG[0].topics[2],  // Data Interpretation
    TOPIC_CATALOG[1].topics[0],  // Seating Arrangement
    TOPIC_CATALOG[2].topics[0],  // Reading Comprehension
    TOPIC_CATALOG[0].topics[4],  // Profit & Loss
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ═══════════ LEFT PANEL ═══════════ */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col"
        style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
          {onBack && (
            <button onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 font-semibold mb-3 transition-colors">
              ← Back to Dashboard
            </button>
          )}
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">🎯</span>
            </div>
            <span className="text-sm font-black text-gray-900">Topic Practice</span>
          </div>
          <p className="text-xs text-gray-400 ml-9">35 topics · unique questions every session</p>

          {/* Search */}
          <div className="relative mt-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search topics…"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Topic list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-gray-400">
              No topics match &ldquo;{search}&rdquo;
            </div>
          ) : filtered.map(sec => (
            <div key={sec.sectionKey}>
              {/* Section header */}
              <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sec.dot}`} />
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{sec.section}</span>
                <span className="text-xs text-gray-300 ml-auto">{sec.topics.length}</span>
              </div>

              <div className="grid grid-cols-2 gap-1 px-3 pb-1">
              {sec.topics.map(t => {
                const score    = studentScores[t.id]
                const isActive = selected?.id === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => { setSelected(t); setDifficulty('easy'); setQCount(10) }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-blue-50 border border-blue-300'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0 ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold truncate leading-tight ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                        {t.name}
                      </div>
                    </div>
                    {score?.best && (
                      <span className={`text-[10px] font-bold px-1 py-0.5 rounded-full flex-shrink-0 ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-green-100 text-green-700'}`}>
                        {score.best}
                      </span>
                    )}
                  </button>
                )
              })}
              </div>
            </div>
          ))}
          <div className="h-6" />
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL ═══════════ */}
      <div className="flex-1 overflow-y-auto bg-gray-50">

        {/* ── Empty state ── */}
        {!selected && (
          <div className="flex flex-col items-center justify-center min-h-full px-8 py-16">
            {/* Hero */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-lg">
              📚
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Select a topic to practise</h2>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-sm">
              Pick any topic from the left panel to configure difficulty, question count, and session options.
            </p>

            {/* Quick-start chips */}
            <div className="w-full max-w-xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Quick start</p>
              <div className="grid grid-cols-3 gap-3">
                {quickTopics.map(t => (
                  <button key={t.id} onClick={() => setSelected(t)}
                    className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{t.icon}</div>
                    <div className="text-xs font-bold text-gray-800 leading-tight">{t.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{t.exam.split('·')[0].trim()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats banner */}
            <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-xl">
              {[
                { icon: '🔢', label: '35 Topics',         sub: 'All IBPS/SBI syllabus'  },
                { icon: '⚡', label: 'Fresh Every Time',   sub: 'Zero repetition'         },
                { icon: '🎯', label: '5 Difficulty levels', sub: 'Easy to Adaptive'      },
              ].map(s => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-sm font-black text-gray-800">{s.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Config panel ── */}
        {selected && (
          <div className="max-w-2xl mx-auto px-6 py-7">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
              <span>Topic Practice</span>
              <span>›</span>
              <span className={`font-bold ${selectedSection?.sectionKey === 'numerical_ability' ? 'text-blue-600' : selectedSection?.sectionKey === 'reasoning' ? 'text-violet-600' : 'text-cyan-600'}`}>
                {selectedSection?.section}
              </span>
              <span>›</span>
              <span className="text-gray-700 font-semibold">{selected.name}</span>
            </div>

            {/* ── Topic hero card ── */}
            <div className={`rounded-2xl p-5 mb-6 border ${
              selectedSection?.sectionKey === 'numerical_ability' ? 'bg-blue-50 border-blue-100' :
              selectedSection?.sectionKey === 'reasoning'         ? 'bg-violet-50 border-violet-100' :
                                                                    'bg-cyan-50 border-cyan-100'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm flex-shrink-0">
                  {selected.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-black text-gray-900 leading-tight">{selected.name}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{selected.exam}</p>
                  <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-2 ${selectedSection?.badge || 'bg-blue-100 text-blue-700'}`}>
                    {selectedSection?.section}
                  </span>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors flex-shrink-0 text-lg">
                  ✕
                </button>
              </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">Best score</div>
                <div className={`text-2xl font-black ${sc?.best ? 'text-green-600' : 'text-gray-300'}`}>
                  {sc?.best || '—'}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">Last attempt</div>
                <div className="text-2xl font-black text-gray-700">{sc?.last || '—'}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">Sessions</div>
                <div className="text-2xl font-black text-blue-600">{sc?.sessions ?? 0}</div>
              </div>
            </div>

            {/* ── Difficulty ── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-black text-gray-900">Difficulty</div>
                <span className="text-xs text-gray-400">{diffObj?.desc}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {DIFFICULTIES.map(d => {
                  const active = difficulty === d.id
                  const colors = {
                    easy:     active ? 'bg-green-500  border-green-500  text-white'          : 'bg-white text-gray-500 border-gray-200 hover:border-green-400  hover:text-green-600',
                    medium:   active ? 'bg-amber-500  border-amber-500  text-white'          : 'bg-white text-gray-500 border-gray-200 hover:border-amber-400  hover:text-amber-600',
                    hard:     active ? 'bg-red-500    border-red-500    text-white'          : 'bg-white text-gray-500 border-gray-200 hover:border-red-400    hover:text-red-600',
                    mixed:    active ? 'bg-blue-600   border-blue-600   text-white'          : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400   hover:text-blue-600',
                    adaptive: active ? 'bg-violet-600 border-violet-600 text-white'          : 'bg-white text-gray-500 border-gray-200 hover:border-violet-400 hover:text-violet-600',
                  }[d.id]
                  return (
                    <button key={d.id} onClick={() => setDifficulty(d.id)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${colors}`}>
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Question count ── */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
              <div className="text-sm font-black text-gray-900 mb-3">Number of questions</div>
              <div className="flex gap-2">
                {Q_COUNTS.map(n => (
                  <button key={n} onClick={() => setQCount(n)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                      qCount === n
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Session options ── */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <div className="text-sm font-black text-gray-900">Session options</div>
              </div>
              {[
                { label: 'Timed mode',                     sub: '60 seconds per question',              val: timed,    set: setTimed    },
                { label: 'Show explanations after answer', sub: 'Immediate feedback on each question',  val: showExpl, set: setShowExpl },
                { label: 'Negative marking',               sub: '−0.25 for wrong answers (IBPS pattern)', val: negMark,  set: setNegMark  },
              ].map((opt, i) => (
                <div key={opt.label}
                  className={`flex items-center justify-between px-5 py-4 ${i < 2 ? 'border-b border-gray-100' : ''}`}>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{opt.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                  </div>
                  <Toggle value={opt.val} onChange={opt.set} />
                </div>
              ))}
            </div>

            {/* ── Start button ── */}
            <button
              onClick={handleStart}
              disabled={launching}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all shadow-sm ${
                launching
                  ? 'bg-blue-300 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {launching
                ? '⏳ Preparing questions…'
                : `▶ Start ${selected.name} — ${qCount} Qs · ${diffObj?.label || ''}`
              }
            </button>

            <p className="text-xs text-gray-400 text-center mt-3 mb-6">
              Questions are generated fresh every session — no repeats.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
