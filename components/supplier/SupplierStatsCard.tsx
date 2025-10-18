import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Building2,
  LucideIcon
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  iconBgColor: string;
  iconColor: string;
  textColor: string;
  valueColor: string;
}

export default function SupplierStatsCard({
  title,
  value,
  icon: Icon,
  gradientFrom,
  gradientTo,
  borderColor,
  iconBgColor,
  iconColor,
  textColor,
  valueColor
}: StatCardProps) {
  return (
    <Card className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} ${borderColor}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textColor}`}>{title}</p>
            <p className={`text-3xl font-bold ${valueColor} mt-2`}>{value}</p>
          </div>
          <div className={`p-3 ${iconBgColor} rounded-full`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Preset configurations for common stats
export const PendingStatsCard = ({ value }: { value: number }) => (
  <SupplierStatsCard
    title="Pending Approval"
    value={value}
    icon={Clock}
    gradientFrom="from-yellow-50"
    gradientTo="to-yellow-100"
    borderColor="border-yellow-200"
    iconBgColor="bg-yellow-200"
    iconColor="text-yellow-700"
    textColor="text-yellow-800"
    valueColor="text-yellow-900"
  />
);

export const PaymentPendingStatsCard = ({ value }: { value: number }) => (
  <SupplierStatsCard
    title="Payment Pending"
    value={value}
    icon={DollarSign}
    gradientFrom="from-orange-50"
    gradientTo="to-orange-100"
    borderColor="border-orange-200"
    iconBgColor="bg-orange-200"
    iconColor="text-orange-700"
    textColor="text-orange-800"
    valueColor="text-orange-900"
  />
);

export const ActiveStatsCard = ({ value }: { value: number }) => (
  <SupplierStatsCard
    title="Active Suppliers"
    value={value}
    icon={CheckCircle}
    gradientFrom="from-green-50"
    gradientTo="to-green-100"
    borderColor="border-green-200"
    iconBgColor="bg-green-200"
    iconColor="text-green-700"
    textColor="text-green-800"
    valueColor="text-green-900"
  />
);

export const TotalStatsCard = ({ value }: { value: number }) => (
  <SupplierStatsCard
    title="Total Suppliers"
    value={value}
    icon={Building2}
    gradientFrom="from-blue-50"
    gradientTo="to-blue-100"
    borderColor="border-blue-200"
    iconBgColor="bg-blue-200"
    iconColor="text-blue-700"
    textColor="text-blue-800"
    valueColor="text-blue-900"
  />
);
