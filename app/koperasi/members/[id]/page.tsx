'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { useNotification } from '@/lib/notification-context';
import { Card, CardHeader, CardContent, Button, Badge } from '@/components/ui';
import { 
  ArrowLeft,
  Users, 
  Gift,
  TrendingUp,
  Award,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Download,
  History
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

interface PointsHistory {
  id: string;
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED';
  points: number;
  balance: number;
  description: string;
  createdAt: Date;
  expiresAt: Date | null;
  transactionId: string | null;
}

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params.id as string;
  const { user, loading } = useAuth(['ADMIN', 'SUPER_ADMIN']);
  const { success, error } = useNotification();
  const [member, setMember] = useState<Member | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (memberId) {
      fetchMemberDetail();
      fetchPointsHistory();
    }
  }, [memberId]);

  const fetchMemberDetail = async () => {
    try {
      const response = await fetch(`/api/members/${memberId}`);
      const result = await response.json();
      if (result.success) {
        setMember(result.data);
      } else {
        error('Error', 'Failed to load member details');
      }
    } catch (err) {
      console.error('Error fetching member:', err);
      error('Error', 'Failed to load member details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPointsHistory = async () => {
    try {
      const response = await fetch(`/api/members/points/history?memberId=${memberId}`);
      const result = await response.json();
      if (result.success) {
        setPointsHistory(result.data);
      }
    } catch (err) {
      console.error('Error fetching points history:', err);
    }
  };

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
    return null;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EARNED': return '➕';
      case 'REDEEMED': return '➖';
      case 'EXPIRED': return '⏰';
      case 'ADJUSTED': return '✏️';
      default: return '•';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EARNED': return 'text-green-600 bg-green-50 border-green-200';
      case 'REDEEMED': return 'text-red-600 bg-red-50 border-red-200';
      case 'EXPIRED': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'ADJUSTED': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Member Not Found</h3>
            <p className="text-slate-600 mb-4">The requested member could not be found.</p>
            <Link href="/koperasi/members">
              <Button>Back to Members</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextTier = getNextTier(member.tier, Number(member.totalSpent));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/koperasi/members">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Members
            </Button>
          </Link>
          <Button
            onClick={() => success('Success', 'Export feature coming soon!')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export History
          </Button>
        </div>

        {/* Member Profile Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{member.name}</h1>
                    <p className="text-slate-600 text-lg">Member #{member.nomorAnggota}</p>
                  </div>
                  <Badge className={`${getTierColor(member.tier)} px-4 py-2 text-lg font-bold shadow-lg`}>
                    {getTierIcon(member.tier)} {member.tier}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Email</p>
                      <p className="font-medium text-slate-900">{member.email || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Phone</p>
                      <p className="font-medium text-slate-900">{member.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Join Date</p>
                      <p className="font-medium text-slate-900">
                        {new Date(member.joinDate).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Last Purchase</p>
                      <p className="font-medium text-slate-900">
                        {member.lastPurchase 
                          ? new Date(member.lastPurchase).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Points Balance */}
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-amber-900">Points Balance</h3>
                <Gift className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-4xl font-bold text-amber-900 mb-2">
                {member.points.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-amber-700">
                Cash Value: Rp {Math.floor(member.points / 100 * 1000).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                100 points = Rp 1,000
              </p>
            </CardContent>
          </Card>

          {/* Total Spending */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-green-900">Total Spending</h3>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900 mb-2">
                Rp {Math.floor(Number(member.totalSpent)).toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-green-700">
                Current Discount: {getTierDiscount(member.tier)}% off
              </p>
              <p className="text-xs text-green-600 mt-1">
                Lifetime value
              </p>
            </CardContent>
          </Card>

          {/* Tier Progress */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-900">Tier Status</h3>
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              {nextTier ? (
                <>
                  <p className="text-2xl font-bold text-blue-900 mb-3">
                    Next: {getTierIcon(nextTier.name)} {nextTier.name}
                  </p>
                  <div className="mb-2">
                    <div className="w-full bg-blue-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full transition-all"
                        style={{ width: `${nextTier.progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-blue-700">
                    Rp {nextTier.remaining.toLocaleString('id-ID')} more to upgrade
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-purple-900 mb-2">
                    🎉 MAX TIER
                  </p>
                  <p className="text-sm text-purple-700">
                    Enjoying maximum benefits!
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    10% discount on all purchases
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Points History */}
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <History className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Points History</h2>
                <p className="text-sm text-slate-600">All points transactions and activities</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {pointsHistory.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Points History</h3>
                <p className="text-slate-600">This member hasn't earned or redeemed any points yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pointsHistory.map((history) => (
                  <div 
                    key={history.id}
                    className={`p-4 rounded-lg border ${getTypeColor(history.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getTypeIcon(history.type)}</span>
                          <span className="font-semibold">{history.type}</span>
                          <Badge variant="outline" className="text-xs">
                            {history.type === 'EARNED' || history.type === 'ADJUSTED' ? '+' : '-'}
                            {Math.abs(history.points).toLocaleString('id-ID')} pts
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{history.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span>
                            {new Date(history.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {history.expiresAt && history.type === 'EARNED' && (
                            <span className="text-orange-600">
                              Expires: {new Date(history.expiresAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600 mb-1">Balance</p>
                        <p className="text-lg font-bold">
                          {history.balance.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
