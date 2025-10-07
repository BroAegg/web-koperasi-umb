"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Boxes, Users, Megaphone, Settings, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/membership", label: "Membership", icon: Users },
  { href: "/broadcast", label: "Broadcast", icon: Megaphone },
];

export default function KoperasiLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-200 px-6 py-6 flex flex-col bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo-umb.png" width={40} height={40} alt="UMB" className="rounded-full" />
          <div className="text-lg font-bold text-blue-700 leading-tight">KOPERASI<br />UMB</div>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200 space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Settings size={16} /> Settings
          </Link>
          <button className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Konten */}
      <main className="flex-1 p-8 bg-white">{children}</main>
    </div>
  );
}
