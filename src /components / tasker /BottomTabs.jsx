import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarClock, CheckCircle2, User } from 'lucide-react';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/upcoming', icon: CalendarClock, label: 'Upcoming' },
  { path: '/completed', icon: CheckCircle2, label: 'Completed' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomTabs() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-gray-200/60 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {tabs.map(tab => {
          const active = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
                active ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <tab.icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.6} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
