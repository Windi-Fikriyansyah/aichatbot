'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const steps = [
    { path: '/step-1-profile', label: 'Profil Bisnis' },
    { path: '/step-2-wa-connect', label: 'Koneksi WhatsApp' },
    { path: '/step-3-ai-setup', label: 'Pengaturan AI' },
    { path: '/step-4-catalog', label: 'Katalog Produk' },
  ];

  const currentIndex = steps.findIndex((s) => s.path === pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white/90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl relative">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-12 relative z-10 px-8">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 -z-10 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${Math.max(0, currentIndex) / (steps.length - 1) * 100}%` }}
          />
          
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            return (
              <div key={step.path} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${isActive ? 'bg-brand-500 text-white ring-4 ring-brand-500/20' : isCompleted ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'}`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className={`mt-2 text-xs md:text-sm font-medium ${isActive ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 md:p-12 rounded-2xl shadow-theme-sm overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
