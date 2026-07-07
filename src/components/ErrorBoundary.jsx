import { Component } from 'react'

/**
 * ErrorBoundary — catches any unhandled React error.
 * Without this: one JS crash = blank white screen for student.
 * With this: friendly error message + recovery options.
 *
 * Usage: Wrap App in main.jsx:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })

    // Report to Sentry if available
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo })
    }

    // Log to console for debugging
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const isDev = import.meta.env.DEV

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">

          {/* Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="ti ti-alert-triangle text-3xl text-red-500" aria-hidden="true"></i>
          </div>

          {/* Message */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            An unexpected error occurred. Your test progress has been saved.
            Please refresh the page to continue.
          </p>

          {/* Dev-only error detail */}
          {isDev && this.state.error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-left">
              <p className="text-xs font-mono text-red-700 break-all">
                {this.state.error.toString()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Refresh page
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null })
                window.location.href = '/'
              }}
              className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Go to home page
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-5">
            This error has been automatically reported to our team.
          </p>
        </div>
      </div>
    )
  }
}
