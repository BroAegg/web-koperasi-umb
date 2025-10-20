'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeveloperSession {
  actualRole: 'DEVELOPER';
  activeRole: string;
  isProduction: boolean;
  switchedAt?: string;
}

export default function DeveloperDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>('');
  const [devSession, setDevSession] = useState<DeveloperSession | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
      return;
    }
    setToken(storedToken);

    // Decode token to get developerSession
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      if (payload.role !== 'DEVELOPER' && payload.developerSession?.actualRole !== 'DEVELOPER') {
        router.push('/koperasi/dashboard');
        return;
      }
      setDevSession(payload.developerSession || {
        actualRole: 'DEVELOPER',
        activeRole: 'DEVELOPER',
        isProduction: false,
      });
    } catch (err) {
      console.error('Token decode error:', err);
      router.push('/login');
    }
  }, [router]);

  const switchRole = async (targetRole: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/developer/switch-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ targetRole }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to switch role');
      }

      // Update token in localStorage
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setDevSession(data.developerSession);

      // Refresh page to apply new role
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch role');
      console.error('Switch role error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEnvironment = async () => {
    setLoading(true);
    setError('');
    try {
      const newMode = !devSession?.isProduction;
      const response = await fetch('/api/developer/toggle-environment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isProduction: newMode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle environment');
      }

      // Update token in localStorage
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setDevSession(data.developerSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle environment');
      console.error('Toggle environment error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!devSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Developer Dashboard...</p>
        </div>
      </div>
    );
  }

  const { activeRole, isProduction } = devSession;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Developer Control Panel</h1>
          <p className="text-gray-600 mt-1">Reyvan & Aegner Developer Tools</p>
        </div>

        {/* Environment Badge */}
        <div
          className={`px-6 py-3 rounded-full font-bold text-lg shadow-lg ${
            isProduction
              ? 'bg-red-100 text-red-700 border-4 border-red-500 animate-pulse'
              : 'bg-green-100 text-green-700 border-4 border-green-500'
          }`}
        >
          {isProduction ? '🔴 PRODUCTION MODE' : '🟢 DEVELOPMENT MODE'}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Role Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Currently Active As:</p>
            <p className="text-3xl font-bold">{activeRole}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Actual Role:</p>
            <p className="text-xl font-semibold">DEVELOPER</p>
          </div>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Role Switcher
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Switch to any role to test features without logging out. Your actual role remains DEVELOPER.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['ADMIN', 'SUPER_ADMIN', 'SUPPLIER', 'USER', 'DEVELOPER'].map((role) => (
            <button
              key={role}
              onClick={() => switchRole(role)}
              disabled={loading || activeRole === role}
              className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeRole === role
                  ? 'bg-blue-600 text-white shadow-lg scale-105 cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Environment Toggle */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Environment Control
        </h2>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-lg mb-2">
              {isProduction ? '⚠️ Production Mode Active' : '✅ Development Mode Active'}
            </p>
            <p className="text-gray-600 text-sm mb-4">
              {isProduction
                ? 'All changes will affect LIVE DATA. Be very careful with your actions!'
                : 'Safe testing environment. Data will not affect production.'}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Data Isolation:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>DEV Mode:</strong> Creates data with <code className="bg-gray-200 px-1 rounded">isProduction=false</code></span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>PROD Mode:</strong> Creates data with <code className="bg-gray-200 px-1 rounded">isProduction=true</code></span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>All queries automatically filter by current mode</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="ml-6">
            <button
              onClick={toggleEnvironment}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isProduction
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Switching...
                </span>
              ) : (
                <>Switch to {isProduction ? 'DEV' : 'PROD'}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/koperasi/developer-dashboard/activity-logs')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-100 rounded-lg p-3 group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">📊 Activity Logs</h3>
          <p className="text-sm text-gray-600">View production activity trail and audit logs</p>
        </button>

        <button
          onClick={() => router.push('/koperasi/developer/data-management')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-100 rounded-lg p-3 group-hover:bg-orange-200 transition-colors">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">🧹 Data Management</h3>
          <p className="text-sm text-gray-600">Clean, seed, and reset database safely</p>
        </button>

        <button
          onClick={() => router.push('/koperasi/developer/api-tester')}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-cyan-100 rounded-lg p-3 group-hover:bg-cyan-200 transition-colors">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">🔍 API Tester</h3>
          <p className="text-sm text-gray-600">Test endpoints and inspect responses</p>
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-bold text-blue-900 mb-2">Developer Mode Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your actions are logged when in PRODUCTION mode</li>
              <li>• DEVELOPMENT mode activities are NOT logged to keep audit trail clean</li>
              <li>• Use <code className="bg-blue-100 px-1 rounded font-mono">node clean-data.js --dev</code> to clean dev data only</li>
              <li>• Always verify environment badge before making critical changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
