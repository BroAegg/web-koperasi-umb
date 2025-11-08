'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Users, DollarSign, ShoppingBag, TrendingUp, Award, Star } from 'lucide-react';

interface CustomerData {
  memberId: string;
  memberName: string;
  memberEmail: string;
  totalSpent: number;
  totalTransactions: number;
  totalItems: number;
  averageTransaction: number;
  firstPurchase: string;
  lastPurchase: string;
  daysSinceLastPurchase: number;
  segment: string;
}

interface CustomersData {
  customers: CustomerData[];
  summary: {
    totalCustomers: number;
    totalRevenue: number;
    averageSpent: number;
    averageFrequency: number;
  };
  segmentation: {
    highValue: number;
    mediumValue: number;
    lowValue: number;
    loyalCustomers: number;
  };
}

export default function CustomersPage() {
  const { user, loading: authLoading, authorized } = useAuth(['SUPER_ADMIN', 'ADMIN']);
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomersData | null>(null);
  const [period, setPeriod] = useState('30days');
  const [limit, setLimit] = useState('20');

  useEffect(() => {
    if (!authLoading && authorized) {
      fetchCustomers();
    }
  }, [authLoading, authorized, period, limit]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/analytics/customers?period=${period}&limit=${limit}`);

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSegmentBadge = (segment: string) => {
    const badges = {
      'High Value': 'bg-purple-100 text-purple-800 border-purple-200',
      'Medium Value': 'bg-blue-100 text-blue-800 border-blue-200',
      'Low Value': 'bg-gray-100 text-gray-800 border-gray-200',
      'Loyal': 'bg-green-100 text-green-800 border-green-200',
    };
    return badges[segment as keyof typeof badges] || badges['Low Value'];
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer analytics...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const summary = data?.summary;
  const segmentation = data?.segmentation;
  const customers = data?.customers || [];

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
            <h1 className="text-2xl font-bold text-gray-900">Customer Analytics</h1>
            <p className="text-sm text-gray-500">Understand your customer behavior and segments</p>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.totalCustomers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Spent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.averageSpent)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Frequency</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.averageFrequency.toFixed(1)}x
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segmentation */}
      {segmentation && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Segmentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="p-4 bg-purple-50 rounded-lg mb-2">
                <Award className="w-8 h-8 text-purple-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-purple-900">{segmentation.highValue}</p>
              <p className="text-sm text-gray-600">High Value</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-blue-50 rounded-lg mb-2">
                <Star className="w-8 h-8 text-blue-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-blue-900">{segmentation.mediumValue}</p>
              <p className="text-sm text-gray-600">Medium Value</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gray-50 rounded-lg mb-2">
                <Users className="w-8 h-8 text-gray-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{segmentation.lowValue}</p>
              <p className="text-sm text-gray-600">Low Value</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-50 rounded-lg mb-2">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-green-900">{segmentation.loyalCustomers}</p>
              <p className="text-sm text-gray-600">Loyal Customers</p>
            </div>
          </div>
        </div>
      )}

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Transaction
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Purchase
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer, index) => (
                <tr key={customer.memberId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <span className="text-xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <span className="font-medium">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.memberName}</div>
                      <div className="text-sm text-gray-500">{customer.memberEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSegmentBadge(customer.segment)}`}>
                      {customer.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {customer.totalTransactions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {formatCurrency(customer.averageTransaction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {customer.daysSinceLastPurchase} days ago
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
