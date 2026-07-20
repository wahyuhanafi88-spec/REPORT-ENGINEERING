import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, User, HardHat, Check, X, AlertCircle, Database } from 'lucide-react';

interface LoginProps {
  onGoogleLogin: () => Promise<void>;
  onManualLogin: (email: string, role: 'Super Admin' | 'Admin' | 'Teknisi', name: string) => void;
  isLoggingIn: boolean;
  loginError: string;
}

const MANUAL_ACCOUNTS = [
  {
    email: 'wahyuhanafi88@gmail.com',
    aliases: ['wahyuhnafi88@gmail.com'],
    password: 'superadmin123',
    role: 'Super Admin' as const,
    name: 'Wahyu Hanafi'
  },
  {
    email: 'engineering78@gmail.com',
    aliases: ['engineeringbss78@gmail.com'],
    password: 'admin123',
    role: 'Admin' as const,
    name: 'BSS Engineering'
  },
  {
    email: 'engineer4@gmail.com',
    aliases: [],
    password: 'teknisi123',
    role: 'Teknisi' as const,
    name: 'Teknisi BSS'
  }
];

export default function Login({ onGoogleLogin, onManualLogin, isLoggingIn, loginError }: LoginProps) {
  const [error, setError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await onGoogleLogin();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan Google');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailInput.trim() || !passwordInput.trim()) {
      setError('Silakan isi email dan kata sandi.');
      return;
    }

    const emailLower = emailInput.trim().toLowerCase();
    const matchedAccount = MANUAL_ACCOUNTS.find(acc => 
      acc.email.toLowerCase() === emailLower || acc.aliases.some(alias => alias.toLowerCase() === emailLower)
    );

    if (!matchedAccount) {
      setError('Akses Dibatasi. Email tidak terdaftar dalam sistem.');
      return;
    }

    if (matchedAccount.password !== passwordInput) {
      setError('Kata sandi salah. Silakan periksa kembali kata sandi Anda.');
      return;
    }

    // Success
    onManualLogin(matchedAccount.email, matchedAccount.role, matchedAccount.name);
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
              Sistem Otoritas Google Workspace
            </div>
 
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Panin Palmerah Building Management
              </h1>
              <p className="text-slate-400 text-xs mt-2 font-medium">
                Sistem digitalisasi pemeliharaan gedung, helpdesk tiket harian, pencatatan meter energi, sisa stok material, serta roster teknisi terpadu dengan sinkronisasi langsung ke Google Sheets.
              </p>
            </div>
 
            {/* Matrix of capabilities explaining READ, WRITE, DELETE for both roles */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2">
                Akses & Integrasi Multi-Perangkat
              </h3>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* User Role column */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="font-extrabold text-xs">Sinkronisasi Real-Time</span>
                  </div>
                  
                  <div className="space-y-2 text-[11px] leading-relaxed text-slate-400">
                    <p>
                      Semua data inventaris, checklist pemeliharaan (PM), pengeluaran biaya, dan helpdesk tiket disimpan langsung di Google Spreadsheet Anda secara real-time.
                    </p>
                    <p>
                      Memudahkan akses data dari laptop, tablet, maupun ponsel pintar Anda di mana saja secara aman.
                    </p>
                  </div>
                </div>
 
                {/* Engineer Role column */}
                <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20 space-y-3">
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="font-extrabold text-xs text-indigo-400">Akses Eksklusif</span>
                  </div>
 
                  <div className="space-y-2 text-[11px] leading-relaxed text-indigo-200/70">
                    <p>
                      Sistem diamankan menggunakan Google OAuth. Akses disesuaikan berdasarkan peran email resmi yang terdaftar:
                    </p>
                    <p className="font-bold text-indigo-400">
                      • Super Admin (Akses Penuh):<br />
                      &nbsp;&nbsp;wahyuhanafi88@gmail.com<br />
                      • Admin (Edit Laporan, dll):<br />
                      &nbsp;&nbsp;engineeringbss78@gmail.com<br />
                      • Teknisi (Tiket, Listrik, Air, WO):<br />
                      &nbsp;&nbsp;engineer4@gmail.com
                    </p>
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
              <p className="text-xs text-slate-500 mt-1">Silakan masuk menggunakan akun Google Anda untuk mengakses sistem managemen gedung.</p>
            </div>
 
            {/* Error banner */}
            {(error || loginError) && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-xs font-semibold flex flex-col gap-1 border border-rose-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{error || loginError}</span>
                </div>
              </div>
            )}
 
            {/* Interactive Login Card Forms */}
            <div className="space-y-4 pt-2">
              
              {/* 1. Manual Email and Password Login */}
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Email Pengguna
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Ketik email terdaftar..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Sandi akun resmi..."
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg py-2.5 text-xs font-bold transition-all shadow-sm focus:outline-none"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Masuk Sistem Secara Manual</span>
                </button>
              </form>

              {/* Elegant Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-widest text-slate-400">
                  <span className="bg-white px-2">Atau Otoritas Google Workspace</span>
                </div>
              </div>

              {/* 2. Google OAuth Provider */}
              <form onSubmit={handleGoogleSubmit} className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                  <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">Kredensial Resmi Terdaftar</span>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Guna sinkronisasi otomatis Google Sheets multi-perangkat. Anda dapat masuk manual dengan kredensial berikut:
                  </p>
                  <div className="font-semibold text-indigo-600 space-y-1.5 text-[10px]">
                    <div>• <b>wahyuhanafi88@gmail.com</b> <span className="text-slate-400 font-normal">(Sandi:</span> <code>superadmin123</code><span className="text-slate-400 font-normal">)</span></div>
                    <div>• <b>engineering78@gmail.com / engineeringbss78@gmail.com</b> <span className="text-slate-400 font-normal">(Sandi:</span> <code>admin123</code><span className="text-slate-400 font-normal">)</span></div>
                    <div>• <b>engineer4@gmail.com</b> <span className="text-slate-400 font-normal">(Sandi:</span> <code>teknisi123</code><span className="text-slate-400 font-normal">)</span></div>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-lg px-6 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-all shadow-sm focus:outline-none disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.4 3.7 1.5 7.6l3.9 3C6.3 7.5 9 5 12 5z"></path>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"></path>
                      <path fill="#FBBC05" d="M5.4 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.5 7.2C.5 9.2 0 11.5 0 13.8s.5 4.6 1.5 6.6l3.9-3.1C5.1 16.5 5.1 15.6 5.4 14.8z"></path>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.7-2.5-6.6-5.6l-3.9 3C3.4 19.3 7.4 23 12 23z"></path>
                    </svg>
                    <span>{isLoggingIn ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
 
          <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Integrasi Google Drive & Sheets:</span>
            <p className="text-[10px] text-slate-500 leading-normal">
              Saat pertama kali masuk, aplikasi akan otomatis mencari atau membuat file Google Spreadsheet bernama <b>"BSS Engineering App Data"</b> pada akun Drive Anda untuk media penyimpanan terpusat.
            </p>
          </div>
 
        </div>
 
      </div>
 
    </div>
  );
}
