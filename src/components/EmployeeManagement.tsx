import React, { useState, useMemo } from 'react';
import { Employee, BuildingName } from '../types';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Building, 
  Shield, 
  Check, 
  X, 
  User, 
  Users, 
  UserCheck, 
  UserMinus, 
  FileText,
  Clock,
  Lock
} from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (newEmp: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (updatedEmp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  userRole?: string;
}

export default function EmployeeManagement({ 
  employees, 
  onAddEmployee, 
  onUpdateEmployee, 
  onDeleteEmployee,
  userRole = 'Super Admin'
}: EmployeeManagementProps) {
  const isEngineer = userRole === 'Super Admin';
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBuilding, setFilterBuilding] = useState<string>('Semua');
  const [filterRole, setFilterRole] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form States for Add/Edit
  const [formName, setFormName] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formRole, setFormRole] = useState('TEKNISI');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Cuti' | 'Off'>('Aktif');
  const [formBuilding, setFormBuilding] = useState<BuildingName>('Palmerah');

  // Available options
  const buildingOptions: BuildingName[] = ['Palmerah', 'Pecenongan', 'Gedung Sangaji', 'Permata Hijau'];
  const roleOptions = ['AREA MANAGER', 'SUPERVISOR MOBILE', 'TEKNISI', 'TEKNISI MOBILE', 'AM Engineering', 'Supervisor', 'Teknisi'];
  const statusOptions: ('Aktif' | 'Cuti' | 'Off')[] = ['Aktif', 'Cuti', 'Off'];

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormName('');
    setFormNik('');
    setFormRole('TEKNISI');
    setFormPhone('');
    setFormEmail('');
    setFormStatus('Aktif');
    setFormBuilding('Palmerah');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormNik(emp.nik || '');
    setFormRole(emp.role);
    setFormPhone(emp.phone);
    setFormEmail(emp.email);
    setFormStatus(emp.status);
    setFormBuilding(emp.assignedBuilding || 'Palmerah');
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      alert('Nama dan No Telpon Aktif wajib diisi!');
      return;
    }
    onAddEmployee({
      name: formName,
      nik: formNik,
      role: formRole,
      phone: formPhone,
      email: formEmail,
      status: formStatus,
      assignedBuilding: formBuilding
    });
    setShowAddModal(false);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    if (!formName || !formPhone) {
      alert('Nama dan No Telpon Aktif wajib diisi!');
      return;
    }
    onUpdateEmployee({
      id: editingEmployee.id,
      name: formName,
      nik: formNik,
      role: formRole,
      phone: formPhone,
      email: formEmail,
      status: formStatus,
      assignedBuilding: formBuilding
    });
    setEditingEmployee(null);
  };

  // Handle Delete
  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus karyawan "${name}" dari sistem?`)) {
      onDeleteEmployee(id);
    }
  };

  // Filtered Roster
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.nik || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBuilding = filterBuilding === 'Semua' || emp.assignedBuilding === filterBuilding;
      const matchesRole = filterRole === 'Semua' || emp.role === filterRole;
      const matchesStatus = filterStatus === 'Semua' || emp.status === filterStatus;

      return matchesSearch && matchesBuilding && matchesRole && matchesStatus;
    });
  }, [employees, searchQuery, filterBuilding, filterRole, filterStatus]);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'Aktif').length;
    const cuti = employees.filter(e => e.status === 'Cuti').length;
    const off = employees.filter(e => e.status === 'Off').length;
    
    const areaManagerCount = employees.filter(e => e.role === 'AREA MANAGER').length;
    const spvCount = employees.filter(e => e.role.includes('SUPERVISOR') || e.role === 'Supervisor').length;
    const techCount = employees.filter(e => e.role.includes('TEKNISI') || e.role === 'Teknisi').length;

    return { total, active, cuti, off, areaManagerCount, spvCount, techCount };
  }, [employees]);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Kelola & Daftar Karyawan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen daftar personil divisi engineering, supervisor, dan area manager penugasan 4 gedung utama.
          </p>
        </div>
        
        {isEngineer ? (
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Karyawan Baru
          </button>
        ) : (
          <div className="bg-amber-100 text-amber-800 text-[11px] font-black px-3.5 py-2 rounded-lg border border-amber-200 uppercase tracking-wide flex items-center gap-1.5 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            Akses Roster: Baca Saja
          </div>
        )}
      </div>

      {/* Roster Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Employees */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Personil</span>
            <span className="text-xl font-extrabold text-slate-800 block">{stats.total} Orang</span>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Aktif</span>
            <span className="text-xl font-extrabold text-slate-800 block">{stats.active} Aktif</span>
          </div>
        </div>

        {/* Card 3: Cuti / Leave */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sedang Cuti</span>
            <span className="text-xl font-extrabold text-slate-800 block">{stats.cuti} Orang</span>
          </div>
        </div>

        {/* Card 4: Off */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <UserMinus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Off / Roster</span>
            <span className="text-xl font-extrabold text-slate-800 block">{stats.off} Off</span>
          </div>
        </div>

      </div>

      {/* Search and Filters Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, NIK, email, no handphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:bg-white focus:border-slate-400 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Building */}
          <div className="w-full md:w-44">
            <div className="relative">
              <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <select
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs font-semibold outline-none appearance-none"
              >
                <option value="Semua">Semua Gedung</option>
                {buildingOptions.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Role */}
          <div className="w-full md:w-44">
            <div className="relative">
              <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs font-semibold outline-none appearance-none"
              >
                <option value="Semua">Semua Jabatan</option>
                <option value="AREA MANAGER">AREA MANAGER</option>
                <option value="SUPERVISOR MOBILE">SUPERVISOR MOBILE</option>
                <option value="TEKNISI">TEKNISI</option>
                <option value="TEKNISI MOBILE">TEKNISI MOBILE</option>
                <option value="AM Engineering">AM Engineering</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Teknisi">Teknisi</option>
              </select>
            </div>
          </div>

          {/* Filter Status */}
          <div className="w-full md:w-40">
            <div className="relative">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg pl-8 pr-2 py-2 text-xs font-semibold outline-none appearance-none"
              >
                <option value="Semua">Semua Status</option>
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Employee Table Board */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">NO</th>
                <th className="py-3 px-4">NAMA KARYAWAN</th>
                <th className="py-3 px-4">NIK</th>
                <th className="py-3 px-4">JABATAN</th>
                <th className="py-3 px-4">NO TELPON AKTIF</th>
                <th className="py-3 px-4">EMAIL</th>
                <th className="py-3 px-4">GEDUNG UTAMA</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-center w-24">{isEngineer ? 'AKSI' : 'STATUS AKSES'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada data karyawan yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => {
                  
                  // Role style colors
                  const roleStyle = 
                    emp.role === 'AREA MANAGER' || emp.role === 'AM Engineering' || emp.role === 'Chief Engineering' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    emp.role === 'SUPERVISOR MOBILE' || emp.role === 'Supervisor' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    emp.role === 'TEKNISI MOBILE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    emp.role === 'TEKNISI' || emp.role === 'Teknisi' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                    'bg-slate-100 text-slate-800 border-slate-200';

                  // Status badge style
                  const statusBadge = 
                    emp.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    emp.status === 'Cuti' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-50 text-slate-500 border border-slate-200';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-3.5 px-4 font-bold text-slate-400 text-center">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-[11px] uppercase shrink-0">
                            {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 block text-xs">{emp.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium block">ID: {emp.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                        {emp.nik || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${roleStyle}`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{emp.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[160px]" title={emp.email}>
                        {emp.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="underline hover:text-indigo-600">{emp.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Tidak ada</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.assignedBuilding || 'Belum Ditugaskan'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isEngineer ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                              title="Edit Data"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(emp.id, emp.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[10px] flex items-center justify-center gap-1 font-semibold">
                            <Lock className="w-3 h-3 text-slate-400" /> Baca Saja
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table count info */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span>Menampilkan {filteredEmployees.length} dari {employees.length} total karyawan</span>
          <span>Panin Palmerah Building Management</span>
        </div>
      </div>

      {/* Add Employee Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">Form Tambah Karyawan Baru</span>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              {/* Nama */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Nama Lengkap *</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: HABIB HANAFI"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 font-bold"
                />
              </div>

              {/* NIK */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">NIK (Nomor Induk Karyawan)</label>
                <input
                  type="text"
                  placeholder="Contoh: 2501354"
                  value={formNik}
                  onChange={(e) => setFormNik(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-mono outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* JABATAN */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Jabatan / Peran *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-bold outline-none"
                >
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* NO TELPON */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">No Telpon Aktif *</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: 08522221227"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-mono outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Alamat Email</label>
                <input
                  type="email"
                  placeholder="Contoh: wahyuhanafi88@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* GEDUNG UTAMA */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Penugasan Gedung Utama</label>
                <select
                  value={formBuilding}
                  onChange={(e) => setFormBuilding(e.target.value as BuildingName)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-semibold outline-none"
                >
                  {buildingOptions.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* STATUS */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Status Keaktifan</label>
                <div className="flex gap-4 pt-1">
                  {statusOptions.map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="status"
                        checked={formStatus === status}
                        onChange={() => setFormStatus(status)}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                      />
                      <span>{status}</span>
                    </label>
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-bold rounded-lg shadow-sm"
                >
                  Simpan Karyawan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal Dialog */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">Form Edit Data Karyawan</span>
              </div>
              <button onClick={() => setEditingEmployee(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              {/* Nama */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Nama Lengkap *</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: HABIB HANAFI"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 font-bold"
                />
              </div>

              {/* NIK */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">NIK (Nomor Induk Karyawan)</label>
                <input
                  type="text"
                  placeholder="Contoh: 2501354"
                  value={formNik}
                  onChange={(e) => setFormNik(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-mono outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* JABATAN */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Jabatan / Peran *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-bold outline-none"
                >
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* NO TELPON */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">No Telpon Aktif *</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: 08522221227"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-mono outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Alamat Email</label>
                <input
                  type="email"
                  placeholder="Contoh: wahyuhanafi88@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* GEDUNG UTAMA */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Penugasan Gedung Utama</label>
                <select
                  value={formBuilding}
                  onChange={(e) => setFormBuilding(e.target.value as BuildingName)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-semibold outline-none"
                >
                  {buildingOptions.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* STATUS */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Status Keaktifan</label>
                <div className="flex gap-4 pt-1">
                  {statusOptions.map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="edit-status"
                        checked={formStatus === status}
                        onChange={() => setFormStatus(status)}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-bold rounded-lg shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
