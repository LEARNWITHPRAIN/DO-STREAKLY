'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard/habits',      icon: 'check_circle', label: 'Habits'      },
  { href: '/dashboard/challenges',  icon: 'bolt',         label: 'Challenges'  },
  { href: '/dashboard/leaderboard', icon: 'trophy',       label: 'Leaderboard' },
  { href: '/dashboard/profile',     icon: 'person',       label: 'Profile'     },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 w-full z-50 pb-safe"
      style={{
        background: 'rgba(18,20,19,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -1px 0 rgba(66,73,51,0.4)',
      }}
    >
      <div className="flex justify-around items-center h-16 px-gutter">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-colors ${
                active ? 'text-primary-fixed' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="font-label-sm text-label-sm">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
