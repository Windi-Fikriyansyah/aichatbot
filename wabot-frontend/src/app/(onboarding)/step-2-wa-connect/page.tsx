'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import Button from '@/components/ui/button/Button';
import { ArrowRight, Loader2, CheckCircle2, QrCode } from 'lucide-react';

export default function Step2WaConnect() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<string>('Memulai koneksi...');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;

  useEffect(() => {
    if (!tenantId) {
      router.push('/step-1-profile');
      return;
    }

    const initWaSession = async () => {
      try {
        const res = await axios.post('http://localhost:3000/api/onboarding/wa-session', {}, {
          headers: { 'x-tenant-id': tenantId }
        });
        
        const { status: sessionStatus, qrCode: savedQr } = res.data;
        if (sessionStatus === 'CONNECTED') {
          setConnected(true);
          setStatus('Berhasil terhubung!');
        } else if (savedQr) {
          setQrCode(savedQr);
          setStatus('Menunggu Scan QR Code');
        }
      } catch (e) {
        console.error(e);
      }
    };

    initWaSession();

    const socket = io('http://localhost:3000');

    socket.on(`wa-qr-${tenantId}`, (data) => {
      setQrCode(data.qr);
      setStatus('Menunggu Scan QR Code');
    });

    socket.on(`wa-status-${tenantId}`, (data) => {
      if (data.status === 'CONNECTED') {
        setConnected(true);
        setStatus('Berhasil terhubung!');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [tenantId, router]);

  const handleNext = () => {
    setLoading(true);
    router.push('/step-3-ai-setup');
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Hubungkan WhatsApp</h2>
        <p className="text-gray-500">Scan QR Code ini menggunakan WhatsApp Anda (Tautkan Perangkat)</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px] w-[300px] relative transition-all duration-500 border border-gray-100">
        {connected ? (
          <div className="flex flex-col items-center text-emerald-500 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-24 h-24 mb-4" />
            <span className="font-bold text-lg">Terkoneksi!</span>
          </div>
        ) : qrCode ? (
          <QRCodeSVG value={qrCode} size={256} className="animate-in fade-in duration-500" />
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-500" />
            <span className="text-sm">{status}</span>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <div className="inline-flex items-center space-x-2 text-sm font-medium mb-8 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
          <QrCode className="w-4 h-4 text-brand-500" />
          <span className="text-gray-600">{status}</span>
        </div>
      </div>

      <div className="w-full flex justify-between mt-4">
        <Button 
          variant="outline"
          onClick={() => router.push('/step-1-profile')}
          className="text-gray-600"
        >
          Kembali
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!connected || loading}
          className="w-full sm:w-auto"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2 inline" /> : null}
          Pengaturan AI <ArrowRight className="w-4 h-4 ml-2 inline" />
        </Button>
      </div>
    </div>
  );
}
