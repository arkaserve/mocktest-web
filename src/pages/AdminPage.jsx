import { useState, useEffect, useRef } from 'react'
import api from '../api.js'

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'mta-9x7k-2026-AST-qbank-prod'
const headers   = { 'x-admin-key': ADMIN_KEY }

const EXAM_IDS = [
  'bank_clerk_prelims','coal_india_mt','upsc_prelims',
  'ssc_cgl','gate_cs','gre_general','ielts_academic','cfa_level1'
]

export default function AdminPage({ onBack }) {
  const [tab,           setTab]          = useState('exams')
  const [stats,         setStats]        = useState(null)
  const [flagged,       setFlagged]      = useState([])
  const [loading,       setLoading]      = useState(true)
  const [uploadExam,    setUploadExam]   = useState('')
  const [uploadFile,    setUploadFile]   = useState(null)
  const [uploadStatus,  setUploadStatus] = useState('')
  const [seedStatus,    setSeedStatus]   = useState({})
  const [actionMsg,     setActionMsg]    = useState('')
  const [editingQ,      setEditingQ]     = useState(null)   // question being edited
  const [editData,      setEditData]     = useState({})     // edit form data
  const [bulkLoading,   setBulkLoading]  = useState(false)  // bulk approve
  const [savingEdit,    setSavingEdit]   = useState(false)  // saving edit
  const fileRef = useRef()

  // ── Data fetching ────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const r = await api.get('/admin/stats', { headers })
      setStats(r.data)
    } catch(e) {
      setStats({ exams: [], total_exams: 0, total_questions: 0 })
    } finally {
      setLoading(false)
    }
  }

  const fetchFlagged = async (examId = '') => {
    try {
      const url = examId ? `/admin/flagged?exam=${examId}` : '/admin/flagged'
      const r   = await api.get(url, { headers })
      setFlagged(r.data.flagged || [])
    } catch(e) { console.error(e) }
  }

  useEffect(() => { fetchStats(); fetchFlagged() }, [])

  const showMsg = (msg) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(''), 3000)
  }

  // ── Approve single question ──────────────────────────────────────
  const handleApprove = async (qid) => {
    try {
      await api.put(`/admin/approve/${qid}`, {}, { headers })
      setFlagged(f => f.filter(q => q.id !== qid))
      showMsg('Question approved ✓')
      fetchStats()
    } catch(e) { showMsg('Error: ' + (e.response?.data?.error || e.message)) }
  }

  // ── Delete single question ───────────────────────────────────────
  const handleDelete = async (qid) => {
    try {
      await api.delete(`/admin/question/${qid}`, { headers })
      setFlagged(f => f.filter(q => q.id !== qid))
      showMsg('Question deleted')
    } catch(e) { showMsg('Error: ' + (e.response?.data?.error || e.message)) }
  }

  // ── BULK APPROVE ─────────────────────────────────────────────────
  const handleBulkApprove = async (examFilter = '') => {
    const toApprove = examFilter
      ? flagged.filter(q => q.exam === examFilter)
      : flagged
    if (!toApprove.length) { showMsg('No flagged questions to approve'); return }

    const confirmed = window.confirm(
      `Approve all ${toApprove.length} flagged questions${examFilter ? ` for ${examFilter}` : ''}?\n\nReview them first — this cannot be undone.`
    )
    if (!confirmed) return

    setBulkLoading(true)
    let approved = 0
    let failed   = 0

    for (const q of toApprove) {
      try {
        await api.put(`/admin/approve/${q.id}`, {}, { headers })
        approved++
      } catch(e) { failed++ }
    }

    setFlagged(f => examFilter ? f.filter(q => q.exam !== examFilter) : [])
    setBulkLoading(false)
    showMsg(`Bulk approved: ${approved} questions ✓${failed ? ` (${failed} failed)` : ''}`)
    fetchStats()
  }

  // ── EDIT QUESTION ────────────────────────────────────────────────
  const openEdit = (q) => {
    setEditingQ(q.id)
    setEditData({
      question_text:  q.question_text,
      option_a:       q.option_a,
      option_b:       q.option_b,
      option_c:       q.option_c,
      option_d:       q.option_d,
	  option_e:       q.option_e,
      correct_answer: q.correct_answer,
      explanation:    q.explanation || '',
    })
  }

  const handleSaveEdit = async (qid) => {
    setSavingEdit(true)
    try {
      // Save edits then approve
      await api.put(`/admin/edit/${qid}`, editData, { headers })
      await api.put(`/admin/approve/${qid}`, {}, { headers })
      setFlagged(f => f.filter(q => q.id !== qid))
      setEditingQ(null)
      showMsg('Question edited and approved ✓')
      fetchStats()
    } catch(e) {
      // If edit endpoint not available, just approve as-is
      try {
        await api.put(`/admin/approve/${qid}`, {}, { headers })
        setFlagged(f => f.filter(q => q.id !== qid))
        setEditingQ(null)
        showMsg('Approved ✓ (edit endpoint not yet deployed)')
        fetchStats()
      } catch(e2) {
        showMsg('Error saving: ' + (e2.response?.data?.error || e2.message))
      }
    } finally {
      setSavingEdit(false)
    }
  }

  // ── Upload syllabus ──────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadExam || !uploadFile) {
      setUploadStatus('Please select an exam and a PDF file')
      return
    }
    if (uploadFile.size > 20 * 1024 * 1024) {
      setUploadStatus('File too large — max 20MB')
      return
    }
    setUploadStatus('Uploading...')
    const form = new FormData()
    form.append('exam_id', uploadExam)
    form.append('file', uploadFile)
    try {
      const r = await api.post('/admin/upload-syllabus', form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      })
      setUploadStatus(`✓ Uploaded: ${r.data.filename} (${(r.data.size_bytes/1024).toFixed(0)} KB)`)
      setUploadFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch(e) {
      setUploadStatus('Upload failed: ' + (e.response?.data?.error || e.message))
    }
  }

  // Poll seed status every 10 seconds when seeding is active
  useEffect(() => {
    const hasActive = Object.values(seedStatus).some(
      s => s === 'seeding' || s === 'seeding_bg'
    )
    if (!hasActive) return
    const interval = setInterval(async () => {
      try {
        const r = await api.get('/admin/seed-status', { headers })
        const active = r.data.active || {}
        setSeedStatus(prev => {
          const next = { ...prev }
          // Mark completed seeds
          Object.keys(next).forEach(id => {
            if ((next[id] === 'seeding_bg') && !active[id]) {
              next[id] = 'done'
            }
          })
          return next
        })
        if (Object.keys(active).length === 0) {
          fetchStats() // refresh counts when done
        }
      } catch(e) {}
    }, 10000)
    return () => clearInterval(interval)
  }, [seedStatus])

  const handleCancelSeed = async (examId) => {
    try {
      const r = await api.post(`/admin/cancel-seed/${examId}`, {}, { headers })
      setSeedStatus(s => ({ ...s, [examId]: 'cancelled' }))
      showMsg(`Seeding cancelled for ${examId}`)
      setTimeout(() => setSeedStatus(s => ({ ...s, [examId]: null })), 3000)
    } catch(e) {
      showMsg('Cancel failed: ' + (e.response?.data?.message || e.message))
    }
  }

  const handleIngest = async (examId) => {
    setSeedStatus(s => ({ ...s, [examId]: 'ingesting' }))
    try {
      await api.post(`/admin/ingest/${examId}`, {}, { headers })
      setSeedStatus(s => ({ ...s, [examId]: 'ingesting_bg' }))
    } catch(e) {
      setSeedStatus(s => ({ ...s, [examId]: 'error: ' + (e.response?.data?.error || e.message) }))
    }
  }

  const handleSeed = async (examId) => {
    setSeedStatus(s => ({ ...s, [examId]: 'seeding' }))
    try {
      await api.post(`/admin/seed/${examId}`, {}, { headers })
      setSeedStatus(s => ({ ...s, [examId]: 'seeding_bg' }))
    } catch(e) {
      setSeedStatus(s => ({ ...s, [examId]: 'error' }))
    }
  }

  // ── Styles ───────────────────────────────────────────────────────
  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"

  const SECTION_COLORS = {
    'bank_clerk_prelims': 'bg-blue-100 text-blue-700',
    'coal_india_mt':      'bg-orange-100 text-orange-700',
    'upsc_prelims':       'bg-green-100 text-green-700',
    'ssc_cgl':            'bg-purple-100 text-purple-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-xs font-bold">A</div>
          <div>
            <div className="font-bold text-sm">MockTest — Admin Panel</div>
            <div className="text-gray-400 text-xs">anilsofttech.com · Internal only</div>
          </div>
        </div>
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm transition-colors">
          ← Exit Admin
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
        {[
          ['exams',   'Exam Management'],
          ['upload',  'Upload Syllabus PDF'],
          ['flagged', `Review Flagged (${flagged.length})`],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className="bg-green-50 border-b border-green-200 text-green-700 text-sm px-6 py-2 text-center font-medium">
          {actionMsg}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ══ TAB 1: Exam Management ══ */}
        {tab === 'exams' && (
          <div className="space-y-4">
            {stats && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  [stats.total_exams,     'Configured exams',           'text-gray-900'],
                  [stats.total_questions, 'Total approved questions',   'text-green-600'],
                  [stats.exams?.filter(e => e.ready).length || 0, 'Exams live for students', 'text-blue-600'],
                ].map(([val, label, color]) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className={`text-2xl font-bold ${color}`}>{val}</div>
                    <div className="text-xs text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">All Configured Exams</h3>
                <button onClick={fetchStats} className="text-xs text-blue-600 hover:underline">↻ Refresh</button>
              </div>
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {(stats?.exams || []).map(exam => (
                    <div key={exam.exam_id} className="px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${SECTION_COLORS[exam.exam_id] || 'bg-gray-100 text-gray-600'}`}>
                            {exam.exam_id.replace(/_/g,' ')}
                          </span>
                          <span className="font-medium text-gray-900 text-sm">{exam.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${exam.ready ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {exam.ready ? '● Live' : '○ Not ready'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs mb-3">
                        <span className="text-green-600 font-medium">{exam.approved} approved</span>
                        <span className="text-orange-500">{exam.flagged} flagged</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(seedStatus[exam.exam_id] === 'seeding' || seedStatus[exam.exam_id] === 'seeding_bg') ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                              <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                              Seeding...
                            </span>
                            <button onClick={() => handleCancelSeed(exam.exam_id)}
                              className="text-xs bg-red-100 text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-medium">
                              ✕ Cancel
                            </button>
                          </div>
                        ) : seedStatus[exam.exam_id] === 'done' ? (
                          <button onClick={() => { setSeedStatus(s => ({...s, [exam.exam_id]: null})); fetchStats() }}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
                            ✓ Done — Refresh
                          </button>
                        ) : seedStatus[exam.exam_id] === 'cancelled' ? (
                          <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">Cancelled</span>
                        ) : (
                          <button onClick={() => handleSeed(exam.exam_id)}
                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                            {exam.approved > 0 ? '+ Seed more' : '+ Seed questions'}
                          </button>
                        )}
                        <button onClick={() => { setTab('upload'); setUploadExam(exam.exam_id) }}
                          className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                          Upload PDF
                        </button>
                        {exam.flagged > 0 && (
                          <>
                            <button onClick={() => { setTab('flagged'); fetchFlagged(exam.exam_id) }}
                              className="text-xs border border-orange-300 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                              Review flagged ({exam.flagged})
                            </button>
                            <button onClick={() => handleBulkApprove(exam.exam_id)}
                              disabled={bulkLoading}
                              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
                              {bulkLoading ? 'Approving...' : `✓ Approve all ${exam.flagged}`}
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB 2: Upload Syllabus ══ */}
        {tab === 'upload' && (
          <div className="max-w-xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-1">Upload Official Syllabus PDF</h3>
              <p className="text-sm text-gray-500 mb-6">
                Upload the official exam syllabus. RAG pipeline will chunk it and use it to generate grounded questions.
                Max file size: 20MB.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select Exam</label>
                  <select value={uploadExam} onChange={e => setUploadExam(e.target.value)} className={inp}>
                    <option value="">-- Choose exam --</option>
                    {EXAM_IDS.map(id => (
                      <option key={id} value={id}>
                        {id.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Syllabus PDF <span className="text-gray-400 font-normal">(max 20MB)</span>
                  </label>
                  <input ref={fileRef} type="file" accept=".pdf"
                    onChange={e => setUploadFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {uploadFile && (
                    <div className="text-xs text-gray-500 mt-1">
                      {uploadFile.name} · {(uploadFile.size/1024).toFixed(0)} KB
                    </div>
                  )}
                </div>

                {uploadStatus && (
                  <div className={`text-sm px-3 py-2 rounded-lg ${
                    uploadStatus.startsWith('✓')     ? 'bg-green-50 text-green-700 border border-green-200'
                    : uploadStatus.includes('failed') || uploadStatus.includes('Error') || uploadStatus.includes('large')
                                                       ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}>{uploadStatus}</div>
                )}

                <button onClick={handleUpload} disabled={!uploadExam || !uploadFile}
                  className="w-full py-2.5 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors">
                  Upload PDF
                </button>

                {uploadStatus.startsWith('✓') && uploadExam && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-sm font-medium text-blue-900 mb-2">✓ PDF uploaded!</div>
                    <div className="text-xs text-blue-700 mb-3">
                      Next: Start RAG ingestion to process the PDF into the vector database (5-10 minutes).
                    </div>
                    <button onClick={() => handleIngest(uploadExam)}
                      disabled={seedStatus[uploadExam] === 'ingesting' || seedStatus[uploadExam] === 'ingesting_bg'}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
                      {seedStatus[uploadExam] === 'ingesting' ? 'Starting...'
                       : seedStatus[uploadExam] === 'ingesting_bg' ? '⏳ Ingesting in background...'
                       : 'Start RAG Ingestion'}
                    </button>
                    {seedStatus[uploadExam] === 'ingesting_bg' && (
                      <div className="text-xs text-blue-600 mt-2">
                        Ingestion running. When complete → go to Exam tab → Seed questions.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* How it works */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">How it works</div>
                <div className="space-y-2">
                  {[
                    ['1', 'Upload official syllabus PDF here'],
                    ['2', 'Click "Start RAG Ingestion" — PDF chunked + embedded into vector DB'],
                    ['3', 'Exam tab → "Seed questions" — questions grounded in syllabus'],
                    ['4', 'Exam appears live in student dropdown automatically'],
                  ].map(([n, t]) => (
                    <div key={n} className="flex gap-2 text-xs text-gray-500">
                      <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-xs">{n}</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 3: Flagged Questions ══ */}
        {tab === 'flagged' && (
          <div className="space-y-3">
            {/* Header row with bulk actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="font-semibold text-gray-800">
                Flagged Questions — {flagged.length} to review
              </h3>
              <div className="flex items-center gap-2">
                <select onChange={e => fetchFlagged(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All exams</option>
                  {EXAM_IDS.map(id => <option key={id} value={id}>{id.replace(/_/g,' ')}</option>)}
                </select>
                {flagged.length > 0 && (
                  <button onClick={() => handleBulkApprove('')}
                    disabled={bulkLoading}
                    className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors font-medium">
                    {bulkLoading ? 'Approving...' : `✓ Approve all ${flagged.length}`}
                  </button>
                )}
              </div>
            </div>

            {flagged.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                No flagged questions — all clear! ✓
              </div>
            ) : (
              flagged.map(q => (
                <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5">

                  {/* Tags */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {[q.exam, q.section, q.topic, q.difficulty].map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                      ))}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {editingQ === q.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(q.id)} disabled={savingEdit}
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-60">
                            {savingEdit ? 'Saving...' : 'Save & Approve ✓'}
                          </button>
                          <button onClick={() => setEditingQ(null)}
                            className="text-xs border border-gray-300 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-50">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleApprove(q.id)}
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors">
                            Approve ✓
                          </button>
                          <button onClick={() => openEdit(q)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors">
                            Edit ✎
                          </button>
                          <button onClick={() => handleDelete(q.id)}
                            className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors">
                            Delete ✗
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* View mode */}
                  {editingQ !== q.id ? (
                    <>
                      <p className="text-sm text-gray-800 font-medium mb-3 leading-relaxed">{q.question_text}</p>
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
						  {['a','b','c','d','e'].map(opt => {
							const text = q[`option_${opt}`]
							if (!text) return null
							return (
							  <div key={opt}
								className={`text-xs px-3 py-1.5 rounded-lg ${
								  q.correct_answer?.toUpperCase() === opt.toUpperCase()
									? 'bg-green-100 text-green-800 font-semibold border border-green-300'
									: 'bg-gray-50 text-gray-600 border border-gray-200'
								}`}>
								{opt.toUpperCase()}) {text}
								{q.correct_answer?.toUpperCase() === opt.toUpperCase() && ' ✓'}
							  </div>
							)
						  })}
						</div>
                      {q.explanation && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                          💡 {q.explanation}
                        </p>
                      )}
                    </>
                  ) : (
                    /* Edit mode */
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Question text</label>
                        <textarea rows={3} value={editData.question_text}
                          onChange={e => setEditData(d => ({...d, question_text: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['a','b','c','d','e'].map(opt => (
                          <div key={opt}>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Option {opt.toUpperCase()}</label>
                            <input value={editData[`option_${opt}`]}
                              onChange={e => setEditData(d => ({...d, [`option_${opt}`]: e.target.value}))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Correct answer</label>
                        <select value={editData.correct_answer}
                          onChange={e => setEditData(d => ({...d, correct_answer: e.target.value}))}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          {['A','B','C','D','E'].map(opt => (
                            <option key={opt} value={opt}>
                              {opt} — {editData[`option_${opt.toLowerCase()}`]?.substring(0,40)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Explanation</label>
                        <textarea rows={2} value={editData.explanation}
                          onChange={e => setEditData(d => ({...d, explanation: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
