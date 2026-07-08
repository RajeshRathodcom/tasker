import React from 'react';

export default function StatCard({ icon, label, value, sublabel, color = 'bg-blue-50 text-blue-600' }) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100/60">
      <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-xl font-semibold tracking-tight text-foreground truncate">{value}</p>
      <p className="text-[11px] font-medium text-muted-foreground mt-0.5 truncate">{label}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{sublabel}</p>}
    </div>
  );
}
