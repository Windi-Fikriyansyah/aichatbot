"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Copy, Save, AlertCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";

export default function WidgetPage() {
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [welcomeMessage, setWelcomeMessage] = useState("Halo! Ada yang bisa saya bantu?");
  const [botName, setBotName] = useState("Asisten Virtual");
  const [position, setPosition] = useState("right");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tId = localStorage.getItem('tenantId');
    const token = localStorage.getItem('token');

    if (tId && token) {
      setTenantId(tId);
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/widget/config/${tId}`)
        .then(res => {
          if (res.data) {
            setPrimaryColor(res.data.primaryColor);
            setWelcomeMessage(res.data.welcomeMessage);
            setBotName(res.data.botName);
            setPosition(res.data.position);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const tId = localStorage.getItem('tenantId');
    if (!token || !tId) return;

    setIsSaving(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/widget/config`, {
        primaryColor, welcomeMessage, botName, position
      }, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': tId }
      });
      alert('Pengaturan widget berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyimpan pengaturan widget');
    }
    setIsSaving(false);
  };

  const scriptCode = `<script src="https://aiagent.wamapss.com/widget.js" data-tenant-id="${tenantId}" defer></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <>

      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-2">Web Widget Integrasi</h2>
          <p className="text-gray-500">Sesuaikan tampilan widget chat dan salin kodenya ke dalam tag &lt;body&gt; website Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kiri: Form Pengaturan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
            <h3 className="text-lg font-semibold border-b pb-4 dark:border-gray-700">Pengaturan Tampilan</h3>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Warna Utama (Primary Color)</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-200 cursor-pointer"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nama Bot</label>
              <Input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Misal: Asisten Virtual"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pesan Sambutan</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:ring focus:ring-brand-500/20 dark:bg-gray-900 dark:border-gray-700"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Posisi Widget</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="right">Kanan Bawah</option>
                <option value="left">Kiri Bawah</option>
              </select>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full bg-brand-500 text-white hover:bg-brand-600">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </div>

          {/* Kanan: Live Preview & Kode Embed */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold border-b pb-4 dark:border-gray-700 mb-6">Kode Instalasi</h3>
              <p className="text-sm text-gray-500 mb-4">Salin kode ini dan letakkan di atas tag <code>&lt;/body&gt;</code> pada website Anda.</p>

              <div className="relative group">
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-sm font-mono overflow-x-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                  {scriptCode}
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 border shadow-sm rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  {copied ? <span className="text-green-500 text-xs font-bold px-1">Tersalin!</span> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 h-[400px] relative overflow-hidden flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p>Live Preview Simulator</p>
                <p className="text-xs">Widget akan muncul di pojok {position === 'right' ? 'Kanan' : 'Kiri'} Bawah</p>
              </div>

              <div className={`absolute bottom-6 ${position === 'right' ? 'right-6' : 'left-6'} flex flex-col items-end gap-4`}>
                <div className="bg-white dark:bg-gray-800 w-[300px] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 opacity-90 scale-90 origin-bottom-right">
                  <div className="p-4 text-white" style={{ backgroundColor: primaryColor }}>
                    <h4 className="font-bold">{botName}</h4>
                    <p className="text-xs opacity-90">Selalu online</p>
                  </div>
                  <div className="h-[200px] bg-gray-50 dark:bg-gray-900/50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl rounded-tl-sm shadow-sm inline-block text-sm border dark:border-gray-700 max-w-[85%]">
                      {welcomeMessage}
                    </div>
                  </div>
                </div>

                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
