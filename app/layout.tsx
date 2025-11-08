import type { Metadata } from "next";
import "./globals.css";
import { DeveloperProvider } from "@/contexts/DeveloperContext";
import { reportWebVitals } from "@/lib/performance";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

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
        <Providers>
          <DeveloperProvider>{children}</DeveloperProvider>
        </Providers>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid rgb(226 232 240)',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }
          }}
        />
        {/* Only load Vercel Analytics in production */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
      </body>
    </html>
  );
}
