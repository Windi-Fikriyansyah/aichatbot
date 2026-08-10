'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, Package, Bot, Zap, Users, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : '';

  useEffect(() => {
    if (!tenantId) return;
    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/analytics/stats`, { headers: { 'x-tenant-id': tenantId } })
      .then(res => setStats(res.data))
      .catch(e => console.error('Gagal mengambil statistik', e));
  }, [tenantId]);

  if (!stats) return <div className="text-slate-400">Memuat statistik...</div>;

  const usagePercent = stats.subscription ? Math.min((stats.subscription.used / stats.subscription.limit) * 100, 100) : 0;
  
  const chartData = stats.chartData || [];

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Overview Kinerja AI" />

      {stats.subscription && (
        <ComponentCard title="Penggunaan Limit Percakapan (Bulan Ini)" desc="Batas mengatur ulang di awal siklus penagihan.">
          <div className="flex justify-end items-end mb-2">
            <div className="text-right">
              <span className="text-xl font-bold text-gray-800 dark:text-white">{stats.subscription.used}</span>
              <span className="text-gray-500 dark:text-gray-400"> / {stats.subscription.limit} Percakapan</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 mt-2 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-1000 ${usagePercent > 85 ? 'bg-error-500' : usagePercent > 50 ? 'bg-warning-500' : 'bg-success-500'}`} 
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
        </ComponentCard>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-brand-500/10 rounded-xl"><MessageSquare className="w-6 h-6 text-brand-500" /></div>
            <span className="text-brand-500 text-xs font-semibold px-2 py-1 bg-brand-500/10 rounded-full">Bulan Ini</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Percakapan</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90">{stats.totalConversations}</h3>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-success-500/10 rounded-xl"><Bot className="w-6 h-6 text-success-500" /></div>
            <span className="text-success-500 text-xs font-semibold px-2 py-1 bg-success-500/10 rounded-full">Live</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Percakapan Aktif (AI)</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90">{stats.activeConversations}</h3>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-warning-500/10 rounded-xl"><Users className="w-6 h-6 text-warning-500" /></div>
            <span className="text-warning-500 text-xs font-semibold px-2 py-1 bg-warning-500/10 rounded-full">Takeover</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Eskalasi Manual</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90">{stats.humanHandlingConversations}</h3>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-error-500/10 rounded-xl"><Zap className="w-6 h-6 text-error-500" /></div>
            <span className="text-error-500 text-xs font-semibold px-2 py-1 bg-error-500/10 rounded-full">Biaya</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Token Terpakai</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90">{stats.tokensUsed}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComponentCard title="Tren Percakapan" desc="7 Hari Terakhir">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937' }}
                    itemStyle={{ color: '#4f46e5' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="chat" 
                    name="Jumlah Chat" 
                    stroke="#4f46e5" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#4338ca', stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ComponentCard>
        </div>

        <div className="lg:col-span-1">
          <ComponentCard title="Ringkasan Lainnya" desc="Status operasional asisten AI">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-brand-500" />
                  <span className="text-gray-700 dark:text-gray-300">Produk Katalog</span>
                </div>
                <span className="font-bold text-lg text-gray-800 dark:text-white/90">{stats.productsCount}</span>
              </div>

              <div className="flex items-start p-4 bg-warning-50 dark:bg-warning-500/10 rounded-xl border border-warning-200 dark:border-warning-500/20">
                <AlertCircle className="w-5 h-5 text-warning-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-warning-600 dark:text-warning-400 font-medium mb-1">Human Takeover</h4>
                  <p className="text-xs text-warning-600/80 dark:text-warning-400/80 leading-relaxed">
                    Saat ini ada {stats.humanHandlingConversations} pelanggan yang sedang ditangani oleh agen secara manual. AI berhenti mengirimkan balasan untuk pelanggan tersebut.
                  </p>
                </div>
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
