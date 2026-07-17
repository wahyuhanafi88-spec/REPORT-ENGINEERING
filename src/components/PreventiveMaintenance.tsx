import React, { useState, useMemo } from 'react';
import { PMTask, ChecklistItem, BuildingName, PMFrequency, Employee } from '../types';
import { 
  Calendar, 
  CheckSquare, 
  Square, 
  Clock, 
  CheckCircle2, 
  User, 
  Plus, 
  ClipboardCheck, 
  Building, 
  ChevronDown, 
  X, 
  Award,
  BookOpen
} from 'lucide-react';

interface PMProps {
  pmTasks: PMTask[];
  employees: Employee[];
  onCompletePMTask: (id: string, completedBy: string, checklist: ChecklistItem[]) => void;
  onAddPMTask: (task: Omit<PMTask, 'id' | 'status'>) => void;
}

export default function PreventiveMaintenance({ pmTasks, employees, onCompletePMTask, onAddPMTask }: PMProps) {
  const [selectedFrequency, setSelectedFrequency] = useState<PMFrequency | 'Semua'>('Semua');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingName | 'Semua'>('Semua');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [signedName, setSignedName] = useState('');
  
  // Custom PM Modal Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAsset, setNewAsset] = useState('');
  const [newFreq, setNewFreq] = useState<PMFrequency>('Bulanan');
  const [newBuilding, setNewBuilding] = useState<BuildingName>('Palmerah');
  const [newChecklistText, setNewChecklistText] = useState(
    "Cuci filter indoor\nPeriksa tekanan pipa freon\nKencangkan baut terminal\nUkur arus listrik kompresor"
  );

  const activeTask = useMemo(() => {
    return pmTasks.find(t => t.id === activeTaskId) || null;
  }, [pmTasks, activeTaskId]);

  const technicians = employees.filter(e => e.role.toLowerCase().includes('teknisi') && e.status === 'Aktif');

  // Filter application
  const filteredTasks = pmTasks.filter(t => {
    const matchesFreq = selectedFrequency === 'Semua' || t.frequency === selectedFrequency;
    const matchesBuilding = selectedBuilding === 'Semua' || t.building === selectedBuilding;
    return matchesFreq && matchesBuilding;
  });

  // Calculate PRC (Percentage Maintenance Schedule compliance)
  const prcStats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'Selesai').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;
    return { total, completed, percentage };
  }, [filteredTasks]);

  // Handle local checklist modification in active task
  const [localChecklist, setLocalChecklist] = useState<ChecklistItem[]>([]);

  React.useEffect(() => {
    if (activeTask) {
      setLocalChecklist(activeTask.checklist);
      setSignedName(activeTask.completedBy || '');
    }
  }, [activeTask]);

  const toggleLocalCheck = (itemId: string) => {
    setLocalChecklist(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleNoteChange = (itemId: string, val: string) => {
    setLocalChecklist(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, notes: val } : item
      )
    );
  };

  const handleSubmitChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskId || !signedName) return;

    onCompletePMTask(activeTaskId, signedName, localChecklist);
    setActiveTaskId(null);
    setSignedName('');
  };

  const handleCreatePMTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAsset) return;

    const checklistItems: ChecklistItem[] = newChecklistText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map((line, idx) => ({
        id: `custom-ch-${idx}-${Date.now()}`,
        item: line.trim(),
        checked: false
      }));

    onAddPMTask({
      code: `PM-CST-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      assetName: newAsset,
      frequency: newFreq,
      building: newBuilding,
      checklist: checklistItems,
      scheduledDate: new Date().toISOString().split('T')[0],
    });

    setNewTitle('');
    setNewAsset('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Filtering & PRC Percentage Header Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compliance Meter */}
        <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between border border-slate-800 shadow-lg">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block">Compliance Rate (PRC)</span>
            <span className="text-3xl font-extrabold block">{prcStats.percentage}%</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Persentase keberhasilan pencapaian agenda servis preventif tepat waktu.
            </p>
          </div>
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="32" className="stroke-slate-800 fill-none" strokeWidth="6" />
              <circle 
                cx="40" cy="40" r="32" 
                className="stroke-amber-500 fill-none transition-all duration-500" 
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - prcStats.percentage / 100)}
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-slate-100">{prcStats.completed}/{prcStats.total}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3 flex-1">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ClipboardCheck className="text-indigo-600 w-4.5 h-4.5" />
              Filter Jadwal Preventif (Preventive Maintenance)
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gedung</label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value as BuildingName | 'Semua')}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2 text-xs font-semibold outline-none"
                >
                  <option value="Semua">Semua Gedung</option>
                  <option value="Palmerah">Palmerah</option>
                  <option value="Pecenongan">Pecenongan</option>
                  <option value="Gedung Sangaji">Gedung Sangaji</option>
                  <option value="Permata Hijau">Permata Hijau (Gedung & Aset)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Periode Servis</label>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value as PMFrequency | 'Semua')}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2 text-xs font-semibold outline-none"
                >
                  <option value="Semua">Semua Periode</option>
                  <option value="Harian">D - Harian</option>
                  <option value="Mingguan">W - Mingguan</option>
                  <option value="Bulanan">M - Bulanan</option>
                  <option value="Tahunan">Y - Tahunan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sm:self-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Agenda PM
            </button>
          </div>
        </div>

      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Col: Agenda Agenda List */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="bg-slate-50 p-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              Daftar Agenda Rutin ({filteredTasks.length})
            </h4>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredTasks.map(task => {
              const completedCount = task.checklist.filter(c => c.checked).length;
              const percent = task.checklist.length > 0 ? Math.round((completedCount / task.checklist.length) * 100) : 0;
              const isActive = task.id === activeTaskId;

              return (
                <div 
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-all space-y-2.5 ${
                    isActive ? 'bg-slate-50/80 border-r-4 border-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-400">{task.code}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      task.frequency === 'Harian' ? 'bg-amber-50 text-amber-700' :
                      task.frequency === 'Mingguan' ? 'bg-sky-50 text-sky-700' :
                      task.frequency === 'Bulanan' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {task.frequency}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-800 text-sm leading-tight">{task.title}</h5>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {task.building} • {task.assetName}
                    </span>
                  </div>

                  {/* Progress bar inside card */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Progres Checklist:</span>
                      <span className="font-semibold">{completedCount}/{task.checklist.length} ({percent}%)</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          task.status === 'Selesai' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-400">Jadwal: <b>{task.scheduledDate}</b></span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      task.status === 'Selesai' ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {task.status === 'Selesai' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Selesai
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          Belum Dicuci/Cek
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">
                Tidak ada agenda rutin untuk kriteria ini.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Interactive Active Checklist */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm lg:col-span-3 flex flex-col overflow-hidden min-h-[400px]">
          {activeTask ? (
            <form onSubmit={handleSubmitChecklist} className="flex-1 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400">{activeTask.code} • {activeTask.frequency}</span>
                    <h4 className="font-bold text-sm leading-snug">{activeTask.title}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    activeTask.status === 'Selesai' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {activeTask.status}
                  </span>
                </div>

                {/* Checklist Body */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                    <span>Aset: <b>{activeTask.assetName}</b></span>
                    <span>Lokasi: <b>{activeTask.building}</b></span>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Daftar Poin Pemeriksaan (AC FL):</h5>
                    
                    <div className="space-y-2">
                      {localChecklist.map((item) => (
                        <div 
                          key={item.id}
                          className={`p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            item.checked ? 'bg-emerald-50/20 border-emerald-100' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div 
                            className="flex items-start gap-2.5 cursor-pointer flex-1"
                            onClick={() => activeTask.status !== 'Selesai' && toggleLocalCheck(item.id)}
                          >
                            {item.checked ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <span className={`text-xs font-medium text-slate-700 leading-normal ${
                              item.checked ? 'line-through text-slate-400' : ''
                            }`}>
                              {item.item}
                            </span>
                          </div>

                          {/* Notes input for checklist */}
                          <div className="w-full sm:max-w-[180px] shrink-0">
                            <input
                              type="text"
                              disabled={activeTask.status === 'Selesai'}
                              placeholder="Keterangan / Parameter..."
                              value={item.notes || ''}
                              onChange={(e) => handleNoteChange(item.id, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] rounded p-1.5 font-medium outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature / Submission zone */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                {activeTask.status !== 'Selesai' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                          Tanda Tangan Pelaksana (Nama Teknisi) *
                        </label>
                        <select
                          required
                          value={signedName}
                          onChange={(e) => setSignedName(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none font-semibold"
                        >
                          <option value="">-- Pilih Nama Pelaksana --</option>
                          {technicians.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="bg-slate-950 text-white font-bold py-2.5 px-4 rounded-lg text-xs hover:bg-slate-800 uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <ClipboardCheck className="w-4.5 h-4.5" />
                        Simpan & Laporkan Selesai
                      </button>
                    </div>
                    <span className="text-[10px] text-rose-500 italic block">
                      * Pastikan seluruh poin sudah dicentang dan diukur parameternya sebelum menandatangani laporan!
                    </span>
                  </div>
                ) : (
                  /* Completed verification details */
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-xs text-emerald-800">
                    <Award className="w-6 h-6 shrink-0 text-emerald-600" />
                    <div>
                      <span className="font-bold block">Pekerjaan Rampung Diservis</span>
                      <span className="block">
                        Agenda diservis pada <b>{activeTask.completedDate}</b> oleh teknisi penanggung jawab <b>{activeTask.completedBy}</b>.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <BookOpen className="w-12 h-12 stroke-1 text-slate-300 mb-2.5" />
              <h4 className="font-bold text-slate-700 text-sm">Pratinjau Lembar Checklist</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Pilih salah satu agenda perawatan preventif (PM) di sebelah kiri untuk menampilkan lembar kerja checklist lapangan harian, mingguan, atau bulanan.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Modal Dialog: Tambah Agenda PM Baru */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Buat Agenda PM Rutin Baru
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePMTask} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1">Judul Agenda Pemeliharaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Servis Berkala Outdoor Lift No 1"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1">Nama Alat / Kelompok Aset *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lift Lift Otis, AC Central Chiller"
                  value={newAsset}
                  onChange={(e) => setNewAsset(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1">Interval / Frekuensi *</label>
                  <select
                    value={newFreq}
                    onChange={(e) => setNewFreq(e.target.value as PMFrequency)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none"
                  >
                    <option value="Harian">D - Harian</option>
                    <option value="Mingguan">W - Mingguan</option>
                    <option value="Bulanan">M - Bulanan</option>
                    <option value="Tahunan">Y - Tahunan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Item Poin Checklist (Tulis 1 Baris Per Poin) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Masukkan poin-poin checklist pemeriksaan lapangan..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none resize-none font-medium"
                />
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
                  Jadwalkan Agenda PM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
