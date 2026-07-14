/**
 * api.js — Axios client with complete error handling.
 *
 * Every API call now:
 *  1. Shows meaningful error messages (not raw axios errors)
 *  2. Handles network offline separately
 *  3. Handles timeout separately
 *  4. Retries submission once on network failure (critical — protects exam data)
 *  5. Logs errors in dev mode
 */
import axios from 'axios'

// ── Friendly error messages ───────────────────────────────────────────
const ERROR_MESSAGES = {
  // Network
  'Network Error':              'Cannot connect to server. Check your internet connection.',
  'ERR_NETWORK':                'Cannot connect to server. Check your internet connection.',
  'ECONNABORTED':               'Request timed out. The server is taking too long to respond.',
  // HTTP status codes
  400: 'Invalid request. Please try again.',
  401: 'Session expired. Please log in again.',
  403: 'You do not have permission to do this.',
  404: 'Resource not found. Please refresh and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error. Our team has been notified.',
  502: 'Server is temporarily unavailable. Please try again in a moment.',
  503: 'Server is restarting. Please try again in 30 seconds.',
}

function getFriendlyMessage(error) {
  if (!navigator.onLine) {
    return 'You are offline. Please check your internet connection.'
  }
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_MESSAGES['ECONNABORTED']
  }
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return ERROR_MESSAGES['Network Error']
  }
  if (error.response?.status) {
    return ERROR_MESSAGES[error.response.status] || `Server error (${error.response.status}). Please try again.`
  }
  // Server returned a detail message
  const detail = error.response?.data?.detail || error.response?.data?.error
  if (detail && typeof detail === 'string') {
    return detail
  }
  return 'An unexpected error occurred. Please try again.'
}

// ── Axios instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
})

// ── Request interceptor — add auth header if needed ───────────────────
api.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

// ── Response interceptor — normalise errors ───────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    const message = getFriendlyMessage(error)

    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url:     error.config?.url,
        status:  error.response?.status,
        message,
        detail:  error.response?.data,
      })
    }

    // Attach friendly message so callers don't need to decode axios errors
    error.friendlyMessage = message
    return Promise.reject(error)
  }
)

// ── Helper: retry once on network error ──────────────────────────────
async function withRetry(fn, retries = 1) {
  try {
    return await fn()
  } catch (error) {
    const isNetworkError = !error.response && (
      error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK' ||
      !navigator.onLine
    )
    if (isNetworkError && retries > 0) {
      await new Promise(r => setTimeout(r, 2000))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

// ── API functions ─────────────────────────────────────────────────────

export const generateTest = (studentName, exam = 'bank_clerk_prelims') =>
  api.post('/tests/generate', {
    exam,
    student_name: studentName
  }).then(r => r.data)

/**
 * submitTest — retries once on network failure.
 * Student's answers are too important to lose on a single network blip.
 */
export const submitTest = (testId, answers, timeSpent) =>
  withRetry(() =>
    api.post('/tests/submit', {
      test_id:    testId,
      answers,
      time_spent: timeSpent
    }).then(r => r.data)
  )

export const generateMiniTest = (section, topic, count = 10, difficulty = 'mixed', student_id = null) =>
  api.post('/tests/mini', {
    exam: 'bank_clerk_prelims',
    section,
    topic,
    difficulty,
    count,
    ...(student_id ? { student_id } : {})
  }).then(r => r.data)

export const generateTopicTest = (section, topic, count = 10, student_id = null) =>
  api.post('/tests/topic', {
    exam: 'bank_clerk_prelims',
    section,
    topic,
    count,
    ...(student_id ? { student_id } : {})
  }).then(r => r.data)

export const getQuestionCount = () =>
  api.get('/questions/count').then(r => r.data)

export const checkHealth = () =>
  api.get('/').then(r => r.data)

// ── Payments (Stripe Checkout) ────────────────────────────────────────
export const createCheckout = (userId, plan) =>
  api.post('/payments/create-checkout', { user_id: userId, plan }).then(r => r.data)

export const confirmCheckout = (userId, plan, sessionId) =>
  api.post('/payments/confirm', { user_id: userId, plan, session_id: sessionId }).then(r => r.data)

// Self-heal: activates any of the user's paid-but-pending subscriptions.
export const syncSubscriptions = (userId) =>
  api.post('/payments/sync', { user_id: userId }).then(r => r.data)

// ── Exam blueprint (pattern + topic-wise weightage) ───────────────────
export const getExamBlueprint = (examId) =>
  api.get(`/exams/${examId}/blueprint`).then(r => r.data)

export { getFriendlyMessage }
export default api
