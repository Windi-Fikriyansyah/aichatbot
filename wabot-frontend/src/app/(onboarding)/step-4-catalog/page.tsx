'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Label } from '@/components/ui/label';
import { Loader2, PackagePlus, CheckCircle, Trash2 } from 'lucide-react';

export default function Step4Catalog() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });

  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;

  // Fetch existing products on load
  const fetchProducts = async () => {
    if (!tenantId) return;
    try {
      const res = await axios.get('http://localhost:3000/api/catalog', {
        headers: { 'x-tenant-id': tenantId }
      });
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [tenantId]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    setLoading(true);
    setSuccessMsg('');
    try {
      await axios.post('http://localhost:3000/api/onboarding/catalog', formData, {
        headers: { 'x-tenant-id': tenantId }
      });
      setSuccessMsg('Produk berhasil ditambahkan!');
      setFormData({ name: '', description: '', price: '' });
      fetchProducts(); // Refresh daftar produk
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
      alert('Gagal menambahkan produk');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!tenantId) return;
    try {
      await axios.delete(`http://localhost:3000/api/catalog/${id}`, {
        headers: { 'x-tenant-id': tenantId }
      });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await axios.post('http://localhost:3000/api/onboarding/complete', {}, {
        headers: { 'x-tenant-id': tenantId }
      });
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Gagal menyelesaikan proses onboarding');
      setCompleting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white/90">Katalog Produk Dasar</h2>
        <p className="text-gray-500 dark:text-gray-400">Tambahkan 1-3 produk dasar sebagai wawasan agar AI bisa menjawab stok &amp; harga.</p>
      </div>

      <form onSubmit={handleAddProduct} className="space-y-4 mb-8 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input 
            id="name" 
            type="text"
            required 
            placeholder="Contoh: Kopi Susu Aren"
            value={formData.name}
            onChange={(e: any) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi Singkat</Label>
          <Input 
            id="description" 
            type="text"
            required 
            placeholder="Kopi lokal dengan gula aren premium"
            value={formData.description}
            onChange={(e: any) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Harga (Rp)</Label>
          <Input 
            id="price" 
            required 
            type="number"
            placeholder="25000"
            value={formData.price}
            onChange={(e: any) => setFormData({...formData, price: e.target.value})}
          />
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={loading}
            variant="outline"
            className="w-full text-brand-500 border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2 inline" /> : <PackagePlus className="w-4 h-4 mr-2 inline" />}
            Tambah Produk
          </Button>
          {successMsg && (
            <p className="text-emerald-500 text-sm mt-3 text-center animate-pulse flex justify-center items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> {successMsg}
            </p>
          )}
        </div>
      </form>

      {/* Daftar produk yang sudah ditambahkan */}
      {products.length > 0 && (
        <div className="mb-8 bg-white dark:bg-gray-800/30 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white/90">Produk Anda ({products.length})</h3>
          <div className="space-y-2">
            {products.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50">
                <div>
                  <span className="font-medium text-gray-800 dark:text-white/90">{p.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-3">{p.description}</span>
                  <span className="text-emerald-500 font-mono text-sm ml-3">Rp{p.price}</span>
                </div>
                <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-400 p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex justify-between mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/step-3-ai-setup')}
          className="text-gray-600 dark:text-gray-300"
        >
          Kembali
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={completing}
          className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white shadow-theme-sm shadow-brand-500/20"
        >
          {completing ? <Loader2 className="animate-spin w-4 h-4 mr-2 inline" /> : null}
          Selesaikan Onboarding!
        </Button>
      </div>
    </div>
  );
}
