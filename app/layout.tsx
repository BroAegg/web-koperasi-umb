import type { Metadata } from "next";
import "./globals.css";
import { DeveloperProvider } from "@/contexts/DeveloperContext";

export const metadata: Metadata = {
  title: "Koperasi UM BANDUNG",
  description: "Sistem Koperasi Universitas Muhammadiyah Bandung",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-white text-gray-800 antialiased">
        <DeveloperProvider>{children}</DeveloperProvider>
      </body>
    </html>
  );
}
