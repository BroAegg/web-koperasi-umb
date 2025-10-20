"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import { NotificationProvider } from '@/lib/notification-context';
import { DeveloperToolbar } from '@/components/DeveloperToolbar';
import { 
  LayoutDashboard, 
  Users,
  Package,
  TrendingUp,
  Megaphone,
  Settings,
  Menu,
  X,
  LogOut,
  UserCog,
  Shield,
  Building2,
  CreditCard,
  Wrench,
  Activity,
  Database,
  Code
} from "lucide-react";

function KoperasiContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, authorized, logout } = useAuth(["ADMIN", "SUPER_ADMIN", "SUPPLIER", "DEVELOPER"]);

  // Check if user is a developer (has developer session in token)
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setIsDeveloper(payload.developerSession?.actualRole === 'DEVELOPER');
        } catch (error) {
          setIsDeveloper(false);
        }
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  // Categorized navigation for better organization
  const navigationCategories = [
    {
      title: "OPERASIONAL",
      items: [
        { name: "Dashboard", href: "/koperasi/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SUPER_ADMIN"] },
        { name: "POS Kasir", href: "/koperasi/pos", icon: CreditCard, roles: ["ADMIN", "SUPER_ADMIN"] },
        { name: "Inventory", href: "/koperasi/inventory", icon: Package, roles: ["ADMIN", "SUPER_ADMIN"] },
      ]
    },
    {
      title: "MITRA", 
      items: [
        { name: "Suppliers", href: "/koperasi/super-admin/suppliers", icon: Building2, roles: ["SUPER_ADMIN"] },
      ]
    },
    {
      title: "KEUANGAN",
      items: [
        { name: "Keuangan", href: "/koperasi/financial", icon: TrendingUp, roles: ["SUPER_ADMIN"] },
      ]
    },
    {
      title: "SISTEM",
      items: [
        { name: "Broadcast", href: "/koperasi/broadcast", icon: Megaphone, roles: ["SUPER_ADMIN"] },
        { name: "Pengaturan", href: "/koperasi/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
      ]
    },
    {
      title: "DEVELOPER TOOLS",
      items: [
        { name: "Developer Dashboard", href: "/koperasi/developer-dashboard", icon: Wrench, roles: ["DEVELOPER"] },
        { name: "Activity Logs", href: "/koperasi/developer-dashboard/activity-logs", icon: Activity, roles: ["DEVELOPER"] },
        { name: "Data Management", href: "/koperasi/developer-dashboard/data-management", icon: Database, roles: ["DEVELOPER"] },
        { name: "API Tester", href: "/koperasi/developer-dashboard/api-tester", icon: Code, roles: ["DEVELOPER"] },
      ]
    }
  ];

  // Filter categories and items based on user role
  // Special case: Developer Tools always visible if isDeveloper is true
  const filteredCategories = navigationCategories.map(category => ({
    ...category,
    items: category.items.filter(item => {
      // Always show Developer Tools if user is a developer
      if (category.title === "DEVELOPER TOOLS" && isDeveloper) {
        return true;
      }
      // Otherwise filter by role as usual
      return item.roles.includes(user?.role || "");
    })
  })).filter(category => category.items.length > 0);

  const isActive = (href: string) => {
    if (href === "/koperasi/dashboard") {
      return pathname === href || pathname === "/koperasi";
    }
    return pathname?.startsWith(href);
  };

  // Determine portal name and icon based on role
  const portalConfig = user?.role === "SUPER_ADMIN" 
    ? { name: "Super Admin", icon: Shield }
    : { name: "Admin Portal", icon: UserCog };

  const PortalIcon = portalConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Developer Toolbar - Always visible for developers */}
      <DeveloperToolbar />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <PortalIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Koperasi UMB</h1>
                <p className="text-xs text-slate-500">{portalConfig.name}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {filteredCategories.map((category, categoryIndex) => (
              <div key={category.title}>
                {/* Category Header */}
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {category.title}
                  </h3>
                </div>
                
                {/* Category Items */}
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? "text-white" : "text-slate-500"}`} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
                
                {/* Separator between categories (except last) */}
                {categoryIndex < filteredCategories.length - 1 && (
                  <div className="mt-4 border-t border-slate-200"></div>
                )}
              </div>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-slate-200 space-y-2">
            <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-blue-600 font-medium">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                 user?.role === 'DEVELOPER' ? 'Developer' : 'Admin'}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white shadow-md">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-lg font-bold text-slate-800">{portalConfig.name}</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function KoperasiLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <KoperasiContent>{children}</KoperasiContent>
    </NotificationProvider>
  );
}