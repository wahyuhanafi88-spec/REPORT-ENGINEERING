import React, { useState, useMemo } from 'react';
import { EnergyReading, BuildingName, Employee } from '../types';
import { 
  Activity, 
  Plus, 
  Calendar, 
  Building, 
  Zap, 
  Droplet, 
  User, 
  Trash2, 
  X,
  FileSpreadsheet,
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface EnergyProps {
  energyReadings: EnergyReading[];
  employees: Employee[];
  onAddReading: (reading: Omit<EnergyReading, 'id'>) => void;
}

export default function EnergyLogs({ energyReadings, employees, onAddReading }: EnergyProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingName | 'Semua'>('Semua');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBuilding, setNewBuilding] = useState<BuildingName>('Palmerah');
  const [newElectricity, setNewElectricity] = useState('');
  const [newWater, setNewWater] = useState('');
  const [newRecordedBy, setNewRecordedBy] = useState('');

  const technicians = employees.filter(e => e.role.toLowerCase().includes('teknisi') && e.status === 'Aktif');

  // Filter readings by building
  const filteredReadings = useMemo(() => {
    let list = [...energyReadings];
    if (selectedBuilding !== 'Semua') {
      list = list.filter(r => r.building === selectedBuilding);
    }
    // Sort descending by date
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [energyReadings, selectedBuilding]);

  // Aggregate readings for the line chart (chronological order)
  const chartData = useMemo(() => {
    const list = [...energyReadings];
    if (selectedBuilding !== 'Semua') {
      return list
        .filter(r => r.building === selectedBuilding)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    // If 'Semua' selected, group by date and sum readings
    const dateMap: { [date: string]: { date: string; Listrik: number; Air: number } } = {};
    list.forEach(r => {
      if (!dateMap[r.date]) {
        dateMap[r.date] = { date: r.date, Listrik: 0, Air: 0 };
      }
      dateMap[r.date].Listrik += r.electricityReading;
      dateMap[r.date].Air += r.waterReading;
    });

    return Object.values(dateMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [energyReadings, selectedBuilding]);

  // Totals for summary banner
  const summary = useMemo(() => {
    const count = filteredReadings.length;
    if (count === 0) return { avgElectricity: 0, avgWater: 0, totalElectricity: 0, totalWater: 0 };

    const totalElec = filteredReadings.reduce((sum, r) => sum + r.electricityReading, 0);
    const totalWat = filteredReadings.reduce((sum, r) => sum + r.waterReading, 0);

    return {
      avgElectricity: Math.round(totalElec / count),
      avgWater: Math.round(totalWat / count),
      totalElectricity: totalElec,
      totalWater: totalWat
    };
  }, [filteredReadings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElectricity || !newWater || !newRecordedBy) return;

    onAddReading({
      date: newDate,
      building: newBuilding,
      electricityReading: parseFloat(newElectricity),
      waterReading: parseFloat(newWater),
      recordedBy: newRecordedBy
    });

    setNewElectricity('');
    setNewWater('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner & Stat Cards */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-600 w-5 h-5" />
            Catatan Meter Konsumsi Energi Harian
          </h2>
          <p className="text-sm text-slate-500">
            Pencatatan manual data harian Kwh Listrik (EMR) & Air Bersih (WMR) untuk kontrol efisiensi energi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            {(['Semua', 'Palmerah', 'Pecenongan', 'Gedung Sangaji', 'Permata Hijau'] as const).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBuilding(b)}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedBuilding === b ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-950 text-white px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-800 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Input Meter Harian
          </button>
        </div>
      </div>

      {/* Grid of Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Listrik Terpakai</span>
            <span className="text-2xl font-black text-slate-900 block">{summary.totalElectricity.toLocaleString('id-ID')} kWh</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Akumulasi periode tercatat</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Air Terpakai</span>
            <span className="text-2xl font-black text-slate-900 block">{summary.totalWater.toLocaleString('id-ID')} m³</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Akumulasi volume air bersih</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-slate-50 text-slate-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Rerata Listrik Harian</span>
            <span className="text-2xl font-black text-slate-900 block">{summary.avgElectricity} kWh</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Rata-rata pemakaian per log</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-slate-50 text-slate-600">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Rerata Air Harian</span>
            <span className="text-2xl font-black text-slate-900 block">{summary.avgWater} m³</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Rata-rata suplai air harian</span>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Visualisasi Grafik Tren Utilitas</h3>
          <p className="text-xs text-slate-400">Grafik perbandingan asupan harian antara listrik (kW) dan air (m³).</p>
        </div>

        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => {
                    const dateObj = new Date(val);
                    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                  }} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Listrik (kWh)', angle: -90, position: 'insideLeft', offset: -5, fill: '#d97706', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Air (m³)', angle: 90, position: 'insideRight', offset: -5, fill: '#2563eb', fontSize: 10 }} />
                <Tooltip 
                  labelFormatter={(lbl) => {
                    return new Date(lbl).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" name="Listrik (kWh)" dataKey="Listrik" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" name="Air (m³)" dataKey="Air" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                {selectedBuilding !== 'Semua' && (
                  <>
                    <Line yAxisId="left" type="monotone" name="Listrik (kWh)" dataKey="electricityReading" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" name="Air (m³)" dataKey="waterReading" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Tidak ada data grafik yang terekam.
            </div>
          )}
        </div>
      </div>

      {/* History Data Table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Histori Logger Meter Harian</h4>
          <span className="text-xs text-slate-500 font-medium">Tercatat: <b>{filteredReadings.length} Log</b></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Tanggal Pembacaan</th>
                <th className="p-4">Gedung</th>
                <th className="p-4 text-amber-700">Listrik kWh (EMR)</th>
                <th className="p-4 text-blue-700">Air m³ (WMR)</th>
                <th className="p-4">Petugas Logger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReadings.map(reading => (
                <tr key={reading.id} className="hover:bg-slate-50/40 transition-all font-medium text-slate-700">
                  <td className="p-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(reading.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {reading.building}
                    </span>
                  </td>
                  <td className="p-4 text-amber-600 font-bold">
                    {reading.electricityReading.toLocaleString('id-ID')} kWh
                  </td>
                  <td className="p-4 text-blue-600 font-bold">
                    {reading.waterReading.toLocaleString('id-ID')} m³
                  </td>
                  <td className="p-4 text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {reading.recordedBy}
                  </td>
                </tr>
              ))}

              {filteredReadings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    Belum ada data meter utilitas terekam untuk kriteria ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Input Meter Harian */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-emerald-500" />
                Logger Meter Utilitas Harian
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1">Tanggal Pembacaan *</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1">Pilih Gedung *</label>
                <select
                  value={newBuilding}
                  onChange={(e) => setNewBuilding(e.target.value as BuildingName)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none"
                >
                  <option value="Palmerah">Palmerah</option>
                  <option value="Pecenongan">Pecenongan</option>
                  <option value="Gedung Sangaji">Gedung Sangaji</option>
                  <option value="Permata Hijau">Permata Hijau (Gedung & Aset)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Angka Kwh Listrik (Kwh) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 1250"
                  value={newElectricity}
                  onChange={(e) => setNewElectricity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-blue-500" />
                  Angka Volume Air Bersih (m³) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 45"
                  value={newWater}
                  onChange={(e) => setNewWater(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1">Nama Petugas Logger *</label>
                <select
                  required
                  value={newRecordedBy}
                  onChange={(e) => setNewRecordedBy(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-850 rounded-lg p-2.5 text-xs outline-none font-semibold"
                >
                  <option value="">-- Pilih Logger --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-slate-950 text-white px-5 py-2 hover:bg-slate-800 rounded-lg shadow-sm font-bold"
                >
                  Simpan Logger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
