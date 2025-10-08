"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Boxes, Users, Megaphone, Settings, LogOut, Menu, X, Bell, User } from "lucide-react";
import { Button } from '@/components/ui/button';

const navItems = [
  { href: "/koperasi/dashboard", label: "Dashboard", icon: Home },
  { href: "/koperasi/inventory", label: "Inventory", icon: Boxes },
  { href: "/koperasi/membership", label: "Membership", icon: Users },
  { href: "/koperasi/broadcast", label: "Broadcast", icon: Megaphone },
];

export default function KoperasiLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 mb-8 px-6 pt-6">
        <Image src="/logo-umb.png" width={40} height={40} alt="UMB" className="rounded-full" />
        <div className="text-lg font-bold text-blue-700 leading-tight">KOPERASI<br />UMB</div>
      </div>

      <nav className="space-y-1 px-6">
        {navItems.map(({ href, label, icon: Icon }) => {
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

      <div className="mt-auto pt-6 border-t border-gray-200 space-y-1 px-6 pb-6">
        <Link
          href="/settings"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings size={18} className="flex-shrink-0" /> 
          <span>Settings</span>
        </Link>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 w-full text-left px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
        >
          <LogOut size={18} className="flex-shrink-0" /> 
          <span>Logout</span>
        </button>
      </div>
    </>
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
            <span className="font-bold text-blue-700 text-sm">KOPERASI UMB</span>
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
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
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
        <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col min-h-screen shadow-sm">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
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
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@umb.ac.id</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
