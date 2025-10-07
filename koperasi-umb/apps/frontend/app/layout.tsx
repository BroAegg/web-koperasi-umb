import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Koperasi UMB",
  description: "Sistem Koperasi Universitas Mercu Buana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-white text-gray-800 antialiased">{children}</body>
    </html>
  );
}
