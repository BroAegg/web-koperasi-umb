'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeveloper } from '@/contexts/DeveloperContext';

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata: Record<string, any> | null;
  isProduction: boolean;
  createdAt: string;
  users: {
    name: string;
    role: string;
  };
}

interface ActivityStats {
  total: number;
  today: number;
  devCount: number;
  prodCount: number;
  byRole: Record<string, number>;
}

type Role = 'ALL' | 'ADMIN' | 'KASIR' | 'MEMBER' | 'SUPPLIER' | 'DEVELOPER';

export default function ActivityLogsPage() {
  const router = useRouter();
  const { isDeveloper, activeRole } = useDeveloper();
  
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [roleFilter, setRoleFilter] = useState<Role>('ALL');
  const [envFilter, setEnvFilter] = useState<'ALL' | 'DEV' | 'PROD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  // Detail modal state
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  // Auth check
  useEffect(() => {
    if (!isDeveloper) {
      router.push('/koperasi/dashboard');
    }
  }, [isDeveloper, router]);

  // Fetch activity logs
  useEffect(() => {
    fetchActivityLogs();
  }, [currentPage, itemsPerPage, roleFilter, envFilter, searchQuery, dateFrom, dateTo]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (envFilter !== 'ALL') params.append('environment', envFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/developer/activity-logs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setStats(data.stats || null);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setRoleFilter('ALL');
    setEnvFilter('ALL');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      alert('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'Username', 'Role', 'Action', 'Description', 'Environment', 'Metadata'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.users.name,
      log.users.role,
      log.action,
      log.description,
      log.isProduction ? 'PROD' : 'DEV',
      JSON.stringify(log.metadata || {}),
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (!isDeveloper) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs Viewer</h1>
        <p className="text-gray-600">Monitor and analyze all system activities</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-500">Total Actions</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-sm font-medium text-gray-500">Today's Actions</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.today.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-cyan-500">
            <div className="text-sm font-medium text-gray-500">DEV Actions</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {stats.devCount.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({stats.total > 0 ? ((stats.devCount / stats.total) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="text-sm font-medium text-gray-500">PROD Actions</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {stats.prodCount.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({stats.total > 0 ? ((stats.prodCount / stats.total) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as Role);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="KASIR">Kasir</option>
              <option value="MEMBER">Member</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </div>

          {/* Environment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEnvFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  envFilter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => {
                  setEnvFilter('DEV');
                  setCurrentPage(1);
                }}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  envFilter === 'DEV'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🟦 DEV
              </button>
              <button
                onClick={() => {
                  setEnvFilter('PROD');
                  setCurrentPage(1);
                }}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  envFilter === 'PROD'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🟩 PROD
              </button>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Username, action, description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="datetime-local"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {logs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
            </p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={logs.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Export CSV
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="px-6 py-12 text-center">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={fetchActivityLogs}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && logs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-lg">No activity logs found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* Table Content */}
        {!loading && !error && logs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Env
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.users.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {log.users.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          !log.isProduction
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {!log.isProduction ? '🟦 DEV' : '🟩 PROD'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && logs.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ◀ Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Activity Log Detail</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 Basic Info</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex">
                    <dt className="font-medium text-gray-600 w-32">ID:</dt>
                    <dd className="text-gray-900 font-mono text-xs">{selectedLog.id}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium text-gray-600 w-32">Timestamp:</dt>
                    <dd className="text-gray-900">
                      {new Date(selectedLog.createdAt).toLocaleString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium text-gray-600 w-32">User:</dt>
                    <dd className="text-gray-900">
                      {selectedLog.users.name} ({selectedLog.users.role})
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium text-gray-600 w-32">Action:</dt>
                    <dd className="text-gray-900 font-mono">{selectedLog.action}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium text-gray-600 w-32">Environment:</dt>
                    <dd>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          !selectedLog.isProduction
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {!selectedLog.isProduction ? '🟦 DEV' : '🟩 PROD'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Description</h4>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedLog.description}</p>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700">🔧 Metadata (JSON)</h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedLog.metadata, null, 2));
                        alert('Metadata copied to clipboard!');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
