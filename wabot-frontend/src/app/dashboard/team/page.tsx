'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Shield, ShieldAlert, User, Plus, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('AGENT');
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('AGENT');
  const [inviting, setInviting] = useState(false);
  
  const [inviteResult, setInviteResult] = useState<{ isNew: boolean, password?: string } | null>(null);

  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [membersRes, meRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/team`, { headers: { 'x-tenant-id': tenantId } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/me`, { headers: { 'x-tenant-id': tenantId } })
      ]);
      setMembers(membersRes.data);
      setCurrentUserRole(meRes.data.role);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteResult(null);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/team`, {
        email: inviteEmail,
        name: inviteName,
        role: inviteRole
      }, { headers: { 'x-tenant-id': tenantId } });
      
      setInviteResult({
        isNew: res.data.isNewUser,
        password: res.data.defaultPassword
      });
      
      setInviteEmail('');
      setInviteName('');
      setInviteRole('AGENT');
      fetchData(); // Refresh list
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal mengundang anggota');
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (confirm('Ubah role anggota ini?')) {
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/team/${memberId}`, { role: newRole }, { headers: { 'x-tenant-id': tenantId } });
        fetchData();
      } catch (e: any) {
        alert(e.response?.data?.message || 'Gagal mengubah role');
      }
    }
  };

  const handleRemove = async (memberId: string) => {
    if (confirm('Anda yakin ingin mengeluarkan anggota ini dari tim?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/team/${memberId}`, { headers: { 'x-tenant-id': tenantId } });
        fetchData();
      } catch (e: any) {
        alert(e.response?.data?.message || 'Gagal mengeluarkan anggota');
      }
    }
  };

  if (loading) return <div>Memuat data tim...</div>;

  const isOwnerOrAdmin = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Tim & Akses" />

      {inviteResult && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <p className="font-bold mb-1">Berhasil mengundang anggota!</p>
          {inviteResult.isNew ? (
            <p>Akun baru telah dibuat. Beritahu mereka untuk login dengan email tersebut dan password: <strong className="text-white bg-slate-900 px-2 py-1 rounded">{inviteResult.password}</strong></p>
          ) : (
            <p>Pengguna sudah terdaftar sebelumnya dan telah berhasil ditambahkan ke tim Anda.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ComponentCard title="Daftar Anggota">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Role</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {members.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">{member.user.name}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-600 dark:text-gray-400">{member.user.email}</TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        {member.role === 'OWNER' && <span className="bg-purple-50 text-purple-500 dark:bg-purple-500/10 dark:text-purple-400 text-xs px-2 py-1 rounded-full flex items-center w-fit"><ShieldAlert className="w-3 h-3 mr-1" /> Owner</span>}
                        {member.role === 'ADMIN' && <span className="bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400 text-xs px-2 py-1 rounded-full flex items-center w-fit"><Shield className="w-3 h-3 mr-1" /> Admin</span>}
                        {member.role === 'AGENT' && <span className="bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400 text-xs px-2 py-1 rounded-full flex items-center w-fit"><User className="w-3 h-3 mr-1" /> Agen</span>}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start space-x-2 flex items-center">
                        {currentUserRole === 'OWNER' && member.role !== 'OWNER' && (
                          <select 
                            className="bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-500/20"
                            value={member.role}
                            onChange={e => handleUpdateRole(member.id, e.target.value)}
                          >
                            <option value="AGENT">Jadikan Agen</option>
                            <option value="ADMIN">Jadikan Admin</option>
                          </select>
                        )}
                        {currentUserRole === 'OWNER' && member.role !== 'OWNER' && (
                          <button onClick={() => handleRemove(member.id)} className="text-error-500 hover:text-error-600 p-2 hover:bg-error-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ComponentCard>
        </div>

        <div>
          {isOwnerOrAdmin && (
            <ComponentCard title="Undang Anggota Baru">
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Email Anggota</Label>
                  <Input 
                    required 
                    type="email" 
                    value={inviteEmail} 
                    onChange={e => setInviteEmail(e.target.value)} 
                    placeholder="agen@bisnis.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nama Anggota</Label>
                  <Input 
                    required 
                    type="text" 
                    value={inviteName} 
                    onChange={e => setInviteName(e.target.value)} 
                    placeholder="Budi Santoso"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role/Peran</Label>
                  <select 
                    required
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 outline-none transition-all"
                  >
                    <option value="AGENT">Agen (Hanya Live Chat)</option>
                    {currentUserRole === 'OWNER' && <option value="ADMIN">Admin (Akses Katalog & Tim)</option>}
                  </select>
                </div>
                <Button disabled={inviting} type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white mt-2">
                  {inviting ? 'Mengundang...' : 'Undang Sekarang'}
                </Button>
              </form>
            </ComponentCard>
          )}
        </div>
      </div>
    </div>
  );
}
