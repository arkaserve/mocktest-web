import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import { startCheckout } from '../payments.js'
import { toast } from '../toast.js'
import { getExamBlueprint } from '../api.js'
import { EXAMS as CUTOFF_EXAMS } from './CutoffsPage.jsx'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

/* ─────────────────────────────────────────────
   CONSTANTS  (merged from both files)
───────────────────────────────────────────── */
const ADMIN_EMAILS = [
  'anil.mikkili@stacknexus.io',
  'amikkili@gmail.com',
  'anil.mikkili@gmail.com',
]

export const EXAM_GROUPS = [
  {
    id: 'ibps', label: 'IBPS Exams',
    color: 'from-orange-500 to-orange-600', hex: '#FF653F',
    exams: [
      { id: 'bank_clerk_prelims', name: 'Clerk Prelims', sub: '100Q · 60 min',  tag: 'Popular', tagColor: 'bg-amber-100 text-amber-700' },
      { id: 'bank_clerk_mains',   name: 'Clerk Mains',   sub: '175Q · 160 min', tag: null },
      { id: 'bank_po_prelims',    name: 'PO Prelims',    sub: '100Q · 60 min',  tag: 'Popular', tagColor: 'bg-amber-100 text-amber-700' },
      { id: 'bank_po_mains',      name: 'PO Mains',      sub: '175Q · 180 min', tag: null },
    ],
  },
  {
    id: 'sbi', label: 'SBI Exams',
    color: 'from-gray-800 to-gray-900', hex: '#111',
    exams: [
      { id: 'sbi_clerk_prelims', name: 'Clerk Prelims', sub: '100Q · 60 min',  tag: null },
      { id: 'sbi_clerk_mains',   name: 'Clerk Mains',   sub: '170Q · 160 min', tag: null },
      { id: 'sbi_po_prelims',    name: 'PO Prelims',    sub: '100Q · 60 min',  tag: null },
      { id: 'sbi_po_mains',      name: 'PO Mains',      sub: '175Q · 180 min', tag: null },
    ],
  },
  {
    id: 'rbi', label: 'RBI Exams',
    color: 'from-rose-500 to-rose-600', hex: '#e11d48',
    exams: [
      { id: 'rbi_assistant_pre',   name: 'Assistant Prelims', sub: '100Q · 60 min',  tag: 'New', tagColor: 'bg-rose-100 text-rose-700' },
      { id: 'rbi_assistant_mains', name: 'Assistant Mains',   sub: '200Q · 135 min', tag: null },
      { id: 'rbi_gradeb_p1',       name: 'Grade B (Phase 1)', sub: '200Q · 120 min', tag: null },
    ],
  },
  {
    id: 'nabard', label: 'NABARD Exams',
    color: 'from-green-600 to-green-700', hex: '#16a34a',
    exams: [
      { id: 'nabard_gradeA_pre', name: 'Grade A Prelims',          sub: '200Q · 120 min', tag: null },
      { id: 'nabard_da_pre',     name: 'Development Assistant',     sub: '100Q · 60 min',  tag: null },
    ],
  },
  {
    id: 'lic', label: 'LIC Exams',
    color: 'from-blue-600 to-blue-700', hex: '#2563eb',
    exams: [
      { id: 'lic_aao_pre',       name: 'AAO Prelims',       sub: '100Q · 60 min',  tag: null },
      { id: 'lic_aao_mains',     name: 'AAO Mains',         sub: '120Q · 120 min', tag: 'New', tagColor: 'bg-blue-100 text-blue-700' },
      { id: 'lic_assistant_pre', name: 'Assistant Prelims', sub: '100Q · 60 min',  tag: null },
      { id: 'lic_ado_pre',       name: 'ADO Prelims',       sub: '100Q · 60 min',  tag: null },
      { id: 'lic_ado_mains',     name: 'ADO Mains',         sub: '120Q · 120 min', tag: 'New', tagColor: 'bg-blue-100 text-blue-700' },
    ],
  },
  {
    id: 'insurance', label: 'Insurance Exams',
    color: 'from-cyan-600 to-cyan-700', hex: '#0891b2',
    exams: [
      { id: 'niacl_ao_pre',       name: 'NIACL AO Prelims',       sub: '100Q · 60 min', tag: null },
      { id: 'niacl_assistant_pre', name: 'NIACL Assistant Prelims', sub: '100Q · 60 min', tag: null },
      { id: 'nicl_ao_pre',         name: 'NICL AO Prelims',         sub: '100Q · 60 min', tag: null },
      { id: 'uiic_ao_pre',         name: 'UIIC AO Prelims',         sub: '100Q · 60 min', tag: null },
      { id: 'oicl_ao_pre',         name: 'OICL AO Prelims',         sub: '100Q · 60 min', tag: null },
    ],
  },
  {
    id: 'indiapost', label: 'India Post Exams',
    color: 'from-amber-600 to-amber-700', hex: '#d97706',
    exams: [
      { id: 'ippb_officer', name: 'IPPB Officer Scale I', sub: '100Q · 60 min', tag: null },
    ],
  },
  {
    id: 'psu', label: 'PSU Exams',
    color: 'from-emerald-600 to-emerald-700', hex: '#059669',
    exams: [
      { id: 'coal_india_mt', name: 'Coal India MT', sub: '100Q · 120 min', tag: 'New', tagColor: 'bg-emerald-100 text-emerald-700' },
    ],
  },
]

const CATEGORIES = [
  { value:'UR',   label:'General / UR' },
  { value:'OBC',  label:'OBC' },
  { value:'EWS',  label:'EWS' },
  { value:'SC',   label:'SC' },
  { value:'ST',   label:'ST' },
  { value:'PwBD', label:'PwBD' },
]
const LEVELS = [
  { value:'beginner',     label:'Beginner' },
  { value:'intermediate', label:'Intermediate' },
  { value:'advanced',     label:'Advanced' },
]

const SvgDoc   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M12 2v4h4M6 10h8M6 13h5"/></svg>
const SvgTarget = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r="1" fill="currentColor"/></svg>
const SvgTimer  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="11" r="7"/><path d="M10 7v4l2.5 2.5"/><path d="M7.5 2h5M10 2v2"/></svg>
const SvgHome   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l7-7 7 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M8 19V12h4v7"/></svg>
const SvgCal    = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="16" height="14" rx="2"/><path d="M2 8h16M6 2v4M14 2v4"/></svg>
const SvgChart  = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="10" width="4" height="8"/><rect x="8" y="6" width="4" height="12"/><rect x="14" y="2" width="4" height="16"/></svg>
const SvgClip   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-3M8 3a1 1 0 011-1h2a1 1 0 011 1M8 3h4"/></svg>
const SvgUser   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="6" r="4"/><path d="M2 18c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const SvgCard   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="16" height="12" rx="2"/><path d="M2 9h16"/></svg>
const SvgGear   = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/></svg>

const MODES = [
  { id:'mock',    label:'Full Mock Test',  desc:'100Q · all sections · -0.25 · PDF result',    Icon:SvgDoc,    bg:'bg-blue-600',    light:'bg-blue-50',    text:'text-blue-700',    border:'border-blue-200'    },
  { id:'topic',   label:'Topic Practice',  desc:'35 topics · unique questions · any difficulty', Icon:SvgTarget, bg:'bg-violet-600',  light:'bg-violet-50',  text:'text-violet-700',  border:'border-violet-200'  },
  { id:'section', label:'Section Test',    desc:'Pick one section · 20 min timed · full score',  Icon:SvgTimer,  bg:'bg-emerald-600', light:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200' },
]

const SIDEBAR_NAV = [
  { id:'home',          Icon:SvgHome,  label:'Dashboard'     },
  { id:'explore',       Icon:SvgDoc,   label:'Explore Exams' },
  { id:'studyplan',     Icon:SvgCal,   label:'Study Planner' },
  { id:'results',       Icon:SvgChart, label:'My Results'    },
  { id:'subscriptions', Icon:SvgClip,  label:'Subscriptions' },
  { id:'profile',       Icon:SvgUser,  label:'Profile'       },
  { id:'billing',       Icon:SvgCard,  label:'Billing'       },
  { id:'settings',      Icon:SvgGear,  label:'Settings'      },
]

const TOPIC_GROUPS = [
  { section:'Quantitative Aptitude', color:'#1d4ed8', topics:['Simplification','Number Series','Quadratic Equations','Data Interpretation','Percentage','Profit & Loss','Time & Work','Time & Distance','Mensuration'] },
  { section:'Reasoning Ability',     color:'#7c3aed', topics:['Puzzles & Seating','Syllogism','Inequality','Blood Relations','Coding-Decoding','Direction Sense','Floor Puzzles','Input-Output'] },
  { section:'English Language',      color:'#0891b2', topics:['Reading Comprehension','Cloze Test','Error Detection','Para Jumbles','Fill in the Blanks','Sentence Improvement'] },
  { section:'General Awareness',     color:'#d97706', topics:['Current Affairs','Banking Awareness','RBI & Monetary Policy','Financial Terms','Government Schemes','Static GK'] },
  { section:'Insurance Awareness',   color:'#0e7490', topics:['IRDAI & Regulations','LIC Products','Insurance Principles','Government Schemes (PMJJBY/PMSBY/PMFBY)','Health Insurance & PM-JAY','Reinsurance','Bancassurance','ULIP & Investment Plans','Insurance Terminology','Solvency & Capital Norms'] },
]

const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const WEEK_DISPLAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']  // grid display order

/* Indicative latest-year cut-offs (marks) by exam group + category — for the
   personalised "your score vs cut-off" card. Mirrors the public Cut-offs page. */
const CUTOFF_BY_GROUP = {
  ibps:      { UR:76.5, OBC:75.0, EWS:74.5, SC:68.0, ST:56.0, PwBD:48.0 },
  sbi:       { UR:80.5, OBC:79.0, EWS:78.0, SC:72.0, ST:60.0, PwBD:52.0 },
  rrb:       { UR:70.0, OBC:68.0, EWS:67.0, SC:60.0, ST:52.0, PwBD:44.0 },
  rbi:       { UR:84.0, OBC:82.0, EWS:81.0, SC:75.0, ST:64.0, PwBD:55.0 },
  nabard:    { UR:70.0, OBC:67.0, EWS:66.0, SC:58.0, ST:50.0, PwBD:44.0 },
  lic:       { UR:72.0, OBC:70.0, EWS:69.0, SC:62.0, ST:54.0, PwBD:46.0 },
  insurance: { UR:78.0, OBC:76.0, EWS:75.0, SC:68.0, ST:58.0, PwBD:50.0 },
  indiapost: { UR:62.0, OBC:60.0, EWS:59.0, SC:52.0, ST:45.0, PwBD:38.0 },
  psu:       { UR:55.0, OBC:52.0, EWS:51.0, SC:45.0, ST:40.0, PwBD:35.0 },
}

/* Dashboard exam id → public Cut-offs page exam id (for the Cut-off Marks tab) */
const CUTOFF_ID_MAP = {
  bank_clerk_prelims:'ibps_clerk_pre', bank_clerk_mains:'ibps_clerk_mains',
  bank_po_prelims:'ibps_po_pre',       bank_po_mains:'ibps_po_mains',
  sbi_clerk_prelims:'sbi_clerk_pre',   sbi_po_prelims:'sbi_po_pre',
  // LIC
  lic_aao_pre:'lic_aao_pre',           lic_aao_mains:'lic_aao_mains',
  lic_assistant_pre:'lic_assistant_pre',
  lic_ado_pre:'lic_ado_pre',           lic_ado_mains:'lic_ado_mains',
  // General Insurance
  niacl_ao_pre:'niacl_ao_pre',         niacl_assistant_pre:'niacl_assistant_pre',
  nicl_ao_pre:'nicl_ao_pre',
  uiic_ao_pre:'uiic_ao_pre',
  oicl_ao_pre:'oicl_ao_pre',
  // NABARD
  nabard_gradeA_pre:'nabard_gradeA_pre', nabard_da_pre:'nabard_da_pre',
  // India Post / PSU
  ippb_officer:'ippb_officer',
  coal_india_mt:'coal_india_mt',
}

/* Subscription tiers with validity — shown in Explore Exams + Subscriptions */
const PLAN_TIERS = [
  { id:'basic',    name:'Basic',    price:'₹199',  validity:'1 month',  features:['5 mock tests / month','Topic practice','Basic analytics'] },
  { id:'pro',      name:'Pro',      price:'₹499',  validity:'1 month',  popular:true, features:['Unlimited mock tests','PDF solutions','personalised study plan','Priority support'] },
  { id:'ultimate', name:'Ultimate', price:'₹1199', validity:'3 months', features:['Everything in Pro','All exam categories','Performance trends','WhatsApp reminders'] },
]

/* section label → key, to store weak topics grouped by section */
const SECTION_KEY = {
  'Quantitative Aptitude': 'arithmetic',
  'Reasoning Ability':     'reasoning',
  'English Language':      'english',
  'General Awareness':     'general_awareness',
}
function groupWeakTopics(weakTopics) {
  const grouped = {}
  TOPIC_GROUPS.forEach(g => {
    const picked = g.topics.filter(t => weakTopics.includes(t))
    if (picked.length) grouped[SECTION_KEY[g.section] || g.section] = picked
  })
  return grouped
}

/* ─────────────────────────────────────────────
   PLAN GENERATOR  (pure JS, no API needed)
───────────────────────────────────────────── */
function generatePlan({ startDate, endDate, studyDays, hoursPerDay, dayHours = {}, weakTopics }) {
  const start = new Date(startDate)
  const end   = new Date(endDate)
  const total = Math.round((end - start) / (1000 * 60 * 60 * 24))
  if (total < 1) return null

  const allTopics = TOPIC_GROUPS.flatMap(g => g.topics)
  const priority  = allTopics.filter(t => weakTopics.includes(t))
  const rest      = allTopics.filter(t => !weakTopics.includes(t))
  const ordered   = [...priority, ...rest]

  const days = []
  let topicIdx = 0
  for (let i = 0; i <= total; i++) {
    const d   = new Date(start); d.setDate(start.getDate() + i)
    const dow = WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]
    if (!studyDays.includes(dow)) continue
    const dayNum   = days.length + 1
    const isRevise = dayNum % 14 === 0
    const isMock   = !isRevise && dayNum % 7 === 0
    let type, topics, duration
    const dh = dayHours[dow] || hoursPerDay
    if (isRevise)     { type='revision'; topics=['Full Revision'];   duration=`${dh}h` }
    else if (isMock)  { type='mock';     topics=['Full Mock Test'];  duration='2–3h' }
    else              {
      type='study'
      topics = ordered.slice(topicIdx, topicIdx + 2).filter(Boolean)
      if (!topics.length) topics = ['Revision / Practice']
      topicIdx = (topicIdx + 2) % ordered.length
      duration = `${dh}h`
    }
    days.push({
      day: dayNum,
      date: d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}),
      dow, type, topics, duration,
    })
  }
  return {
    totalCalendarDays: total,
    scheduledDays:     days.length,
    studyDays:         days.filter(d=>d.type==='study').length,
    mockDays:          days.filter(d=>d.type==='mock').length,
    revisionDays:      days.filter(d=>d.type==='revision').length,
    days,
  }
}

/* ─────────────────────────────────────────────
   DASHBOARD  (merged — keeps all existing
   functionality, adds UWorld sidebar tabs)

   Props (unchanged from existing):
     user          Supabase user object
     onStartTest   (mode, examId?) → launches test
     onLogout      signs out
     onNav         routes to other pages
   New prop:
     planData      wizard output (optional)
───────────────────────────────────────────── */
/* ── ActionButton — avoids IIFE in JSX ── */
function ActionButton({ dayType, topics, getAction }) {
  const act = getAction(dayType, topics)
  return (
    <button
      onClick={act.onClick}
      className={`text-xs font-bold px-4 py-1.5 rounded-full flex-shrink-0 transition-all ${act.cls} whitespace-nowrap`}>
      {act.label}
    </button>
  )
}

/* ── TodayPlanCard — shows today or next pending day on Home tab ── */
function TodayPlanCard({ savedPlan, onViewPlan }) {
  if (!savedPlan) return null
  const days = savedPlan?.days || []
  const todayFormatted = new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})
  const todayPlan  = days.find(d => d.date === todayFormatted)
  const nextPlan   = days.find(d => d.type)   // first available day
  const display    = todayPlan || nextPlan
  if (!display) return null
  const icon = display.type==='mock' ? '📝' : display.type==='revision' ? '🔁' : '📖'
  const label = todayPlan ? "TODAY'S PLAN — Day "+display.day : "NEXT UP — Day "+display.day
  return (
    <div className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4" style={{background:'#FF653F'}}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:'rgba(255,255,255,.2)'}}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-semibold mb-0.5" style={{color:'rgba(255,255,255,.75)'}}>{label}</div>
          <div className="text-sm font-black text-white">{display.topics.join(', ')}</div>
          <div className="text-xs mt-0.5" style={{color:'rgba(255,255,255,.75)'}}>{display.duration} · {display.date}</div>
        </div>
      </div>
      <button
        onClick={onViewPlan}
        className="flex-shrink-0 text-xs font-black px-4 py-2 rounded-full hover:shadow-lg transition-all whitespace-nowrap"
        style={{background:'#fff',color:'#FF653F'}}>
        View Full Plan →
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PLAN SCHEDULE VIEW — UWorld-style day list
   Shows after plan is saved. Groups days by
   week, expandable rows, topic + action chips.
───────────────────────────────────────────── */
function PlanScheduleView({ plan, onStartTest, onTopicPractice, onRebuild, todayStr }) {
  const days   = plan?.days || []
  const [expandedWeeks, setExpandedWeeks] = useState(() => {
    const init = {}; init[0] = true; return init
  })
  const [doneDays, setDoneDays] = useState({})

  if (!days.length) return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
      <div className="text-3xl mb-3">📅</div>
      <div className="text-sm font-bold text-blue-800 mb-1">No schedule data found</div>
      <button onClick={onRebuild} className="text-xs text-blue-600 font-semibold underline">Create a plan</button>
    </div>
  )

  /* Group days into weeks */
  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i+7))

  const totalDone  = Object.values(doneDays).filter(Boolean).length
  const totalDays  = days.length
  const pctDone    = totalDays ? Math.round((totalDone/totalDays)*100) : 0

  const typeLabel  = t => t==='mock' ? 'Mock Test' : t==='revision' ? 'Revision' : 'Study'
  const typeBadge  = t => t==='mock'
    ? 'bg-cyan-100 text-cyan-700'
    : t==='revision'
    ? 'bg-green-100 text-green-700'
    : 'bg-violet-100 text-violet-700'
  /* action resolves per day type — study days get topic-specific routing */
  const getAction = (dayType, topics) => {
    if (dayType === 'mock')
      return { label:'Launch Mock Test', cls:'bg-pink-500 hover:bg-pink-600 text-white',
               onClick: () => onStartTest('mock') }
    if (dayType === 'revision')
      return { label:'Review Topics', cls:'bg-green-500 hover:bg-green-600 text-white',
               onClick: () => onTopicPractice(topics[0] || '') }
    // Study day — route to topic practice with the specific topic pre-selected
    return { label:'Practice Questions', cls:'bg-violet-500 hover:bg-violet-600 text-white',
             onClick: () => onTopicPractice(topics[0] || '') }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">My Study Plan</h2>
          <p className="text-sm text-gray-500 mt-0.5">{totalDays} scheduled days · {plan.studyDays||'—'} study · {plan.mockDays||'—'} mocks · {plan.revisionDays||'—'} revision</p>
        </div>
        <button onClick={onRebuild}
          className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-semibold">
          ✏️ Rebuild Plan
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-900">Overall Progress</span>
          <span className="text-sm font-black text-blue-600">{pctDone}% complete</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
            style={{width:`${pctDone}%`}}/>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-black text-green-600">{totalDone}</div>
            <div className="text-xs text-gray-400">Days done</div>
          </div>
          <div>
            <div className="text-lg font-black text-blue-600">{totalDays - totalDone}</div>
            <div className="text-xs text-gray-400">Days remaining</div>
          </div>
          <div>
            <div className="text-lg font-black text-violet-600">{totalDays}</div>
            <div className="text-xs text-gray-400">Total days</div>
          </div>
        </div>
      </div>

      {/* Week-by-week schedule — UWorld style */}
      <div className="space-y-3">
        {weeks.map((weekDays, wIdx) => {
          const weekNum   = wIdx + 1
          const isOpen    = expandedWeeks[wIdx] !== false
          const doneInWk  = weekDays.filter(d => doneDays[d.day]).length
          /* total hrs = sum of hours string parsed */
          const totalHrs  = weekDays.reduce((s,d)=>{
            const m = d.duration?.match(/(\d+)/)
            return s + (m ? parseInt(m[1]) : 0)
          }, 0)

          /* Determine weekday name for group label */
          const firstDay  = weekDays[0]
          const lastDay   = weekDays[weekDays.length-1]

          return (
            <div key={wIdx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {/* Week header — clickable to expand/collapse */}
              <button
                onClick={() => setExpandedWeeks(p=>({...p,[wIdx]:!isOpen}))}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 ${doneInWk===weekDays.length?'bg-green-500 border-green-500 text-white':doneInWk>0?'bg-blue-50 border-blue-400 text-blue-700':'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    {doneInWk===weekDays.length ? '✓' : weekNum}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900">
                      Week {weekNum} · Days {firstDay.day}–{lastDay.day}
                    </div>
                    <div className="text-xs text-gray-400">{firstDay.date} — {lastDay.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 hidden sm:block">{totalHrs} hrs est.</span>
                  <span className="text-xs font-semibold text-gray-500">{doneInWk}/{weekDays.length} done</span>
                  <span className={`text-gray-400 transition-transform ${isOpen?'rotate-180':''} text-sm`}>▼</span>
                </div>
              </button>

              {/* Day rows — UWorld style */}
              {isOpen && (
                <div className="border-t border-gray-100">
                  {weekDays.map((d, dIdx) => {
                    const isDone   = doneDays[d.day]
                    const isToday  = d.date?.includes(new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'}))

                    return (
                      <div key={d.day}
                        className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b border-gray-50 last:border-0 transition-all ${isDone?'bg-green-50/40':isToday?'bg-blue-50/50':''}`}>

                        {/* Meta row: checkbox · day · date (own line on mobile) */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <button
                            onClick={() => setDoneDays(p=>({...p,[d.day]:!isDone}))}
                            className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isDone?'bg-blue-600 border-blue-600 text-white':'border-gray-300 hover:border-blue-400'}`}
                            title="Mark as done"
                          >
                            {isDone && <span className="text-xs font-bold">✓</span>}
                          </button>
                          <div className={`text-xs font-bold flex-shrink-0 ${isDone?'text-green-600':isToday?'text-blue-700':'text-gray-400'}`}>
                            D{d.day}
                          </div>
                          <div className={`text-xs font-semibold ${isToday?'text-blue-700':isDone?'text-green-600':'text-gray-600'}`}>
                            {d.date}
                            {isToday && <span className="ml-1 text-blue-500">• Today</span>}
                          </div>
                        </div>

                        {/* Topics */}
                        <div className="flex-1 flex items-center gap-1.5 flex-wrap min-w-0 sm:pl-0 pl-9">
                          {d.topics.map(t => (
                            <span key={t}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${isDone?'bg-green-100 text-green-700 line-through opacity-60':typeBadge(d.type)}`}>
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Action + duration (own line on mobile) */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pl-9 sm:pl-0">
                          {!isDone && <ActionButton dayType={d.type} topics={d.topics} getAction={getAction} />}
                          {isDone && (
                            <span className="text-xs text-green-600 font-semibold whitespace-nowrap">✓ Completed</span>
                          )}
                          <div className="text-xs text-gray-400 flex-shrink-0 w-10 text-right">{d.duration}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom motivation banner */}
      <div className="mt-6 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-5 text-white flex items-center justify-between">
        <div>
          <div className="text-sm font-black mb-1">
            {pctDone === 0 && "🚀 Your journey starts today — Day 1 awaits!"}
            {pctDone > 0 && pctDone < 50 && `🔥 Great start! ${totalDone} days done — keep the momentum!`}
            {pctDone >= 50 && pctDone < 100 && `⚡ More than halfway there — you're on track!`}
            {pctDone === 100 && "🏆 Plan complete — you're exam ready!"}
          </div>
          <div className="text-xs text-blue-200">{totalDays - totalDone} study days remaining to your exam</div>
        </div>
        <button onClick={() => onStartTest('mock')}
          className="flex-shrink-0 bg-white text-blue-700 text-xs font-black px-5 py-2.5 rounded-full hover:shadow-lg transition-all whitespace-nowrap ml-4">
          Take a Mock Test →
        </button>
      </div>
    </div>
  )
}


export default function Dashboard({ user, planData, onStartTest, onLogout, onNav, onOpenResult, initialTab = 'home' }) {

  /* ── existing state ── */
  const [history,    setHistory]   = useState([])
  const [panelOpen,  setPanelOpen] = useState(false)

  /* ── new sidebar state ── */
  const [activeTab,  setActiveTab] = useState(initialTab)
  const [exploreExam, setExploreExam] = useState(null)   // selected exam in Explore view
  const [exploreTab,  setExploreTab]  = useState('overview')
  const [blueprint,   setBlueprint]   = useState(null)
  const [bpLoading,   setBpLoading]   = useState(false)
  useEffect(() => { if (activeTab !== 'explore') setExploreExam(null) }, [activeTab])
  // Make browser Back close an open exam-detail (return to the exam list) instead
  // of appearing to do nothing — the detail is internal state, so we register a
  // history entry while it's open and pop back to the list on Back.
  useEffect(() => {
    if (!exploreExam) return
    window.history.pushState({ dashExplore: true }, '')
    const onPop = () => setExploreExam(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [exploreExam])
  // load the real per-exam blueprint (topic-wise weightage) when an exam opens
  useEffect(() => {
    if (!exploreExam) { setBlueprint(null); return }
    setExploreTab('overview'); setBlueprint(null); setBpLoading(true)
    let cancelled = false
    // Retry on failure — Render free tier cold-starts, so the first hit after
    // inactivity can time out; without this it falls back to the plain chips view.
    const load = (attempt = 0) =>
      getExamBlueprint(exploreExam)
        .then(d => { if (!cancelled) { setBlueprint(d); setBpLoading(false) } })
        .catch(() => {
          if (cancelled) return
          if (attempt < 3) { setTimeout(() => load(attempt + 1), 2500) }
          else { setBlueprint(null); setBpLoading(false) }
        })
    load()
    return () => { cancelled = true }
  }, [exploreExam])

  /* ── study planner state ── */
  const [planExam,      setPlanExam]      = useState(user?.user_metadata?.target_exam || '')
  const [startDate,     setStartDate]     = useState('')
  const [endDate,       setEndDate]       = useState('')
  const [studyDays,     setStudyDays]     = useState([])
  const [dayHours,      setDayHours]      = useState({})
  // average hours/day across selected days — used where a single value is needed
  const hoursPerDay = studyDays.length
    ? Math.max(1, Math.round(studyDays.reduce((s,d)=>s+(Number(dayHours[d])||0),0)/studyDays.length))
    : 2
  const [weakTopics,    setWeakTopics]    = useState([])
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [savedPlan,     setSavedPlan]     = useState(planData || null)
  const [planSaving,    setPlanSaving]    = useState(false)
  const [planSaved,     setPlanSaved]     = useState(false)
  const [showPlanBuilder,setShowPlanBuilder]= useState(false)
  const [completedDays,  setCompletedDays] = useState({})
  const [planLoading,    setPlanLoading]   = useState(true)   // true until Supabase responds

  /* ── profile state ── */
  const [profileEdit,   setProfileEdit]   = useState(false)
  const [profileName,   setProfileName]   = useState(user?.user_metadata?.full_name || '')
  const [profilePhone,  setProfilePhone]  = useState(user?.user_metadata?.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg,    setProfileMsg]    = useState('')
  // educational status
  const [profileCategory, setProfileCategory] = useState(user?.user_metadata?.category || 'UR')
  const [profileState,    setProfileState]    = useState(user?.user_metadata?.state || '')
  const [profileLevel,    setProfileLevel]    = useState(user?.user_metadata?.level || '')
  const [profileExam,     setProfileExam]     = useState(user?.user_metadata?.target_exam || 'bank_clerk_prelims')
  const [eduEdit,         setEduEdit]         = useState(false)
  const [eduSaving,       setEduSaving]       = useState(false)
  // password change
  const [newPwd,    setNewPwd]    = useState('')
  const [confirmPwd,setConfirmPwd]= useState('')
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg,    setPwdMsg]    = useState('')
  // notification preferences
  const [notifNoSubs,  setNotifNoSubs]  = useState(!!user?.user_metadata?.notif_off_subs)
  const [notifNoPromo, setNotifNoPromo] = useState(!!user?.user_metadata?.notif_off_promo)
  const [notifSaving,  setNotifSaving]  = useState(false)

  /* ── selected / target exam state ── */
  const [selectedExamId, setSelectedExamId] = useState(
    user?.user_metadata?.target_exam || 'bank_clerk_prelims'
  )
  // true only once the user has actually picked an exam (not skipped onboarding)
  const [examChosen,     setExamChosen]     = useState(!!user?.user_metadata?.target_exam)
  const [showAllExams,   setShowAllExams]   = useState(false)
  const [changingExam,   setChangingExam]   = useState(false)
  const [examSaving,     setExamSaving]     = useState(false)

  /* flatten all exams + find the selected one and its group */
  const ALL_EXAMS_FLAT = EXAM_GROUPS.flatMap(g => g.exams.map(e => ({ ...e, groupId: g.id, groupLabel: g.label, groupColor: g.color })))
  const selectedExam   = ALL_EXAMS_FLAT.find(e => e.id === selectedExamId) || ALL_EXAMS_FLAT[0]
  const selectedGroup  = EXAM_GROUPS.find(g => g.id === selectedExam?.groupId) || EXAM_GROUPS[0]

  /* persist a new target exam to Supabase user_metadata */
  const handleChangeExam = async (examId) => {
    setSelectedExamId(examId)
    setExamChosen(true)
    setChangingExam(false)
    setExamSaving(true)
    try { await supabase.auth.updateUser({ data: { target_exam: examId } }) }
    catch (e) { console.error('Change exam error:', e.message) }
    setExamSaving(false)
  }

  /* results that belong to the selected exam GROUP (for progress) */
  const groupExamIds = selectedGroup?.exams?.map(e => e.id) || [selectedExamId]
  const examResults = history.filter(r => groupExamIds.includes(r.exam || ''))

  /* exam ids the user has actually attempted (for "other exams" list) */
  const attemptedExamIds = [...new Set(history.map(r => r.exam).filter(Boolean))]

  /* If the user skipped exam selection but has practised something,
     treat their most recent attempt as the selected exam. */
  useEffect(() => {
    if (!examChosen && history.length > 0 && history[0].exam) {
      setSelectedExamId(history[0].exam)
      setExamChosen(true)
    }
  }, [history, examChosen])

  /* subscription tier — free users can only prepare for one exam group */
  const plan  = (user?.user_metadata?.plan || user?.user_metadata?.subscription || 'free').toLowerCase()
  const isPro = !['free','', 'none'].includes(plan)

  /* 7-day free trial countdown (from account creation) */
  const TRIAL_DAYS    = 7
  const createdAt     = user?.created_at ? new Date(user.created_at) : new Date()
  const trialEnd      = new Date(createdAt.getTime() + TRIAL_DAYS * 86400000)
  const trialDaysLeft = Math.max(0, Math.ceil((trialEnd - new Date()) / 86400000))
  const trialActive   = !isPro && trialDaysLeft > 0
  const trialExpired  = !isPro && trialDaysLeft <= 0
  const trialEndStr   = trialEnd.toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' })

  /* exams the user registered for (free → just their pick; pro → whole group) */
  const registeredExamIds = (Array.isArray(user?.user_metadata?.selected_exams) && user.user_metadata.selected_exams.length)
    ? user.user_metadata.selected_exams
    : [selectedExamId]

  /* Derived live each render (not one-time state) so the "pick an exam" hero
     never flashes for returning users while their data is still loading. */
  const hasChosenExam = examChosen
    || !!user?.user_metadata?.target_exam
    || (Array.isArray(user?.user_metadata?.selected_exams) && user.user_metadata.selected_exams.length > 0)
    || history.length > 0
  const visibleGroupExams = isPro
    ? selectedGroup.exams
    : selectedGroup.exams.filter(e => registeredExamIds.includes(e.id) || e.id === selectedExamId)
  const examBest    = examResults.length ? Math.max(...examResults.map(r => r.percentage || 0)) : null
  const examAvg     = examResults.length ? (examResults.reduce((s,r)=>s+(r.percentage||0),0)/examResults.length) : null
  const lastAttempt = examResults[0] || null
  const readiness   = examBest != null ? Math.min(100, Math.round(examBest)) : 0

  /* ── existing derived values ── */
  const rawName  = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const generic  = ['admin','test','user','testuser','administrator']
  const userName = generic.includes(rawName.toLowerCase()) ? (user?.email?.split('@')[0] || rawName) : rawName
  const adminUser = ADMIN_EMAILS.includes((user?.email || '').toLowerCase())
  const today    = new Date().toISOString().split('T')[0]
  // Free users can't plan past their trial expiry; everyone is capped at 7 days.
  const trialCap = (!isPro && trialActive) ? trialEnd.toISOString().split('T')[0] : ''
  const startMax = trialCap || ''                      // latest the plan may START (free users)
  const minEnd   = startDate || today
  // Plan length cap = 7 days, but never beyond the trial window for free users.
  const maxEnd   = startDate
    ? (() => {
        const cap7 = new Date(new Date(startDate).getTime() + 7 * 86400000)
        const cap  = (!isPro && trialActive)
          ? new Date(Math.min(cap7.getTime(), trialEnd.getTime()))
          : cap7
        return cap.toISOString().split('T')[0]
      })()
    : ''

  // A date input's `max` only limits the calendar popup, not an already-set value.
  // Clamp the picked dates back inside the allowed range (e.g. trial window).
  useEffect(() => {
    if (startMax && startDate && startDate > startMax) setStartDate(startMax)
    if (maxEnd && endDate && endDate > maxEnd) setEndDate(maxEnd)
  }, [startMax, maxEnd, startDate, endDate])

  /* ── load recent results + saved plan ── */
  useEffect(() => {
    if (!user) return

    supabase.from('results').select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setHistory(data || []))
      .catch(() => {})

    if (planData) {
      // Came fresh from OnboardingWizard — already have plan in memory
      setSavedPlan(normalizePlan(planData))
      setPlanLoading(false)
    } else {
      // Returning user — load latest plan from Supabase
      supabase.from('study_plans').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .then(({ data, error }) => {
          if (error) console.error('Load plan error:', error.message)
          if (data?.[0]) setSavedPlan(normalizePlan(data[0]))
          setPlanLoading(false)  // always stop loading, plan or no plan
        })
        .catch((e) => {
          console.error('Load plan exception:', e)
          setPlanLoading(false)
        })
    }
  }, [user])

  /* ── existing stats ── */
  const best = history.length ? Math.max(...history.map(r => r.percentage || 0)).toFixed(1) : null
  const avg  = history.length ? (history.reduce((s, r) => s + (r.percentage || 0), 0) / history.length).toFixed(1) : null

  /* ── plan helpers ── */
  const toggleDay   = d => setStudyDays(p => {
    const has = p.includes(d)
    setDayHours(h => { const n = { ...h }; if (has) delete n[d]; else n[d] = n[d] || 0; return n })
    return has ? p.filter(x => x !== d) : [...p, d]
  })
  const setDayHour  = (d, hrs) => {
    setDayHours(h => ({ ...h, [d]: hrs }))
    setStudyDays(p => p.includes(d) ? p : [...p, d])
  }
  const toggleTopic = t => setWeakTopics(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t])

  /* ── subscription / payment ── */
  const [payingPlan, setPayingPlan] = useState('')
  const handleSubscribe = async (planName) => {
    const planId = (planName || '').toLowerCase()
    setPayingPlan(planId)
    try {
      await startCheckout({ user, plan: planId })   // redirects to Stripe on success
    } catch (e) {
      toast(e?.message || 'Could not start checkout. Please try again.', 'error')
      setPayingPlan('')
    }
  }

  /* Normalize plan shape — Supabase rows wrap it under plan_json */
  const normalizePlan = (raw) => {
    if (!raw) return null
    // Already a raw plan object with .days at root
    if (Array.isArray(raw?.days)) return raw
    // Supabase row — plan is under plan_json
    if (raw?.plan_json) {
      return {
        ...raw.plan_json,
        exam_id:       raw.exam_id,
        exam_date:     raw.exam_date,
        hours_per_day: raw.hours_per_day,
        weak_topics:   raw.weak_topics,
        created_at:    raw.created_at,
      }
    }
    return null
  }

  // Create Plan now generates AND saves in one click (no separate Save step).
  const handleGeneratePlan = async () => {
    if (!startDate || !endDate || !studyDays.length) return
    const span = Math.round((new Date(endDate) - new Date(startDate)) / 86400000)
    if (span > 7) { toast('Study plan can be at most 7 days. Please pick an end date within a week of the start date.', 'error'); return }
    if (!isPro && trialActive && new Date(endDate) > trialEnd) {
      toast(`Your free trial ends on ${trialEndStr}. Pick an end date within your trial, or upgrade for longer plans.`, 'error'); return
    }
    const plan = generatePlan({ startDate, endDate, studyDays, hoursPerDay, dayHours, weakTopics })
    if (!plan) return
    setGeneratedPlan(plan)
    await handleSavePlan(plan)
  }

  const handleSavePlan = async (planArg) => {
    const plan = planArg || generatedPlan
    if (!plan) return
    setPlanSaving(true)

    // Delete old plans for this user first, then insert fresh
    await supabase.from('study_plans').delete().eq('user_id', user.id)

    const { data: inserted, error } = await supabase
      .from('study_plans')
      .insert({
        user_id:       user.id,
        exam_id:       planExam,
        exam_date:     endDate,
        hours_per_day: hoursPerDay,
        weak_topics:   weakTopics,
        plan_json:     plan,
        created_at:    new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Plan save error:', error.message, error.details, error.hint)
      setPlanSaving(false)
      toast('Could not save plan: ' + error.message, 'error')
      return
    }

    await supabase.auth.updateUser({
      data: { onboarding_complete: true, target_exam: planExam }
    })

    // Capture the plan inputs into student_onboarding (one row per student)
    try {
      await supabase.from('student_onboarding').upsert({
        student_id:      user.id,
        exam_id:         planExam,
        selected_exams:  [planExam],
        exam_date:       endDate || null,
        hours_per_day:   hoursPerDay,
        weak_topics:     groupWeakTopics(weakTopics),
        onboarding_done: true,
        updated_at:      new Date().toISOString(),
      }, { onConflict: 'student_id' })
    } catch (e) { console.error('student_onboarding (planner) save failed:', e?.message) }

    // Reflect the chosen exam on the dashboard immediately
    setSelectedExamId(planExam); setExamChosen(true)

    // Use the normalized plan so PlanScheduleView always gets .days at root
    const normalized = normalizePlan(inserted || plan)
    setSavedPlan(normalized)
    setPlanSaving(false)
    setPlanSaved(true)
    setShowPlanBuilder(false)
    setGeneratedPlan(null)
    setTimeout(() => setPlanSaved(false), 3000)
  }

  const handleSaveProfile = async () => {
    setProfileSaving(true); setProfileMsg('')
    await supabase.auth.updateUser({ data: { full_name: profileName, phone: profilePhone } })
    try {
      await supabase.from('profiles').upsert({ id: user.id, full_name: profileName, phone: profilePhone }, { onConflict: 'id' })
      await supabase.from('student_onboarding').upsert({ student_id: user.id, phone: profilePhone, updated_at: new Date().toISOString() }, { onConflict: 'student_id' })
    } catch (_) {}
    setProfileSaving(false); setProfileEdit(false)
    setProfileMsg('✓ Saved'); setTimeout(() => setProfileMsg(''), 2500)
  }

  const handleSaveEdu = async () => {
    setEduSaving(true)
    await supabase.auth.updateUser({ data: {
      category: profileCategory, state: profileState, level: profileLevel, target_exam: profileExam,
    }})
    try {
      await supabase.from('profiles').upsert({ id: user.id, category: profileCategory, state: profileState, target_exam: profileExam }, { onConflict: 'id' })
      await supabase.from('student_onboarding').upsert({ student_id: user.id, exam_id: profileExam, selected_exams: [profileExam], level: profileLevel, updated_at: new Date().toISOString() }, { onConflict: 'student_id' })
    } catch (_) {}
    setSelectedExamId(profileExam); setExamChosen(true)
    setEduSaving(false); setEduEdit(false)
  }

  const handleChangePassword = async () => {
    setPwdMsg('')
    if (newPwd.length < 6)        { setPwdMsg('Password must be at least 6 characters.'); return }
    if (newPwd !== confirmPwd)    { setPwdMsg('Passwords do not match.'); return }
    setPwdSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setPwdSaving(false)
    if (error) { setPwdMsg(error.message); return }
    setNewPwd(''); setConfirmPwd(''); setPwdMsg('✓ Password updated')
    setTimeout(() => setPwdMsg(''), 3000)
  }

  const handleSaveNotif = async (subs, promo) => {
    setNotifNoSubs(subs); setNotifNoPromo(promo); setNotifSaving(true)
    await supabase.auth.updateUser({ data: { notif_off_subs: subs, notif_off_promo: promo } })
    setNotifSaving(false)
  }

  /* ── type colour helpers ── */
  const typeColor = t => t==='mock'?'#FF653F':t==='revision'?'#16a34a':'#FF653F'
  const typeBg    = t => t==='mock'?'#FFF3EE':t==='revision'?'#dcfce7':'#FFF3EE'

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col" style={{background:'#ffffff'}}>

      {/* ══ TOP HEADER — identical to existing ══ */}
      <header className="h-16 flex items-center px-5 gap-4 sticky top-0 z-30 shadow-md" style={{ background:'#111' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'#FF653F' }}>
            <span className="text-white text-sm font-black">MT</span>
          </div>
          <div className="hidden sm:block leading-none">
            <div className="text-base font-black text-white tracking-tight">MockTest</div>
            <div className="text-xs" style={{ color:'#888' }}>by Anil Software Technologies</div>
          </div>
        </div>
        <div className="flex-1"/>
        {/* Right section — kept from existing */}
        <div className="flex items-center gap-2 ml-3">
          {adminUser && (
            <button onClick={() => onNav?.('admin')}
              className="w-9 h-9 flex items-center justify-center bg-white/15 hover:bg-white/25 text-white rounded-xl border border-white/20 transition-colors text-sm">⚙</button>
          )}
          <button onClick={onLogout} title="Log out" aria-label="Log out"
            className="w-9 h-9 flex items-center justify-center rounded-full text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
          <button onClick={() => setPanelOpen(true)} aria-label="Menu"
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-white/20 border border-white/20 transition-colors">
            <span className="w-4 h-0.5 bg-white rounded-full"/>
            <span className="w-4 h-0.5 bg-white rounded-full"/>
            <span className="w-4 h-0.5 bg-white rounded-full"/>
          </button>
        </div>
      </header>

      {/* ══ TRIAL COUNTDOWN BANNER ══ */}
      {(trialActive || trialExpired) && (
        <div className="px-5 py-2.5 flex items-center justify-center gap-3 text-sm flex-wrap text-white"
          style={{ background: trialExpired ? '#7f1d1d' : '#1a1a2e' }}>
          <span>
            {trialExpired
              ? 'Your free trial has ended.'
              : <>You have <b style={{color:'#FF653F'}}>{trialDaysLeft}</b> day{trialDaysLeft>1?'s':''} left in your free trial.</>}
            {' '}Upgrade for unlimited mocks, all exams & PDF solutions.
          </span>
          <button onClick={() => setActiveTab('subscriptions')}
            className="text-white text-xs font-bold px-4 py-1.5 rounded-lg flex-shrink-0"
            style={{ background:'#FF653F' }}>
            Upgrade Now
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0">

        {/* ══ LEFT SIDEBAR — premium white ══ */}
        <aside className="w-56 flex-shrink-0 hidden md:flex flex-col overflow-y-auto border-r border-gray-200 bg-white"
          style={{position:'sticky',top:64,height:'calc(100vh - 64px)'}}>

          {/* Nav items */}
          <nav className="flex-1 py-3 px-2">
            {SIDEBAR_NAV.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm mb-0.5 transition-all ${
                  activeTab === item.id
                    ? 'text-white font-bold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'
                }`}
                style={activeTab === item.id ? { background:'#FF653F' } : {}}>
                <span className="flex-shrink-0"><item.Icon /></span>
                {item.label}
                {activeTab === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"/>}
              </button>
            ))}
          </nav>

          {/* Bottom: user profile + expiry + logout */}
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background:'#FF653F' }}>
                {(userName[0]||'U').toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-900 leading-snug truncate">{userName}</span>
                  {isPro && (
                    <span className="text-[10px] font-black uppercase tracking-wide text-white px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{ background: plan==='ultimate' ? '#7048E8' : '#FF653F' }}>
                      {plan ? plan.charAt(0).toUpperCase()+plan.slice(1) : 'Member'}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {isPro ? 'Plan' : 'Free Trial'}
            </div>
            <div className="text-xs mb-3" style={{ color: trialExpired ? '#dc2626' : '#6b7280' }}>
              {isPro
                ? `${plan.charAt(0).toUpperCase()+plan.slice(1)} — active`
                : trialExpired
                  ? `Expired on ${trialEndStr}`
                  : `${trialDaysLeft} day${trialDaysLeft>1?'s':''} left · ends ${trialEndStr}`}
            </div>
            <button onClick={onLogout}
              className="w-full py-2 text-red-500 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
              ↪ Log Out
            </button>
          </div>
        </aside>

        {/* ══ MAIN CONTENT — swaps per sidebar tab ══ */}
        <main className="flex-1 overflow-auto py-7 px-5 lg:px-8">
          <div className="max-w-7xl mx-auto">

            {/* ── HOME tab (existing dashboard content — unchanged) ── */}
            {activeTab === 'home' && <>
              {/* Welcome */}
              <div className="mb-5">
                <h1 className="text-2xl font-black text-gray-900">Welcome, {(userName||'').replace(/\b\w/g,c=>c.toUpperCase())}!</h1>
                <p className="text-gray-500 text-sm mt-0.5">Your expert-crafted exam prep dashboard</p>
              </div>

              {/* ── KPI strip — always visible ── */}
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:'#FF653F' }}>Your Progress</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                {[
                  { label:'Tests Taken',    value:String(history.length),          hex:'#111827', icon:'📝', bg:'#f1f5f9' },
                  { label:'Best Score',     value:(best!=null?best+'%':'—'),       hex:'#16a34a', icon:'🏆', bg:'#ecfdf5' },
                  { label:'Average Score',  value:(avg!=null?avg+'%':'—'),         hex:'#FF653F', icon:'📊', bg:'#FFF3EE' },
                  { label:'Exam Readiness', value:(examResults.length?readiness+'%':'—'), hex:'#7048E8', icon:'🎯', bg:'#f3effe' },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-2xl border border-gray-200 px-4 py-4 flex items-center gap-3 hover:shadow-md transition-shadow"
                    style={{ boxShadow:'0 1px 3px rgba(0,0,0,.05)' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background:k.bg }}>{k.icon}</div>
                    <div className="min-w-0">
                      <div className="text-2xl font-black leading-none" style={{ color:k.hex }}>{k.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{k.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── STUDY PLAN WIDGET (UWorld-style: upcoming + progress ring) ── */}
              {savedPlan && (() => {
                const days      = savedPlan.days || []
                const total     = days.length
                const completed = Object.values(completedDays).filter(Boolean).length
                const remaining = Math.max(0, total - completed)
                const pct       = total ? Math.round((completed / total) * 100) : 0
                const upcoming  = days.filter(d => !completedDays[d.day]).slice(0, 6)
                const typeIcon  = (t)=> t==='mock'?'📝':t==='revision'?'🔁':'📖'
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    {/* Upcoming list */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                        <span className="font-bold text-gray-900 text-sm">📅 Study Planner</span>
                        <button onClick={() => setActiveTab('studyplan')} className="text-xs font-bold" style={{color:'#FF653F'}}>View Plan →</button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {upcoming.length === 0 ? (
                          <div className="px-5 py-6 text-center text-sm text-gray-400">🎉 All planned days completed!</div>
                        ) : upcoming.map(d => (
                          <div key={d.day} className="flex items-center gap-3 px-5 py-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                              style={{ background:'#FFF3EE' }}>{typeIcon(d.type)}</div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">{(d.topics||[]).join(', ')||'Study'}</div>
                              <div className="text-xs text-gray-400">{d.date} · {d.duration}</div>
                            </div>
                            <button onClick={() => setActiveTab('studyplan')}
                              className="text-xs font-bold rounded-lg px-3 py-1.5 border flex-shrink-0"
                              style={{ color:'#FF653F', borderColor:'#fec9b0' }}>
                              {d.type==='mock'?'Start':'Practice'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress ring */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 self-start">Study Plan Progress</div>
                      <div className="text-sm text-gray-500 mb-3 self-start">{completed} / {total} · {remaining} days remaining</div>
                      <div className="relative w-32 h-32 my-1">
                        <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="3"/>
                          {pct>0 && <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FF653F" strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={`${pct} ${100-pct}`}/>}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-gray-900">{pct}%</span>
                          <span className="text-xs text-gray-400">{pct===100?'Complete':'Done'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-xs">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"/>Done {completed}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:'#FF653F'}}/>Left {remaining}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* ── GET-STARTED HERO (shown until an exam is chosen) ── */}
              {user && !hasChosenExam && (
                <div className="mb-8 rounded-2xl p-6 sm:p-7 relative overflow-hidden text-white"
                  style={{ background:'linear-gradient(135deg,#FF8A5F 0%,#FFB088 100%)' }}>
                  {/* decorative bubbles */}
                  <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none"/>
                  <div className="absolute -bottom-16 right-16 w-36 h-36 rounded-full bg-white/10 pointer-events-none"/>
                  <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-bold mb-3">✨ expert-crafted exam prep</div>
                      <h2 className="text-xl sm:text-2xl font-black mb-1.5">Ready to crack your exam, {(userName||'there').split(' ')[0]}?</h2>
                      <p className="text-sm text-white/90 mb-4 leading-relaxed">Pick your target exam to unlock the full syllabus blueprint, topic-wise weightage, cut-offs and unlimited mock tests — or jump straight into practice.</p>
                      <div className="flex flex-wrap gap-2">
                        {['📝 Realistic mocks','📄 PDF solutions','🎯 Adaptive practice','📊 Readiness tracking'].map(f=>(
                          <span key={f} className="text-xs font-semibold bg-white/15 rounded-lg px-2.5 py-1">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PROGRESS — for the selected exam ── */}
              {hasChosenExam && (
              <div className="mb-8">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Your Progress · {selectedGroup.label}
                </h2>

                {examResults.length === 0 ? (
                  /* No attempts yet */
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background:'#FFF3EE' }}>🚀</div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">No attempts yet for {selectedGroup.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Take your first test to start tracking readiness, scores and weak areas.</div>
                      </div>
                    </div>
                    <button onClick={() => onStartTest('mock', selectedExamId)}
                      className="text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all flex-shrink-0 whitespace-nowrap"
                      style={{ background:'#FF653F' }}
                      onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
                      onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
                      Take first test →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Readiness */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Exam readiness</div>
                      <div className="flex items-end gap-2 mb-3">
                        <span className="text-3xl font-black" style={{ color:'#FF653F' }}>{readiness}%</span>
                        <span className="text-xs text-gray-400 mb-1">based on best score</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width:`${readiness}%`, background:'#FF653F' }}/>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {readiness >= 60 ? 'On track — keep practising to stay sharp.' : readiness >= 40 ? 'Getting there — focus on weak sections.' : 'Early days — build consistency with daily practice.'}
                      </div>
                    </div>

                    {/* Score stats */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Scores</div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-2xl font-black text-gray-900">{examResults.length}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Tests</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-green-600">{examBest?.toFixed(0)}%</div>
                          <div className="text-xs text-gray-400 mt-0.5">Best</div>
                        </div>
                        <div>
                          <div className="text-2xl font-black" style={{ color:'#FF653F' }}>{examAvg?.toFixed(0)}%</div>
                          <div className="text-xs text-gray-400 mt-0.5">Average</div>
                        </div>
                      </div>
                      {lastAttempt && (
                        <div className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
                          Last attempt: {new Date(lastAttempt.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} · {Number(lastAttempt.percentage||0).toFixed(0)}%
                        </div>
                      )}
                    </div>

                    {/* Weak areas / next step */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Focus next</div>
                      {Array.isArray(lastAttempt?.weak_topics) && lastAttempt.weak_topics.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {lastAttempt.weak_topics.slice(0,6).map((t,i) => {
                            const label = typeof t === 'string'
                              ? t
                              : (t?.topic || t?.name || t?.label || t?.section || '')
                            if (!label) return null
                            return (
                              <span key={i} className="text-xs px-2 py-1 rounded-full font-medium" style={{ background:'#FFF3EE', color:'#FF653F' }}>
                                {String(label).replace(/_/g,' ')}
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 mb-4">Take a few more tests and we'll highlight your weakest topics here.</div>
                      )}
                      <button onClick={() => setActiveTab('studyplan')}
                        className="w-full text-xs font-bold rounded-lg py-2 border transition-all"
                        style={{ color:'#FF653F', borderColor:'#fec9b0' }}
                        onMouseOver={e=>e.currentTarget.style.background='#FFF3EE'}
                        onMouseOut={e=>e.currentTarget.style.background=''}>
                        Open Study Planner →
                      </button>
                    </div>
                  </div>
                )}

                {/* Cut-off comparison — your best vs your category's cut-off */}
                {examResults.length > 0 && (() => {
                  const cat    = (user?.user_metadata?.category || 'UR')
                  const cutoff = (CUTOFF_BY_GROUP[selectedGroup.id] || CUTOFF_BY_GROUP.ibps)[cat]
                  if (cutoff == null || examBest == null) return null
                  const diff   = +(examBest - cutoff).toFixed(1)
                  const clears = diff >= 0
                  return (
                    <div className="mt-4 rounded-2xl overflow-hidden" style={{ background: clears ? 'linear-gradient(135deg,#ecfdf5,#f0fdf4)' : 'linear-gradient(135deg,#fff7ed,#fff3e6)', border: `1.5px solid ${clears?'#6ee7b7':'#fec9b0'}` }}>
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: clears?'#059669':'#d97706' }}>Cut-off Check · {cat} category</div>
                          <div className="text-lg font-black mt-0.5" style={{ color: clears?'#065f46':'#92400e' }}>
                            {clears ? `+${diff} marks safe` : `${Math.abs(diff)} marks to go`}
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: clears?'#d1fae5':'#ffedd5' }}>
                          {clears ? '🎯' : '📈'}
                        </div>
                      </div>
                      {/* Progress track */}
                      <div className="px-4 pb-1">
                        <div className="relative h-5 rounded-full overflow-hidden" style={{ background: clears?'#d1fae5':'#ffe4cc' }}>
                          {/* Fill up to user score */}
                          <div className="absolute left-0 top-0 h-full rounded-full transition-all"
                            style={{ width:`${Math.min(examBest,100)}%`, background: clears ? 'linear-gradient(90deg,#34d399,#059669)' : 'linear-gradient(90deg,#fb923c,#FF653F)' }}/>
                          {/* Cut-off marker */}
                          <div className="absolute top-0 h-full w-0.5" style={{ left:`${Math.min(cutoff,99)}%`, background:'rgba(0,0,0,0.35)', zIndex:2 }}>
                            <div className="absolute -top-0.5 -translate-x-1/2 text-[8px] font-black text-white bg-gray-700 rounded px-0.5">{cutoff}</div>
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] mt-1.5 font-semibold" style={{ color: clears?'#059669':'#d97706' }}>
                          <span>Your best: {examBest.toFixed(1)}%</span>
                          <span>{cat} cut-off ≈ {cutoff}</span>
                        </div>
                      </div>
                      {/* Message */}
                      <div className="px-4 pb-4 pt-1 text-[11px] leading-relaxed" style={{ color: clears?'#047857':'#b45309' }}>
                        {clears
                          ? `Great — you're ${diff} marks above the ${cat} cut-off for ${selectedGroup.label}. Keep practising to stay safe.`
                          : `You need ${Math.abs(diff)} more marks to clear the ${cat} cut-off. Focus on your weak topics above.`}
                      </div>
                    </div>
                  )
                })()}
              </div>
              )}

              {/* Quick practice */}
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Practice</h2>
              <div className="flex gap-2 mb-8">
                {MODES.map(m => (
                  <button key={m.id} onClick={() => onStartTest(m.id)}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all hover:shadow-sm ${m.light} ${m.border}`}
                    onMouseOver={e=>e.currentTarget.style.opacity='0.85'}
                    onMouseOut={e=>e.currentTarget.style.opacity='1'}>
                    <div className={`w-7 h-7 ${m.bg} rounded-lg flex items-center justify-center text-white flex-shrink-0`}><m.Icon /></div>
                    <span className={`text-xs font-bold ${m.text} text-left leading-tight`}>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* ── YOUR EXAM — driven by signup selection, changeable ── */}
              {hasChosenExam && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Exam</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      You're preparing for <span className="font-bold text-gray-800">{selectedGroup.label}</span>
                      {examSaving && <span className="ml-2 text-xs text-gray-400">saving…</span>}
                    </p>
                  </div>
                  <button onClick={() => setChangingExam(v => !v)}
                    className="text-xs font-bold rounded-lg px-3 py-2 border transition-all flex-shrink-0"
                    style={{ color:'#FF653F', borderColor:'#fec9b0' }}
                    onMouseOver={e=>{ e.currentTarget.style.background='#FFF3EE' }}
                    onMouseOut={e=>{ e.currentTarget.style.background='' }}>
                    {changingExam ? 'Close' : '✎ Change exam'}
                  </button>
                </div>

                {/* Change-exam picker */}
                {changingExam && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Pick the exam you want to prepare for:</p>
                    <div className="space-y-4">
                      {/* Free users only see their current group; Pro users see all */}
                      {(isPro ? EXAM_GROUPS : EXAM_GROUPS.filter(g => g.id === selectedGroup.id)).map(g => (
                        <div key={g.id}>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{g.label}</div>
                          <div className="flex flex-wrap gap-2">
                            {g.exams.map(e => {
                              const sel = e.id === selectedExamId
                              return (
                                <button key={e.id} onClick={() => handleChangeExam(e.id)}
                                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                                  style={sel
                                    ? { background:'#FF653F', color:'#fff', borderColor:'#FF653F' }
                                    : { background:'#fff', color:'#555', borderColor:'#e5e7eb' }}>
                                  {e.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Upgrade CTA for free users — unlocks other exams */}
                    {!isPro && (
                      <div className="mt-4 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3"
                        style={{ background:'#1a1a2e' }}>
                        <div className="text-center sm:text-left">
                          <div className="text-sm font-bold text-white">Want to prepare for more exams?</div>
                          <div className="text-xs text-gray-300 mt-0.5">Free covers one exam. Upgrade to Pro to unlock SBI, RRB, PSU and more.</div>
                        </div>
                        <button onClick={() => onNav?.('subscriptions')}
                          className="text-white text-xs font-bold px-5 py-2.5 rounded-xl flex-shrink-0 transition-all"
                          style={{ background:'#FF653F' }}
                          onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
                          onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
                          ⭐ Upgrade to Pro
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected exam group's papers (registered only for free users) */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className={`bg-gradient-to-r ${selectedGroup.color} px-5 py-3 flex items-center justify-between`}>
                    <span className="font-bold text-white text-sm">{selectedGroup.label}</span>
                    <span className="text-white/70 text-xs">{visibleGroupExams.length} exam{visibleGroupExams.length>1?'s':''}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-gray-100">
                    {visibleGroupExams.map((e, i) => {
                      const isPicked = e.id === selectedExamId
                      return (
                        <div key={e.id} className={`p-4 flex flex-col gap-2 ${i>=2?'border-t sm:border-t-0 border-gray-100':''}`}
                          style={isPicked ? { background:'#FFF8F4' } : {}}>
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-sm font-bold text-gray-900 leading-tight">{e.name}</span>
                            {e.tag && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${e.tagColor||'bg-gray-100 text-gray-500'}`}>{e.tag}</span>}
                          </div>
                          <span className="text-xs text-gray-400">{e.sub}</span>
                          <button onClick={() => onStartTest('mock', e.id)}
                            className="mt-auto text-xs font-bold rounded-lg py-1.5 transition-all text-center w-full border"
                            style={{color:'#FF653F',borderColor:'#fec9b0'}}
                            onMouseOver={ev=>{ ev.currentTarget.style.background='#FF653F'; ev.currentTarget.style.color='#fff'; ev.currentTarget.style.borderColor='#FF653F' }}
                            onMouseOut={ev=>{ ev.currentTarget.style.background=''; ev.currentTarget.style.color='#FF653F'; ev.currentTarget.style.borderColor='#fec9b0' }}>
                            Launch
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Browse all exams toggle */}
                <button onClick={() => setShowAllExams(v => !v)}
                  className="mt-3 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                  {showAllExams ? '▲ Hide other exams' : '▼ Browse all other exams'}
                </button>

                {showAllExams && (() => {
                  // only exams the user has actually attempted, outside the current group
                  const otherGroups = EXAM_GROUPS
                    .filter(g => g.id !== selectedGroup.id)
                    .map(g => ({ ...g, exams: g.exams.filter(e => attemptedExamIds.includes(e.id)) }))
                    .filter(g => g.exams.length > 0)

                  if (otherGroups.length === 0) return (
                    <div className="mt-3 bg-white rounded-2xl border border-gray-200 p-5 text-center">
                      <div className="text-sm text-gray-500">You haven't attempted any other exams yet.</div>
                      <div className="text-xs text-gray-400 mt-1">Exams you practise will show up here.</div>
                    </div>
                  )

                  return (
                    <div className="space-y-4 mt-3">
                      {otherGroups.map(g => (
                        <div key={g.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                          <div className={`bg-gradient-to-r ${g.color} px-5 py-3 flex items-center justify-between`}>
                            <span className="font-bold text-white text-sm">{g.label}</span>
                            <span className="text-white/70 text-xs">{g.exams.length} attempted</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-gray-100">
                            {g.exams.map((e, i) => (
                              <div key={e.id} className={`p-4 flex flex-col gap-2 ${i>=2?'border-t sm:border-t-0 border-gray-100':''}`}>
                                <div className="flex items-start justify-between gap-1">
                                  <span className="text-sm font-bold text-gray-900 leading-tight">{e.name}</span>
                                  {e.tag && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${e.tagColor||'bg-gray-100 text-gray-500'}`}>{e.tag}</span>}
                                </div>
                                <span className="text-xs text-gray-400">{e.sub}</span>
                                <button onClick={() => handleChangeExam(e.id)}
                                  className="mt-auto text-xs font-bold rounded-lg py-1.5 transition-all text-center w-full border border-gray-200 text-gray-600 hover:bg-gray-50">
                                  Select this exam
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
              )}

              {/* Recent results — existing */}
              {history.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Activity</h2>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {history.slice(0,3).map((r, i, arr) => {
                      const pct  = Number(r.percentage || 0)
                      const name = (() => {
                        const toTitle = s => (s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
                        if (r.test_type === 'topic_diagnostic') return `Topicwise Test${r.topic ? ` — ${toTitle(r.topic)}` : ''}`
                        if (r.test_type === 'mini' || r.test_type === 'concept_mini') return `Practice Test${r.topic ? ` — ${toTitle(r.topic)}` : r.section ? ` — ${toTitle(r.section)}` : ''}`
                        return `Mock Test — ${toTitle(r.exam) || 'Bank Clerk Prelims'}`
                      })()
                      const date = new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})
                      const pass = pct >= 40
                      return (
                        <button key={r.id||i} onClick={()=>onOpenResult?.(r)}
                          className={`w-full text-left flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors ${i<arr.length-1?'border-b border-gray-100':''}`}>
                          <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${pass?'bg-green-50 text-green-700':'bg-orange-50 text-orange-700'}`}>
                            <span className="text-sm font-black">{pct.toFixed(0)}%</span>
                            <span className="text-xs opacity-60">{pass?'Pass':'Fail'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">{name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{date} · {r.correct_count||0} correct · {r.wrong_count||0} wrong · {r.skipped_count||0} skipped</div>
                          </div>
                          <span className="text-xs font-bold flex-shrink-0" style={{color:'#FF653F'}}>Review →</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </>}

            {/* ── PRACTICE tab ── */}
            {activeTab === 'practice' && <>
              <h2 className="text-xl font-black text-gray-900 mb-1">Practice</h2>
              <p className="text-sm text-gray-500 mb-6">Choose a mode and launch your test</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {MODES.map(m => (
                  <button key={m.id} onClick={() => onStartTest(m.id)}
                    className="text-left bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all group"
                    onMouseOver={e=>e.currentTarget.style.borderColor='#fec9b0'}
                    onMouseOut={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
                    <div className={`w-11 h-11 ${m.bg} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform`}><m.Icon /></div>
                    <div className="font-bold text-gray-900 text-sm mb-1">{m.label}</div>
                    <div className="text-xs text-gray-500 leading-relaxed mb-3">{m.desc}</div>
                    <span className={`text-xs font-bold ${m.text}`}>Start now →</span>
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {EXAM_GROUPS.map(g => (
                  <div key={g.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className={`bg-gradient-to-r ${g.color} px-5 py-3 flex items-center justify-between`}>
                      <span className="font-bold text-white text-sm">{g.label}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                      {g.exams.map((e, i) => (
                        <div key={e.id} className={`p-4 flex flex-col gap-2 ${i>=2?'border-t sm:border-t-0 border-gray-100':''}`}>
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-sm font-bold text-gray-900 leading-tight">{e.name}</span>
                            {e.tag && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${e.tagColor||'bg-gray-100 text-gray-500'}`}>{e.tag}</span>}
                          </div>
                          <span className="text-xs text-gray-400">{e.sub}</span>
                          <button onClick={() => onStartTest('mock', e.id)}
                            className="mt-auto text-xs font-bold text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-600 hover:text-white transition-all text-center">
                            Launch
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>}

            {/* ── EXPLORE EXAMS tab — list → exam detail (pricing + start mock) ── */}
            {activeTab === 'explore' && (() => {
              const groupOf = (id) => EXAM_GROUPS.find(g => g.exams.some(e => e.id === id))
              const grp  = exploreExam ? groupOf(exploreExam) : null
              const exam = grp ? grp.exams.find(e => e.id === exploreExam) : null
              const cut  = grp ? (CUTOFF_BY_GROUP[grp.id] || CUTOFF_BY_GROUP.ibps) : null
              const qOf  = (sub='') => (sub.match(/(\d+)\s*Q/)||[])[1] || '—'
              const mOf  = (sub='') => (sub.match(/(\d+)\s*min/)||[])[1] || '—'
              const userPlan = (user?.user_metadata?.plan || user?.user_metadata?.subscription || '').toLowerCase()
              const fmtTopic = t => String(t||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
              const SEC_COLORS = ['#1d4ed8','#7c3aed','#0891b2','#d97706','#16a34a','#e11d48']
              const TOPIC_COLORS = ['#FF653F','#1d4ed8','#7c3aed','#0891b2','#d97706','#16a34a','#e11d48','#db2777','#0d9488','#9333ea','#ca8a04','#2563eb']
              const cutExam = exploreExam ? CUTOFF_EXAMS.find(e => e.id === (CUTOFF_ID_MAP[exploreExam] || exploreExam)) : null
              const cutRows = cutExam ? cutExam.rows.slice(0, 2) : []
              return (
              <div>
                {!exam ? (
                  /* ── LIST ── */
                  <>
                    <h2 className="text-xl font-black text-gray-900 mb-1">Explore Exams</h2>
                    <p className="text-sm text-gray-500 mb-6">Pick an exam to see its pattern, cut-offs, pricing and start a mock test</p>
                    {EXAM_GROUPS.map(g => (
                      <div key={g.id} className="mb-5">
                        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:g.hex }}>{g.label}</div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {g.exams.map(e => (
                            <button key={e.id} onClick={()=>{ setExploreExam(e.id); window.scrollTo(0,0) }}
                              className="text-left border rounded-xl p-3 hover:shadow-md transition-all"
                              style={{ background:`${g.hex}0D`, borderColor:`${g.hex}33`, borderLeftColor:g.hex, borderLeftWidth:4 }}>
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-[13px] font-bold leading-tight" style={{ color:g.hex }}>{e.name}</span>
                                {e.tag && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 text-white" style={{ background:g.hex }}>{e.tag}</span>}
                              </div>
                              <div className="text-[11px] text-gray-500 mt-1">{e.sub}</div>
                              <div className="text-[11px] font-semibold mt-1.5" style={{ color:'#FF653F' }}>View details →</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  /* ── DETAIL (tabbed) — no outer card padding so it aligns edge-to-edge like the exam list ── */
                  <div className="mb-4">
                    {/* Title + Back */}
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black text-gray-900">{grp.label.replace(' Exams','')} {exam.name}</h2>
                        {exam.tag && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:`${grp.hex}18`, color:grp.hex }}>{exam.tag}</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={()=>onStartTest('mock', exam.id)}
                          className="text-xs font-bold text-white rounded-lg px-4 py-1.5 hover:shadow-md transition-all whitespace-nowrap"
                          style={{ background:'#FF653F' }}
                          onMouseOver={e=>e.currentTarget.style.background='#e5512f'}
                          onMouseOut={e=>e.currentTarget.style.background='#FF653F'}>
                          🚀 Start Mock Test →
                        </button>
                        <button onClick={()=>{ setExploreExam(null); window.scrollTo(0,0) }}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                          ← Back to exams
                        </button>
                      </div>
                    </div>

                    {/* Quick summary — single compact box */}
                    <div className="inline-flex items-center gap-3 flex-wrap text-xs mb-5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
                      <span className="text-gray-600"><b className="text-orange-600">{blueprint?.total_questions||qOf(exam.sub)}</b> Questions</span>
                      <span className="text-orange-200">·</span>
                      <span className="text-gray-600"><b className="text-blue-600">{blueprint?.total_time_mins||mOf(exam.sub)} min</b> Duration</span>
                      <span className="text-orange-200">·</span>
                      <span className="text-gray-600"><b className="text-red-600">-{blueprint?.negative??0.25}</b> Negative marking</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-gray-100 mb-4 overflow-x-auto">
                      {[['overview','Overview'],['cutoff','Cut-off Marks']].map(([id,label])=>(
                        <button key={id} onClick={()=>setExploreTab(id)}
                          className={`px-4 py-2 text-sm font-bold border-b-2 -mb-px whitespace-nowrap transition-colors ${exploreTab===id?'text-orange-600':'border-transparent text-gray-500 hover:text-gray-800'}`}
                          style={exploreTab===id?{borderColor:'#FF653F'}:{}}>
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* OVERVIEW — topic-wise chapters, marks + per-section circle ── */}
                    {exploreTab==='overview' && (
                      bpLoading ? <p className="text-xs text-gray-400 text-center py-8">Loading syllabus…</p>
                      : blueprint?.sections?.length ? (
                        <div className="space-y-4">
                          {blueprint.sections.map((s,si)=>{
                            const data = s.topics.filter(t=>t.count>0).map((t,j)=>({ name:fmtTopic(t.topic), value:t.count, color:TOPIC_COLORS[j%TOPIC_COLORS.length] }))
                            return (
                              <div key={s.section} className="border border-gray-200 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-bold" style={{ color:SEC_COLORS[si%SEC_COLORS.length] }}>{s.label}</span>
                                  <span className="text-xs font-semibold text-gray-400">{s.count} marks{s.minutes?` · ${s.minutes} min`:''}</span>
                                </div>
                                <div className="flex flex-col lg:flex-row gap-8 lg:gap-20">
                                  <div className="w-44 h-44 flex-shrink-0 mx-auto lg:mx-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <PieChart margin={{ top:14, right:14, bottom:14, left:14 }}>
                                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={34} outerRadius={56} paddingAngle={1} labelLine={false} label={({value})=>value}>
                                          {data.map((d,j)=><Cell key={j} fill={d.color}/>)}
                                        </Pie>
                                        <Tooltip/>
                                      </PieChart>
                                    </ResponsiveContainer>
                                  </div>
                                  <div className="flex-1 min-w-0 lg:pl-24">
                                    <table className="w-full text-xs table-fixed">
                                      <thead>
                                        <tr className="text-gray-400 border-b border-gray-100">
                                          <th className="text-left   font-bold py-2">Topic / Chapter</th>
                                          <th className="text-center font-bold py-2 w-10 sm:w-20">Marks</th>
                                          <th className="text-center font-bold py-2 w-10 sm:w-20 text-green-600">Easy</th>
                                          <th className="text-center font-bold py-2 w-10 sm:w-20 text-amber-600">Med</th>
                                          <th className="text-center font-bold py-2 w-10 sm:w-20 text-red-600">Hard</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {s.topics.filter(t=>t.count>0).map((t,j)=>(
                                          <tr key={t.topic} className="border-b border-gray-50 last:border-0">
                                            <td className="py-2 pr-2 font-medium text-gray-700">
                                              <span className="flex items-start gap-2">
                                                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background:TOPIC_COLORS[j%TOPIC_COLORS.length] }}/>
                                                <span className="leading-snug">{fmtTopic(t.topic)}</span>
                                              </span>
                                            </td>
                                            <td className="py-2 text-center font-bold text-gray-900">{t.count}</td>
                                            <td className="py-2 text-center font-semibold text-green-600">{t.easy||0}</td>
                                            <td className="py-2 text-center font-semibold text-amber-600">{t.medium||0}</td>
                                            <td className="py-2 text-center font-semibold text-red-600">{t.hard||0}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {TOPIC_GROUPS.map(group => (
                            <div key={group.section}>
                              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color:group.color }}>{group.section}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {group.topics.map(t => (
                                  <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background:`${group.color}14`, color:group.color }}>{t}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* CUT-OFF MARKS — last two recent years ── */}
                    {exploreTab==='cutoff' && (
                      cutRows.length ? (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[420px] text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500">
                                <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Year</th>
                                {['UR','OBC','EWS','SC','ST','PwBD'].map(c=>(
                                  <th key={c} className="font-bold px-3 py-2.5 text-center whitespace-nowrap">{c}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {cutRows.map((r,i)=>(
                                <tr key={r.year} className={i<cutRows.length-1?'border-b border-gray-100':''}>
                                  <td className="px-4 py-2.5 font-bold text-gray-900 whitespace-nowrap">{r.year}</td>
                                  {['UR','OBC','EWS','SC','ST','PwBD'].map(c=>(
                                    <td key={c} className="px-3 py-2.5 text-center font-semibold whitespace-nowrap" style={{ color:c==='UR'?'#FF653F':'#374151' }}>{r[c]??'—'}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="text-xs text-gray-400 mt-3">⚠ Indicative figures. Out of {cutExam?.total} marks · actual cut-offs are released state-wise and vary each year.</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-8">Cut-off data not available for this exam yet.</p>
                      )
                    )}

                  </div>
                )}
              </div>
              )
            })()}

            {/* ── STUDY PLANNER tab ── */}
            {activeTab === 'studyplan' && (
              <div>
                {/* Loading state — only show if still fetching AND no plan loaded yet */}
                {planLoading && !savedPlan ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"/>
                      <div className="text-sm text-gray-500">Loading your study plan...</div>
                    </div>
                  </div>
                ) : savedPlan && !showPlanBuilder ? (
                  <PlanScheduleView
                    plan={savedPlan}
                    onStartTest={onStartTest}
                    onTopicPractice={(topic) => {
                      /* Route to HomeScreen in topic mode, pass topic as examId so
                         HomeScreen/ExamScreen can pre-select it */
                      onStartTest('topic', topic)
                    }}
                    onRebuild={() => { setShowPlanBuilder(true); setGeneratedPlan(null) }}
                    todayStr={today}
                  />
                ) : (
                  /* ── Plan builder form ── */
                  <div className="w-full">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Study Planner</h2>
                      <p className="text-sm text-gray-500 mt-1.5 max-w-2xl mx-auto">
                        Tell us your exam date and how many hours you can give each day — we'll turn it into a clear,
                        day-by-day schedule with built-in mock tests and revision, so you always know what to study next.
                      </p>
                      {savedPlan && (
                        <button onClick={()=>setShowPlanBuilder(false)}
                          className="mt-3 text-xs text-blue-600 font-semibold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                          ← View My Plan
                        </button>
                      )}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-4 items-start">

                    {/* ════ LEFT column: exam + weak topics ════ */}
                    <div>
                    {/* Exam selector */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                        <span>🎓</span>
                        <span className="text-sm font-bold text-gray-900">Select your target exam</span>
                      </div>
                      <div className="px-5 py-4">
                        {/* Mobile: dropdown */}
                        <select value={planExam} onChange={e=>setPlanExam(e.target.value)}
                          className="sm:hidden w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-blue-500">
                          <option value="">Select an exam…</option>
                          {EXAM_GROUPS.map(g => (
                            <optgroup key={g.id} label={g.label}>
                              {g.exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </optgroup>
                          ))}
                        </select>
                        {/* Desktop: chips (colored by exam family) */}
                        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-2">
                          {EXAM_GROUPS.flatMap(g => g.exams.map(e => {
                            const sel = planExam===e.id
                            return (
                            <button key={e.id} onClick={() => setPlanExam(e.id)}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:shadow-sm text-center truncate"
                              style={sel
                                ? { background:g.hex, borderColor:g.hex, color:'#fff' }
                                : { background:`${g.hex}12`, borderColor:`${g.hex}40`, color:g.hex }}>
                              {e.name}
                            </button>
                          )}))}
                        </div>
                      </div>
                    </div>

                    {/* Weak topics */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>⚡</span>
                          <div>
                            <span className="text-sm font-bold text-gray-900">Select and arrange weak topics</span>
                            <p className="text-xs text-gray-400 mt-0.5">These get extra days in your plan · {weakTopics.length} selected</p>
                          </div>
                        </div>
                        {weakTopics.length > 0 && (
                          <button onClick={() => setWeakTopics([])} className="text-xs text-red-500 font-semibold">Clear all</button>
                        )}
                      </div>
                      {(() => {
                        const sections = TOPIC_GROUPS.map(group => (
                          <div key={group.section}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{color:group.color}}>{group.section}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {group.topics.map(t => {
                                const sel = weakTopics.includes(t)
                                return (
                                  <button key={t} onClick={() => toggleTopic(t)}
                                    className="px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:shadow-sm text-center truncate"
                                    style={sel
                                      ? {borderColor:group.color, background:group.color, color:'#fff'}
                                      : {borderColor:`${group.color}40`, background:`${group.color}12`, color:group.color}}>
                                    {t}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))
                        return (<>
                          {/* Mobile: tap to expand */}
                          <details className="sm:hidden border-t border-gray-100">
                            <summary className="px-5 py-3 text-sm font-semibold text-blue-600 cursor-pointer select-none list-none flex items-center justify-between">
                              <span>{weakTopics.length ? `${weakTopics.length} topic${weakTopics.length>1?'s':''} selected` : 'Tap to choose weak topics'}</span>
                              <span className="text-gray-400">▾</span>
                            </summary>
                            <div className="px-5 pb-4 space-y-4">{sections}</div>
                          </details>
                          {/* Desktop: always shown */}
                          <div className="hidden sm:block px-5 py-4 space-y-4">{sections}</div>
                        </>)
                      })()}
                    </div>
                    </div>

                    {/* ════ RIGHT column: dates + per-day study hours ════ */}
                    <div>
                    {/* Date range */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span className="text-sm font-bold text-gray-900">Choose your start and end dates</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 ml-6">Based on your selections, we'll evenly distribute topics across your plan</p>
                      </div>
                      <div className="px-5 py-4">
                        <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200 focus-within:border-blue-500">
                          <div className="flex-1 px-3 py-2.5">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Start date</label>
                            <input type="date" min={today} max={startMax || undefined} value={startDate} onChange={e=>setStartDate(e.target.value)}
                              className="w-full text-sm text-gray-700 bg-transparent outline-none border-0 p-0"/>
                          </div>
                          <div className="flex-1 px-3 py-2.5">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">End date <span className="text-gray-300 font-normal">{(!isPro && trialActive) ? `(within your ${trialDaysLeft}-day trial)` : '(max 7 days)'}</span></label>
                            <input type="date" min={minEnd} max={maxEnd || undefined} value={endDate} onChange={e=>setEndDate(e.target.value)}
                              className="w-full text-sm text-gray-700 bg-transparent outline-none border-0 p-0"/>
                          </div>
                        </div>
                        {startDate && endDate && (
                          <p className="text-xs text-blue-600 font-semibold mt-2">
                            {Math.round((new Date(endDate)-new Date(startDate))/(1000*60*60*24))} calendar days · {studyDays.length} study days/week selected
                          </p>
                        )}
                        {(!startDate || !endDate) && (
                          <p className="text-xs text-gray-400 mt-2">Pick both a start and end date to enable Create Plan.</p>
                        )}
                      </div>
                    </div>

                    {/* Study days + per-day hours (checkbox · slider · hh:mm) */}
                    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>⏰</span>
                          <span className="text-sm font-bold text-gray-900">Select your study days and hours</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-400">hh:mm</span>
                      </div>
                      <div className="px-5 py-4 space-y-2.5">
                        {WEEK_DISPLAY.map(d => {
                          const on  = studyDays.includes(d)
                          const hrs = on ? (Number(dayHours[d]) || 0) : 0
                          const hh  = String(Math.floor(hrs)).padStart(2,'0')
                          const mm  = String(Math.round((hrs % 1) * 60)).padStart(2,'0')
                          return (
                            <div key={d} className="flex items-center gap-3">
                              <label className="flex items-center gap-2 w-16 flex-shrink-0 cursor-pointer">
                                <input type="checkbox" checked={on} onChange={()=>toggleDay(d)} className="w-4 h-4 accent-sky-400"/>
                                <span className={`text-sm font-semibold ${on?'text-gray-900':'text-gray-400'}`}>{d}</span>
                              </label>
                              <input type="range" min="0" max="12" step="0.5" value={hrs} disabled={!on}
                                onChange={e=>setDayHour(d, Number(e.target.value))}
                                className="flex-1 accent-sky-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"/>
                              <span className={`w-14 text-right text-sm font-mono ${on?'text-sky-500 font-bold':'text-gray-300'}`}>{hh}:{mm}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    </div>

                    </div>{/* ── end two-column grid ── */}

                    {/* Single action — Create Plan generates AND saves */}
                    <div className="mb-6">
                      <button onClick={handleGeneratePlan}
                        disabled={!startDate||!endDate||!studyDays.length||planSaving}
                        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                          planSaved ? 'bg-green-600 text-white'
                          : (startDate&&endDate&&studyDays.length)
                            ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-lg'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                        {planSaving ? 'Creating your plan…' : planSaved ? '✓ Plan created — View below' : '✨ Create Plan'}
                      </button>
                    </div>

                    {/* Preview of generated plan */}
                    {generatedPlan && (
                      <div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                          {[
                            {label:'Scheduled', value:generatedPlan.scheduledDays, icon:'📅', cls:'text-blue-600'},
                            {label:'Study days',value:generatedPlan.studyDays,     icon:'📖', cls:'text-violet-600'},
                            {label:'Mocks',     value:generatedPlan.mockDays,      icon:'📝', cls:'text-cyan-600'},
                            {label:'Revision',  value:generatedPlan.revisionDays,  icon:'🔁', cls:'text-green-600'},
                          ].map(c=>(
                            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                              <div className="text-lg mb-1">{c.icon}</div>
                              <div className={`text-xl font-black ${c.cls}`}>{c.value}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{c.label}</div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 text-center mb-2">Save the plan to see your full day-by-day schedule ↑</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── MY RESULTS tab — performance graphs + every attempt ── */}
            {activeTab === 'results' && (() => {
              const fmtTopic = t => String(t||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
              const SEC_LABEL = {
                english:'English', numerical_ability:'Numerical', quantitative_aptitude:'Quant',
                reasoning:'Reasoning', reasoning_computer_aptitude:'Reasoning+Comp',
                general_financial_awareness:'GA', general_awareness:'GA',
                data_analysis_interpretation:'DI', general_economy_banking:'GA', general_english:'English',
              }
              const chrono = [...history].reverse()
              const scoreTrend = chrono.map((r,i) => ({
                name: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : `T${i+1}`,
                score: Math.round(Number(r.percentage)||0),
                readiness: Math.round(Number(r.exam_readiness)||0),
              }))
              const secAgg = {}
              history.forEach(r => Object.entries(r.section_scores||{}).forEach(([sec,v])=>{
                const acc = v?.accuracy!=null ? v.accuracy : (v?.total ? (v.correct/v.total*100) : 0)
                if(!secAgg[sec]) secAgg[sec]={sum:0,n:0}; secAgg[sec].sum+=acc; secAgg[sec].n+=1
              }))
              const sectionData = Object.entries(secAgg).map(([sec,a])=>({ section: SEC_LABEL[sec]||sec, accuracy: Math.round(a.sum/a.n) }))
              const topAgg = {}
              history.forEach(r => (r.weak_topics||[]).forEach(w=>{
                const name = w?.topic||w?.name; if(!name) return
                const acc = Number(w?.accuracy)||0
                if(!topAgg[name]) topAgg[name]={sum:0,n:0}; topAgg[name].sum+=acc; topAgg[name].n+=1
              }))
              const weakData = Object.entries(topAgg)
                .map(([t,a])=>({ topic: fmtTopic(t), accuracy: Math.round(a.sum/a.n) }))
                .sort((x,y)=>x.accuracy-y.accuracy).slice(0,6)

              return (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">My Results</h2>
                <p className="text-sm text-gray-500 mb-6">Your performance trends and every attempt in one place</p>

                {history.length < 1 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                    <div className="text-4xl mb-3">📈</div>
                    <div className="text-sm font-bold text-gray-900 mb-1">No data yet</div>
                    <div className="text-xs text-gray-500 mb-4">Take a topicwise test or mock test to unlock your progress graphs.</div>
                    <button onClick={()=>onStartTest()} className="bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl">
                      Take a test →
                    </button>
                  </div>
                ) : (
                  <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Score & readiness trend */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 lg:col-span-2">
                      <div className="text-sm font-bold text-gray-900 mb-3">Score &amp; readiness trend</div>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={scoreTrend} margin={{top:5,right:20,left:-10,bottom:5}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3"/>
                          <XAxis dataKey="name" tick={{fontSize:11}}/>
                          <YAxis domain={[0,100]} tick={{fontSize:11}}/>
                          <Tooltip/>
                          <Line type="monotone" dataKey="score"     name="Score %"     stroke="#FF653F" strokeWidth={2} dot={{r:3}}/>
                          <Line type="monotone" dataKey="readiness" name="Readiness %" stroke="#7048E8" strokeWidth={2} dot={{r:3}}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Section accuracy radar */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="text-sm font-bold text-gray-900 mb-3">Section-wise accuracy (avg)</div>
                      {sectionData.length ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <RadarChart data={sectionData} outerRadius={90}>
                            <PolarGrid stroke="#eef0f3"/>
                            <PolarAngleAxis dataKey="section" tick={{fontSize:11}}/>
                            <Radar dataKey="accuracy" stroke="#FF653F" fill="#FF653F" fillOpacity={0.35}/>
                            <Tooltip/>
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-xs text-gray-400 text-center py-16">No section data yet.</p>}
                    </div>

                    {/* Weakest topics */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="text-sm font-bold text-gray-900 mb-3">Weakest topics (avg accuracy)</div>
                      {weakData.length ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={weakData} layout="vertical" margin={{top:5,right:20,left:10,bottom:5}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3"/>
                            <XAxis type="number" domain={[0,100]} tick={{fontSize:11}}/>
                            <YAxis type="category" dataKey="topic" width={120} tick={{fontSize:11}}/>
                            <Tooltip/>
                            <Bar dataKey="accuracy" fill="#f59e0b" radius={[0,4,4,0]}/>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-xs text-gray-400 text-center py-16">No weak-topic data yet — take a test to see this.</p>}
                    </div>
                  </div>

                  {/* Every attempt — click to review */}
                  <div className="text-sm font-bold text-gray-900 mb-3">All attempts</div>
                  <div className="space-y-3">
                    {history.map((r,i)=>{
                      const pct  = Number(r.percentage||0)
                      const name = (() => {
                        const toTitle = s => (s||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
                        if (r.test_type === 'topic_diagnostic') return `Topicwise Test${r.topic ? ` — ${toTitle(r.topic)}` : ''}`
                        if (r.test_type === 'mini' || r.test_type === 'concept_mini') return `Practice Test${r.topic ? ` — ${toTitle(r.topic)}` : r.section ? ` — ${toTitle(r.section)}` : ''}`
                        return `Mock Test — ${toTitle(r.exam) || 'Bank Clerk Prelims'}`
                      })()
                      const date = new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
                      const pass = pct >= 40
                      return (
                        <button key={r.id||i} onClick={()=>onOpenResult?.(r)}
                          className="w-full text-left bg-white border border-gray-200 rounded-xl flex items-center gap-4 px-5 py-4 hover:shadow-md hover:border-gray-300 transition-all">
                          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${pass?'bg-green-50 text-green-700':'bg-orange-50 text-orange-700'}`}>
                            <span className="text-sm font-black">{pct.toFixed(0)}%</span>
                            <span className="text-xs opacity-60">{pass?'Pass':'Fail'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900">{name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{date} · {r.correct_count||0} correct · {r.wrong_count||0} wrong · {r.skipped_count||0} skipped</div>
                          </div>
                          <span className="text-xs font-bold flex-shrink-0" style={{color:'#FF653F'}}>Review →</span>
                        </button>
                      )
                    })}
                  </div>
                  </>
                )}
              </div>
              )
            })()}

            {/* ── SUBSCRIPTIONS tab ── */}
            {activeTab === 'subscriptions' && (() => {
              const RANK = { basic:1, pro:2, ultimate:3 }
              const curPlan  = (user?.user_metadata?.plan || user?.user_metadata?.subscription || '').toLowerCase()
              const expRaw   = user?.user_metadata?.plan_expires
              const expDate  = expRaw ? new Date(expRaw) : null
              const expValid = expDate && !isNaN(expDate) ? expDate : null
              const fmtD     = (d) => d.toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' })
              const PLANS = [
                { name:'Basic',    price:'₹199',  per:'/month',    features:['5 mock tests / month','Topic & section practice','Basic analytics'] },
                { name:'Pro',      price:'₹499',  per:'/month',    features:['Unlimited mock tests','PDF solutions','Personalised study plan','Priority support'], highlight:true },
                { name:'Ultimate', price:'₹1199', per:'/3 months', features:['Everything in Pro','All exam categories','Performance trends','WhatsApp reminders'] },
              ]
              // Feature comparison matrix
              const CMP = [
                ['Price',                   '₹199/mo', '₹499/mo', '₹1199/3mo'],
                ['Mock tests',              '5 / month', 'Unlimited', 'Unlimited'],
                ['Topic & section practice','✓', '✓', '✓'],
                ['PDF solutions',           '✗', '✓', '✓'],
                ['Personalised study plan', '✗', '✓', '✓'],
                ['Performance trends',      'Basic', '✓', '✓'],
                ['All exam categories',     '✗', '✗', '✓'],
                ['Priority support',        '✗', '✓', '✓'],
                ['WhatsApp reminders',      '✗', '✗', '✓'],
              ]
              const cell = (v) => v === '✓' ? <span className="text-green-600 font-bold">✓</span>
                                : v === '✗' ? <span className="text-gray-300">✗</span>
                                : <span className="text-gray-700">{v}</span>
              return (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">Subscriptions</h2>
                <p className="text-sm text-gray-500 mb-6">Manage your MockTest plan</p>

                {/* Current status */}
                {isPro ? (
                  <div className="rounded-2xl p-5 mb-6 text-white" style={{ background:'linear-gradient(135deg,#FF653F 0%,#ff8a5f 100%)' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-bold mb-1.5">● Active</div>
                        <div className="text-lg font-black">You're subscribed to the {curPlan.charAt(0).toUpperCase()+curPlan.slice(1)} plan</div>
                        <div className="text-sm text-white/90 mt-0.5">{expValid ? `Renews / expires on ${fmtD(expValid)}` : 'Subscription active'}</div>
                        {RANK[curPlan] > 1 && (
                          <div className="text-xs text-white/80 mt-2">
                            You can switch to a lower plan when this one renews{expValid ? ` on ${fmtD(expValid)}` : ''}.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background:'#FFF3EE' }}>🎓</div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{trialActive ? `You're on the free trial — ${trialDaysLeft} day${trialDaysLeft>1?'s':''} left` : "You're on the Free tier"}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Upgrade for unlimited mock tests, PDF solutions & study plans.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* On the top plan (Ultimate) there's nothing to upgrade to — hide the options */}
                {curPlan === 'ultimate' ? (
                  <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center">
                    <div className="text-2xl mb-1">🎉</div>
                    <div className="text-base font-black text-gray-900">You're on the Ultimate plan — our highest tier</div>
                    <div className="text-sm text-gray-600 mt-1">You already have every feature. There's nothing more to upgrade.</div>
                  </div>
                ) : (<>
                {/* Unified plan comparison — headers (price + buy) sit on top of the feature rows */}
                <h3 className="text-sm font-bold text-gray-900 mb-3">Choose your plan</h3>
                <div className="overflow-x-auto -mx-1 sm:mx-0 border border-gray-200 rounded-2xl">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr>
                        <th className="p-3 sm:p-4"></th>
                        {PLANS.map(plan=>{
                          const planId  = plan.name.toLowerCase()
                          const current = isPro && curPlan === planId
                          const busy    = payingPlan === planId
                          const lower   = isPro && RANK[planId] < RANK[curPlan]
                          const hl      = plan.highlight
                          const label   = current ? '✓ Current Plan'
                                        : busy    ? 'Opening…'
                                        : lower   ? 'Included'
                                        : isPro   ? 'Upgrade →'
                                        : hl ? 'Get Started' : 'Choose Plan'
                          return (
                            <th key={plan.name} className="p-3 sm:p-4 text-center align-top border-l border-gray-100"
                              style={current?{background:'#f0fdf4'}:hl?{background:'#FFF3EE'}:{}}>
                              {/* Always reserve the tag line so every column aligns (no zigzag) */}
                              <div className="text-[10px] font-black uppercase tracking-wide mb-1 h-3.5 leading-none"
                                style={{color:current?'#16a34a':hl?'#FF653F':'transparent'}}>
                                {current ? 'Your plan' : hl ? 'Most popular' : ' '}
                              </div>
                              <div className="text-sm sm:text-base font-black text-gray-900">{plan.name}</div>
                              <div className="flex items-baseline justify-center gap-1 mt-0.5 h-8">
                                <span className="text-xl sm:text-2xl font-black" style={{color:hl?'#FF653F':'#111827'}}>{plan.price}</span>
                                <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{plan.per}</span>
                              </div>
                              <button onClick={() => (!current && !lower) && handleSubscribe(plan.name)} disabled={busy || current || lower}
                                className={`mt-2 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                                  current ? 'bg-green-600 text-white cursor-default'
                                  : lower  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'text-white hover:shadow-md'} ${busy?'opacity-60 cursor-wait':''}`}
                                style={(!current && !lower) ? {background:'#FF653F'} : {}}>
                                {label}
                              </button>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {CMP.filter(r=>r[0]!=='Price').map(row=>(
                        <tr key={row[0]} className="border-t border-gray-100">
                          <td className="px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">{row[0]}</td>
                          {[1,2,3].map(ci=>{
                            const planId  = ['','basic','pro','ultimate'][ci]
                            const current = isPro && curPlan === planId
                            const hl      = planId === 'pro'
                            return (
                              <td key={ci} className="px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm text-center border-l border-gray-100"
                                style={current?{background:'#f0fdf4'}:hl?{background:'#FFF8F4'}:{}}>
                                {cell(row[ci])}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>)}
              </div>
              )
            })()}

            {/* ── PROFILE tab ── */}
            {activeTab === 'profile' && (() => {
              const fieldCls = (on) => `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${on ? 'bg-white text-gray-900 focus:ring-2' : 'border-gray-200 bg-gray-50 text-gray-500'}`
              const fieldStyle = (on) => on ? { borderColor:'#FF653F' } : {}
              const examName = (id) => ALL_EXAMS_FLAT.find(e=>e.id===id)?.name
              const examLabel = (id) => { const e=ALL_EXAMS_FLAT.find(x=>x.id===id); const g=EXAM_GROUPS.find(gr=>gr.exams.some(x=>x.id===id)); return e? `${g?.label?.replace(' Exams','')||''} ${e.name}`.trim() : id }
              return (
              <div className="max-w-2xl">
                <h2 className="text-xl font-black text-gray-900 mb-1">Profile</h2>
                <p className="text-sm text-gray-500 mb-6">Manage your account, exam preferences and password</p>

                {/* User Information */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{background:'#FF653F'}}>
                      {(userName[0]||'U').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-bold text-gray-900">{userName}</div>
                      <div className="text-xs text-gray-400">{user?.email}</div>
                      <div className="text-xs text-green-600 font-semibold mt-1">✓ Account active</div>
                    </div>
                    <button onClick={()=>setProfileEdit(v=>!v)} className="ml-auto text-sm font-semibold" style={{color:'#FF653F'}}>
                      {profileEdit ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input value={profileName} onChange={e=>setProfileName(e.target.value)} disabled={!profileEdit}
                        className={fieldCls(profileEdit)} style={fieldStyle(profileEdit)}/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                      <input value={user?.email||''} disabled className={fieldCls(false)}/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile (+91)</label>
                      <input value={profilePhone} maxLength={10} onChange={e=>setProfilePhone(e.target.value.replace(/[^0-9]/g,''))} disabled={!profileEdit}
                        className={fieldCls(profileEdit)} style={fieldStyle(profileEdit)} placeholder="10-digit mobile"/>
                    </div>
                  </div>
                  {profileEdit && (
                    <button onClick={handleSaveProfile} disabled={profileSaving}
                      className="mt-5 text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-60" style={{background:'#FF653F'}}>
                      {profileSaving?'Saving…':'Save Changes'}
                    </button>
                  )}
                  {profileMsg && <span className="ml-3 text-sm text-green-600 font-semibold">{profileMsg}</span>}
                </div>

                {/* Educational Status */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900">Educational Status</h3>
                    <button onClick={()=>setEduEdit(v=>!v)} className="text-sm font-semibold" style={{color:'#FF653F'}}>
                      {eduEdit ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  {!eduEdit ? (
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Target Exam</div><div className="font-semibold text-gray-900">{examLabel(profileExam)}</div></div>
                      <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Category</div><div className="font-semibold text-gray-900">{CATEGORIES.find(c=>c.value===profileCategory)?.label||profileCategory}</div></div>
                      <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Prep Level</div><div className="font-semibold text-gray-900 capitalize">{profileLevel||'—'}</div></div>
                      <div><div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">State</div><div className="font-semibold text-gray-900">{profileState||'—'}</div></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Exam</label>
                        <select value={profileExam} onChange={e=>setProfileExam(e.target.value)} className={fieldCls(true)+' cursor-pointer'} style={fieldStyle(true)}>
                          {EXAM_GROUPS.flatMap(g=>g.exams.map(e=>(
                            <option key={e.id} value={e.id}>{g.label.replace(' Exams','')} — {e.name}</option>
                          )))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                          <select value={profileCategory} onChange={e=>setProfileCategory(e.target.value)} className={fieldCls(true)+' cursor-pointer'} style={fieldStyle(true)}>
                            {CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Prep Level</label>
                          <select value={profileLevel} onChange={e=>setProfileLevel(e.target.value)} className={fieldCls(true)+' cursor-pointer'} style={fieldStyle(true)}>
                            <option value="">-- Select --</option>
                            {LEVELS.map(l=><option key={l.value} value={l.value}>{l.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                        <input value={profileState} onChange={e=>setProfileState(e.target.value)} className={fieldCls(true)} style={fieldStyle(true)} placeholder="e.g. Telangana"/>
                      </div>
                      <button onClick={handleSaveEdu} disabled={eduSaving}
                        className="text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-60" style={{background:'#FF653F'}}>
                        {eduSaving?'Saving…':'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                      <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="Min 6 chars"
                        className={fieldCls(true)} style={fieldStyle(true)}/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                      <input type="password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} placeholder="Repeat password"
                        className={fieldCls(true)} style={fieldStyle(true)}/>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button onClick={handleChangePassword} disabled={pwdSaving || !newPwd}
                      className="text-white text-sm font-bold px-6 py-2.5 rounded-xl disabled:opacity-50" style={{background:'#FF653F'}}>
                      {pwdSaving?'Updating…':'Update Password'}
                    </button>
                    {pwdMsg && <span className={`text-sm font-semibold ${pwdMsg.startsWith('✓')?'text-green-600':'text-red-600'}`}>{pwdMsg}</span>}
                  </div>
                </div>

                {/* Notification preferences */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Email / Notification Preferences {notifSaving && <span className="text-xs text-gray-400 font-normal">saving…</span>}</h3>
                  {[
                    { key:'subs',  val:notifNoSubs,  label:"I don't want notifications about my subscription (renewals, service updates)." },
                    { key:'promo', val:notifNoPromo, label:"I don't want promotions about future products and special offers." },
                  ].map(n=>(
                    <label key={n.key} className="flex items-start gap-3 py-2 cursor-pointer">
                      <input type="checkbox" checked={n.val}
                        onChange={e=>handleSaveNotif(n.key==='subs'?e.target.checked:notifNoSubs, n.key==='promo'?e.target.checked:notifNoPromo)}
                        className="mt-0.5 w-4 h-4 accent-orange-500"/>
                      <span className="text-sm text-gray-600">{n.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              )
            })()}

            {/* ── BILLING tab — account & payment management (distinct from Subscriptions = plan shopping) ── */}
            {activeTab === 'billing' && (() => {
              const planLabel = isPro ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free'
              const expRaw    = user?.user_metadata?.plan_expires
              const expDate   = expRaw ? new Date(expRaw) : null
              const expValid  = expDate && !isNaN(expDate) ? expDate : null
              const fmtDate   = (d) => d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
              const tier      = PLAN_TIERS.find(t => t.id === plan)
              const lastAmt   = tier?.price
              return (
              <div className="max-w-lg">
                <h2 className="text-xl font-black text-gray-900 mb-1">Billing</h2>
                <p className="text-sm text-gray-500 mb-6">Your current plan, validity and payment history</p>

                {/* Current plan status */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-gray-900">Current Plan</div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPro?'bg-green-50 text-green-600':'bg-gray-100 text-gray-500'}`}>
                      {isPro ? '● Active' : 'Free tier'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-black ${isPro?'text-orange-600':'text-gray-900'}`}>{planLabel}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isPro
                          ? (expValid ? `Renews / expires on ${fmtDate(expValid)}` : 'Active subscription')
                          : 'Limited to 5 mock tests / month · No PDF downloads'}
                      </div>
                    </div>
                    <button onClick={()=>setActiveTab('subscriptions')}
                      className="text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
                      style={{ background:'#FF653F' }}>
                      {isPro ? 'Change plan' : 'Upgrade →'}
                    </button>
                  </div>
                </div>

                {/* Payment history */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="text-sm font-bold text-gray-900 mb-4">Payment History</div>
                  {isPro ? (
                    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{planLabel} plan</div>
                        <div className="text-xs text-gray-400 mt-0.5">{expValid ? `Valid until ${fmtDate(expValid)}` : 'Active'}</div>
                      </div>
                      <div className="text-right">
                        {lastAmt && <div className="text-sm font-bold text-gray-900">{lastAmt}</div>}
                        <span className="text-xs font-semibold text-green-600">Paid</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-2">🧾</div>
                      <div className="text-sm font-semibold text-gray-600">No payments yet</div>
                      <div className="text-xs text-gray-400 mt-1">Your invoices will appear here after you subscribe.</div>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1.5">
                    <span>🔒</span> Payments are processed securely via Stripe.
                  </div>
                </div>
              </div>
              )
            })()}

            {/* ── SETTINGS tab ── */}
            {activeTab === 'settings' && (
              <div className="max-w-lg">
                <h2 className="text-xl font-black text-gray-900 mb-6">Settings</h2>
                <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 mb-4">
                  {[
                    { label:'Email notifications',  sub:'Exam reminders, plan updates',      on:true  },
                    { label:'WhatsApp alerts',       sub:'Daily study reminders',             on:false },
                    { label:'Performance digest',   sub:'Weekly score summary email',        on:true  },
                  ].map(s=>(
                    <div key={s.label} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${s.on?'':'bg-gray-200'}`} style={s.on?{background:'#FF653F'}:{}}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.on?'left-5':'left-0.5'}`}/>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={onLogout} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl border border-red-200 transition-colors">
                  ↪ Log Out of MockTest
                </button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ══ SLIDE-IN PANEL ══ */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={()=>setPanelOpen(false)}/>
          <div className="fixed right-0 top-0 h-full w-72 z-50 flex flex-col overflow-y-auto shadow-2xl" style={{ background:'#1a1a1a' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,.1)' }}>
              <div className="flex items-center gap-2">
                <div style={{ width:28, height:28, background:'#FF653F', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'#fff', fontWeight:900, fontSize:10 }}>MT</span>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">MockTest</div>
                  <div className="text-xs" style={{ color:'#888' }}>by Anil Software Technologies</div>
                </div>
              </div>
              <button onClick={()=>setPanelOpen(false)} className="text-white/70 hover:text-white text-2xl w-8 h-8 flex items-center justify-center">×</button>
            </div>
            <nav className="flex-1 py-3">
              {/* Dashboard sections — MOBILE ONLY (desktop already has the sidebar) */}
              <div className="md:hidden">
                <div className="px-5 pt-1 pb-2 text-xs font-bold uppercase tracking-widest" style={{ color:'#FF653F' }}>Menu</div>
                {SIDEBAR_NAV.map(item => (
                  <button key={item.id}
                    onClick={()=>{ setPanelOpen(false); setActiveTab(item.id) }}
                    className="w-full flex items-center gap-3 px-5 py-2.5 text-white transition-colors"
                    style={ activeTab===item.id ? { background:'rgba(255,107,53,.18)' } : {} }
                    onMouseOver={e=>{ if(activeTab!==item.id) e.currentTarget.style.background='rgba(255,107,53,.10)' }}
                    onMouseOut={e=>{ if(activeTab!==item.id) e.currentTarget.style.background='transparent' }}>
                    <span className="text-white/90 flex-shrink-0"><item.Icon /></span>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="px-5 pt-1 md:pt-1 pb-2 text-xs font-bold uppercase tracking-widest" style={{ color:'#FF653F' }}>Practice Modes</div>
              {MODES.map(m => (
                <button key={m.id} onClick={()=>{setPanelOpen(false);onStartTest(m.id)}}
                  className="w-full flex items-center gap-3 px-5 py-3 text-white transition-colors"
                  style={{ borderRadius:0 }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,107,53,.15)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <span className="text-white flex-shrink-0"><m.Icon /></span>
                  <div>
                    <div className="text-sm font-bold">{m.label}</div>
                  </div>
                </button>
              ))}
              {EXAM_GROUPS.map(g => (
                <div key={g.id} className="mt-2">
                  <div className="px-5 py-2 text-xs font-bold uppercase tracking-widest" style={{ color:'#FF653F', borderTop:'1px solid rgba(255,255,255,.08)' }}>{g.label}</div>
                  {g.exams.map(e => (
                    <button key={e.id} onClick={()=>{setPanelOpen(false);onStartTest('mock', e.id)}}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-white transition-colors"
                      onMouseOver={ev=>ev.currentTarget.style.background='rgba(255,107,53,.15)'}
                      onMouseOut={ev=>ev.currentTarget.style.background='transparent'}>
                      <div>
                        <span className="text-sm font-medium">{e.name}</span>
                        <span className="text-xs ml-2" style={{ color:'#888' }}>{e.sub}</span>
                      </div>
                      {e.tag && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{e.tag}</span>}
                    </button>
                  ))}
                </div>
              ))}
              <div className="mt-3 pt-2" style={{ borderTop:'1px solid rgba(255,255,255,.08)' }}>
                {adminUser && (
                  <button onClick={()=>{setPanelOpen(false);onNav?.('admin')}} className="w-full text-left px-5 py-2.5 text-sm" style={{ color:'#ccc' }}>⚙ Admin Panel</button>
                )}
                <button onClick={onLogout} className="w-full text-left px-5 py-2.5 text-sm" style={{ color:'#ccc' }}>→ Log out</button>
              </div>
            </nav>
          </div>
        </>
      )}

    </div>
  )
}
