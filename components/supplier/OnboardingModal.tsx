"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, Package, Upload, CreditCard, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      icon: Package,
      title: "Selamat Datang di Dashboard Penitip!",
      description: "Mari kenali fitur-fitur yang tersedia untuk membantu Anda berjualan di BSM Mart.",
      color: "blue"
    },
    {
      icon: Upload,
      title: "Ajukan Produk Anda",
      description: "Kirim request produk baru melalui menu 'Produk Saya'. Admin akan meninjau dan menyetujui produk Anda maksimal 1x24 jam.",
      color: "purple"
    },
    {
      icon: Package,
      title: "Kelola Stok Produk",
      description: "Pantau stok produk dan ajukan permintaan restock saat stok menipis melalui menu 'Manajemen Stok'.",
      color: "green"
    },
    {
      icon: TrendingUp,
      title: "Pantau Penjualan",
      description: "Lihat total pendapatan dan pesanan Anda di dashboard. Anda mendapat 90% dari setiap penjualan.",
      color: "emerald"
    },
    {
      icon: CreditCard,
      title: "Pembayaran Bulanan",
      description: "Biaya bulanan Rp 25.000 untuk maintenance sistem. Pastikan membayar tepat waktu agar akun tetap aktif.",
      color: "orange"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('supplier_onboarding_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  const colorClasses = {
    blue: "from-blue-600 to-blue-700",
    purple: "from-purple-600 to-purple-700",
    green: "from-green-600 to-green-700",
    emerald: "from-emerald-600 to-emerald-700",
    orange: "from-orange-600 to-orange-700"
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colorClasses[step.color as keyof typeof colorClasses]} text-white p-6 relative`}>
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center text-center pt-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Icon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">{step.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-center leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-blue-600"
                    : index < currentStep
                    ? "w-2 bg-blue-400"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                Kembali
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className={`flex-1 ${currentStep === 0 ? 'w-full' : ''}`}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mulai Berjualan
                </>
              ) : (
                "Lanjut"
              )}
            </Button>
          </div>

          {/* Skip button */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-3 transition-colors"
            >
              Lewati tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
