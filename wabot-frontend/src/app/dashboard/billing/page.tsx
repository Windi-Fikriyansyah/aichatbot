'use client';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { CreditCard, CheckCircle2, Zap, Rocket, AlertTriangle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import { useSearchParams, useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Badge from '@/components/ui/badge/Badge';

function BillingContent() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : '';

  const fetchData = async () => {
    if (!tenantId) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/billing`, {
        headers: { 'x-tenant-id': tenantId }
      });
      setSub(res.data);
      
      // Jika kembali dari mock Pakasir success
      if (searchParams.get('mock_success') === 'true') {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/billing/upgrade-mock`, {}, {
          headers: { 'x-tenant-id': tenantId }
        });
        alert('Pembayaran Berhasil! Paket Anda telah ditingkatkan ke PRO.');
        router.replace('/dashboard/billing');
        
        // Refresh data
        const res2 = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/billing`, {
          headers: { 'x-tenant-id': tenantId }
        });
        setSub(res2.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId, searchParams]);

  const handleUpgrade = async (planName: string) => {
    if (sub.plan === planName) return;
    
    setUpgrading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/billing/checkout`, { plan: planName }, {
        headers: { 'x-tenant-id': tenantId }
      });
      
      // Redirect ke Pakasir (atau mock link)
      window.location.href = res.data.checkoutUrl;
    } catch (e: any) {
      alert(e.response?.data?.message || 'Terjadi kesalahan saat membuat tagihan');
      setUpgrading(false);
    }
  };

  if (loading) return <div className="flex items-center text-slate-400"><Loader2 className="animate-spin w-5 h-5 mr-2" /> Memuat data tagihan...</div>;
  if (!sub) return <div>Data langganan tidak ditemukan.</div>;

  const usagePercent = Math.min((sub.convUsed / sub.convLimit) * 100, 100);
  const isNearLimit = usagePercent > 80;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageBreadcrumb pageTitle="Langganan & Tagihan" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel Kiri - Status Saat Ini */}
        <div className="md:col-span-1 space-y-6">
          <ComponentCard title="Paket Aktif">
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-4xl font-bold bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">
                {sub.plan}
              </span>
              {sub.status === 'ACTIVE' && <Badge color="success">Aktif</Badge>}
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Periode berakhir pada {new Date(sub.periodEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Penggunaan Bulan Ini</span>
                <span className="font-semibold text-gray-800 dark:text-white/90">{sub.convUsed} / {sub.convLimit}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-error-500' : usagePercent > 75 ? 'bg-warning-500' : 'bg-brand-500'}`} 
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>
            </div>

            {isNearLimit && (
              <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/30 rounded-xl flex items-start">
                <AlertTriangle className="w-5 h-5 text-warning-500 mr-3 shrink-0 mt-0.5" />
                <p className="text-sm text-warning-800 dark:text-warning-300 leading-relaxed">
                  Kuota AI Anda hampir habis. Lakukan upgrade untuk memastikan bot AI Anda tidak terhenti saat melayani pelanggan.
                </p>
              </div>
            )}
          </ComponentCard>
        </div>

        {/* Panel Kanan - Tabel Harga */}
        <div className="md:col-span-2">
          <ComponentCard title="Pilihan Paket">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Starter Plan */}
            <Card className={`relative overflow-visible ${sub.plan === 'STARTER' ? 'border-brand-500 ring-1 ring-brand-500/50 bg-brand-50/50 dark:bg-brand-500/5' : ''}`}>
              {sub.plan === 'STARTER' && <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-500 text-white text-xs font-medium px-3 py-1 rounded-full z-10">Paket Anda</div>}
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Starter</CardTitle>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">Gratis</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-success-500 mr-2" /> Hingga 500 obrolan/bulan</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-success-500 mr-2" /> Model AI Standar</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-success-500 mr-2" /> 1 Anggota Tim</li>
                  <li className="flex items-center text-gray-400 dark:text-gray-500"><CheckCircle2 className="w-4 h-4 text-gray-300 dark:text-gray-600 mr-2" /> Tidak ada Live Chat</li>
                </ul>
                <Button disabled className="w-full bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700">
                  {sub.plan === 'STARTER' ? 'Paket Aktif' : 'Pilih Starter'}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className={`relative overflow-visible ${sub.plan === 'PRO' ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/5' : 'border-brand-500/20 shadow-md shadow-brand-500/5'}`}>
              {sub.plan === 'PRO' && <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full z-10">Paket Anda</div>}
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center text-brand-600 dark:text-brand-400"><Zap className="w-4 h-4 mr-1" /> Pro</CardTitle>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">Rp 150.000</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">/ bulan</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-success-500 mr-2" /> <span className="font-bold text-gray-900 dark:text-white">5.000</span> obrolan/bulan</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-success-500 mr-2" /> Model AI Premium (Claude 3.5)</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-success-500 mr-2" /> Anggota Tim Tak Terbatas</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-success-500 mr-2" /> Fitur Live Chat & Handoff</li>
                </ul>
                <Button 
                  onClick={() => handleUpgrade('PRO')}
                  disabled={sub.plan === 'PRO' || upgrading}
                  className={`w-full ${sub.plan === 'PRO' ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/30 shadow-lg'}`}
                >
                  {upgrading ? <Loader2 className="animate-spin w-4 h-4" /> : sub.plan === 'PRO' ? 'Paket Aktif' : 'Upgrade Sekarang via Pakasir'}
                </Button>
              </CardContent>
            </Card>

            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Memuat data tagihan...</div>}>
      <BillingContent />
    </Suspense>
  );
}
