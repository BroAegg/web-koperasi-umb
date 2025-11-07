"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShieldAlert, Home, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    // If not logged in, redirect to login
    if (!session) {
      router.push("/login")
    }
  }, [session, router])

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    // Redirect based on role
    if (session?.user?.role === "DEVELOPER") {
      router.push("/koperasi/developer-dashboard")
    } else if (session?.user?.role === "SUPER_ADMIN") {
      router.push("/koperasi/dashboard")
    } else if (session?.user?.role === "ADMIN") {
      router.push("/koperasi/dashboard")
    } else {
      router.push("/koperasi/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-red-500 to-orange-500 p-4 rounded-full shadow-lg">
              <ShieldAlert className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Akses Ditolak
            </h1>
            <p className="text-slate-600 text-lg">
              Maaf, Anda tidak memiliki izin untuk mengakses halaman ini
            </p>
          </div>

          {/* User Info */}
          {session?.user && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 space-y-1">
              <p className="text-sm text-slate-500">Login sebagai:</p>
              <p className="font-semibold text-slate-800">{session.user.name}</p>
              <p className="text-sm text-slate-600">{session.user.email}</p>
              <div className="inline-block mt-2">
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium rounded-full">
                  {session.user.role === "SUPER_ADMIN" && "Super Admin"}
                  {session.user.role === "ADMIN" && "Kasir"}
                  {session.user.role === "DEVELOPER" && "Developer"}
                  {session.user.role === "USER" && "User"}
                </span>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <p className="text-sm text-orange-800">
              <strong>Catatan:</strong> Halaman ini hanya dapat diakses oleh pengguna dengan hak akses tertentu. 
              Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator sistem.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleGoBack}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <button
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Home className="w-4 h-4" />
              Beranda
            </button>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Sistem Koperasi UMB © 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
