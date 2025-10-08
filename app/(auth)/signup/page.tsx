"use client";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white text-gray-800">
      {/* Left Logo */}
      <div className="hidden md:flex items-center justify-center bg-white">
        <Image src="/logo-umb.png" alt="UMB" width={200} height={200} className="rounded-full" />
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">Buat Akun Baru</h2>

          <form className="space-y-4">
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Nama Lengkap" />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Email" type="email" />
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Password" type="password" />

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">Daftar</button>
            <button type="button" className="w-full border rounded-lg py-2 hover:bg-gray-50">Daftar dengan Google</button>
          </form>

          <p className="text-center text-sm mt-6">
            Sudah punya akun? <Link href="/login" className="text-blue-700 font-medium">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
