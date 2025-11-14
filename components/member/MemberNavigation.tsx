"use client";

import {
  CreditCard,
  Home,
  LogOut,
  Menu,
  ShoppingCart,
  User,
  Wallet,
  X
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MemberNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/member/dashboard' },
    { icon: Wallet, label: 'Simpanan', href: '/member/simpanan' },
    { icon: CreditCard, label: 'Pinjaman', href: '/member/pinjaman' },
    { icon: ShoppingCart, label: 'Transaksi', href: '/member/transaksi' },
    { icon: User, label: 'Profil', href: '/member/profile' },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Member Portal
                </h1>
                <p className="text-xs text-gray-500">
                  Koperasi UMB
                </p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* User Info - Desktop */}
              <div className="hidden lg:flex items-center space-x-3 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {session?.user?.name?.charAt(0).toUpperCase() || 'M'}
                  </span>
                </div>
                <div className="text-left max-w-[150px]">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name || 'Member'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              {/* Logout Button - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden md:flex p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-30 bg-white border-t border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-2">
            {/* User Info Mobile */}
            <div className="flex items-center space-x-3 p-4 bg-gray-100 rounded-lg mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'M'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Member'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            {/* Menu Items */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-base font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Logout Mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-base font-medium">Keluar</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
