'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Step1Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    operatingHours: '',
    escalationPhone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/onboarding/start`, formData);
      // Simpan businessAccountId di localStorage untuk flow selanjutnya
      localStorage.setItem('tenantId', res.data.id);
      router.push('/step-2-wa-connect');
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan profil bisnis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white/90">Profil Bisnis Anda</h2>
        <p className="text-gray-500 dark:text-gray-400">Mari mulai dengan melengkapi informasi dasar bisnis Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Bisnis</Label>
          <Input 
            id="name" 
            type="text"
            required 
            placeholder="Contoh: Toko Kopi Senja"
            value={formData.name}
            onChange={(e: any) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategori Bisnis</Label>
          <Input 
            id="category" 
            type="text"
            required 
            placeholder="Contoh: Food & Beverage"
            value={formData.category}
            onChange={(e: any) => setFormData({...formData, category: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operatingHours">Jam Operasional</Label>
          <Input 
            id="operatingHours" 
            type="text"
            required 
            placeholder="Contoh: Senin-Sabtu, 08:00-21:00"
            value={formData.operatingHours}
            onChange={(e: any) => setFormData({...formData, operatingHours: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="escalationPhone">Nomor WhatsApp Eskalasi (Owner)</Label>
          <Input 
            id="escalationPhone" 
            type="text"
            required 
            placeholder="6281234567890"
            value={formData.escalationPhone}
            onChange={(e: any) => setFormData({...formData, escalationPhone: e.target.value})}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2 inline" /> : null}
            Simpan & Lanjut <ArrowRight className="w-4 h-4 ml-2 inline" />
          </Button>
        </div>
      </form>
    </div>
  );
}
