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
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/login'
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force redirect even if signOut fails
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#0055FF] to-[#003DB3] rounded-xl shadow-md shadow-blue-500/20">
                <Wallet className="w-6 h-6 text-white stroke-[2.5px]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">
                  Member Portal
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Koperasi UMB
                </p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-[#0055FF] font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] stroke-[2px]" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* User Info - Desktop */}
              <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-9 h-9 bg-gradient-to-br from-[#0055FF] to-[#003DB3] rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-bold">
                    {session?.user?.name?.charAt(0).toUpperCase() || 'M'}
                  </span>
                </div>
                <div className="text-left max-w-[140px]">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
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
                className="hidden md:flex p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5 stroke-[2px]" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
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
        <div className="md:hidden fixed inset-0 top-18 z-30 bg-white border-t border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-2">
            {/* User Info Mobile */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0055FF] to-[#003DB3] rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white text-lg font-bold">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'M'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-50 text-[#0055FF] font-semibold shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 font-medium'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2px]" />
                  <span className="text-base">{item.label}</span>
                </Link>
              );
            })}

            {/* Logout Mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5 stroke-[2px]" />
              <span className="text-base">Keluar</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
