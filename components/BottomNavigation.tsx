'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ShoppingCart, Plus, Sprout, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/marketplace', icon: ShoppingCart, label: 'Market' },
  { href: '/marketplace/sell-crop', icon: Plus, label: 'Sell' },
  { href: '/crop-guidance', icon: Sprout, label: 'Crop' },
  { href: '/profile', icon: User, label: 'Profile' }
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-green-600' : 'text-gray-600'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}