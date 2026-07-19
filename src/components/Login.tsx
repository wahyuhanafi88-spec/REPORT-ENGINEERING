import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, User, HardHat, Check, X, AlertCircle, Database } from 'lucide-react';

interface LoginProps {
  onGoogleLogin: () => Promise<void>;
  isLoggingIn: boolean;
  loginError: string;
}

export default function Login({ onGoogleLogin, isLoggingIn, loginError }: LoginProps) {
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onGoogleLogin();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan Google');
    }
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
 
            {/* Google Sign-In Container */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">Persyaratan Masuk</span>
                <p className="text-slate-500 leading-relaxed">
                  Guna menjamin keamanan data multi-perangkat, aplikasi ini memerlukan otentikasi Google. Akses terbatas berdasarkan email terdaftar:
                </p>
                <div className="font-semibold text-indigo-600 space-y-1 text-[11px]">
                  <div>• <b>wahyuhanafi88@gmail.com</b> (Super Admin)</div>
                  <div>• <b>engineeringbss78@gmail.com</b> (Admin)</div>
                  <div>• <b>engineer4@gmail.com</b> (Teknisi)</div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-lg px-6 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-all shadow-sm focus:outline-none disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
