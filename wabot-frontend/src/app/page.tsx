'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');
    if (token) {
      if (tenantId) {
        router.replace('/dashboard');
      } else {
        router.replace('/step-1-profile');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
        <p className="text-sm text-gray-400">Memuat...</p>
      </div>
    </div>
  );
}
