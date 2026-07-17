import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, User, HardHat, Check, X, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'User' | 'Engineer', name: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<'User' | 'Engineer'>('Engineer');
  const [email, setEmail] = useState('engineer@panin.co.id');
  const [password, setPassword] = useState('******');
  const [showPassword, setShowPassword] = useState(false);
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');

  const handleRoleChange = (role: 'User' | 'Engineer') => {
    setSelectedRole(role);
    if (role === 'Engineer') {
      setEmail('engineer@panin.co.id');
      setCustomName('DWI CAHYADI');
    } else {
      setEmail('tenant.user@panin.co.id');
      setCustomName('USER PANIN');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email wajib diisi!');
      return;
    }
    const finalName = customName || (selectedRole === 'Engineer' ? 'DWI CAHYADI' : 'USER PANIN');
    onLogin(selectedRole, finalName);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch z-10">
        
        {/* Left Panel: App Branding & Permissions details */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Sistem Otoritas Multi-Role
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Panin Palmerah Building Management
              </h1>
              <p className="text-slate-400 text-xs mt-2 font-medium">
                Sistem digitalisasi pemeliharaan gedung, helpdesk tiket harian, pencatatan meter energi, sisa stok material, serta roster teknisi terpadu.
              </p>
            </div>

            {/* Matrix of capabilities explaining READ, WRITE, DELETE for both roles */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2">
                Hak Akses & Tindakan Pengguna (Role Privileges)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* User Role column */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-extrabold text-xs">Role: "User" (Regular)</span>
                  </div>
                  
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div>
                      <span className="text-emerald-400 font-bold block">✓ MEMBACA (Read-Only):</span>
                      <p className="text-slate-400">
                        Dasbor utama, status helpdesk, agenda PM, catatan meter listrik/air, inventaris gudang, & daftar karyawan.
                      </p>
                    </div>
                    <div>
                      <span className="text-rose-400 font-bold block">✗ MENGEDIT (Write):</span>
                      <p className="text-slate-500 italic">
                        Akses ditolak. Tidak bisa input data, menyelesaikan PM, atur stok gudang, atau ubah roster.
                      </p>
                    </div>
                    <div>
                      <span className="text-rose-400 font-bold block">✗ MENGHAPUS (Delete):</span>
                      <p className="text-slate-500 italic">
                        Dilarang menghapus data karyawan atau dokumen apa pun.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Engineer Role column */}
                <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20 space-y-3">
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <HardHat className="w-4 h-4 text-indigo-400" />
                    <span className="font-extrabold text-xs text-indigo-400">Role: "Engineer" (Petugas)</span>
                  </div>

                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div>
                      <span className="text-emerald-400 font-bold block">✓ MEMBACA (Full Access):</span>
                      <p className="text-indigo-200/70">
                        Semua modul aplikasi termasuk generator cetak laporan harian & bulanan.
                      </p>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-bold block">✓ MENGEDIT (Write & Update):</span>
                      <p className="text-indigo-200/70">
                        Membuat tiket helpdesk, input perbaikan & biaya material, centang checklist PM, input meter energi, <b>tambah & update peralatan kerja rusak</b>, <b>tambah/edit stok material baru</b>, dan kelola karyawan.
                      </p>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-bold block">✓ MENGHAPUS (Delete):</span>
                      <p className="text-indigo-200/70">
                        Mampu menghapus karyawan dari roster dan menyesuaikan data aset terdaftar.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div className="text-[10px] text-slate-500 pt-6 mt-6 border-t border-slate-800">
            Sistem pengaman akses ganda • Panin Palmerah Building Management, Jakarta Barat, DKI Jakarta.
          </div>
        </div>

        {/* Right Panel: Interactive Login Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between border border-slate-200">
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Masuk ke Sistem</h2>
              <p className="text-xs text-slate-500 mt-1">Silakan pilih peran kerja Anda untuk menguji tingkat hak akses aplikasi.</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Selector Tab for Demo Roles */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleChange('Engineer')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'Engineer' 
                    ? 'bg-slate-900 text-white shadow' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HardHat className="w-4 h-4" />
                Engineer
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('User')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'User' 
                    ? 'bg-slate-900 text-white shadow' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                User Umum
              </button>
            </div>

            {/* Simulated Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: engineer@panin.co.id"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium outline-none text-slate-800 focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Kata Sandi</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-xs font-mono outline-none text-slate-800 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Optional custom display name input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Nama Tampilan Demo</label>
                <input
                  type="text"
                  placeholder={selectedRole === 'Engineer' ? 'DWI CAHYADI (Default)' : 'USER PANIN (Default)'}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold outline-none text-slate-800 focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Key className="w-4 h-4" />
                  Masuk Sebagai {selectedRole === 'Engineer' ? 'Engineer' : 'User'}
                </button>
              </div>

            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bantuan Pengujian Cepat:</span>
            <p className="text-[10px] text-slate-500 leading-normal">
              Aplikasi ini mengaktifkan pembatasan hak ases menu dan kontrol edit di sisi klien. Pilih salah satu tab peran di atas lalu klik tombol <b>Masuk</b> untuk menguji secara langsung.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
