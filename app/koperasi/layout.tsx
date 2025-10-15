"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Boxes, Users, Megaphone, DollarSign, Settings, LogOut, Menu, X, Bell, User } from "lucide-react";
import { Button } from '@/components/ui/button';
import { NotificationProvider } from '@/lib/notification-context';

const navItems = [
  { href: "/koperasi/dashboard", label: "Dashboard", icon: Home },
  { href: "/koperasi/inventory", label: "Inventory", icon: Boxes },
  { href: "/koperasi/membership", label: "Membership", icon: Users },
  { href: "/koperasi/financial", label: "Keuangan", icon: DollarSign },
  { href: "/koperasi/broadcast", label: "Broadcast", icon: Megaphone },
];

export default function KoperasiLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setUser(d.data);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8 px-6 pt-6">
        <Image src="/logo-umb.png" width={40} height={40} alt="UMB" className="rounded-full" />
        <div className="text-lg font-bold text-blue-700 leading-tight">KOPERASI<br />UM BANDUNG</div>
      </div>

      <nav className="space-y-1 px-6 flex-1">
        {navItems
          .filter(item => {
            if (!user) return true;
            if (user.role === 'SUPER_ADMIN') return true;
            if (user.role === 'ADMIN') return !item.href.startsWith('/koperasi/super-admin');
            if (user.role === 'SUPPLIER') return item.href.startsWith('/koperasi/supplier') || item.href.includes('broadcast');
            return true;
          })
          .map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                  active ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" /> 
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-gray-200 space-y-1 px-6 py-6 mt-auto">
        <Link
          href="/koperasi/settings"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
            pathname === '/koperasi/settings' ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings size={18} className="flex-shrink-0" /> 
          <span>Settings</span>
        </Link>
        <button 
          onClick={() => { setSidebarOpen(false); setShowLogoutModal(true); }}
          className="flex items-center gap-3 w-full text-left px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
        >
          <LogOut size={18} className="flex-shrink-0" /> 
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2"
          >
            <Menu size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Image src="/logo-umb.png" width={32} height={32} alt="UMB" className="rounded-full" />
            <span className="font-bold text-blue-700 text-sm">KOPERASI UM BANDUNG</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="p-2">
            <Bell size={18} />
          </Button>
          <Button variant="outline" size="sm" className="p-2">
            <User size={18} />
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute top-4 right-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="p-2"
          >
            <X size={20} />
          </Button>
        </div>
        <div className="h-full flex flex-col">
          <SidebarContent />
        </div>
      </aside>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm z-20 overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64 flex-1 min-h-screen">
          {/* Desktop Header */}
          <header className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 items-center justify-between sticky top-0 z-30">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="p-2">
                <Bell size={18} />
              </Button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'not-logged-in'}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Logout</h3>
                <p className="text-sm text-gray-500">Anda yakin ingin keluar?</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Ya, Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
