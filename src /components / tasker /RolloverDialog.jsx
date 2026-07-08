import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { format, addDays } from 'date-fns';

export default function RolloverDialog({ task, open, onClose, onRefresh }) {
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const [date, setDate] = useState(tomorrow);
  const [loading, setLoading] = useState(false);

  const handleRollover = async () => {
    setLoading(true);
    await base44.entities.Task.update(task.id, { scheduled_date: date });
    setLoading(false);
    onRefresh?.();
    onClose();
  };

  const quickDates = [
    { label: 'Tomorrow', value: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
    { label: 'In 2 days', value: format(addDays(new Date(), 2), 'yyyy-MM-dd') },
    { label: 'Next week', value: format(addDays(new Date(), 7), 'yyyy-MM-dd') },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Rollover Task</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-3">Move "{task?.title}" to another day</p>
        <div className="flex gap-2 mb-4">
          {quickDates.map(d => (
            <button
              key={d.value}
              onClick={() => setDate(d.value)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                date === d.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm mb-4"
        />
        <Button onClick={handleRollover} disabled={loading} className="w-full rounded-xl">
          {loading ? 'Moving...' : 'Move Task'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
