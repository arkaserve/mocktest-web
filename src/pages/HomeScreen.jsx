import { useState, useRef, useEffect } from 'react'
import { generateTest, generateMiniTest, generateTopicTest } from '../api.js'

// ── Sidebar icons — identical set to the Dashboard sidebar ─────
const SvgHome  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l7-7 7 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M8 19V12h4v7"/></svg>
const SvgDoc   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M12 2v4h4M6 10h8M6 13h5"/></svg>
const SvgCal   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="16" height="14" rx="2"/><path d="M2 8h16M6 2v4M14 2v4"/></svg>
const SvgChart = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="10" width="4" height="8"/><rect x="8" y="6" width="4" height="12"/><rect x="14" y="2" width="4" height="16"/></svg>
const SvgClip  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-3M8 3a1 1 0 011-1h2a1 1 0 011 1M8 3h4"/></svg>
const SvgUser  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="6" r="4"/><path d="M2 18c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const SvgCard  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="16" height="12" rx="2"/><path d="M2 9h16"/></svg>
const SvgGear  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/></svg>

// ── Colours ───────────────────────────────────────────────────
const SEC_COLOR = {
  english:'text-emerald-700 bg-emerald-50 border-emerald-200',
  english_language:'text-emerald-700 bg-emerald-50 border-emerald-200',
  numerical_ability:'text-amber-700 bg-amber-50 border-amber-200',
  reasoning:'text-violet-700 bg-violet-50 border-violet-200',
  quantitative_aptitude:'text-amber-700 bg-amber-50 border-amber-200',
  reasoning_computer_aptitude:'text-violet-700 bg-violet-50 border-violet-200',
  data_analysis_interpretation:'text-amber-700 bg-amber-50 border-amber-200',
  general_financial_awareness:'text-blue-700 bg-blue-50 border-blue-200',
  general_economy_banking:'text-blue-700 bg-blue-50 border-blue-200',
  general_knowledge:'text-blue-700 bg-blue-50 border-blue-200',
  // SSC sections
  general_intelligence_reasoning:'text-violet-700 bg-violet-50 border-violet-200',
  general_intelligence:'text-violet-700 bg-violet-50 border-violet-200',
  general_awareness:'text-blue-700 bg-blue-50 border-blue-200',
  english_comprehension:'text-emerald-700 bg-emerald-50 border-emerald-200',
  numerical_mathematical_ability:'text-amber-700 bg-amber-50 border-amber-200',
  reasoning_problem_solving:'text-violet-700 bg-violet-50 border-violet-200',
  general_english:'text-emerald-700 bg-emerald-50 border-emerald-200',
}
const SEC_LABEL = {
  english:'English Language',
  english_language:'English Language', numerical_ability:'Numerical Ability',
  reasoning:'Reasoning Ability', quantitative_aptitude:'Quantitative Aptitude',
  reasoning_computer_aptitude:'Reasoning & Computer Aptitude',
  data_analysis_interpretation:'Data Analysis & Interpretation',
  general_financial_awareness:'General / Financial Awareness',
  general_economy_banking:'General Economy & Banking',
  general_knowledge:'General Knowledge',
  // SSC sections
  general_intelligence_reasoning:'General Intelligence & Reasoning',
  general_intelligence:'General Intelligence',
  general_awareness:'General Awareness',
  english_comprehension:'English Comprehension',
  numerical_mathematical_ability:'Numerical & Mathematical Ability',
  reasoning_problem_solving:'Reasoning & Problem Solving',
  general_english:'General English',
}
const secLabel = s => SEC_LABEL[s] || s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())

// ── Exam data ─────────────────────────────────────────────────
const EXAM_TREE = [
  { bank:'IBPS', exams:[
    { id:'bank_clerk_prelims', name:'IBPS Clerk Prelims', badge:'Clerk', level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
    { id:'bank_clerk_mains',   name:'IBPS Clerk Mains',   badge:'Clerk', level:'Mains',   questions:175, duration:'160 min', negative:0.25, sections:['general_financial_awareness','general_english','reasoning_computer_aptitude','quantitative_aptitude'], pattern:{general_financial_awareness:50,general_english:45,reasoning_computer_aptitude:40,quantitative_aptitude:40} },
    { id:'bank_po_prelims',    name:'IBPS PO Prelims',    badge:'PO',    level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','quantitative_aptitude','reasoning'], pattern:{english:30,quantitative_aptitude:35,reasoning:35} },
    { id:'bank_po_mains',      name:'IBPS PO Mains',      badge:'PO',    level:'Mains',   questions:175, duration:'180 min', negative:0.25, sections:['reasoning_computer_aptitude','english_language','data_analysis_interpretation','general_economy_banking'], pattern:{reasoning_computer_aptitude:45,english_language:45,data_analysis_interpretation:45,general_economy_banking:40} },
  ]},
  { bank:'SBI', exams:[
    { id:'sbi_clerk_prelims', name:'SBI Clerk Prelims', badge:'Clerk', level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
    { id:'sbi_clerk_mains',   name:'SBI Clerk Mains',   badge:'Clerk', level:'Mains',   questions:170, duration:'160 min', negative:0.25, sections:['general_english','quantitative_aptitude','reasoning_computer_aptitude','general_financial_awareness'], pattern:{general_english:45,quantitative_aptitude:40,reasoning_computer_aptitude:40,general_financial_awareness:45} },
    { id:'sbi_po_prelims',    name:'SBI PO Prelims',    badge:'PO',    level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','quantitative_aptitude','reasoning'], pattern:{english:30,quantitative_aptitude:35,reasoning:35} },
    { id:'sbi_po_mains',      name:'SBI PO Mains',      badge:'PO',    level:'Mains',   questions:175, duration:'180 min', negative:0.25, sections:['reasoning_computer_aptitude','data_analysis_interpretation','general_economy_banking','english_language'], pattern:{reasoning_computer_aptitude:45,data_analysis_interpretation:45,general_economy_banking:40,english_language:45} },
  ]},
  { bank:'RBI', exams:[
    { id:'rbi_assistant_pre',   name:'RBI Assistant Prelims', badge:'Assistant', level:'Prelims', questions:100, duration:'60 min',  negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
    { id:'rbi_assistant_mains', name:'RBI Assistant Mains',   badge:'Assistant', level:'Mains',   questions:190, duration:'135 min', negative:0.25, sections:['general_financial_awareness','general_english','reasoning_computer_aptitude','quantitative_aptitude'], pattern:{general_financial_awareness:50,general_english:45,reasoning_computer_aptitude:40,quantitative_aptitude:40} },
    { id:'rbi_gradeb_p1',       name:'RBI Grade B (Phase 1)', badge:'Grade B',   level:'Phase 1', questions:155, duration:'120 min', negative:0.25, sections:['reasoning_computer_aptitude','english_language','data_analysis_interpretation','general_economy_banking'], pattern:{reasoning_computer_aptitude:45,english_language:45,data_analysis_interpretation:45,general_economy_banking:40} },
  ]},
  { bank:'NABARD', exams:[
    { id:'nabard_gradeA_pre', name:'NABARD Grade A Prelims',         badge:'Grade A', level:'Prelims', questions:190, duration:'120 min', negative:0.25, sections:['general_financial_awareness','general_english','reasoning_computer_aptitude','quantitative_aptitude'], pattern:{general_financial_awareness:50,general_english:45,reasoning_computer_aptitude:40,quantitative_aptitude:40} },
    { id:'nabard_da_pre',     name:'NABARD Development Assistant',   badge:'DA',      level:'Prelims', questions:100, duration:'60 min',  negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
  ]},
  { bank:'LIC', exams:[
    { id:'lic_aao_pre',       name:'LIC AAO Prelims',       badge:'AAO',       level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','quantitative_aptitude','reasoning'], pattern:{english:30,quantitative_aptitude:35,reasoning:35} },
    { id:'lic_assistant_pre', name:'LIC Assistant Prelims', badge:'Assistant', level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
    { id:'lic_ado_pre',       name:'LIC ADO Prelims',       badge:'ADO',       level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
  ]},
  { bank:'Insurance', exams:[
    { id:'niacl_assistant_pre', name:'NIACL Assistant Prelims', badge:'NIACL', level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
    { id:'nicl_ao_pre',         name:'NICL AO Prelims',         badge:'NICL',  level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','quantitative_aptitude','reasoning'], pattern:{english:30,quantitative_aptitude:35,reasoning:35} },
  ]},
  { bank:'India Post', exams:[
    { id:'ippb_officer', name:'IPPB Officer Scale I', badge:'IPPB', level:'Prelims', questions:100, duration:'60 min', negative:0.25, sections:['english','numerical_ability','reasoning'], pattern:{english:30,numerical_ability:35,reasoning:35} },
  ]},
  { bank:'PSU', exams:[
    { id:'coal_india_mt', name:'Coal India MT', badge:'MT', level:'Main', questions:100, duration:'120 min', negative:0, sections:['general_knowledge','reasoning','quantitative_aptitude','english'], pattern:{general_knowledge:30,reasoning:25,quantitative_aptitude:25,english:20} },
  ]},
  { bank:'SSC', exams:[
    { id:'ssc_cgl_tier1',  name:'SSC CGL Tier I',  badge:'CGL',  level:'Tier I', questions:100, duration:'60 min', negative:0.50, sections:['general_intelligence_reasoning','general_awareness','quantitative_aptitude','english_comprehension'], pattern:{general_intelligence_reasoning:25,general_awareness:25,quantitative_aptitude:25,english_comprehension:25} },
    { id:'ssc_chsl_tier1', name:'SSC CHSL Tier I', badge:'CHSL', level:'Tier I', questions:100, duration:'60 min', negative:0.50, sections:['general_intelligence','general_awareness','quantitative_aptitude','english_language'], pattern:{general_intelligence:25,general_awareness:25,quantitative_aptitude:25,english_language:25} },
    { id:'ssc_mts_paper1', name:'SSC MTS Paper I', badge:'MTS',  level:'Paper I', questions:80, duration:'90 min', negative:0,    sections:['numerical_mathematical_ability','reasoning_problem_solving','general_english','general_awareness'], pattern:{numerical_mathematical_ability:20,reasoning_problem_solving:20,general_english:20,general_awareness:20} },
  ]},
]

const ALL_EXAMS = EXAM_TREE.flatMap(g => g.exams)

// ── Topic data ────────────────────────────────────────────────
const TOPICS = [
  { section:'numerical_ability', label:'Numerical Ability', accent:'#F59E0B',
    topics:[
      { id:'simplification',         label:'Simplification',        sub:'BODMAS · sqrt · fractions' }, 
	  { id:'data_sufficiency',       label:'Data Sufficiency',      sub:'find value · yes/no · sufficient' },
      { id:'number_series',          label:'Number Series',         sub:'patterns · missing term' },
      { id:'data_interpretation',    label:'Data Interpretation',   sub:'tables · bar · pie charts' },
      { id:'profit_loss',            label:'Profit & Loss',         sub:'SP / CP / profit %' },
      { id:'simple_compound_interest',label:'Simple Interest',      sub:'SI / CI / difference' },
      { id:'percentage',             label:'Percentage',            sub:'successive % · population' },
      { id:'time_work',              label:'Time & Work',           sub:'pipes · cisterns · combined' },
      { id:'time_speed_distance',    label:'Time & Distance',       sub:'trains · boats · relative speed' },
      { id:'average',                label:'Average',               sub:'combined avg · weighted' },
      { id:'problems_on_ages',       label:'Ages',                  sub:'ratio · linear equations' },
      { id:'ratio_proportion',       label:'Ratio & Proportion',    sub:'direct · indirect' },
      { id:'mixture_alligation',     label:'Mixture & Alligation',  sub:'rule of alligation' },
      { id:'quadratic_equations',    label:'Quadratic Equations',   sub:'roots · compare I & II' },
      { id:'partnership_ratio',      label:'Partnership',           sub:'profit sharing · time ratio' },
      { id:'mensuration_2d',         label:'Mensuration',           sub:'area · perimeter · volume' },
      { id:'boats_streams',          label:'Boats & Streams',       sub:'upstream · downstream' },
      { id:'pipes_cisterns',         label:'Pipes & Cisterns',      sub:'fill · drain · together' },
      { id:'probability',            label:'Probability',           sub:'P(E) · cards · dice' },
      { id:'permutation_combination',label:'Permutation & Combination', sub:'nPr · nCr · arrangements' },
      { id:'trigonometry',            label:'Trigonometry',             sub:'standard angles · height & distance' },
    ]
  },
  { section:'reasoning', label:'Reasoning Ability', accent:'#8B5CF6',
    topics:[
      { id:'seating_arrangement_linear',   label:'Linear Seating',     sub:'row · facing same/opposite' },
      { id:'seating_arrangement_circular', label:'Circular Seating',   sub:'round table · facing centre' },
      { id:'puzzle_box_floor',             label:'Floor / Box Puzzle',  sub:'ordering · multi-parameter' },
      { id:'syllogisms',                   label:'Syllogism',           sub:'all · some · no · possibility' },
      { id:'inequalities',                 label:'Coded Inequality',    sub:'coded signs · conclusions' },
      { id:'blood_relations',              label:'Blood Relations',     sub:'family tree · coded relations' },
      { id:'direction_sense',              label:'Direction Sense',     sub:'N/S/E/W · distance' },
      { id:'coding_decoding',              label:'Coding-Decoding',     sub:'letter / number codes' },
      { id:'alphanumeric_series',          label:'Alphanumeric Series', sub:'mixed series · next term' },
      { id:'order_ranking',                label:'Order & Ranking',     sub:'position from top/bottom' },
      { id:'computer_awareness',           label:'Computer Awareness',  sub:'hardware · software · MS Office · internet' },
      { id:'data_sufficiency_reasoning',   label:'Data Sufficiency',    sub:'arrangement · relationships · direction' },
      { id:'venn_diagram',                 label:'Venn Diagram',        sub:'two-set · three-set · intersection' },
      { id:'missing_number',               label:'Missing Number',      sub:'grid patterns · triangle · matrix' },
    ]
  },
  { section:'english', label:'English Language', accent:'#10B981',
    topics:[
      { id:'error_detection',    label:'Error Detection',   sub:'subject-verb · tense · preposition' },
      { id:'cloze_test',         label:'Cloze Test',        sub:'fill 5-word passage' },
      { id:'para_jumbles',       label:'Para Jumbles',      sub:'rearrange sentences' },
      { id:'vocabulary',         label:'Vocabulary',        sub:'synonyms · antonyms (60 words)' },
      { id:'fill_in_the_blanks', label:'Fill in the Blanks',sub:'grammar · context words' },
      { id:'reading_comprehension',  label:'Reading Comprehension',sub:'passage · 5 Qs' },
    ]
  },
]

const BADGE = { Clerk:'bg-indigo-100 text-indigo-700', PO:'bg-purple-100 text-purple-700', MT:'bg-green-100 text-green-700' }
const LEVEL = { Prelims:'bg-sky-100 text-sky-700', Mains:'bg-amber-100 text-amber-700', Main:'bg-amber-100 text-amber-700' }

// ── Tab: Full Mock ────────────────────────────────────────────
function FullMockTab({ studentName, onStart, initialExamId = '', registeredExamIds = [], isPro = false }) {
  // Restrict the tree to the exams the user registered for (free users).
  const hasReg = registeredExamIds.length > 0
  const visibleTree = (isPro || !hasReg)
    ? EXAM_TREE
    : EXAM_TREE
        .map(g => ({ ...g, exams: g.exams.filter(e => registeredExamIds.includes(e.id)) }))
        .filter(g => g.exams.length > 0)
  const tree = visibleTree.length ? visibleTree : EXAM_TREE   // safety fallback

  // Pre-select bank and exam if initialExamId provided (must be in the visible tree)
  const _initExam = initialExamId ? tree.flatMap(g=>g.exams).find(e => e.id === initialExamId) : null
  const _initBank = _initExam ? tree.find(g => g.exams.some(e => e.id === initialExamId))?.bank : tree[0].bank
  const [bank,      setBank]    = useState(_initBank || tree[0].bank)
  const [examId,    setExamId]  = useState((_initExam ? initialExamId : tree[0].exams[0].id))
  const [loading,   setLoading] = useState(false)
  const [error,     setError]   = useState('')

  const group = tree.find(g => g.bank === bank) || tree[0]
  const exam  = ALL_EXAMS.find(e => e.id === examId) || group.exams[0]

  const changeBank = b => { setBank(b); setExamId(tree.find(g=>g.bank===b).exams[0].id); setError('') }

  const start = async () => {
    setError(''); setLoading(true)
    try { const d = await generateTest(studentName, exam.id); onStart(d) }
    catch(e) { setError(e.friendlyMessage || 'Server error. Please try again.'); setLoading(false) }
  }

  return (
    <div className="space-y-4">
      {/* Bank tabs */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Select bank</p>
        <div className="flex gap-2">
          {tree.map(g => (
            <button key={g.bank} onClick={() => changeBank(g.bank)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all
                ${bank===g.bank ? 'text-white' : 'border-gray-200 text-gray-700 hover:border-orange-300'}`}
              style={bank===g.bank ? {borderColor:'#FF653F',background:'#FF653F'} : {}}>
              {g.bank}
            </button>
          ))}
        </div>
      </div>

      {/* Exam dropdown */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Select exam</p>
        <select value={examId} onChange={e=>{setExamId(e.target.value);setError('')}}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium bg-white focus:outline-none cursor-pointer" style={{focusBorderColor:'#FF653F'}}
          onFocus={e=>e.target.style.borderColor='#FF653F'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}>
          {group.exams.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name} — {ex.level}</option>
          ))}
        </select>
      </div>

      {/* Exam card */}
      <div className="rounded-2xl border p-4" style={{background:'#FFF3EE',borderColor:'#fec9b0'}}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-gray-900 text-sm">{exam.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE[exam.badge]||'bg-gray-100 text-gray-600'}`}>{exam.badge}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL[exam.level]||'bg-gray-100 text-gray-600'}`}>{exam.level}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[[`${exam.questions}Q`,'Questions'],[exam.duration,'Duration'],[exam.negative>0?`-${exam.negative}`:'None','Negative']].map(([v,l])=>(
            <div key={l} className="bg-white rounded-xl p-2 text-center border" style={{borderColor:'#fec9b0'}}>
              <div className="text-xs font-bold" style={{color:'#FF653F'}}>{v}</div>
              <div className="text-xs text-gray-500">{l}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {exam.sections.map(s=>(
            <div key={s} className={`flex justify-between px-3 py-1.5 rounded-lg border text-xs font-medium ${SEC_COLOR[s]||'text-gray-700 bg-gray-50 border-gray-200'}`}>
              <span>{secLabel(s)}</span>
              <span>{exam.pattern[s]}Q · 20 min</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-0.5">
        <div className="font-semibold mb-1">Before you start:</div>
        <div>• Each section has a separate 20-minute timer — auto-moves to next section when time expires</div>
        {exam.negative>0 && <div>• Negative marking: -{exam.negative} per wrong answer</div>}
        <div>• Download solution PDF after submission for full explanations</div>
      </div>

      {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

      <button onClick={start} disabled={loading}
        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-60 transition-all"
        style={{background:'#FF653F'}}
        onMouseOver={e=>!loading&&(e.currentTarget.style.background='#e5512f')}
        onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
        {loading
          ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generating test...</span>
          : `Start ${exam.name}`}
      </button>
    </div>
  )
}

// ── Tab: Topic Practice ───────────────────────────────────────
function TopicPracticeTab({ studentName, onStart, user = null, sectionId = 'numerical_ability' }) {
  const [topic,      setTopic]     = useState(null)
  const [topicSec,   setTopicSec]  = useState(null)
  const [difficulty, setDifficulty]= useState('diagnostic')
  const [count,      setCount]     = useState(10)
  const [loading,    setLoading]   = useState(false)
  const [error,      setError]     = useState('')

  const currentSection = TOPICS.find(s => s.section === sectionId) || TOPICS[0]
  const isDiagnostic   = difficulty === 'diagnostic'

  const pickTopic = (t, secId) => { setTopic(t); setTopicSec(secId); setError('') }

  const start = async () => {
    if (!topic) return
    setError(''); setLoading(true)
    try {
      const d = isDiagnostic
        ? await generateTopicTest(topicSec, topic.id, count, user?.id || null)
        : await generateMiniTest(topicSec, topic.id, count, difficulty, user?.id || studentName)
      onStart(d)
    }
    catch(e) { setError(e.friendlyMessage||'Server error. Please try again.'); setLoading(false) }
  }

  const diffStyle = { easy:'bg-emerald-100 text-emerald-800 border-emerald-300', medium:'bg-amber-100 text-amber-800 border-amber-300', hard:'bg-red-100 text-red-800 border-red-300', mixed:'bg-orange-100 text-orange-800 border-orange-300', diagnostic:'bg-orange-100 text-orange-800 border-orange-300' }

  return (
    <div className="flex flex-col xl:flex-row gap-4 items-start">

      {/* ── TOPIC CARDS for selected section ── */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
          {currentSection.label} — {currentSection.topics.length} Topics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
          {currentSection.topics.map(t => {
            const isSel = topic?.id === t.id
            return (
              <button key={t.id}
                onClick={() => pickTopic(t, currentSection.section)}
                className={`text-left px-3 py-2 rounded-xl border transition-all hover:shadow-sm ${isSel ? 'border-2' : ''}`}
                style={isSel
                  ? { background:'#FFF3EE', borderColor:'#FF653F' }
                  : { background:`${currentSection.accent}0D`, borderColor:`${currentSection.accent}33`, borderLeftColor: currentSection.accent, borderLeftWidth: 4 }}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-bold leading-tight"
                    style={{ color: isSel ? '#111' : currentSection.accent }}>
                    {t.label}
                  </span>
                  {isSel && <span className="text-[10px] text-white px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background:'#FF653F' }}>✓</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">{t.sub}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT: config panel ── */}
      <div className="w-full xl:w-72 flex-shrink-0">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-4 xl:sticky xl:top-4">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">{topic ? secLabel(topicSec) : 'No topic selected'}</div>
            <div className="text-base font-black" style={{color: topic ? '#FF653F' : '#9ca3af'}}>{topic ? topic.label : 'Pick a topic →'}</div>
          </div>

          {/* ── Mode: Diagnostic vs Practice ── */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=>setDifficulty('diagnostic')}
                className={`py-1.5 text-xs font-semibold rounded-xl border-2 transition-all ${isDiagnostic ? diffStyle.diagnostic+' border-current' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}>
                🎯 Diagnostic
              </button>
              <button onClick={()=>setDifficulty(prev => prev==='diagnostic' ? 'easy' : prev)}
                className={`py-1.5 text-xs font-semibold rounded-xl border-2 transition-all ${!isDiagnostic ? 'bg-blue-50 text-blue-700 border-blue-300 border-current' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}>
                📚 Practice
              </button>
            </div>
            {isDiagnostic && (
              <p className="text-[11px] text-orange-600 mt-1.5 leading-tight">
                Auto-mix of Easy + Medium + Hard — shows your level instantly after the test
              </p>
            )}
          </div>

          {/* ── Difficulty (only when Practice mode) ── */}
          {!isDiagnostic && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Difficulty</p>
            <div className="grid grid-cols-2 gap-2">
              {['easy','medium','hard','mixed'].map(d=>(
                <button key={d} onClick={()=>setDifficulty(d)}
                  className={`py-1.5 text-xs font-semibold rounded-xl border-2 capitalize transition-all
                    ${difficulty===d ? diffStyle[d]+' border-current' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}>
                  {d === 'mixed' ? '⚡ Mixed' : d}
                </button>
              ))}
            </div>
          </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Number of questions</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:'#FFF3EE', color:'#FF653F'}}>~{Math.max(5,count)} min</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[5,10,15,20,30,50].map(n=>(
                <button key={n} onClick={()=>setCount(n)}
                  className={`h-9 text-xs font-bold rounded-xl border-2 transition-all
                    ${count===n ? 'text-white' : 'border-gray-200 text-gray-600 bg-white hover:border-orange-300'}`}
                  style={count===n ? {borderColor:'#FF653F',background:'#FF653F'} : {}}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          <button onClick={start} disabled={loading || !topic}
            className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{background:'#FF653F'}}
            onMouseOver={e=>!loading&&topic&&(e.currentTarget.style.background='#e5512f')}
            onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generating…</span>
              : !topic
                ? 'Select a topic to start'
                : isDiagnostic
                  ? `🎯 Start Diagnostic · ${count}Q · ~${Math.max(5,count)} min`
                  : `Start · ${count}Q · ~${Math.max(5,count)} min · ${difficulty}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Section Test ─────────────────────────────────────────
function SectionTestTab({ studentName, onStart, user = null }) {
  const [sec,     setSec]     = useState('numerical_ability')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const SECS = [
    { id:'numerical_ability', label:'Numerical Ability', q:35, mins:20, accent:'#F59E0B', bg:'bg-amber-50', border:'border-amber-200', text:'text-amber-800' },
    { id:'reasoning',         label:'Reasoning Ability', q:35, mins:20, accent:'#8B5CF6', bg:'bg-violet-50', border:'border-violet-200', text:'text-violet-800' },
    { id:'english',           label:'English Language',  q:30, mins:20, accent:'#10B981', bg:'bg-emerald-50', border:'border-emerald-200', text:'text-emerald-800' },
  ]
  const active = SECS.find(s=>s.id===sec)||SECS[0]

  const start = async () => {
    setError(''); setLoading(true)
    // For section tests, cycle through all topics of that section
    // Send multiple mini-tests and merge — or use the first topic with enough Q count
    // Strategy: pick the highest-variety topic per section
    const topic = 'all'
    const sectDiff = user?.id ? 'adaptive' : 'mixed'
    try { const d = await generateMiniTest(sec, topic, active.q, sectDiff, user?.id || null); onStart(d) }
    catch(e) { setError(e.friendlyMessage||'Server error. Please try again.'); setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Practice one complete section under timed exam conditions</p>

      <div className="grid grid-cols-3 gap-3">
        {SECS.map(s=>(
          <button key={s.id} onClick={()=>{setSec(s.id);setError('')}}
            className={`p-4 rounded-2xl border-2 text-left transition-all
              ${sec===s.id ? `border-2 ${s.border} ${s.bg}` : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className="w-8 h-8 rounded-xl mb-2 flex items-center justify-center" style={{background:s.accent}}>
              <span className="text-white text-sm font-bold">{s.label[0]}</span>
            </div>
            <div className={`text-xs font-bold mb-1 ${sec===s.id?s.text:'text-gray-700'}`}>{s.label}</div>
            <div className="text-xs text-gray-400">{s.q}Q · {s.mins} min</div>
          </button>
        ))}
      </div>

      <div className={`rounded-2xl border-2 ${active.border} ${active.bg} p-4`}>
        <div className={`font-bold text-sm mb-3 ${active.text}`}>{active.label} Section Test</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[[`${active.q}Q`,'Questions'],[`${active.mins} min`,'Timer'],['-0.25','Negative']].map(([v,l])=>(
            <div key={l} className="bg-white rounded-xl p-2">
              <div className={`text-sm font-bold ${active.text}`}>{v}</div>
              <div className="text-xs text-gray-500">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-0.5">
        <div className="font-semibold mb-1">Section test rules:</div>
        <div>• 20-minute timer starts immediately on begin</div>
        <div>• Same difficulty mix as real IBPS / SBI exam</div>
        <div>• Full explanation PDF available after submission</div>
      </div>

      {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

      <button onClick={start} disabled={loading}
        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-60 transition-all"
        style={{background:'#FF653F'}}
        onMouseOver={e=>!loading&&(e.currentTarget.style.background='#e5512f')}
        onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
        {loading
          ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generating section test...</span>
          : `Start ${active.label} · ${active.q}Q · ${active.mins} min`}
      </button>
    </div>
  )
}

// ── Main HomeScreen ───────────────────────────────────────────
export default function HomeScreen({ studentName, onStart, onBack, onNav, onLogout, startMode = 'mock', startExamId = '', user = null }) {
  const [tab,        setTab]        = useState(startMode)
  const [topicSecId, setTopicSecId] = useState('numerical_ability')
  const mainRef = useRef(null)

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [tab])

  // Registration + subscription → which exams the user may launch
  const _meta = user?.user_metadata || {}
  const _plan = (_meta.plan || _meta.subscription || 'free').toLowerCase()
  const isPro = !['free','','none'].includes(_plan)
  const registeredExamIds = (Array.isArray(_meta.selected_exams) && _meta.selected_exams.length)
    ? _meta.selected_exams
    : (_meta.target_exam ? [_meta.target_exam] : [])

  // 7-day trial
  const createdAt     = user?.created_at ? new Date(user.created_at) : new Date()
  const trialDaysLeft = Math.max(0, Math.ceil((createdAt.getTime() + 7*86400000 - Date.now())/86400000))
  const trialActive   = !isPro && trialDaysLeft > 0

  const initials = (studentName||'U').slice(0,2).toUpperCase()
  const tabs = [
    { id:'mock',    label:'Full Mock Test',  icon:'📝' },
    { id:'topic',   label:'Topic Practice',  icon:'🎯' },
    { id:'section', label:'Section Test',    icon:'⏱' },
  ]
  const SIDE = [
    { id:'dashboard',     label:'Dashboard',     Icon:SvgHome  },
    { id:'explore',       label:'Explore Exams', Icon:SvgDoc   },
    { id:'studyplan',     label:'Study Planner', Icon:SvgCal   },
    { id:'results',       label:'My Results',    Icon:SvgChart },
    { id:'subscriptions', label:'Subscriptions', Icon:SvgClip  },
    { id:'profile',       label:'Profile',       Icon:SvgUser  },
    { id:'billing',       label:'Billing',       Icon:SvgCard  },
    { id:'settings',      label:'Settings',      Icon:SvgGear  },
  ]

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{background:'#ffffff'}}>

      {/* ── Dark header with mode buttons ── */}
      <header className="h-16 flex items-center px-5 gap-4 flex-shrink-0 shadow-md" style={{ background:'#111' }}>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'#FF653F'}}>
            <span className="text-white text-sm font-black">MT</span>
          </div>
          <div className="hidden sm:block leading-none">
            <div className="text-base font-black text-white tracking-tight">MockTest</div>
            <div className="text-xs" style={{color:'#888'}}>by Anil Software Technologies</div>
          </div>
        </div>
        <div className="flex-1" />
        <button onClick={onBack}
          className="text-sm text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-1.5 font-medium transition-colors">
          ← Exit
        </button>
        <button onClick={onLogout}
          className="text-sm text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-1.5 font-medium transition-colors">
          Log out
        </button>
      </header>

      {/* ── Trial banner ── */}
      {trialActive && (
        <div className="px-5 py-2.5 flex items-center justify-center gap-3 text-sm flex-wrap text-white flex-shrink-0" style={{ background:'#1a1a2e' }}>
          <span>You have <b style={{color:'#FF653F'}}>{trialDaysLeft}</b> day{trialDaysLeft>1?'s':''} left in your free trial. Upgrade for unlimited mocks, all exams &amp; PDF solutions.</span>
          <button onClick={()=>onNav?.('subscriptions')} className="text-white text-xs font-bold px-4 py-1.5 rounded-lg flex-shrink-0" style={{ background:'#FF653F' }}>Upgrade Now</button>
        </div>
      )}

      <div className="flex flex-1 min-h-0">

        {/* ── Left sidebar ── */}
        <aside className="w-56 flex-shrink-0 hidden md:flex flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <nav className="flex-1 py-3 px-2">
            {SIDE.map(item => (
              <button key={item.id} onClick={()=>onNav?.(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm mb-0.5 transition-all text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium">
                <span className="flex-shrink-0"><item.Icon /></span>{item.label}
              </button>
            ))}
            {tab === 'topic' && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Subject</p>
                {TOPICS.map(sec => {
                  const active = topicSecId === sec.section
                  return (
                    <button key={sec.section}
                      onClick={() => setTopicSecId(sec.section)}
                      className="w-full text-left px-3 py-2.5 rounded-xl mb-0.5 transition-all"
                      style={active
                        ? { background:`${sec.accent}15`, color: sec.accent }
                        : { color:'#4b5563' }}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sec.accent }}/>
                        <span className="text-xs font-semibold leading-tight">{sec.label}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 ml-4">{sec.topics.length} topics</div>
                    </button>
                  )
                })}
              </div>
            )}
          </nav>
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background:'#FF653F' }}>{initials}</div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{studentName}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
            <button onClick={onLogout} className="w-full py-2 text-red-500 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-50 transition-colors">↪ Log Out</button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main ref={mainRef} className="flex-1 overflow-y-auto nice-scroll py-7 px-6">
          <div className="w-full">

            <div className="mb-6">
              <div className="text-gray-500 text-sm">Welcome, <span className="font-semibold text-gray-900">{studentName}</span></div>
              <h1 className="text-2xl font-black text-gray-900 mt-1">What would you like to practice?</h1>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
              {tab==='mock'    && <FullMockTab    studentName={studentName} onStart={onStart} initialExamId={startExamId} registeredExamIds={registeredExamIds} isPro={isPro} />}
              {tab==='topic'   && <TopicPracticeTab key={topicSecId} studentName={studentName} onStart={onStart} user={user} sectionId={topicSecId} />}
              {tab==='section' && <SectionTestTab studentName={studentName} onStart={onStart} user={user} />}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
