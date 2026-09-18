// QuestionScanner.jsx — OCR-based topic detector, no LLM required
// Pipeline: image upload → Tesseract.js (WASM OCR) → keyword classifier → topic match

import { useState, useRef, useCallback } from 'react'

/* ─── Topic keyword map ────────────────────────────────────────────────────
   Each entry: engineKey that matches TopicPractice's engineKey, a friendly
   name, section, icon, and weighted keyword list.
   Weight 3 = highly specific phrase, 2 = strong signal, 1 = weak signal.
─────────────────────────────────────────────────────────────────────────── */
const TOPIC_MAP = [
  /* ── Numerical Ability ── */
  {
    engineKey: 'simplification', name: 'Simplification', section: 'Numerical Ability', icon: '🔢',
    keywords: [
      [3, ['bodmas', 'simplify', 'simplification', 'order of operations']],
      [2, ['evaluate', 'square root', 'cube root', '√', 'expression', '÷', '×']],
      [1, ['calculate', 'find the value', 'solve']],
    ],
  },
  {
    engineKey: 'number_series', name: 'Number Series', section: 'Numerical Ability', icon: '🔁',
    keywords: [
      [3, ['number series', 'next number in the series', 'missing number', 'wrong number in the series']],
      [2, ['next term', 'missing term', 'find the next', 'sequence', 'series', 'pattern']],
      [1, ['find the missing', '?', 'blank in series']],
    ],
  },
  {
    engineKey: 'data_interpretation', name: 'Data Interpretation', section: 'Numerical Ability', icon: '📊',
    keywords: [
      [3, ['data interpretation', 'bar graph', 'pie chart', 'line graph', 'table chart', 'di set']],
      [2, ['percentage change', 'total production', 'number of students', 'based on the following', 'from the table']],
      [1, ['graph', 'chart', 'table', 'data', 'year']],
    ],
  },
  {
    engineKey: 'quadratic_equations', name: 'Quadratic Equations', section: 'Numerical Ability', icon: '📐',
    keywords: [
      [3, ['quadratic', 'x² ', 'x^2', 'roots of the equation', 'solve the equation', 'find the value of x and y']],
      [2, ['equation', 'x² +', 'x2 +', '2x²', 'y²', 'y^2', 'column i', 'column ii']],
      [1, ['roots', 'solve', 'value of x', 'value of y']],
    ],
  },
  {
    engineKey: 'profit_loss', name: 'Profit & Loss', section: 'Numerical Ability', icon: '💹',
    keywords: [
      [3, ['profit and loss', 'selling price', 'cost price', 'marked price', 'discount percent']],
      [2, ['profit', 'loss', 'gain', 'discount', 'sp', 'cp', 'mp', 'overhead', 'shopkeeper']],
      [1, ['sold', 'bought', 'article', 'purchase', 'sell']],
    ],
  },
  {
    engineKey: 'simple_interest', name: 'Simple / Compound Interest', section: 'Numerical Ability', icon: '🏦',
    keywords: [
      [3, ['simple interest', 'compound interest', 'rate of interest', 'principal amount', 'ci - si']],
      [2, ['si ', ' ci ', 'interest', 'principal', 'amount after', 'annual rate', 'years at']],
      [1, ['deposit', 'invest', 'bank', 'rate', 'annum']],
    ],
  },
  {
    engineKey: 'percentage', name: 'Percentage', section: 'Numerical Ability', icon: '📈',
    keywords: [
      [3, ['what percent', 'percentage increase', 'percentage decrease', 'what is the percentage', 'find the percent']],
      [2, ['percent', '%', 'increased by', 'decreased by', 'reduction', 'successive discount']],
      [1, ['how much', 'original value', 'new value']],
    ],
  },
  {
    engineKey: 'time_work', name: 'Time & Work', section: 'Numerical Ability', icon: '⚙️',
    keywords: [
      [3, ['time and work', 'can complete the work', 'together they can finish', 'efficiency', 'man days']],
      [2, ['complete the work', 'finish the work', 'days', 'hours to complete', 'pipes fill', 'a alone', 'b alone']],
      [1, ['work', 'workers', 'men', 'women', 'together', 'left alone']],
    ],
  },
  {
    engineKey: 'time_distance', name: 'Time, Speed & Distance', section: 'Numerical Ability', icon: '🚀',
    keywords: [
      [3, ['time speed distance', 'relative speed', 'speed of train', 'km/h', 'kmph', 'meets the other train']],
      [2, ['speed', 'distance', 'time', 'train', 'overtakes', 'covers', 'travelled']],
      [1, ['km', 'hours', 'minutes', 'journey', 'reaches']],
    ],
  },
  {
    engineKey: 'average', name: 'Average', section: 'Numerical Ability', icon: '⚖️',
    keywords: [
      [3, ['average of', 'arithmetic mean', 'weighted average', 'new average', 'average age']],
      [2, ['average', 'mean', 'class average', 'average marks', 'average salary']],
      [1, ['total', 'sum', 'find the average']],
    ],
  },
  {
    engineKey: 'ages', name: 'Problems on Ages', section: 'Numerical Ability', icon: '👤',
    keywords: [
      [3, ['present age', 'age of father', 'age of son', 'ratio of ages', 'years ago the age', 'after n years']],
      [2, ['age', 'father', 'son', 'mother', 'daughter', 'years ago', 'years hence', 'twice as old']],
      [1, ['older', 'younger', 'born']],
    ],
  },
  {
    engineKey: 'ratio_proportion', name: 'Ratio & Proportion', section: 'Numerical Ability', icon: '⚡',
    keywords: [
      [3, ['ratio and proportion', 'in the ratio', 'divided in ratio', 'proportion', 'fourth proportional']],
      [2, ['ratio', 'proportion', ':1', ':2', ':3', 'share', 'parts', 'divide']],
      [1, ['distribute', 'split', 'divides']],
    ],
  },
  {
    engineKey: 'mixture_alligation', name: 'Mixture & Alligation', section: 'Numerical Ability', icon: '🧪',
    keywords: [
      [3, ['mixture alligation', 'alligation', 'two solutions', 'concentration', 'ratio of mixing']],
      [2, ['mixture', 'solution', 'milk and water', 'pure milk', 'pure water', 'litres of']],
      [1, ['mixed', 'combine', 'dilute']],
    ],
  },
  {
    engineKey: 'mensuration', name: 'Mensuration', section: 'Numerical Ability', icon: '📏',
    keywords: [
      [3, ['area of rectangle', 'area of circle', 'volume of cylinder', 'perimeter', 'curved surface area', 'total surface area']],
      [2, ['area', 'volume', 'radius', 'diameter', 'circumference', 'height', 'breadth', 'length', 'side']],
      [1, ['square', 'rectangle', 'triangle', 'circle', 'cylinder', 'cone', 'sphere', 'cube', 'cuboid']],
    ],
  },
  {
    engineKey: 'partnership', name: 'Partnership', section: 'Numerical Ability', icon: '🤝',
    keywords: [
      [3, ['partnership', 'profit sharing', 'invest for months', 'capital ratio', 'a and b started']],
      [2, ['invested', 'capital', 'profit share', 'ratio of profit', 'business']],
      [1, ['partner', 'invest', 'months', 'annual profit']],
    ],
  },
  {
    engineKey: 'probability', name: 'Probability', section: 'Numerical Ability', icon: '🎲',
    keywords: [
      [3, ['probability', 'favourable outcomes', 'total outcomes', 'p(a)', 'mutually exclusive']],
      [2, ['probability of', 'chance', 'dice', 'card', 'ball', 'bag', 'coin', 'toss']],
      [1, ['event', 'random', 'drawn', 'selected']],
    ],
  },
  {
    engineKey: 'permutation_combination', name: 'Permutation & Combination', section: 'Numerical Ability', icon: '🔣',
    keywords: [
      [3, ['permutation', 'combination', 'ncr', 'npr', 'arrange', 'number of ways']],
      [2, ['ways', 'select', 'choose', 'arrangement', 'seated in a row', 'word can be formed']],
      [1, ['n!', 'factorial', 'distinct', 'positions']],
    ],
  },
  {
    engineKey: 'pipes_cisterns', name: 'Pipes & Cisterns', section: 'Numerical Ability', icon: '🔧',
    keywords: [
      [3, ['pipe cistern', 'fill the tank', 'empty the tank', 'inlet pipe', 'outlet pipe', 'both pipes open']],
      [2, ['pipe', 'cistern', 'tank', 'fill', 'empty', 'leakage']],
      [1, ['hours', 'minutes', 'together']],
    ],
  },
  {
    engineKey: 'boats_streams', name: 'Boats & Streams', section: 'Numerical Ability', icon: '🚢',
    keywords: [
      [3, ['boat and stream', 'upstream', 'downstream', 'speed of boat in still water', 'speed of stream']],
      [2, ['boat', 'stream', 'river', 'rowing', 'current']],
      [1, ['against', 'with', 'still water']],
    ],
  },

  /* ── Reasoning Ability ── */
  {
    engineKey: 'seating_arrangement', name: 'Seating Arrangement', section: 'Reasoning Ability', icon: '🪑',
    keywords: [
      [3, ['seating arrangement', 'sitting arrangement', 'circular arrangement', 'facing north', 'facing south', 'facing the centre']],
      [2, ['sitting', 'between', 'adjacent', 'immediate left', 'immediate right', 'facing', 'direction']],
      [1, ['row', 'circle', 'table', 'seats', 'persons']],
    ],
  },
  {
    engineKey: 'puzzles', name: 'Puzzles', section: 'Reasoning Ability', icon: '🧩',
    keywords: [
      [3, ['floor puzzle', 'box puzzle', 'different floors', 'different boxes', 'lives on']],
      [2, ['puzzle', 'floor', 'building', 'box', 'rank', 'weight', 'height', 'age group']],
      [1, ['arranges', 'ordered', 'scheduled']],
    ],
  },
  {
    engineKey: 'syllogisms', name: 'Syllogisms', section: 'Reasoning Ability', icon: '💬',
    keywords: [
      [3, ['syllogism', 'all a are b', 'no a is b', 'some a are b', 'conclusion follows', 'either conclusion']],
      [2, ['statement', 'conclusion', 'all', 'some', 'no', 'follows', 'definitely']],
      [1, ['i and ii', 'neither', 'only conclusion']],
    ],
  },
  {
    engineKey: 'inequality', name: 'Inequalities', section: 'Reasoning Ability', icon: '🔃',
    keywords: [
      [3, ['coded inequality', 'find the relation', 'a > b > c', 'which relationship is true']],
      [2, ['inequality', '>', '<', '=', '≥', '≤', 'greater than', 'less than']],
      [1, ['relationship', 'true', 'false', 'follow']],
    ],
  },
  {
    engineKey: 'coding_decoding', name: 'Coding-Decoding', section: 'Reasoning Ability', icon: '🔑',
    keywords: [
      [3, ['coding decoding', 'coded as', 'in a certain language', 'what is the code for', 'decode the message']],
      [2, ['coded', 'code', 'decoded', 'language', 'cipher']],
      [1, ['word', 'letter', 'digit', 'symbol']],
    ],
  },
  {
    engineKey: 'blood_relations', name: 'Blood Relations', section: 'Reasoning Ability', icon: '🩸',
    keywords: [
      [3, ['blood relation', 'pointing to a photograph', 'how is a related to b', 'son of my father']],
      [2, ['father', 'mother', 'brother', 'sister', 'uncle', 'aunt', 'nephew', 'niece', 'grandson', 'granddaughter']],
      [1, ['relative', 'related', 'family', 'parent', 'child']],
    ],
  },
  {
    engineKey: 'direction_sense', name: 'Direction Sense', section: 'Reasoning Ability', icon: '🧭',
    keywords: [
      [3, ['direction sense', 'started walking towards north', 'turns right', 'turns left', 'how far from starting']],
      [2, ['north', 'south', 'east', 'west', 'direction', 'turn', 'walking']],
      [1, ['km away', 'metres away', 'starting point', 'final position']],
    ],
  },
  {
    engineKey: 'alphanumeric_series', name: 'Alphanumeric Series', section: 'Reasoning Ability', icon: '🔤',
    keywords: [
      [3, ['alphanumeric series', 'next in the series', 'a1b2c3', 'letter number', 'find the missing term']],
      [2, ['series', 'sequence', 'alphabetic', 'numeric', 'pattern']],
      [1, ['a b c', 'letters', 'numbers']],
    ],
  },
  {
    engineKey: 'order_ranking', name: 'Order & Ranking', section: 'Reasoning Ability', icon: '🏅',
    keywords: [
      [3, ['rank', 'from the top', 'from the bottom', 'order of merit', 'ranking']],
      [2, ['position', 'rank', 'row', 'class', 'tallest', 'shortest', 'heaviest', 'lightest']],
      [1, ['students', 'persons', 'total']],
    ],
  },

  /* ── English Language ── */
  {
    engineKey: 'reading_comprehension', name: 'Reading Comprehension', section: 'English Language', icon: '📖',
    keywords: [
      [3, ['passage', 'read the following passage', 'comprehension', 'according to the passage', 'the author']],
      [2, ['infer', 'passage implies', 'best title', 'suitable title', 'tone of the passage']],
      [1, ['suggest', 'based on', 'mentioned', 'paragraph']],
    ],
  },
  {
    engineKey: 'cloze_test', name: 'Cloze Test', section: 'English Language', icon: '✍️',
    keywords: [
      [3, ['cloze test', 'fill in the blanks in the passage', 'choose the correct word for each blank']],
      [2, ['blank', 'passage with blanks', 'appropriate word', 'correct option']],
      [1, ['given below', 'choose', 'option']],
    ],
  },
  {
    engineKey: 'error_detection', name: 'Error Detection', section: 'English Language', icon: '🔍',
    keywords: [
      [3, ['error detection', 'grammatically incorrect', 'find the error', 'no error', 'underlined part']],
      [2, ['error', 'grammatically', 'incorrect', 'correct the sentence', 'part of the sentence']],
      [1, ['(a)', '(b)', '(c)', '(d)', '(e) no error']],
    ],
  },
  {
    engineKey: 'para_jumbles', name: 'Para Jumbles', section: 'English Language', icon: '🔀',
    keywords: [
      [3, ['para jumble', 'rearrange the sentences', 'correct order', 'jumbled sentences', 'which sentence comes first']],
      [2, ['rearrange', 'order', 'jumbled', 'coherent paragraph', 'sentence']],
      [1, ['a', 'b', 'c', 'd', 'e', 'correct sequence']],
    ],
  },
  {
    engineKey: 'fill_in_the_blanks', name: 'Fill in the Blanks', section: 'English Language', icon: '📝',
    keywords: [
      [3, ['fill in the blank', 'choose the appropriate word', 'most appropriate word', 'suitable word']],
      [2, ['blank', 'appropriate', 'suitable', 'correct word', 'missing word']],
      [1, ['fill', 'choose', 'option']],
    ],
  },
  {
    engineKey: 'vocabulary', name: 'Vocabulary', section: 'English Language', icon: '📚',
    keywords: [
      [3, ['synonym', 'antonym', 'meaning of', 'contextual meaning', 'word meaning', 'similar meaning', 'opposite meaning']],
      [2, ['synonym', 'antonym', 'similar', 'opposite', 'word', 'meaning']],
      [1, ['closest', 'nearest', 'usage']],
    ],
  },
]

/* ─── Keyword classifier ────────────────────────────────────────────────── */
function classifyText(rawText) {
  const text = rawText.toLowerCase().replace(/[''""]/g, "'")

  const scores = TOPIC_MAP.map(topic => {
    let score = 0
    for (const [weight, phrases] of topic.keywords) {
      for (const phrase of phrases) {
        if (text.includes(phrase.toLowerCase())) score += weight
      }
    }
    return { ...topic, score }
  })

  const sorted = scores.sort((a, b) => b.score - a.score)
  const top = sorted.slice(0, 3).filter(t => t.score > 0)

  if (top.length === 0) return null

  const maxPossible = TOPIC_MAP.reduce((best, topic) => {
    const s = topic.keywords.reduce((acc, [w, kws]) => acc + w * kws.length, 0)
    return Math.max(best, s)
  }, 1)

  return top.map((t, i) => ({
    engineKey: t.engineKey,
    name: t.name,
    section: t.section,
    icon: t.icon,
    score: t.score,
    confidence: Math.min(100, Math.round((t.score / Math.max(top[0].score, 1)) * (i === 0 ? 92 : i === 1 ? 65 : 40))),
    rank: i + 1,
  }))
}

/* ─── Section color map ─────────────────────────────────────────────────── */
const SECTION_STYLE = {
  'Numerical Ability': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Reasoning Ability': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  'English Language':  { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
}

/* ─── Progress bar during OCR ───────────────────────────────────────────── */
function ProgressBar({ value }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{ width: `${value}%`, background: '#FF653F' }}
      />
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function QuestionScanner({ onStartTest }) {
  const [image, setImage]         = useState(null)   // data URL for preview
  const [imageFile, setImageFile] = useState(null)   // File object for Tesseract
  const [status, setStatus]       = useState('idle') // idle | ocr | done | error
  const [progress, setProgress]   = useState(0)
  const [ocrText, setOcrText]     = useState('')
  const [results, setResults]     = useState(null)   // array of top matches
  const [dragging, setDragging]   = useState(false)
  const [showText, setShowText]   = useState(false)
  const inputRef = useRef(null)

  const loadImage = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImage(URL.createObjectURL(file))
    setImageFile(file)
    setStatus('idle')
    setResults(null)
    setOcrText('')
    setProgress(0)
    setShowText(false)
  }, [])

  const onFileChange = (e) => loadImage(e.target.files?.[0])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    loadImage(e.dataTransfer.files?.[0])
  }

  const runOcr = async () => {
    if (!imageFile) return
    setStatus('ocr')
    setProgress(5)

    try {
      // Dynamic import so Tesseract WASM only loads when actually used
      const { createWorker } = await import('tesseract.js')

      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(10 + Math.round(m.progress * 80))
          } else if (m.status === 'loading tesseract core') {
            setProgress(5)
          } else if (m.status === 'initializing tesseract') {
            setProgress(10)
          }
        },
      })

      setProgress(15)
      const { data } = await worker.recognize(imageFile)
      await worker.terminate()

      const text = data.text || ''
      setOcrText(text)
      setProgress(100)

      const matches = classifyText(text)
      setResults(matches)
      setStatus('done')
    } catch (err) {
      console.error('OCR error:', err)
      setStatus('error')
    }
  }

  const reset = () => {
    setImage(null)
    setImageFile(null)
    setStatus('idle')
    setProgress(0)
    setOcrText('')
    setResults(null)
    setShowText(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const startPractice = (match) => {
    onStartTest('topic', match.engineKey, {
      difficulty: 'easy',
      count: 10,
      timed: false,
      show_explanations: true,
      negative_marking: false,
      exam: 'bank_clerk_prelims',
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: '#FF653F' }}>
            📷
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Question Scanner</h2>
            <p className="text-sm text-gray-500">Upload a textbook question — we'll detect the topic and open a targeted practice set</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { step: '1', label: 'Upload image', sub: 'Photo, screenshot, or scan', icon: '🖼️' },
          { step: '2', label: 'OCR scans text', sub: 'Runs locally, no server', icon: '🔍' },
          { step: '3', label: 'Topic detected', sub: 'Start the matching practice', icon: '🎯' },
        ].map(s => (
          <div key={s.step} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <div className="text-xl mb-1">{s.icon}</div>
            <p className="text-xs font-bold text-gray-700">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Upload area */}
      {!image ? (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragging ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/40'
          }`}
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          <div className="text-4xl mb-3">📸</div>
          <p className="font-bold text-gray-700 text-sm">Drag & drop an image here</p>
          <p className="text-xs text-gray-400 mt-1">or click to browse — JPG, PNG, WEBP, etc.</p>
          <p className="text-xs text-gray-300 mt-3">Works with photos, textbook screenshots, scanned pages</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Image preview */}
          <div className="relative bg-gray-50 flex items-center justify-center" style={{ maxHeight: 280 }}>
            <img src={image} alt="uploaded question" className="max-h-72 object-contain w-full" />
            <button
              onClick={reset}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-500 hover:text-red-500 text-xs font-bold transition-colors"
              title="Remove image"
            >✕</button>
          </div>

          <div className="p-4">
            {status === 'idle' && (
              <button
                onClick={runOcr}
                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 shadow-sm"
                style={{ background: '#FF653F' }}
              >
                Scan & Detect Topic
              </button>
            )}

            {status === 'ocr' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium">
                    {progress < 15 ? 'Loading OCR engine…'
                      : progress < 90 ? 'Reading text from image…'
                      : 'Classifying topic…'}
                  </span>
                  <span className="font-bold" style={{ color: '#FF653F' }}>{progress}%</span>
                </div>
                <ProgressBar value={progress} />
                <p className="text-xs text-gray-400 text-center mt-1">
                  Running entirely in your browser — no data leaves your device
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-2">
                <p className="text-sm text-red-600 font-medium mb-2">OCR failed — please try a clearer image</p>
                <button onClick={() => setStatus('idle')} className="text-xs text-gray-500 underline">Try again</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'done' && (
        <div className="mt-5 space-y-3">
          {!results ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
              <p className="text-2xl mb-2">🤔</p>
              <p className="font-bold text-gray-800 text-sm">Couldn't identify a specific topic</p>
              <p className="text-xs text-gray-500 mt-1">
                The image may be blurry, the text too small, or the question doesn't match a known category.
                Try a clearer, closer photo.
              </p>
              <button onClick={reset} className="mt-3 text-xs font-bold underline text-gray-500">Try another image</button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-gray-700">Detected topics</p>
                <button
                  onClick={() => setShowText(v => !v)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  {showText ? 'Hide' : 'Show'} extracted text
                </button>
              </div>

              {showText && (
                <pre className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-3 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto mb-3">
                  {ocrText || '(no text extracted)'}
                </pre>
              )}

              {results.map((match, i) => {
                const style = SECTION_STYLE[match.section] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' }
                const isPrimary = i === 0
                return (
                  <div
                    key={match.engineKey}
                    className={`rounded-2xl border p-4 transition-all ${
                      isPrimary
                        ? 'border-orange-200 bg-orange-50/60 shadow-sm'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl mt-0.5 flex-shrink-0">{match.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-bold text-sm ${isPrimary ? 'text-gray-900' : 'text-gray-700'}`}>
                              {match.name}
                            </p>
                            {isPrimary && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#FF653F' }}>
                                Best match
                              </span>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${style.bg} ${style.text} border ${style.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {match.section}
                          </span>

                          {/* Confidence bar */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>Match confidence</span>
                              <span className="font-bold text-gray-600">{match.confidence}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${match.confidence}%`,
                                  background: isPrimary ? '#FF653F' : '#a78bfa',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => startPractice(match)}
                        className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                          isPrimary
                            ? 'text-white shadow-sm hover:opacity-90'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={isPrimary ? { background: '#FF653F' } : {}}
                      >
                        Practice →
                      </button>
                    </div>
                  </div>
                )
              })}

              <button onClick={reset} className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 underline">
                Scan another question
              </button>
            </>
          )}
        </div>
      )}

      {/* Privacy note */}
      <div className="mt-6 flex items-start gap-2 text-xs text-gray-400">
        <span className="flex-shrink-0 mt-0.5">🔒</span>
        <span>
          OCR runs entirely in your browser using WebAssembly. Your image is never uploaded to any server.
        </span>
      </div>
    </div>
  )
}
