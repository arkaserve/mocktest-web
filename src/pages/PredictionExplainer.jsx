import { useState } from "react"

/* ── Sample data that mirrors a real student result ── */
const SAMPLE = {
  name: "Anil Kumar",
  exam: "IBPS Clerk Prelims",
  category: "OBC",
  score: 67.5,
  maxScore: 100,
  percentage: 67.5,
  correct: 69,
  wrong: 12,
  skipped: 19,

  cutoff: { typical: 70.0, min: 62.0, max: 79.25, status: "borderline_low", gap: -2.5 },

  sections: [
    { id:"english",   label:"English",   correct:22, total:30, cutoff:8.25,  color:"#10b981" },
    { id:"numerical", label:"Numerical", correct:26, total:35, cutoff:9.5,   color:"#f59e0b" },
    { id:"reasoning", label:"Reasoning", correct:19, total:35, cutoff:9.75,  color:"#8b5cf6" },
  ],

  topics: [
    { name:"Simplification",  section:"Numerical", acc:85, time:16, target:18, conf:"confident",        silly:1, gap:0 },
    { name:"Percentage",      section:"Numerical", acc:0,  time:98, target:40, conf:"concept_gap",      silly:0, gap:3 },
    { name:"Profit & Loss",   section:"Numerical", acc:50, time:55, target:45, conf:"knows_but_slow",   silly:0, gap:0 },
    { name:"Seating Arr.",    section:"Reasoning", acc:60, time:52, target:50, conf:"moderate",         silly:0, gap:0 },
    { name:"Blood Relations", section:"Reasoning", acc:25, time:140,target:40, conf:"struggling",       silly:0, gap:2 },
    { name:"Error Detection", section:"English",   acc:50, time:38, target:40, conf:"knows_but_careless",silly:2,gap:0 },
    { name:"Vocabulary",      section:"English",   acc:12, time:8,  target:20, conf:"guessing",         silly:0, gap:0 },
  ],

  timeAnalysis: {
    avg: 52, silly: 3, cgap: 5,
    sunk: { secs: 97, count: 2, topic: "Seating Arrangement" },
    slowest: [
      { topic:"Percentage",     ratio:2.45, avg:98,  target:40 },
      { topic:"Blood Relations",ratio:3.50, avg:140, target:40 },
    ],
  },

  streaks: [{ start:28, end:31, length:4, message:"4 consecutive wrong/skipped (Q28–Q31) in Reasoning block" }],

  nextSteps: [
    { priority:1, title:"Practice Percentage",      conf:"concept_gap",       impact:"+3.0 marks", severity:"critical", difficulty:"easy"  },
    { priority:2, title:"Speed drill on Profit & Loss", conf:"knows_but_slow",impact:"+1.5 marks", severity:"moderate", difficulty:"medium" },
    { priority:3, title:"Stop guessing Vocabulary", conf:"guessing",          impact:"+1.2 marks", severity:"moderate", difficulty:"easy"  },
  ],
}

const CONF_META = {
  confident:          { color:"#10b981", bg:"#d1fae5", label:"Confident",          icon:"✓",  desc:"Correct + fast. No action needed." },
  knows_but_slow:     { color:"#f59e0b", bg:"#fef3c7", label:"Knows but Slow",     icon:"⏱",  desc:"Correct but too slow. Speed drills needed." },
  knows_but_careless: { color:"#f97316", bg:"#ffedd5", label:"Careless Errors",    icon:"✏",  desc:"Silly mistakes on familiar topic. Slow down on final step." },
  concept_gap:        { color:"#ef4444", bg:"#fee2e2", label:"Concept Gap",        icon:"📖", desc:"Slow + wrong. Needs concept revision, not speed practice." },
  guessing:           { color:"#dc2626", bg:"#fee2e2", label:"Guessing",           icon:"🎲", desc:"Fast + wrong. Stop guessing — costs marks with -0.25." },
  struggling:         { color:"#b91c1c", bg:"#fee2e2", label:"Struggling",         icon:"⚠",  desc:"Slow + wrong. Worst state. Revisit fundamentals immediately." },
  moderate:           { color:"#6b7280", bg:"#f3f4f6", label:"Moderate",           icon:"~",  desc:"Mixed signals. Needs more data." },
  untested:           { color:"#9ca3af", bg:"#f9fafb", label:"Untested",           icon:"?",  desc:"Not enough questions to classify." },
}

const SEV_META = {
  critical: { color:"#ef4444", bg:"#fee2e2", label:"Critical" },
  moderate: { color:"#f59e0b", bg:"#fef3c7", label:"Moderate" },
  mild:     { color:"#10b981", bg:"#d1fae5", label:"Mild"     },
  strong:   { color:"#6366f1", bg:"#ede9fe", label:"Strong"   },
}

/* ── Small reusable components ── */
function Card({ title, subtitle, children, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        {accent && <div className="w-1 h-6 rounded-full" style={{ background: accent }} />}
        <div>
          <div className="font-bold text-gray-900 text-sm">{title}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Badge({ label, color, bg }) {
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ color, background: bg }}>{label}</span>
  )
}

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block cursor-help"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute z-50 left-0 top-full mt-1 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none">
          {text}
        </span>
      )}
    </span>
  )
}

/* ── MAIN ── */
export default function PredictionExplainer() {
  const [activeSection, setActiveSection] = useState("overview")
  const d = SAMPLE

  const sections = [
    { id:"overview",   label:"📊 Overview"      },
    { id:"cutoff",     label:"🎯 Cut-off"        },
    { id:"confidence", label:"🧠 Confidence"     },
    { id:"time",       label:"⏱ Time Analysis"  },
    { id:"steps",      label:"🚀 Next Steps"     },
    { id:"howit",      label:"⚙ How It Works"   },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-blue-200 text-xs mb-1">MockTest · Result Analysis</div>
          <h1 className="text-white font-black text-xl">How Your Prediction Works</h1>
          <p className="text-blue-200 text-sm mt-1">
            Student: <strong className="text-white">{d.name}</strong> · {d.exam} · Category: <strong className="text-white">{d.category}</strong>
          </p>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto py-2">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${activeSection===s.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* ── OVERVIEW ── */}
        {activeSection === "overview" && (<>
          {/* Score card */}
          <Card title="Your Score" subtitle="IBPS Clerk Prelims · 100 marks" accent="#3b82f6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                    strokeDasharray={`${d.percentage} ${100-d.percentage}`} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-gray-900">{d.percentage}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 flex-1">
                {[
                  { label:"Correct",  val:d.correct,  color:"#10b981" },
                  { label:"Wrong",    val:d.wrong,     color:"#ef4444" },
                  { label:"Skipped",  val:d.skipped,  color:"#9ca3af" },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50">
                    <div className="text-2xl font-black" style={{color:s.color}}>{s.val}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Section bars */}
          <Card title="Section Scores" subtitle="Each section has its own cut-off — failing one = disqualified" accent="#8b5cf6">
            <div className="space-y-4">
              {d.sections.map(sec => {
                const pct = Math.round(sec.correct/sec.total*100)
                const passing = sec.correct >= sec.cutoff
                return (
                  <div key={sec.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">{sec.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{sec.correct}/{sec.total}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${passing?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>
                          {passing ? "✓ Cut-off passed" : "✗ Below cut-off"}
                        </span>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                      <div className="h-full rounded-full transition-all"
                        style={{ width:`${pct}%`, background:sec.color }} />
                      {/* cut-off marker */}
                      <div className="absolute top-0 h-full border-l-2 border-dashed border-gray-400"
                        style={{ left:`${sec.cutoff/sec.total*100}%` }}
                        title={`Cut-off: ${sec.cutoff} marks`} />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Sectional cut-off ({d.category}): {sec.cutoff} marks — dashed line
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </>)}

        {/* ── CUT-OFF ANALYSIS ── */}
        {activeSection === "cutoff" && (<>
          <Card title={`${d.category} Cut-off Comparison`} subtitle="Based on official IBPS results 2023" accent="#f59e0b">
            <div className="space-y-4">
              {/* Visual gauge */}
              <div className="relative h-12 bg-gray-100 rounded-xl overflow-hidden">
                {/* colour zones */}
                <div className="absolute inset-0 flex">
                  <div className="bg-red-100"    style={{width:`${d.cutoff.min}%`}} />
                  <div className="bg-amber-100"  style={{width:`${d.cutoff.typical-d.cutoff.min}%`}} />
                  <div className="bg-green-100"  style={{flex:1}} />
                </div>
                {/* markers */}
                <div className="absolute top-0 h-full border-l-2 border-amber-500"
                  style={{left:`${d.cutoff.typical}%`}}>
                  <span className="absolute -top-0.5 left-1 text-xs text-amber-700 font-bold whitespace-nowrap">
                    Typical {d.cutoff.typical}
                  </span>
                </div>
                <div className="absolute top-0 h-full border-l-2 border-green-600"
                  style={{left:`${d.cutoff.max}%`}}>
                  <span className="absolute -top-0.5 left-1 text-xs text-green-700 font-bold whitespace-nowrap">
                    Safe {d.cutoff.max}
                  </span>
                </div>
                {/* student marker */}
                <div className="absolute top-0 h-full border-l-4 border-blue-600"
                  style={{left:`${d.score}%`}}>
                  <span className="absolute top-3 left-1 text-xs text-blue-700 font-black whitespace-nowrap">
                    You {d.score}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:"Minimum cut-off", val:d.cutoff.min,  sub:"Lowest state",     color:"#ef4444" },
                  { label:"Typical cut-off", val:d.cutoff.typical,sub:"National average",color:"#f59e0b" },
                  { label:"Safe zone",       val:d.cutoff.max,  sub:"Highest state",     color:"#10b981" },
                ].map(c => (
                  <div key={c.label} className="text-center p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="text-lg font-black" style={{color:c.color}}>{c.val}</div>
                    <div className="text-xs font-semibold text-gray-700">{c.label}</div>
                    <div className="text-xs text-gray-400">{c.sub}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="font-bold text-amber-800 text-sm mb-1">
                  🟠 {d.cutoff.gap < 0 ? `Need ${Math.abs(d.cutoff.gap)} more marks` : "Above typical cut-off"}
                </div>
                <p className="text-xs text-amber-700">
                  Your score of {d.score} is {Math.abs(d.cutoff.gap)} marks below the typical {d.category} cut-off ({d.cutoff.typical}).
                  You may clear some states but not all. Just 2–3 more correct answers closes this gap.
                </p>
              </div>
            </div>
          </Card>

          {/* All categories */}
          <Card title="All Category Cut-offs" subtitle="For perspective — same exam, 2023" accent="#6366f1">
            <div className="space-y-2">
              {[
                {cat:"UR",  typ:75.0, min:67.5, max:82.75},
                {cat:"OBC", typ:70.0, min:62.0, max:79.25},
                {cat:"EWS", typ:70.0, min:62.0, max:79.00},
                {cat:"SC",  typ:61.0, min:51.0, max:71.50},
                {cat:"ST",  typ:50.0, min:40.0, max:62.00},
                {cat:"PwBD",typ:47.0, min:38.0, max:58.00},
              ].map(c => (
                <div key={c.cat} className={`flex items-center gap-3 p-2.5 rounded-lg ${c.cat===d.category?"bg-blue-50 border border-blue-200":""}`}>
                  <span className={`text-xs font-bold w-12 ${c.cat===d.category?"text-blue-700":"text-gray-500"}`}>
                    {c.cat}{c.cat===d.category?" ←":""}
                  </span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-400" style={{width:`${c.typ}%`}} />
                  </div>
                  <span className="text-xs text-gray-600 w-32">{c.min}–{c.max} (typ:{c.typ})</span>
                </div>
              ))}
            </div>
          </Card>
        </>)}

        {/* ── CONFIDENCE ANALYSIS ── */}
        {activeSection === "confidence" && (<>
          <Card title="4-State Confidence Model" subtitle="Each topic gets one of these labels based on time + accuracy" accent="#8b5cf6">
            <div className="grid grid-cols-2 gap-3">
              {[
                {key:"confident",          ex:"Simplification: 85% acc, 16s avg"},
                {key:"knows_but_slow",     ex:"Profit & Loss: 50% acc, 55s avg"},
                {key:"knows_but_careless", ex:"Error Detection: 50% acc, 38s + 2 silly mistakes"},
                {key:"concept_gap",        ex:"Percentage: 0% acc, 98s avg"},
                {key:"guessing",           ex:"Vocabulary: 12% acc, 8s avg"},
                {key:"struggling",         ex:"Blood Relations: 25% acc, 140s avg"},
              ].map(({key,ex}) => {
                const m = CONF_META[key]
                return (
                  <div key={key} className="p-3 rounded-xl border" style={{borderColor:m.color+"44", background:m.bg}}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{m.icon}</span>
                      <span className="font-bold text-xs" style={{color:m.color}}>{m.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{m.desc}</p>
                    <p className="text-xs text-gray-400 italic">{ex}</p>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title="Your Topic Confidence Map" subtitle="Hover over any label for explanation" accent="#3b82f6">
            <div className="space-y-2">
              {d.topics.map(t => {
                const m = CONF_META[t.conf]
                const timeRatio = (t.time/t.target).toFixed(1)
                const overTarget = t.time > t.target*1.2
                return (
                  <div key={t.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="text-xs font-semibold text-gray-700 w-32 flex-shrink-0">{t.name}</span>
                    <span className="text-xs text-gray-400 w-16 flex-shrink-0">{t.section}</span>
                    {/* accuracy bar */}
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{width:`${t.acc}%`, background:m.color}} />
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">{t.acc}%</span>
                    <Tooltip text={`Avg ${t.time}s vs ideal ${t.target}s (${timeRatio}x)`}>
                      <span className={`text-xs w-16 text-right ${overTarget?"text-red-600 font-semibold":"text-gray-400"}`}>
                        {t.time}s {overTarget?`↑${timeRatio}x`:""}
                      </span>
                    </Tooltip>
                    <Tooltip text={m.desc}>
                      <Badge label={m.label} color={m.color} bg={m.bg} />
                    </Tooltip>
                    {t.silly>0 && <span className="text-xs text-orange-600 font-bold" title="Silly mistakes">✏{t.silly}</span>}
                    {t.gap>0   && <span className="text-xs text-red-600 font-bold" title="Concept gap questions">📖{t.gap}</span>}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">✏ = silly mistakes detected &nbsp;|&nbsp; 📖 = concept gap detected</p>
          </Card>
        </>)}

        {/* ── TIME ANALYSIS ── */}
        {activeSection === "time" && (<>
          <Card title="Time Analysis" subtitle="How you spent your 60 minutes" accent="#f59e0b">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                {label:"Avg per question", val:`${d.timeAnalysis.avg}s`, target:"< 60s", ok:d.timeAnalysis.avg<60, note:"Target is under 60s overall"},
                {label:"Silly mistakes",   val:d.timeAnalysis.silly, target:"0",   ok:d.timeAnalysis.silly===0, note:"Wrong + medium fast on known topic"},
                {label:"Concept gaps",     val:d.timeAnalysis.cgap,  target:"0",   ok:d.timeAnalysis.cgap===0,  note:"Wrong + slow = didn't understand"},
                {label:"Sunk time",        val:`${d.timeAnalysis.sunk.secs}s`, target:"0s", ok:false, note:"Time wasted on skipped questions"},
              ].map(c => (
                <div key={c.label} className={`p-3 rounded-xl border ${c.ok?"border-green-200 bg-green-50":"border-red-200 bg-red-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{c.label}</span>
                    <span className={`text-xs font-bold ${c.ok?"text-green-600":"text-red-600"}`}>{c.ok?"✓":"✗"}</span>
                  </div>
                  <div className={`text-xl font-black mt-1 ${c.ok?"text-green-700":"text-red-700"}`}>{c.val}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.note}</div>
                </div>
              ))}
            </div>

            {/* Sunk time explanation */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-4">
              <div className="font-bold text-orange-800 text-sm mb-1">⏳ Sunk Time: {d.timeAnalysis.sunk.secs}s wasted</div>
              <p className="text-xs text-orange-700">
                You spent {d.timeAnalysis.sunk.secs}s reading {d.timeAnalysis.sunk.count} questions you eventually skipped
                (worst: {d.timeAnalysis.sunk.topic}). Apply the <strong>30-second rule</strong>:
                if you can't start solving within 30s, skip immediately. Those {Math.round(d.timeAnalysis.sunk.secs/60,1)} minutes
                could solve 2 more questions you know.
              </p>
            </div>

            {/* Slowest vs target */}
            <div className="font-semibold text-sm text-gray-700 mb-2">Slowest Topics vs Ideal Time</div>
            {d.timeAnalysis.slowest.map(s => (
              <div key={s.topic} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-gray-600 w-32">{s.topic}</span>
                <div className="flex-1 relative h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full transition-all" style={{width:`${Math.min(s.avg/2,100)}%`}} />
                  <div className="absolute top-0 h-full border-l-2 border-green-600 border-dashed" style={{left:`${Math.min(s.target/2,100)}%`}} />
                </div>
                <span className="text-xs text-red-600 font-bold w-24 text-right">
                  {s.avg}s ({s.ratio}x over {s.target}s ideal)
                </span>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-1">Green dashed line = ideal target time</p>
          </Card>

          {/* Streak */}
          {d.streaks.length > 0 && (
            <Card title="Consecutive Wrong Streaks" subtitle="3+ consecutive wrong/skipped = confidence dip signal" accent="#ef4444">
              {d.streaks.map((s,i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="font-bold text-red-700 text-sm mb-1">
                    🔴 {s.length} consecutive wrong/skipped — Q{s.start}–Q{s.end}
                  </div>
                  <p className="text-xs text-red-600">{s.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    This often means a topic block you're unfamiliar with appeared together.
                    In the real exam, skip immediately after 2 consecutive unknowns — don't persist.
                  </p>
                </div>
              ))}
            </Card>
          )}
        </>)}

        {/* ── NEXT STEPS ── */}
        {activeSection === "steps" && (<>
          <Card title="Recommended Next Steps" subtitle="Ranked by exam impact — most marks to gain first" accent="#10b981">
            <div className="space-y-3">
              {d.nextSteps.map(step => {
                const c = CONF_META[step.conf]
                const sev = SEV_META[step.severity] || SEV_META.moderate
                return (
                  <div key={step.priority} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {step.priority}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-gray-900 text-sm">{step.title}</span>
                          <Badge label={sev.label} color={sev.color} bg={sev.bg} />
                          <Badge label={c.label}   color={c.color}   bg={c.bg}   />
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          Confidence state: <strong>{c.label}</strong> — {c.desc}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{step.impact}</span>
                          <span className="text-xs text-gray-400">Difficulty: {step.difficulty}</span>
                          <button className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                            Start Practice →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Impact estimate */}
          <Card title="If You Fix These 3 Topics" subtitle="Estimated score improvement" accent="#6366f1">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900">{d.percentage}</div>
                <div className="text-xs text-gray-400">Current</div>
              </div>
              <div className="flex-1 text-center text-2xl text-gray-300">→</div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-600">
                  {d.percentage + d.nextSteps.reduce((s,n)=>s+parseFloat(n.impact),0)}
                </div>
                <div className="text-xs text-gray-400">Projected</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-blue-600">{d.cutoff.typical}</div>
                <div className="text-xs text-gray-400">{d.category} cut-off</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
              Fixing your top 3 weak topics brings you from {d.percentage} to ~{d.percentage+5.7} marks —
              above the typical {d.category} cut-off of {d.cutoff.typical}.
              This is achievable in 2–3 weeks of focused practice.
            </div>
          </Card>
        </>)}

        {/* ── HOW IT WORKS ── */}
        {activeSection === "howit" && (<>
          <Card title="How the Prediction Engine Works" subtitle="Step by step — no magic, just math" accent="#6366f1">
            <div className="space-y-5">
              {[
                {
                  step:1, title:"Every question is logged",
                  color:"#3b82f6",
                  body:"For each of your 100 answers, we record: topic, section, your answer, correct answer, and time spent in milliseconds.",
                  example:'{ topic:"percentage", status:"wrong", time_ms:98000 }'
                },
                {
                  step:2, title:"Topic-specific time benchmark applied",
                  color:"#8b5cf6",
                  body:"We compare your time against an ideal target for THAT topic — not a uniform constant. Simplification ideal = 18s. Reading Comprehension ideal = 75s. These are derived from real IBPS exam analysis.",
                  example:'Percentage: you took 98s vs ideal 40s → 2.4x over target → flagged'
                },
                {
                  step:3, title:"Confidence state assigned per topic",
                  color:"#f59e0b",
                  body:"Each topic is classified into one of 6 states based on accuracy + time pattern. This drives all downstream advice.",
                  example:'Wrong + slow + low accuracy → concept_gap\nWrong + fast + decent accuracy → silly_mistake'
                },
                {
                  step:4, title:"Sunk time on skips calculated",
                  color:"#ef4444",
                  body:"Skips under 3s = deliberate skip. Skips over 10s = sunk time — you read it, couldn't solve, abandoned. We report how many minutes you lost this way.",
                  example:'2 skipped questions × 48s each = 97s wasted on unproductive reading'
                },
                {
                  step:5, title:"Category cut-off comparison",
                  color:"#10b981",
                  body:"We use your reservation category (OBC/SC/ST/UR/EWS/PwBD) to show how you compare against official IBPS/SBI cut-offs from previous years. Cut-offs vary by state and year.",
                  example:'OBC 2023 typical: 70 marks. You: 67.5. Gap: -2.5. Need 3 more correct.'
                },
                {
                  step:6, title:"Weakness score computed",
                  color:"#f97316",
                  body:"Each topic gets a score 0–1 based on: accuracy (45%), time vs target (20%), skip rate (20%), guess rate (10%). Silly mistakes reduce the score — you know the topic.",
                  example:'Percentage: acc=0% (high), time=2.4x (high), skips=25% → score=0.88 → CRITICAL'
                },
                {
                  step:7, title:"Next steps ranked by exam impact",
                  color:"#6366f1",
                  body:"We estimate how many extra marks you'd gain by fixing each weak topic. Ranked by impact × difficulty to fix. The top 3 are your priority.",
                  example:'Fixing Percentage (weight 3.0) from 0%→80% accuracy = +2.4 marks estimated'
                },
              ].map(s => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black"
                    style={{background:s.color}}>
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm mb-1">{s.title}</div>
                    <p className="text-xs text-gray-600 mb-2">{s.body}</p>
                    <div className="bg-gray-900 text-green-400 text-xs rounded-lg px-3 py-2 font-mono whitespace-pre-wrap">
                      {s.example}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="What the Engine Cannot Do" subtitle="Honest limitations" accent="#ef4444">
            <ul className="space-y-2 text-xs text-gray-600">
              {[
                "Cannot predict exact cut-offs — those depend on vacancy count and competition that year.",
                "Cannot detect if you knew the answer but misread the question — only time and correctness are available.",
                "State-wise cut-off comparison needs your state (optional field we ask during registration).",
                "Peer percentile needs 20+ other students to have taken the same exam — activates automatically as platform grows.",
                "Google sign-in users may not have a category set — defaults to UR until they update their profile.",
              ].map((item,i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-red-400 flex-shrink-0">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </>)}

      </div>
    </div>
  )
}
