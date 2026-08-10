'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : '';

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/catalog', { headers: { 'x-tenant-id': tenantId } });
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) fetchProducts();
  }, [tenantId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('http://localhost:3000/api/catalog', form, { headers: { 'x-tenant-id': tenantId } });
    setForm({ name: '', description: '', price: '' });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    await axios.delete(`http://localhost:3000/api/catalog/${id}`, { headers: { 'x-tenant-id': tenantId } });
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Katalog Produk" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ComponentCard title="Tambah Produk Baru">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nama Produk</Label>
                <Input 
                  placeholder="Ketik nama produk..." 
                  required 
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Deskripsi</Label>
                <Input 
                  placeholder="Deskripsi singkat produk" 
                  required 
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Harga (Rp)</Label>
                <Input 
                  placeholder="Misal: 150000" 
                  type="number" required 
                  value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white mt-2">
                <Plus className="w-4 h-4 mr-2" /> Tambah
              </Button>
            </form>
          </ComponentCard>
        </div>

        <div className="lg:col-span-2">
          <ComponentCard title="Daftar Produk">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Deskripsi</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Harga</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-16">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={4}>Belum ada produk</TableCell>
                    </TableRow>
                  ) : (
                    products.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">{p.name}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-sm text-gray-600 dark:text-gray-400">{p.description}</TableCell>
                        <TableCell className="px-5 py-4 text-start font-mono text-success-500">Rp{p.price}</TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <button onClick={() => handleDelete(p.id)} className="text-error-500 hover:text-error-600 p-2 hover:bg-error-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
