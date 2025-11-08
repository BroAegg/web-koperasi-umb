'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, TrendingUp } from 'lucide-react';

interface HourlyData {
  hour: number;
  transactionCount: number;
  totalRevenue: number;
  averageTransaction: number;
}

interface DailyData {
  dayOfWeek: number;
  dayName: string;
  transactionCount: number;
  totalRevenue: number;
  averageTransaction: number;
}

interface PeakHoursData {
  hourlyData: HourlyData[];
  dailyData: DailyData[];
  insights: {
    peakHour: {
      hour: number;
      label: string;
      transactionCount: number;
    };
    quietHour: {
      hour: number;
      label: string;
      transactionCount: number;
    };
    peakDay: {
      day: string;
      transactionCount: number;
    };
    quietDay: {
      day: string;
      transactionCount: number;
    };
  };
}

export default function PeakHoursPage() {
  const { user, loading: authLoading, authorized } = useAuth(['SUPER_ADMIN', 'ADMIN']);
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PeakHoursData | null>(null);
  const [days, setDays] = useState('30');

  useEffect(() => {
    if (!authLoading && authorized) {
      fetchPeakHours();
    }
  }, [authLoading, authorized, days]);

  const fetchPeakHours = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/analytics/peak-hours?days=${days}`);

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching peak hours:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading peak hours data...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const insights = data?.insights;
  const hourlyData = data?.hourlyData || [];
  const dailyData = data?.dailyData || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/koperasi/analytics" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Peak Hours Analysis</h1>
            <p className="text-sm text-gray-500">Identify your busiest hours and days</p>
          </div>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Insights Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">Peak Hour</p>
            </div>
            <p className="text-2xl font-bold text-green-900">{insights.peakHour.label}</p>
            <p className="text-sm text-green-700 mt-1">{insights.peakHour.transactionCount} transactions</p>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Quiet Hour</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{insights.quietHour.label}</p>
            <p className="text-sm text-blue-700 mt-1">{insights.quietHour.transactionCount} transactions</p>
          </div>

          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-medium text-purple-900">Peak Day</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{insights.peakDay.day}</p>
            <p className="text-sm text-purple-700 mt-1">{insights.peakDay.transactionCount} transactions</p>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <p className="text-sm font-medium text-gray-900">Quiet Day</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{insights.quietDay.day}</p>
            <p className="text-sm text-gray-700 mt-1">{insights.quietDay.transactionCount} transactions</p>
          </div>
        </div>
      )}

      {/* Hourly Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hourly Transaction Pattern</h2>
        <div className="h-64 flex items-end justify-between gap-1">
          {hourlyData.map((hour) => {
            const maxCount = Math.max(...hourlyData.map(h => h.transactionCount));
            const height = maxCount > 0 ? (hour.transactionCount / maxCount) * 100 : 0;
            const isPeak = insights?.peakHour.hour === hour.hour;
            
            return (
              <div key={hour.hour} className="flex-1 flex flex-col items-center group">
                <div className="relative flex-1 w-full flex items-end">
                  <div 
                    className={`w-full transition-colors rounded-t cursor-pointer ${
                      isPeak ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${hour.hour.toString().padStart(2, '0')}:00 - ${hour.transactionCount} transactions`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {hour.transactionCount} trx
                      <br />
                      {formatCurrency(hour.totalRevenue)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {hour.hour.toString().padStart(2, '0')}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Transaction Pattern</h2>
        <div className="h-64 flex items-end justify-between gap-4">
          {dailyData.map((day) => {
            const maxCount = Math.max(...dailyData.map(d => d.transactionCount));
            const height = maxCount > 0 ? (day.transactionCount / maxCount) * 100 : 0;
            const isPeak = insights?.peakDay.day === day.dayName;
            
            return (
              <div key={day.dayOfWeek} className="flex-1 flex flex-col items-center group">
                <div className="relative flex-1 w-full flex items-end">
                  <div 
                    className={`w-full transition-colors rounded-t cursor-pointer ${
                      isPeak ? 'bg-purple-500 hover:bg-purple-600' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${day.dayName} - ${day.transactionCount} transactions`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.transactionCount} trx
                      <br />
                      {formatCurrency(day.totalRevenue)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-900 font-medium mt-2">
                  {day.dayName.substring(0, 3)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Hourly Breakdown</h2>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hour
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Transactions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hourlyData.map((hour) => (
                  <tr key={hour.hour} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {hour.hour.toString().padStart(2, '0')}:00
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                      {hour.transactionCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                      {formatCurrency(hour.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Daily Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Day
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Transactions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyData.map((day) => (
                  <tr key={day.dayOfWeek} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {day.dayName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                      {day.transactionCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                      {formatCurrency(day.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
