import type { Metadata } from "next";
import "./globals.css";
import { DeveloperProvider } from "@/contexts/DeveloperContext";
import { reportWebVitals } from "@/lib/performance";

export const metadata: Metadata = {
  title: "Koperasi UM BANDUNG",
  description: "Sistem Koperasi Universitas Muhammadiyah Bandung",
};

// Report Web Vitals for performance monitoring (client-side only)
if (typeof window !== 'undefined') {
  import('web-vitals').then(({ onCLS, onLCP, onFCP, onTTFB, onINP }) => {
    onCLS(reportWebVitals);
    onLCP(reportWebVitals);
    onFCP(reportWebVitals);
    onTTFB(reportWebVitals);
    onINP(reportWebVitals); // INP replaced FID in web-vitals v3
  });
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-white text-gray-800 antialiased">
        <DeveloperProvider>{children}</DeveloperProvider>
      </body>
    </html>
  );
}
