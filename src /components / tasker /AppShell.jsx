import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomTabs from '@/components/tasker/BottomTabs';
import FAB from '@/components/tasker/FAB';
import AddDialog from '@/components/tasker/AddDialog';

export default function AppShell() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <Outlet context={{ openAdd: () => setAddOpen(true) }} />
      <FAB onClick={() => setAddOpen(true)} />
      <BottomTabs />
      <AddDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <div className="h-20" /> {/* spacer for bottom tabs */}
    </div>
  );
}
