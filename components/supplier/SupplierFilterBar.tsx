import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, DollarSign, CheckCircle } from 'lucide-react';
import { SupplierFilter } from '@/types/supplier';

interface FilterBarProps {
  activeFilter: SupplierFilter;
  onFilterChange: (filter: SupplierFilter) => void;
  pendingCount: number;
  paymentPendingCount: number;
  activeCount: number;
  totalCount: number;
}

export default function SupplierFilterBar({
  activeFilter,
  onFilterChange,
  pendingCount,
  paymentPendingCount,
  activeCount,
  totalCount
}: FilterBarProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeFilter === 'pending' ? 'primary' : 'outline'}
            onClick={() => onFilterChange('pending')}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Pending Approval ({pendingCount})
          </Button>
          <Button
            variant={activeFilter === 'payment_pending' ? 'primary' : 'outline'}
            onClick={() => onFilterChange('payment_pending')}
            className="flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Payment Pending ({paymentPendingCount})
          </Button>
          <Button
            variant={activeFilter === 'active' ? 'primary' : 'outline'}
            onClick={() => onFilterChange('active')}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Active ({activeCount})
          </Button>
          <Button
            variant={activeFilter === 'all' ? 'primary' : 'outline'}
            onClick={() => onFilterChange('all')}
          >
            Semua ({totalCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
