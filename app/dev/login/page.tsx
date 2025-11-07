/**
 * Developer Login Page (Hidden)
 * 
 * Secret login page for developer emergency access
 * Access: http://localhost:3000/dev/login
 * 
 * ⚠️ This page is hidden from navigation
 * Only accessible via direct URL
 */

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, Terminal, Lock, Mail } from 'lucide-react'

export default function DeveloperLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Email dan password harus diisi')
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        // Success - redirect to developer dashboard
        router.push('/koperasi/developer-dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Developer Login Card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Developer Access</h1>
                <p className="text-slate-400 text-sm flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  Emergency Login Portal
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="dev-email" className="block text-sm font-medium text-slate-300 mb-2">
                Developer Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="dev-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aegner@umb.ac.id"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-white placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="dev-password" className="block text-sm font-medium text-slate-300 mb-2">
                Security Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="dev-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-white placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Warning Notice */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-xs text-yellow-400 flex items-center gap-2">
                <Shield className="w-3 h-3" />
                This is a restricted area. All actions are logged and monitored.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  Access Developer Console
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500">
              System Administrator: Aegner Billik
              <br />
              Koperasi UM Bandung © 2025
            </p>
          </div>
        </div>

        {/* Back to Main */}
        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-slate-400 hover:text-slate-300 transition"
          >
            ← Back to Main Login
          </a>
        </div>
      </div>
    </div>
  )
}
