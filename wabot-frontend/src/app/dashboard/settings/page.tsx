'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import { Settings, Phone, Bot, Building2, Save, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import { Label } from '@/components/ui/label';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'wa' | 'ai' | 'profile'>('wa');
  const [loading, setLoading] = useState(true);
  
  // WA State
  const [waSession, setWaSession] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [waStatus, setWaStatus] = useState<string>('Memeriksa...');
  const [waConnecting, setWaConnecting] = useState(false);

  // Profile State
  const [profile, setProfile] = useState<any>({ name: '', description: '', category: '', escalationPhone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // AI State
  const [aiConfig, setAiConfig] = useState<any>({ 
    provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet', temperature: 0.7, tone: 'professional', language: 'id', customSystemPrompt: '', escalationKeywords: [] 
  });
  const [escalationKeys, setEscalationKeys] = useState('');
  const [savingAi, setSavingAi] = useState(false);

  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : '';

  useEffect(() => {
    if (tenantId) {
      fetchData();
      
      const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}`);
      
      socket.on(`wa-qr-${tenantId}`, (data) => {
        setQrCode(data.qr);
        setWaStatus('Menunggu Scan QR Code');
        setWaSession((prev: any) => ({ ...prev, status: 'DISCONNECTED' }));
      });

      socket.on(`wa-status-${tenantId}`, (data) => {
        setWaStatus(data.status === 'CONNECTED' ? 'Berhasil Terhubung' : data.status);
        if (data.status === 'CONNECTED') {
          setQrCode('');
          setWaSession((prev: any) => ({ ...prev, status: 'CONNECTED' }));
        } else if (data.status === 'DISCONNECTED') {
          setWaSession((prev: any) => ({ ...prev, status: 'DISCONNECTED' }));
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [tenantId]);

  const fetchData = async () => {
    try {
      const headers = { 'x-tenant-id': tenantId };
      const [profRes, aiRes, waRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/settings/profile`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/settings/ai-config`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/settings/wa-session`, { headers })
      ]);
      
      if (profRes.data) setProfile(profRes.data);
      if (aiRes.data) {
        setAiConfig(aiRes.data);
        setEscalationKeys(aiRes.data.escalationKeywords?.join(', ') || '');
      }
      if (waRes.data) {
        setWaSession(waRes.data);
        if (waRes.data.status === 'CONNECTED') {
          setWaStatus('Berhasil Terhubung');
          setQrCode('');
        }
        else if (waRes.data.qrCode) {
          setQrCode(waRes.data.qrCode);
          setWaStatus('Menunggu Scan QR Code');
        } else {
          setWaStatus('Terputus');
          setQrCode('');
        }
      } else {
        setWaStatus('Sesi belum dibuat');
        setQrCode('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/settings/profile`, profile, { headers: { 'x-tenant-id': tenantId } });
      alert('Profil berhasil disimpan');
    } catch (e) {
      alert('Gagal menyimpan profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveAi = async () => {
    setSavingAi(true);
    try {
      const keys = escalationKeys.split(',').map(k => k.trim()).filter(k => k);
      const payload = { ...aiConfig, escalationKeywords: keys };
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/settings/ai-config`, payload, { headers: { 'x-tenant-id': tenantId } });
      alert('Konfigurasi AI berhasil disimpan');
    } catch (e) {
      alert('Gagal menyimpan konfigurasi AI');
    } finally {
      setSavingAi(false);
    }
  };

  const connectWa = async () => {
    setWaConnecting(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/settings/wa-connect`, {}, { headers: { 'x-tenant-id': tenantId } });
      const { status: sessionStatus, qrCode: savedQr } = res.data;
      setWaSession(res.data);
      if (sessionStatus === 'CONNECTED') {
        setWaStatus('Berhasil Terhubung');
        setQrCode('');
      } else if (savedQr) {
        setQrCode(savedQr);
        setWaStatus('Menunggu Scan QR Code');
      } else {
        setWaStatus('Memulai koneksi...');
      }
    } catch (e) {
      alert('Gagal menghubungkan WA');
    } finally {
      setWaConnecting(false);
    }
  };

  const disconnectWa = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/settings/wa-logout`, {}, { headers: { 'x-tenant-id': tenantId } });
      setWaSession({ status: 'DISCONNECTED' });
      setWaStatus('Terputus');
      setQrCode('');
    } catch (e) {
      alert('Gagal memutus koneksi');
    }
  };

  const forceReconnectWa = async () => {
    setWaConnecting(true);
    try {
      // First logout to clear old auth
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/settings/wa-logout`, {}, { headers: { 'x-tenant-id': tenantId } });
      setQrCode('');
      setWaStatus('Mereset koneksi...');
      
      // Wait a moment, then reconnect fresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/settings/wa-connect`, {}, { headers: { 'x-tenant-id': tenantId } });
      const { status: sessionStatus, qrCode: savedQr } = res.data;
      setWaSession(res.data);
      if (sessionStatus === 'CONNECTED') {
        setWaStatus('Berhasil Terhubung');
        setQrCode('');
      } else if (savedQr) {
        setQrCode(savedQr);
        setWaStatus('Menunggu Scan QR Code');
      } else {
        setWaStatus('Memulai koneksi...');
      }
    } catch (e) {
      alert('Gagal mereset koneksi WA');
    } finally {
      setWaConnecting(false);
    }
  };

  if (loading) return <div className="text-slate-400">Memuat pengaturan...</div>;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Pengaturan Sistem" />

      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-6">
        <button 
          onClick={() => setActiveTab('wa')} 
          className={`pb-4 text-sm font-medium transition-all ${activeTab === 'wa' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          <Phone className="w-4 h-4 inline mr-2" />
          Koneksi WhatsApp
        </button>
        <button 
          onClick={() => setActiveTab('ai')} 
          className={`pb-4 text-sm font-medium transition-all ${activeTab === 'ai' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          <Bot className="w-4 h-4 inline mr-2" />
          Konfigurasi AI
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`pb-4 text-sm font-medium transition-all ${activeTab === 'profile' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          Profil Bisnis
        </button>
      </div>

      <ComponentCard title={activeTab === 'wa' ? 'Koneksi WhatsApp' : activeTab === 'ai' ? 'Tuning Asisten AI' : 'Identitas Bisnis'}>
        
        {/* WhatsApp Tab */}
        {activeTab === 'wa' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Status Koneksi WhatsApp</h3>
            
            <div className={`p-4 rounded-xl border flex items-center justify-between ${waSession?.status === 'CONNECTED' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <div>
                <p className="text-sm text-slate-400 mb-1">Status Saat Ini</p>
                <div className="flex items-center space-x-2">
                  {waSession?.status === 'CONNECTED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-t-amber-400 animate-spin" />
                  )}
                  <span className={`font-semibold ${waSession?.status === 'CONNECTED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {waStatus}
                  </span>
                </div>
                {waSession?.phoneNumber && (
                  <p className="text-sm font-medium mt-2">Nomor: {waSession.phoneNumber}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                {waSession?.status === 'CONNECTED' ? (
                  <Button onClick={disconnectWa} variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                    <LogOut className="w-4 h-4 mr-2" /> Putuskan Koneksi
                  </Button>
                ) : (
                  <>
                    <Button onClick={connectWa} disabled={waConnecting} className="bg-brand-500 hover:bg-brand-600 text-white">
                      <RefreshCw className={`w-4 h-4 mr-2 ${waConnecting ? 'animate-spin' : ''}`} /> 
                      {qrCode ? 'Muat Ulang QR' : 'Hubungkan WhatsApp'}
                    </Button>
                    {qrCode && (
                      <Button onClick={forceReconnectWa} disabled={waConnecting} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                        Reset & Hubungkan Ulang
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {waSession?.status !== 'CONNECTED' && qrCode && (
              <div className="mt-8 flex flex-col items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                <div className="bg-white p-4 rounded-2xl shadow-xl">
                  <QRCodeSVG value={qrCode} size={240} />
                </div>
                <p className="mt-6 text-gray-500 dark:text-gray-400 text-center max-w-sm">
                  Buka WhatsApp di ponsel Anda, tap <strong>Perangkat Tertaut</strong>, lalu scan QR Code di atas.
                </p>
              </div>
            )}

            {waSession?.status !== 'CONNECTED' && !qrCode && !waConnecting && (
              <div className="mt-6 text-center text-gray-500 dark:text-gray-400 p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                <Phone className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Klik tombol <strong>"Hubungkan WhatsApp"</strong> di atas untuk memulai koneksi.</p>
              </div>
            )}
          </div>
        )}

        {/* AI Config Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Tuning Asisten AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label>Penyedia AI</Label>
                <select 
                  value={aiConfig.provider}
                  onChange={e => setAiConfig({...aiConfig, provider: e.target.value})}
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 outline-none transition-all"
                >
                  <option value="openrouter">OpenRouter</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Model AI</Label>
                <select 
                  value={aiConfig.model}
                  onChange={e => setAiConfig({...aiConfig, model: e.target.value})}
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 outline-none transition-all"
                >
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Terbaik)</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini (Cepat)</option>
                  <option value="nvidia/nemotron-3-super-120b-a12b:free">Nvidia Nemotron 120B (Free)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Gaya Bahasa (Tone)</Label>
                <select 
                  value={aiConfig.tone}
                  onChange={e => setAiConfig({...aiConfig, tone: e.target.value})}
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 outline-none transition-all"
                >
                  <option value="professional">Profesional & Sopan</option>
                  <option value="friendly">Santai & Ramah</option>
                  <option value="persuasive">Persuasif (Sales)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Kreativitas (Temperature)</Label>
                <div className="h-11 flex flex-col justify-center">
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={aiConfig.temperature}
                    onChange={e => setAiConfig({...aiConfig, temperature: parseFloat(e.target.value)})}
                    className="w-full accent-brand-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Kaku (0.0)</span>
                    <span>{aiConfig.temperature}</span>
                    <span>Kreatif (1.0)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex justify-between items-end">
                  <Label>System Prompt Override</Label>
                  <span className="text-xs text-gray-500">Opsional</span>
                </div>
                <TextArea 
                  value={aiConfig.baseSystemPrompt || ''}
                  onChange={e => setAiConfig({...aiConfig, baseSystemPrompt: e.target.value})}
                  placeholder={`Contoh (Default Sistem):\n\nAnda adalah admin online untuk {{nama_bisnis}}, seorang sales representative yang ramah, cekatan, dan berpengalaman closing lewat WhatsApp.\nGunakan bahasa {{bahasa}} dengan gaya komunikasi {{gaya_bahasa}}, natural seperti manusia asli — BUKAN seperti robot/FAQ bot.\n\nPERAN & TUJUAN UTAMA:\n- Tujuan Anda bukan cuma menjawab pertanyaan...`}
                  rows={6}
                  className="w-full text-sm font-mono placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
                <p className="text-xs text-slate-500">
                  Jika diisi, prompt bawaan sistem akan diganti sepenuhnya oleh ini.
                </p>
              </div>
            </div>

              <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mt-8">
                <h4 className="text-lg font-semibold text-brand-500 mb-4 border-b border-gray-100 dark:border-white/10 pb-2">📚 Knowledge Base Bisnis</h4>
                <div className="space-y-2">
                  <Label>Informasi, Kriteria, dan Pengetahuan Bisnis</Label>
                  <TextArea 
                    value={aiConfig.knowledgeBase || ''}
                    onChange={e => setAiConfig({...aiConfig, knowledgeBase: e.target.value})}
                    placeholder="Masukkan semua informasi bisnis Anda di sini (misal: FAQ, jam operasional, lokasi, ketentuan COD, promo, dll)..."
                    rows={12}
                    className="resize-y"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Kumpulkan seluruh informasi yang perlu diketahui oleh AI tentang bisnis Anda ke dalam kolom ini. AI akan otomatis membacanya sebagai pedoman dalam membalas chat.
                  </p>
                </div>
              </div>

              <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mt-8">
                <h4 className="text-lg font-semibold text-emerald-500 mb-4 border-b border-gray-100 dark:border-white/10 pb-2">⚙️ Pengaturan Tambahan</h4>
                <div className="space-y-1.5">
                  <Label>10. Kata Kunci Eskalasi (Pisahkan dengan koma)</Label>
                  <Input 
                    value={escalationKeys}
                    onChange={e => setEscalationKeys(e.target.value)}
                    placeholder="komplain, manusia, admin, cs, rusak"
                    hint="Jika pelanggan mengetik kata ini, obrolan otomatis dialihkan ke agen (Human Takeover)."
                  />
                </div>
              </div>

            <Button onClick={saveAi} disabled={savingAi} className="bg-brand-500 hover:bg-brand-600 text-white mt-4 w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" /> {savingAi ? 'Menyimpan...' : 'Simpan Konfigurasi AI'}
            </Button>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Identitas Bisnis</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nama Bisnis</Label>
                <Input 
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kategori Bisnis</Label>
                <Input 
                  value={profile.category}
                  onChange={e => setProfile({...profile, category: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nomor Telepon CS / Eskalasi (Opsional)</Label>
                <Input 
                  value={profile.escalationPhone || ''}
                  onChange={e => setProfile({...profile, escalationPhone: e.target.value})}
                  placeholder="081234567890"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Deskripsi Singkat</Label>
                <TextArea 
                  value={profile.description || ''}
                  onChange={e => setProfile({...profile, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            
            <Button onClick={saveProfile} disabled={savingProfile} className="bg-brand-500 hover:bg-brand-600 text-white mt-4 w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" /> {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
