import React, { useState } from 'react';
import { Ticket, BuildingName, AssetType, TicketPriority, TicketStatus, Employee } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Check, 
  X, 
  DollarSign, 
  Building, 
  ChevronRight,
  ClipboardList,
  Wrench,
  Camera
} from 'lucide-react';

interface HelpdeskProps {
  tickets: Ticket[];
  employees: Employee[];
  onAddTicket: (ticket: Omit<Ticket, 'id' | 'ticketNo' | 'createdAt'>) => void;
  onUpdateTicketStatus: (id: string, status: TicketStatus, details?: { actionTaken?: string; cost?: number; assignedTo?: string }) => void;
  userRole?: string;
}

export default function HelpdeskTickets({ tickets, employees, onAddTicket, onUpdateTicketStatus, userRole = 'Super Admin' }: HelpdeskProps) {
  const isEngineer = userRole === 'Super Admin' || userRole === 'Admin' || userRole === 'Teknisi';
  // Navigation states
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<Ticket | null>(null);

  // Search/filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBuilding, setFilterBuilding] = useState<BuildingName | 'Semua'>('Semua');
  const [filterPriority, setFilterPriority] = useState<TicketPriority | 'Semua'>('Semua');
  const [filterAsset, setFilterAsset] = useState<AssetType | 'Semua'>('Semua');

  // Form states for new ticket
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newReporter, setNewReporter] = useState('');
  const [newBuilding, setNewBuilding] = useState<BuildingName>('Palmerah');
  const [newFloor, setNewFloor] = useState('');
  const [newAsset, setNewAsset] = useState<AssetType>('HVAC/AC');
  const [newPriority, setNewPriority] = useState<TicketPriority>('Sedang');
  const [newAssigned, setNewAssigned] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Form states for updating status
  const [actionTaken, setActionTaken] = useState('');
  const [actionCost, setActionCost] = useState('0');
  const [actionAssigned, setActionAssigned] = useState('');

  const technicians = employees.filter(e => e.role.toLowerCase().includes('teknisi') && e.status === 'Aktif');

  // Filter application
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.ticketNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = filterBuilding === 'Semua' || t.building === filterBuilding;
    const matchesPriority = filterPriority === 'Semua' || t.priority === filterPriority;
    const matchesAsset = filterAsset === 'Semua' || t.assetType === filterAsset;

    return matchesSearch && matchesBuilding && matchesPriority && matchesAsset;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newReporter) return;

    onAddTicket({
      title: newTitle,
      description: newDescription,
      reporterName: newReporter,
      building: newBuilding,
      floorArea: newFloor || 'Lobby',
      assetType: newAsset,
      priority: newPriority,
      status: 'Baru',
      assignedTo: newAssigned || 'Belum Ditugaskan',
      photoUrl: newPhotoUrl || 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=300&q=80',
    });

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewReporter('');
    setNewFloor('');
    setNewAssigned('');
    setNewPhotoUrl('');
    setShowAddModal(false);
  };

  const handleOpenActionModal = (ticket: Ticket) => {
    setShowActionModal(ticket);
    setActionTaken(ticket.actionTaken || '');
    setActionCost(ticket.cost ? ticket.cost.toString() : '0');
    setActionAssigned(ticket.assignedTo !== 'Belum Ditugaskan' ? ticket.assignedTo : '');
  };

  const handleUpdateTicket = () => {
    if (!showActionModal) return;
    
    const nextStatus: TicketStatus = 
      showActionModal.status === 'Baru' ? 'Dalam Pengerjaan' : 'Selesai';

    onUpdateTicketStatus(showActionModal.id, nextStatus, {
      actionTaken: actionTaken,
      cost: parseFloat(actionCost) || 0,
      assignedTo: actionAssigned || 'Belum Ditugaskan'
    });

    setShowActionModal(null);
  };

  // Pre-set some mock sample photos to quickly choose from
  const samplePhotos = [
    { name: 'Kebocoran AC', url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kelistrikan/Panel', url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kebocoran Air/Plumbing', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kerusakan Sipil/Siput', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=300&q=80' }
  ];

  return (
    <div className="space-y-6">
      {/* Search & Filter Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-2 max-w-md bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
            <Search className="text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari kode tiket, kendala, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm outline-none w-full text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'board' ? 'list' : 'board')}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
            >
              Tampilan: {viewMode === 'board' ? 'Daftar Tabel' : 'Papan Kanban'}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 text-white px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-800 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Buat Laporan Baru
            </button>
          </div>
        </div>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Gedung</label>
            <select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value as BuildingName | 'Semua')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2 text-xs font-medium outline-none"
            >
              <option value="Semua">Semua Gedung</option>
              <option value="Palmerah">Palmerah</option>
              <option value="Pecenongan">Pecenongan</option>
              <option value="Gedung Sangaji">Gedung Sangaji</option>
              <option value="Permata Hijau">Permata Hijau (Gedung & Aset)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Prioritas</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as TicketPriority | 'Semua')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2 text-xs font-medium outline-none"
            >
              <option value="Semua">Semua Prioritas</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Sedang">Sedang</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Kategori Aset</label>
            <select
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value as AssetType | 'Semua')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2 text-xs font-medium outline-none"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="HVAC/AC">HVAC / Air Conditioner</option>
              <option value="Lift/Elevator">Lift / Lift Penumpang</option>
              <option value="Kelistrikan">Sistem Kelistrikan</option>
              <option value="Plumbing/Pipa Air">Sistem Plumbing</option>
              <option value="Struktur Bangunan">Struktur Sipil / Bangunan</option>
              <option value="Lainnya">Lain-lain</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Kanban Board vs List */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Columns */}
          {(['Baru', 'Dalam Pengerjaan', 'Selesai'] as TicketStatus[]).map(status => {
            const columnTickets = filteredTickets.filter(t => t.status === status);
            const statusColor = 
              status === 'Baru' ? 'bg-amber-500' : 
              status === 'Dalam Pengerjaan' ? 'bg-blue-500' : 'bg-emerald-500';

            return (
              <div key={status} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex flex-col space-y-4">
                {/* Column Title */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${statusColor}`} />
                    <h3 className="font-bold text-slate-800 text-sm">{status}</h3>
                  </div>
                  <span className="text-xs bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                    {columnTickets.length}
                  </span>
                </div>

                {/* Tickets container */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin">
                  {columnTickets.map(ticket => (
                    <div 
                      key={ticket.id} 
                      className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
                      onClick={() => handleOpenActionModal(ticket)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">{ticket.ticketNo}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ticket.priority === 'Tinggi' ? 'bg-rose-50 text-rose-700' :
                          ticket.priority === 'Sedang' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">{ticket.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{ticket.description}</p>
                      </div>

                      {/* Photo Thumbnail if available */}
                      {ticket.photoUrl && (
                        <div className="relative w-full h-24 rounded-md overflow-hidden bg-slate-100 border border-slate-50">
                          <img 
                            src={ticket.photoUrl} 
                            alt={ticket.title} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {ticket.building}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {ticket.assignedTo === 'Belum Ditugaskan' ? (
                            <span className="text-amber-600 italic">Belum Ditugaskan</span>
                          ) : (
                            <span>{ticket.assignedTo}</span>
                          )}
                        </span>
                      </div>

                      {/* Action trigger button */}
                      {status !== 'Selesai' && (
                        <button 
                          className="w-full mt-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded py-1.5 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenActionModal(ticket);
                          }}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          {status === 'Baru' ? 'Tugaskan & Kerjakan' : 'Selesaikan Pekerjaan'}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {columnTickets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      <ClipboardList className="w-8 h-8 stroke-1 mb-2" />
                      <span className="text-xs">Tidak ada tiket</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode Table */
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">No Tiket</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aset / Laporan</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gedung & Lokasi</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Prioritas</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teknisi</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Lapor</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-all text-xs">
                    <td className="p-4 font-bold text-slate-900">{ticket.ticketNo}</td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">{ticket.title}</span>
                        <span className="text-slate-400 text-[11px] block">{ticket.assetType} • {ticket.reporterName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-700 block">{ticket.building}</span>
                        <span className="text-slate-400 block">{ticket.floorArea}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded font-bold ${
                        ticket.priority === 'Tinggi' ? 'bg-rose-50 text-rose-700' :
                        ticket.priority === 'Sedang' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 w-fit ${
                        ticket.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700' :
                        ticket.status === 'Dalam Pengerjaan' ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ticket.status === 'Selesai' ? 'bg-emerald-500' :
                          ticket.status === 'Dalam Pengerjaan' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`} />
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {ticket.assignedTo === 'Belum Ditugaskan' ? (
                        <span className="text-amber-600 italic">Belum Ditugaskan</span>
                      ) : ticket.assignedTo}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleOpenActionModal(ticket)}
                        className="bg-slate-950 text-white px-2.5 py-1 rounded hover:bg-slate-800 text-[11px] font-bold"
                      >
                        Kelola
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      Tidak ada laporan kerusakan ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog: Buat Laporan Baru */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                Form Laporan Aduan Kerusakan
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Judul Laporan Kerusakan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lampu koridor basemen mati mendadak"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Gedung *</label>
                  <select
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value as BuildingName)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-sm outline-none"
                  >
                    <option value="Palmerah">Palmerah</option>
                    <option value="Pecenongan">Pecenongan</option>
                    <option value="Gedung Sangaji">Gedung Sangaji</option>
                    <option value="Permata Hijau">Permata Hijau (Gedung & Aset)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Lokasi Detail *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lantai 2 Toilet Pria"
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Kategori Aset *</label>
                  <select
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value as AssetType)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-sm outline-none"
                  >
                    <option value="HVAC/AC">HVAC / Air Conditioner</option>
                    <option value="Lift/Elevator">Lift / Elevator</option>
                    <option value="Kelistrikan">Sistem Kelistrikan</option>
                    <option value="Plumbing/Pipa Air">Sistem Plumbing</option>
                    <option value="Struktur Bangunan">Struktur Sipil</option>
                    <option value="Lainnya">Lain-lain</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Tingkat Keparahan / Prioritas *</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-sm outline-none"
                  >
                    <option value="Tinggi">Tinggi (Urgensi Operasional)</option>
                    <option value="Sedang">Sedang (Fasilitas Terganggu)</option>
                    <option value="Rendah">Rendah (Penyimpangan Ringan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Pelapor / Tenant *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama pengadu / tenant"
                    value={newReporter}
                    onChange={(e) => setNewReporter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Tugaskan Teknisi Langsung</label>
                  <select
                    value={newAssigned}
                    onChange={(e) => setNewAssigned(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-sm outline-none text-slate-600"
                  >
                    <option value="">-- Biarkan Masuk Waiting List --</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.name}>{t.name} (Ready)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Uraian Masalah / Deskripsi Detail *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan secara runtut gejala kerusakan, dampak terhadap tenant, dan kronologi jika diketahui."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-sm outline-none resize-none focus:border-slate-400"
                />
              </div>

              {/* Photo Simulator Attachment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Pilih Lampiran Foto Lapangan (Simulasi)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {samplePhotos.map((p, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setNewPhotoUrl(p.url)}
                      className={`relative rounded-lg overflow-hidden border-2 h-16 cursor-pointer group transition-all ${
                        newPhotoUrl === p.url ? 'border-indigo-600 scale-95 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center p-1 text-center opacity-85">
                        <span className="text-[9px] text-white font-semibold leading-tight">{p.name}</span>
                      </div>
                      {newPhotoUrl === p.url && (
                        <span className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-slate-950 text-white px-5 py-2 text-xs font-bold hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Submit Tiket Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog: Kelola / Selesaikan Tiket */}
      {showActionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                <span className="font-bold">Kelola Laporan {showActionModal.ticketNo}</span>
              </div>
              <button onClick={() => setShowActionModal(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Ticket Details summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">{showActionModal.assetType} • {showActionModal.building}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    showActionModal.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700' :
                    showActionModal.status === 'Dalam Pengerjaan' ? 'bg-blue-50 text-blue-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {showActionModal.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{showActionModal.title}</h4>
                <p className="text-slate-600 leading-normal">{showActionModal.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-200/50 text-slate-500">
                  <span>Lokasi: <b>{showActionModal.floorArea}</b></span>
                  <span>Pelapor: <b>{showActionModal.reporterName}</b></span>
                </div>

                {showActionModal.photoUrl && (
                  <div className="mt-2 w-full h-32 rounded bg-slate-200 overflow-hidden border border-slate-200">
                    <img 
                      src={showActionModal.photoUrl} 
                      alt="Aduan Lapangan" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {showActionModal.status !== 'Selesai' ? (
                isEngineer ? (
                  <div className="space-y-3.5">
                    <h5 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-1">Update Status Tugas</h5>

                    {/* Allocation form */}
                    <div>
                      <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1">Tugaskan ke Teknisi</label>
                      <select
                        value={actionAssigned}
                        onChange={(e) => setActionAssigned(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs outline-none"
                      >
                        <option value="">-- Pilih Teknisi --</option>
                        {technicians.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Action Taken (tindakan perbaikan) */}
                    <div>
                      <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1">Tindakan Perbaikan / Catatan Pekerjaan</label>
                      <textarea
                        rows={3}
                        placeholder="Uraikan apa saja tindakan perbaikan yang telah/sedang dilakukan, penggantian material, atau koordinasi vendor."
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs outline-none resize-none"
                      />
                    </div>

                    {/* Spent maintenance cost */}
                    {showActionModal.status === 'Dalam Pengerjaan' && (
                      <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide block mb-1">Biaya Material / Sparepart Terpakai (IDR)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-bold">
                            Rp
                          </div>
                          <input
                            type="number"
                            placeholder="0"
                            value={actionCost}
                            onChange={(e) => setActionCost(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg py-2 pl-8 pr-2.5 text-xs font-semibold outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">Biaya diakumulasikan ke laporan cost analysis bulanan (DEPCOS).</span>
                      </div>
                    )}

                    <button
                      onClick={handleUpdateTicket}
                      className="w-full mt-2 bg-slate-950 hover:bg-slate-850 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-all shadow"
                    >
                      {showActionModal.status === 'Baru' ? 'Tugaskan & Kerjakan Sekarang' : 'Selesaikan & Tutup Tiket'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl text-center space-y-1.5">
                    <p className="font-black text-amber-900 text-[11px] uppercase tracking-wide flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                      Akses Terbatas: Baca Saja
                    </p>
                    <p className="text-[10px] text-amber-700 leading-normal">
                      Hanya user dengan peran <b>Engineer</b> yang dapat memperbarui status tiket aduan atau mengalokasikan teknisi.
                    </p>
                  </div>
                )
              ) : (
                /* Archived completed data */
                <div className="space-y-3.5 border-t border-slate-100 pt-3">
                  <h5 className="font-bold text-emerald-800 flex items-center gap-1 text-xs">
                    <CheckCircle className="w-4 h-4" />
                    Pekerjaan Selesai & Terverifikasi
                  </h5>

                  <div className="space-y-1.5 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block">Tindakan Perbaikan:</span>
                    <p className="font-semibold text-slate-800 leading-relaxed">
                      {showActionModal.actionTaken || 'Tidak ada catatan perbaikan terekam.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="text-slate-400 block">Selesai Oleh:</span>
                      <span className="font-bold text-slate-800">{showActionModal.assignedTo}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="text-slate-400 block">Biaya Terpakai:</span>
                      <span className="font-bold text-slate-800">
                        IDR {showActionModal.cost ? showActionModal.cost.toLocaleString('id-ID') : 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
