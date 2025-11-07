/**
 * Error Boundary Component
 * 
 * Catches React errors and displays user-friendly UI
 * Prevents entire app crash from component errors
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error info
    this.setState({
      error,
      errorInfo
    })

    // TODO: Send to backend logger in production
    // logErrorToBackend(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI (matching current style)
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Error Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8" />
                  <div>
                    <h1 className="text-xl font-bold">Terjadi Kesalahan</h1>
                    <p className="text-red-100 text-sm">Something went wrong</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-slate-600">
                  Maaf, terjadi kesalahan yang tidak terduga. Silakan coba refresh halaman atau hubungi administrator jika masalah berlanjut.
                </p>

                {/* Error details (development only) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4">
                    <summary className="text-sm font-medium text-slate-700 cursor-pointer hover:text-slate-900">
                      Technical Details (Development)
                    </summary>
                    <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200 overflow-auto">
                      <p className="text-xs font-mono text-red-600 mb-2">
                        {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <pre className="text-xs font-mono text-slate-600 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Halaman
                  </button>

                  <button
                    onClick={this.handleReset}
                    className="py-2.5 px-4 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-medium rounded-lg transition-all duration-200"
                  >
                    Coba Lagi
                  </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-slate-500 text-center pt-2">
                  Jika masalah berlanjut, hubungi:{' '}
                  <a href="mailto:aegner@umb.ac.id" className="text-blue-600 hover:underline">
                    aegner@umb.ac.id
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component for easier usage
export default function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
