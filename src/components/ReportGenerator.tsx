import React, { useState, useMemo } from 'react';
import { Ticket, PMTask, EnergyReading, CostRecord, Employee, BuildingName } from '../types';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Building, 
  TrendingUp, 
  UserCheck, 
  Activity, 
  Settings,
  Flame,
  CheckCircle,
  FileCheck
} from 'lucide-react';

interface ReportProps {
  tickets: Ticket[];
  pmTasks: PMTask[];
  energyReadings: EnergyReading[];
  costs: CostRecord[];
  employees: Employee[];
}

export default function ReportGenerator({ tickets, pmTasks, energyReadings, costs, employees }: ReportProps) {
  const [reportType, setReportType] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan'>('harian');
  const [targetBuilding, setTargetBuilding] = useState<BuildingName>('Palmerah');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetYear, setTargetYear] = useState('2026');
  const [targetMonth, setTargetMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // Custom user editorial notes
  const [specialProjects, setSpecialProjects] = useState(
    "1. Pembersihan berkala bak filtrasi air bersih basemen.\n2. Kalibrasi temperatur chiller utama lantai dasar oleh vendor Daikin."
  );
  const [recommendations, setRecommendations] = useState(
    "1. Perlunya penambahan stok freon R410a karena frekuensi pengisian meningkat.\n2. Penjadwalan ulang uji beban genset 800kVA di hari libur."
  );

  const supervisorList = employees.filter(e => e.role.toUpperCase().includes('SUPERVISOR'));
  const [selectedSpv, setSelectedSpv] = useState(() => {
    const defaultSpv = supervisorList.find(e => e.name.toUpperCase().includes('DWI CAHYADI'));
    return defaultSpv ? defaultSpv.name : (supervisorList[0]?.name || 'DWI CAHYADI');
  });

  // Trigger browser printing
  const handlePrint = () => {
    window.print();
  };

  // --- REPORT COMPILATION LOGIC ---

  // 1. Daily Report Compiler
  const dailyData = useMemo(() => {
    // Get energy logs for this building and date
    const energy = energyReadings.find(e => e.building === targetBuilding && e.date === targetDate);
    
    // Get tickets created on this date (or solved on this date)
    const activeTickets = tickets.filter(t => {
      const matchBldg = t.building === targetBuilding;
      const createdDate = t.createdAt.split('T')[0];
      const finishedDate = t.finishedAt ? t.finishedAt.split('T')[0] : '';
      return matchBldg && (createdDate === targetDate || finishedDate === targetDate);
    });

    // Get preventive tasks scheduled for this date
    const activePMs = pmTasks.filter(p => p.building === targetBuilding && p.scheduledDate === targetDate);

    return { energy, activeTickets, activePMs };
  }, [tickets, pmTasks, energyReadings, targetBuilding, targetDate]);

  // 2. Weekly Report Compiler
  const weeklyData = useMemo(() => {
    // Get past 7 days of energy logs
    const targetMs = new Date(targetDate).getTime();
    const startMs = targetMs - 7 * 24 * 60 * 60 * 1000;
    
    const weeklyEnergy = energyReadings.filter(e => {
      const eMs = new Date(e.date).getTime();
      return e.building === targetBuilding && eMs >= startMs && eMs <= targetMs;
    });

    // Tickets in past 7 days
    const weeklyTickets = tickets.filter(t => {
      const tMs = new Date(t.createdAt).getTime();
      return t.building === targetBuilding && tMs >= startMs && tMs <= targetMs;
    });

    // PM tasks in past 7 days
    const weeklyPMs = pmTasks.filter(p => {
      const pMs = new Date(p.scheduledDate).getTime();
      return p.building === targetBuilding && pMs >= startMs && pMs <= targetMs;
    });

    const completedPMCount = weeklyPMs.filter(p => p.status === 'Selesai').length;
    const weeklyPrc = weeklyPMs.length > 0 ? Math.round((completedPMCount / weeklyPMs.length) * 100) : 100;

    return { weeklyEnergy, weeklyTickets, weeklyPMs, weeklyPrc };
  }, [tickets, pmTasks, energyReadings, targetBuilding, targetDate]);

  // 3. Yearly Report Compiler
  const yearlyData = useMemo(() => {
    // Filter costs for target year
    const yearlyCosts = costs.filter(c => c.date.startsWith(targetYear) && c.building === targetBuilding);
    const totalCost = yearlyCosts.reduce((sum, c) => sum + c.cost, 0);

    // Tickets for this year
    const yearlyTickets = tickets.filter(t => t.createdAt.startsWith(targetYear) && t.building === targetBuilding);
    const resolvedCount = yearlyTickets.filter(t => t.status === 'Selesai').length;

    // PM Compliance rate for the year
    const yearlyPMs = pmTasks.filter(p => p.scheduledDate.startsWith(targetYear) && p.building === targetBuilding);
    const pmSelesai = yearlyPMs.filter(p => p.status === 'Selesai').length;
    const prc = yearlyPMs.length > 0 ? Math.round((pmSelesai / yearlyPMs.length) * 100) : 92; // default fallback

    return { yearlyCosts, totalCost, yearlyTickets, resolvedCount, prc, pmTotal: yearlyPMs.length };
  }, [tickets, pmTasks, costs, targetBuilding, targetYear]);

  // 4. Monthly Report Compiler
  const monthlyData = useMemo(() => {
    // Filter energy logs for the target month
    const monthlyEnergy = energyReadings.filter(e => e.building === targetBuilding && e.date.startsWith(targetMonth));
    const totalElectricity = monthlyEnergy.reduce((sum, e) => sum + e.electricityReading, 0);
    const totalWater = monthlyEnergy.reduce((sum, e) => sum + e.waterReading, 0);

    // Tickets for this month
    const monthlyTickets = tickets.filter(t => t.building === targetBuilding && t.createdAt.startsWith(targetMonth));
    const resolvedTickets = monthlyTickets.filter(t => t.status === 'Selesai');
    const pendingTickets = monthlyTickets.filter(t => t.status !== 'Selesai');
    const totalTicketCost = resolvedTickets.reduce((sum, t) => sum + (t.cost || 0), 0);

    // PM tasks in this month
    const monthlyPMs = pmTasks.filter(p => p.building === targetBuilding && p.scheduledDate.startsWith(targetMonth));
    const completedPMs = monthlyPMs.filter(p => p.status === 'Selesai');
    const pmCompliance = monthlyPMs.length > 0 ? Math.round((completedPMs.length / monthlyPMs.length) * 100) : 100;

    // Monthly costs from DEPCOS (cost records)
    const monthlyCosts = costs.filter(c => c.building === targetBuilding && c.date.startsWith(targetMonth));
    const totalDepcosCost = monthlyCosts.reduce((sum, c) => sum + c.cost, 0);

    return {
      monthlyEnergy,
      totalElectricity,
      totalWater,
      monthlyTickets,
      resolvedTickets,
      pendingTickets,
      totalTicketCost,
      monthlyPMs,
      completedPMs,
      pmCompliance,
      monthlyCosts,
      totalDepcosCost
    };
  }, [tickets, pmTasks, energyReadings, costs, targetBuilding, targetMonth]);

  return (
    <div className="space-y-6">
      {/* Configuration Controls Bar - HIDDEN during printing */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 rounded text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Konfigurasi Pengompilasi Laporan</h2>
              <p className="text-xs text-slate-500">Sesuaikan rentang data dan gedung untuk mencetak laporan siap pakai.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              Cetak Laporan / PDF
            </button>
          </div>
        </div>

        {/* Configurations Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Jenis Laporan</label>
            <div className="grid grid-cols-4 gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
              {(['harian', 'mingguan', 'bulanan', 'tahunan'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`py-1 text-[11px] font-bold rounded-md transition-all uppercase ${
                    reportType === type ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Gedung</label>
            <select
              value={targetBuilding}
              onChange={(e) => setTargetBuilding(e.target.value as BuildingName)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs font-semibold outline-none"
            >
              <option value="Palmerah">Palmerah</option>
              <option value="Pecenongan">Pecenongan</option>
              <option value="Gedung Sangaji">Gedung Sangaji</option>
              <option value="Permata Hijau">Permata Hijau (Gedung & Aset)</option>
            </select>
          </div>

          {reportType === 'bulanan' ? (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bulan Acuan</label>
              <input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-1.5 text-xs font-semibold outline-none"
              />
            </div>
          ) : reportType === 'tahunan' ? (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tahun Acuan</label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs font-semibold outline-none"
              >
                <option value="2026">Tahun 2026</option>
                <option value="2025">Tahun 2025</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tanggal Acuan</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-1.5 text-xs font-semibold outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Supervisor Penanggung Jawab</label>
            <select
              value={selectedSpv}
              onChange={(e) => setSelectedSpv(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs font-semibold outline-none"
            >
              {supervisorList.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Editorial Textboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Catatan Proyek Spesial / Aktivitas Shift (Indo)
            </label>
            <textarea
              rows={2}
              value={specialProjects}
              onChange={(e) => setSpecialProjects(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs outline-none resize-none font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Rekomendasi / Rencana Tindak Lanjut AM Engineering
            </label>
            <textarea
              rows={2}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs outline-none resize-none font-medium text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* --- PRINTABLE DOCUMENT SECTION --- */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-md max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 space-y-6 text-slate-900 font-sans">
        
        {/* Document Letterhead */}
        <div className="border-b-4 border-slate-900 pb-5 flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-wider">PANIN PALMERAH PROPERTY MANAGEMENT</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Departemen Maintenance Gedung & Engineering Operasional • 4 Gedung Utama Jakarta
            </p>
          </div>
          <div className="border-2 border-slate-900 px-3 py-1 text-center font-black text-xs shrink-0 tracking-widest bg-slate-50">
            OFFICIAL REPORT
          </div>
        </div>

        {/* Meta Document Details */}
        <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <span className="text-slate-400 block font-normal text-[10px] uppercase tracking-wider">Gedung / Lokasi</span>
            <span className="text-slate-800 font-bold">{targetBuilding}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-normal text-[10px] uppercase tracking-wider">Jenis Dokumen</span>
            <span className="text-slate-800 font-bold uppercase">
              Laporan {reportType}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-normal text-[10px] uppercase tracking-wider">Tanggal Dokumen</span>
            <span className="text-slate-800 font-bold">
              {reportType === 'tahunan' ? `Periode Tahun ${targetYear}` : reportType === 'bulanan' ? `Periode Bulan ${targetMonth}` : targetDate}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-normal text-[10px] uppercase tracking-wider">Status Otoritas</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black text-[10px] w-fit block">
              DRAF VERIFIKASI
            </span>
          </div>
        </div>

        {/* Dynamic Inner Report contents */}
        {reportType === 'harian' && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b-2 border-slate-200 pb-1">
              I. Ringkasan Operasional Utilitas Harian (EMR & WMR)
            </h2>
            
            {dailyData.energy ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block">Konsumsi Energi Listrik (EMR):</span>
                    <span className="text-lg font-black text-slate-800">{dailyData.energy.electricityReading.toLocaleString('id-ID')} kWh</span>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block">Konsumsi Air Bersih (WMR):</span>
                    <span className="text-lg font-black text-slate-800">{dailyData.energy.waterReading.toLocaleString('id-ID')} m³</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-500 italic">
                Peringatan: Belum ada input meter harian utilitas listrik dan air untuk tanggal ini.
              </p>
            )}

            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b-2 border-slate-200 pb-1">
              II. Laporan Masuk & Tindakan Perbaikan Hari Ini (Helpdesk/WO)
            </h2>

            {dailyData.activeTickets.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <th className="p-2.5">No Tiket</th>
                      <th className="p-2.5">Masalah / Sektor</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Teknisi</th>
                      <th className="p-2.5">Tindakan Perbaikan / Suku Cadang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyData.activeTickets.map(t => (
                      <tr key={t.id} className="align-top font-medium text-slate-700">
                        <td className="p-2.5 font-bold text-slate-900">{t.ticketNo}</td>
                        <td className="p-2.5">
                          <b>{t.title}</b> <span className="text-slate-400 block">{t.assetType} • {t.floorArea}</span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                            t.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>{t.status}</span>
                        </td>
                        <td className="p-2.5">{t.assignedTo}</td>
                        <td className="p-2.5 max-w-xs text-slate-500 leading-normal">
                          {t.actionTaken || <span className="italic text-slate-400">Sedang dalam proses penanganan.</span>}
                          {t.cost ? <span className="block font-bold text-slate-800 mt-1">Biaya: Rp {t.cost.toLocaleString('id-ID')}</span> : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Tidak ada keluhan kerusakan terdaftar atau selesai di tanggal ini.</p>
            )}

            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b-2 border-slate-200 pb-1">
              III. Status Perawatan Preventif Terjadwal (Preventive Maintenance)
            </h2>

            {dailyData.activePMs.length > 0 ? (
              <div className="space-y-2">
                {dailyData.activePMs.map(p => (
                  <div key={p.id} className="border border-slate-100 rounded p-3 flex items-center justify-between text-xs bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-800">{p.title} ({p.code})</span>
                      <span className="text-slate-400 block">Sektor: {p.assetName}</span>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                        p.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}>{p.status}</span>
                      {p.completedBy && <span className="block text-[10px] text-slate-400 mt-0.5">Selesai oleh: {p.completedBy}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Tidak ada agenda perawatan preventif terjadwal untuk hari ini.</p>
            )}
          </div>
        )}

        {reportType === 'mingguan' && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b-2 border-slate-200 pb-1">
              I. Kepatuhan Jadwal Perawatan (Weekly PM Compliance Rate)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block font-medium">Compliance Rate (PRC AC):</span>
                  <span className="text-xl font-black text-slate-800">{weeklyData.weeklyPrc}%</span>
                </div>
                <div className="text-[10px] text-slate-500 text-right">
                  Total Agenda: <b>{weeklyData.weeklyPMs.length}</b><br/>
                  Selesai: <b>{weeklyData.weeklyPMs.filter(p => p.status === 'Selesai').length}</b>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block font-medium">Weekly Helpdesk Resolution:</span>
                  <span className="text-xl font-black text-slate-800">
                    {weeklyData.weeklyTickets.filter(t => t.status === 'Selesai').length} / {weeklyData.weeklyTickets.length} Tiket
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 italic font-medium">Aduan tuntas minggu ini</span>
              </div>
            </div>

            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b-2 border-slate-200 pb-1">
              II. Rekapitulasi Data Energi Mingguan
            </h2>
            {weeklyData.weeklyEnergy.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <th className="p-2">Hari / Tanggal</th>
                      <th className="p-2 text-center">Listrik (kWh)</th>
                      <th className="p-2 text-center">Air (m³)</th>
                      <th className="p-2">Petugas Logger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {weeklyData.weeklyEnergy.map(e => (
                      <tr key={e.id}>
                        <td className="p-2">{e.date}</td>
                        <td className="p-2 text-center font-bold text-amber-700">{e.electricityReading} kWh</td>
                        <td className="p-2 text-center font-bold text-blue-700">{e.waterReading} m³</td>
                        <td className="p-2 text-slate-500">{e.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Belum ada rekaman meter utilitas di periode 7 hari terakhir.</p>
            )}
          </div>
        )}

        {reportType === 'bulanan' && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b-2 border-slate-200 pb-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              I. Ringkasan Kinerja &amp; Pencapaian Bulanan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Pencapaian PM (SLA)</span>
                  <span className="text-xl font-black text-indigo-700 mt-1 block">
                    {monthlyData.pmCompliance}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  Total Jadwal PM: <b>{monthlyData.monthlyPMs.length}</b><br/>
                  Selesai Tepat Waktu: <b>{monthlyData.completedPMs.length}</b>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Penyelesaian Helpdesk</span>
                  <span className="text-xl font-black text-emerald-700 mt-1 block">
                    {monthlyData.resolvedTickets.length} / {monthlyData.monthlyTickets.length} Tiket
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  Menunggu Tindakan: <b>{monthlyData.pendingTickets.length} tiket</b><br/>
                  Rasio Penyelesaian: <b>{monthlyData.monthlyTickets.length > 0 ? Math.round((monthlyData.resolvedTickets.length / monthlyData.monthlyTickets.length) * 100) : 100}%</b>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Total Biaya Maintenance</span>
                  <span className="text-xl font-black text-amber-700 mt-1 block">
                    Rp {(monthlyData.totalTicketCost + monthlyData.totalDepcosCost).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  WO/Tiket: <b>Rp {monthlyData.totalTicketCost.toLocaleString('id-ID')}</b><br/>
                  Proyek Depcos: <b>Rp {monthlyData.totalDepcosCost.toLocaleString('id-ID')}</b>
                </div>
              </div>
            </div>

            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b-2 border-slate-200 pb-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              II. Rekapitulasi Utilitas &amp; Energi Bulanan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Total Konsumsi Listrik</span>
                <span className="text-lg font-black text-slate-800 block mt-1">
                  {monthlyData.totalElectricity.toLocaleString('id-ID')} kWh
                </span>
                <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">
                  Rata-rata Harian: {monthlyData.monthlyEnergy.length > 0 ? Math.round(monthlyData.totalElectricity / monthlyData.monthlyEnergy.length).toLocaleString('id-ID') : 0} kWh
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Total Konsumsi Air</span>
                <span className="text-lg font-black text-slate-800 block mt-1">
                  {monthlyData.totalWater.toLocaleString('id-ID')} m³
                </span>
                <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">
                  Rata-rata Harian: {monthlyData.monthlyEnergy.length > 0 ? Math.round(monthlyData.totalWater / monthlyData.monthlyEnergy.length).toLocaleString('id-ID') : 0} m³
                </p>
              </div>
            </div>

            {monthlyData.monthlyEnergy.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                <div className="bg-slate-50 px-3 py-2 font-bold text-slate-600 border-b border-slate-200">
                  Rincian Pengambilan Log Meter Harian Terakhir ({monthlyData.monthlyEnergy.length} Hari Terdaftar)
                </div>
                <div className="max-h-[160px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 sticky top-0">
                        <th className="p-2">Hari / Tanggal</th>
                        <th className="p-2 text-center">Listrik (kWh)</th>
                        <th className="p-2 text-center">Air (m³)</th>
                        <th className="p-2">Petugas Logger</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {monthlyData.monthlyEnergy.map(e => (
                        <tr key={e.id} className="hover:bg-slate-50/50">
                          <td className="p-2">{e.date}</td>
                          <td className="p-2 text-center font-bold text-amber-700">{e.electricityReading} kWh</td>
                          <td className="p-2 text-center font-bold text-blue-700">{e.waterReading} m³</td>
                          <td className="p-2 text-slate-500">{e.recordedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Belum ada rekaman log meter utilitas harian di periode bulan ini.</p>
            )}

            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b-2 border-slate-200 pb-1 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              III. Rincian Biaya Depcos &amp; Pengadaan Bulanan
            </h2>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <th className="p-2.5">Tanggal / Bulan</th>
                    <th className="p-2.5">Kategori Sektor</th>
                    <th className="p-2.5">Deskripsi Alokasi Pekerjaan / Vendor</th>
                    <th className="p-2.5 text-right">Biaya Pengeluaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {monthlyData.monthlyCosts.map(c => (
                    <tr key={c.id}>
                      <td className="p-2.5 font-bold text-slate-900">{c.date}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold text-[9px]">{c.category}</span>
                      </td>
                      <td className="p-2.5 max-w-xs">{c.description}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">IDR {c.cost.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}

                  {monthlyData.monthlyCosts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                        Tidak ada alokasi dana proyek Depcos tercatat untuk bulan ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'tahunan' && (
          <div className="space-y-6">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b-2 border-slate-200 pb-1">
              I. Akumulasi Anggaran & Biaya Perawatan Tahunan (DEPCOS)
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Total Belanja Sparepart & Vendor</span>
                <span className="text-xl font-extrabold text-slate-900 block mt-1">
                  IDR {yearlyData.totalCost.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Biaya terakumulasi dari log pengeluaran DEPCOS</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Pencapaian PM Tahunan</span>
                <span className="text-xl font-extrabold text-emerald-700 block mt-1">
                  {yearlyData.prc}% Compliance
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Menyelesaikan {yearlyData.yearlyTickets.filter(t => t.status === 'Selesai').length} keluhan dari {yearlyData.yearlyTickets.length} aduan.
                </span>
              </div>
            </div>

            <h2 className="text-base font-black text-slate-800 uppercase tracking-wide border-b-2 border-slate-200 pb-1">
              II. Rincian Alokasi Dana Pemeliharaan Gedung
            </h2>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <th className="p-2.5">Bulan</th>
                    <th className="p-2.5">Sektor Aset</th>
                    <th className="p-2.5">Deskripsi Alokasi / Penggantian</th>
                    <th className="p-2.5 text-right">Biaya Pemeliharaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {yearlyData.yearlyCosts.map(c => (
                    <tr key={c.id}>
                      <td className="p-2.5 font-bold text-slate-900">{c.date}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold text-[9px]">{c.category}</span>
                      </td>
                      <td className="p-2.5 max-w-xs">{c.description}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">IDR {c.cost.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}

                  {yearlyData.yearlyCosts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                        Tidak ada catatan pengeluaran besar terdaftar untuk tahun ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Proyek Spesial & Masukan Chief Engineering */}
        <div className="space-y-6 pt-4 border-t border-slate-100 text-xs">
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider block mb-1">IV. Proyek Khusus & Pekerjaan Shift Berjalan (Doc):</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100">
              {specialProjects || 'Tidak ada proyek khusus tercatat.'}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider block mb-1">V. Rekomendasi Dan Catatan AM Engineering:</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100 font-semibold italic">
              {recommendations || 'Seluruh sistem andalan berjalan normal.'}
            </p>
          </div>
        </div>

        {/* Official Signatures Box */}
        <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs text-slate-800">
          <div className="space-y-16">
            <span>Dibuat Oleh,<br/><b>Teknisi Shift Pelaksana</b></span>
            <div className="border-b border-slate-950 mx-auto w-32" />
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wide">Fasilitator Lapangan</span>
          </div>

          <div className="space-y-16">
            <span>Diperiksa & Disetujui,<br/><b>Supervisor On-Duty</b></span>
            <div className="border-b border-slate-950 mx-auto w-32" />
            <span className="block font-black text-slate-900">{selectedSpv}</span>
          </div>

          <div className="space-y-16">
            <span>Mengetahui,<br/><b>AM Engineering</b></span>
            <div className="border-b border-slate-950 mx-auto w-32" />
            <span className="block font-black text-slate-900">HABIB HANAFI</span>
          </div>
        </div>

        {/* Footer print note */}
        <div className="text-center text-[9px] text-slate-400 pt-10 border-t border-dashed border-slate-200">
          Dokumen ini dibuat dan dikompilasi secara digital melalui Sistem Helpdesk Terintegrasi Panin Palmerah.<br/>
          Dicetak harian untuk arsip serah terima jabatan (handover) shift engineering.
        </div>

      </div>
    </div>
  );
}
