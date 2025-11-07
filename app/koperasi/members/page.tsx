'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/use-auth';
import { useNotification } from '@/lib/notification-context';
import { Card, CardHeader, CardContent, Button, Input, Badge } from '@/components/ui';
import { 
  Users, 
  Search, 
  TrendingUp,
  Award,
  Gift,
  Calendar,
  ChevronRight,
  Download,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Member {
  id: string;
  name: string;
  nomorAnggota: string;
  email: string | null;
  phone: string | null;
  points: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalSpent: number;
  lastPurchase: Date | null;
  joinDate: Date;
  isActive: boolean;
}

export default function MembersPage() {
  const { user, loading } = useAuth(['ADMIN', 'SUPER_ADMIN']);
  const { success, error } = useNotification();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/members');
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      error('Error', 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter members
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.nomorAnggota.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tier filter
    if (tierFilter !== 'ALL') {
      filtered = filtered.filter(member => member.tier === tierFilter);
    }

    return filtered;
  }, [members, searchTerm, tierFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.isActive).length;
    const totalPoints = members.reduce((sum, m) => sum + m.points, 0);
    const totalSpending = members.reduce((sum, m) => sum + Number(m.totalSpent), 0);
    
    const tierCounts = {
      BRONZE: members.filter(m => m.tier === 'BRONZE').length,
      SILVER: members.filter(m => m.tier === 'SILVER').length,
      GOLD: members.filter(m => m.tier === 'GOLD').length,
      PLATINUM: members.filter(m => m.tier === 'PLATINUM').length,
    };

    return {
      totalMembers,
      activeMembers,
      totalPoints,
      totalSpending,
      tierCounts,
    };
  }, [members]);

  // Helper functions
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return '💎';
      case 'GOLD': return '🥇';
      case 'SILVER': return '🥈';
      case 'BRONZE': return '🥉';
      default: return '👤';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'GOLD': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'SILVER': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'BRONZE': return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getTierDiscount = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 10;
      case 'GOLD': return 5;
      case 'SILVER': return 2;
      case 'BRONZE': return 0;
      default: return 0;
    }
  };

  const getNextTier = (currentTier: string, totalSpent: number) => {
    const tiers = [
      { name: 'BRONZE', threshold: 0 },
      { name: 'SILVER', threshold: 1000000 },
      { name: 'GOLD', threshold: 5000000 },
      { name: 'PLATINUM', threshold: 10000000 },
    ];

    const currentIndex = tiers.findIndex(t => t.name === currentTier);
    if (currentIndex < tiers.length - 1) {
      const nextTier = tiers[currentIndex + 1];
      const remaining = nextTier.threshold - totalSpent;
      const progress = (totalSpent / nextTier.threshold) * 100;
      return { 
        name: nextTier.name, 
        remaining, 
        progress: Math.min(progress, 100),
        threshold: nextTier.threshold 
      };
    }
    return null; // Already at max tier
  };

  const exportToExcel = () => {
    // TODO: Implement Excel export
    success('Success', 'Export feature coming soon!');
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Member Management</h1>
              <p className="text-slate-600">Loyalty program and member analytics</p>
            </div>
          </div>
          <Button
            onClick={exportToExcel}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Members</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalMembers}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {stats.activeMembers} active
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Points</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stats.totalPoints.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    ≈ Rp {Math.floor(stats.totalPoints / 100 * 1000).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Gift className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Spending</p>
                  <p className="text-2xl font-bold text-slate-900">
                    Rp {Math.floor(stats.totalSpending).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Lifetime value</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-2">Tier Distribution</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>💎 Platinum: {stats.tierCounts.PLATINUM}</span>
                    <span className="font-semibold">{stats.tierCounts.PLATINUM > 0 ? Math.round((stats.tierCounts.PLATINUM / stats.totalMembers) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>🥇 Gold: {stats.tierCounts.GOLD}</span>
                    <span className="font-semibold">{stats.tierCounts.GOLD > 0 ? Math.round((stats.tierCounts.GOLD / stats.totalMembers) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>🥈 Silver: {stats.tierCounts.SILVER}</span>
                    <span className="font-semibold">{stats.tierCounts.SILVER > 0 ? Math.round((stats.tierCounts.SILVER / stats.totalMembers) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>🥉 Bronze: {stats.tierCounts.BRONZE}</span>
                    <span className="font-semibold">{stats.tierCounts.BRONZE > 0 ? Math.round((stats.tierCounts.BRONZE / stats.totalMembers) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search by name, number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="PLATINUM">💎 Platinum</option>
                  <option value="GOLD">🥇 Gold</option>
                  <option value="SILVER">🥈 Silver</option>
                  <option value="BRONZE">🥉 Bronze</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredMembers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Members Found</h3>
                <p className="text-slate-600">Try adjusting your search or filter</p>
              </CardContent>
            </Card>
          ) : (
            filteredMembers.map((member) => {
              const nextTier = getNextTier(member.tier, Number(member.totalSpent));
              return (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left: Member Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                            <p className="text-sm text-slate-600">Member #{member.nomorAnggota}</p>
                          </div>
                          <Badge 
                            className={`${getTierColor(member.tier)} px-3 py-1 text-sm font-bold shadow-md`}
                          >
                            {getTierIcon(member.tier)} {member.tier}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Email</p>
                            <p className="font-medium text-slate-900">{member.email || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Phone</p>
                            <p className="font-medium text-slate-900">{member.phone || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Join Date</p>
                            <p className="font-medium text-slate-900">
                              {new Date(member.joinDate).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600">Last Purchase</p>
                            <p className="font-medium text-slate-900">
                              {member.lastPurchase 
                                ? new Date(member.lastPurchase).toLocaleDateString('id-ID')
                                : 'Never'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Points & Tier Progress */}
                      <div className="md:w-80 space-y-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                        {/* Points */}
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-amber-900">Points Balance</span>
                            <Gift className="w-5 h-5 text-amber-600" />
                          </div>
                          <p className="text-3xl font-bold text-amber-900">
                            {member.points.toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            ≈ Rp {Math.floor(member.points / 100 * 1000).toLocaleString('id-ID')} value
                          </p>
                        </div>

                        {/* Total Spending */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-900">Total Spending</span>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold text-green-900">
                            Rp {Math.floor(Number(member.totalSpent)).toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Discount: {getTierDiscount(member.tier)}% off
                          </p>
                        </div>

                        {/* Tier Progress */}
                        {nextTier ? (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-900">
                                Next: {getTierIcon(nextTier.name)} {nextTier.name}
                              </span>
                              <Award className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="mb-2">
                              <div className="w-full bg-blue-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-2 rounded-full transition-all"
                                  style={{ width: `${nextTier.progress}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-xs text-blue-700">
                              Rp {nextTier.remaining.toLocaleString('id-ID')} more to upgrade
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-purple-900">
                                🎉 MAX TIER REACHED
                              </span>
                              <Award className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-xs text-purple-700 mt-1">
                              Enjoying maximum benefits!
                            </p>
                          </div>
                        )}

                        {/* View Details Button */}
                        <Link href={`/koperasi/members/${member.id}`}>
                          <Button className="w-full flex items-center justify-center gap-2" variant="outline">
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Results Count */}
        {filteredMembers.length > 0 && (
          <div className="text-center text-sm text-slate-600">
            Showing {filteredMembers.length} of {members.length} members
          </div>
        )}
      </div>
    </div>
  );
}
