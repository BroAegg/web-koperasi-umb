'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRangeChange?: (range: DateRange | null) => void;
  activeRange?: DateRange | null;
  showControls?: boolean;
  className?: string;
}

export function DateSelector({ 
  selectedDate, 
  onDateChange, 
  onRangeChange,
  activeRange,
  showControls = true,
  className = ""
}: DateSelectorProps) {
  const handlePrevDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    onDateChange(currentDate.toISOString().split('T')[0]);
    if (onRangeChange) onRangeChange(null); // Clear range when single date selected
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    onDateChange(currentDate.toISOString().split('T')[0]);
    if (onRangeChange) onRangeChange(null); // Clear range when single date selected
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
    if (onRangeChange) onRangeChange(null); // Clear range
  };

  const handleQuickFilter = (range: string) => {
    if (!onRangeChange) return;
    
    const today = new Date();
    let start: Date;
    let label: string;

    switch(range) {
      case 'today':
        onDateChange(today.toISOString().split('T')[0]);
        onRangeChange(null);
        return;
      case '7days':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        label = '7 Hari Terakhir';
        break;
      case '1month':
        start = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        label = '1 Bulan Terakhir';
        break;
      case '6months':
        start = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        label = '6 Bulan Terakhir';
        break;
      default:
        return;
    }

    onRangeChange({
      start,
      end: today,
      label
    });
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Quick Filter Pills */}
          {onRangeChange && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Filter Cepat:</label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={!activeRange && selectedDate === new Date().toISOString().split('T')[0] ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter('today')}
                  className="text-xs h-8"
                >
                  Hari Ini
                </Button>
                <Button 
                  variant={activeRange?.label === '7 Hari Terakhir' ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter('7days')}
                  className="text-xs h-8"
                >
                  7 Hari
                </Button>
                <Button 
                  variant={activeRange?.label === '1 Bulan Terakhir' ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter('1month')}
                  className="text-xs h-8"
                >
                  1 Bulan
                </Button>
                <Button 
                  variant={activeRange?.label === '6 Bulan Terakhir' ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter('6months')}
                  className="text-xs h-8"
                >
                  6 Bulan
                </Button>
              </div>
            </div>
          )}

          {/* Date Range Display */}
          {activeRange ? (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">
                {activeRange.label}
              </p>
              <p className="text-xs text-blue-600">
                {formatDisplayDate(activeRange.start.toISOString().split('T')[0])} - {formatDisplayDate(activeRange.end.toISOString().split('T')[0])}
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Date Icon & Label */}
              <div className="flex items-center gap-2 shrink-0">
                <Calendar className="w-5 h-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Tanggal:</label>
              </div>

              {/* Date Controls */}
              <div className="flex items-center gap-2">
                {showControls && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevDay}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}

                {/* Date Input */}
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    onDateChange(e.target.value);
                    if (onRangeChange) onRangeChange(null);
                  }}
                  className="w-auto min-w-[140px] text-center"
                />

                {showControls && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextDay}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Display Date */}
              <div className="flex-1 hidden md:block">
                <p className="text-sm text-gray-600 text-center">
                  {formatDisplayDate(selectedDate)}
                </p>
              </div>

              {/* Today Button */}
              {showControls && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="shrink-0 text-xs px-3"
                >
                  Hari Ini
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}