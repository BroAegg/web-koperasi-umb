'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  showControls?: boolean;
  className?: string;
}

export function DateSelector({ 
  selectedDate, 
  onDateChange, 
  showControls = true,
  className = ""
}: DateSelectorProps) {
  const handlePrevDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    onDateChange(currentDate.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    onDateChange(currentDate.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
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
              onChange={(e) => onDateChange(e.target.value)}
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
      </CardContent>
    </Card>
  );
}