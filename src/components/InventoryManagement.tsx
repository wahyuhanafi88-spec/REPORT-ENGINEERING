import React, { useState, useMemo } from 'react';
import { ToolItem, MaterialItem } from '../types';
import { 
  Package, 
  Wrench, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Search, 
  MapPin, 
  ShieldAlert, 
  Info,
  FolderOpen,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface InventoryProps {
  tools: ToolItem[];
  materials: MaterialItem[];
  onUpdateToolCondition: (id: string, goodDiff: number, badDiff: number) => void;
  onUpdateMaterialStock: (id: string, qtyDiff: number) => void;
  userRole?: 'User' | 'Engineer';
  onAddTool?: (newTool: Omit<ToolItem, 'id'>) => void;
  onUpdateTool?: (updatedTool: ToolItem) => void;
  onDeleteTool?: (id: string) => void;
  onAddMaterial?: (newMaterial: Omit<MaterialItem, 'id'>) => void;
  onUpdateMaterial?: (updatedMaterial: MaterialItem) => void;
  onDeleteMaterial?: (id: string) => void;
}

export default function InventoryManagement({ 
  tools, 
  materials, 
  onUpdateToolCondition, 
  onUpdateMaterialStock,
  userRole = 'Engineer',
  onAddTool,
  onUpdateTool,
  onDeleteTool,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial
}: InventoryProps) {
  const isEngineer = userRole === 'Engineer';
  const [activeTab, setActiveTab] = useState<'tools' | 'materials'>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interaction state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('1');

  // Modals for Adding/Editing
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);

  // Form states - Material
  const [matName, setMatName] = useState('');
  const [matCategory, setMatCategory] = useState('HVAC');
  const [matStock, setMatStock] = useState('10');
  const [matUnit, setMatUnit] = useState('pcs');
  const [matMinStock, setMatMinStock] = useState('5');
  const [matLocation, setMatLocation] = useState('RAK A-1');

  // Form states - Tool
  const [toolName, setToolName] = useState('');
  const [toolTotalQty, setToolTotalQty] = useState('5');
  const [toolLocation, setToolLocation] = useState('LEMARI B-2');

  // Filter lists
  const filteredTools = useMemo(() => {
    return tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tools, searchQuery]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [materials, searchQuery]);

  // Alert summary
  const alertCount = useMemo(() => {
    return materials.filter(m => m.stock <= m.minStock).length;
  }, [materials]);

  const handleAdjustStock = (isIncrement: boolean) => {
    if (!selectedItemId) return;
    const diff = parseInt(adjustAmount) || 1;
    onUpdateMaterialStock(selectedItemId, isIncrement ? diff : -diff);
    setSelectedItemId(null);
    setAdjustAmount('1');
  };

  const handleToolRepair = (toolId: string, toGood: boolean) => {
    if (toGood) {
      onUpdateToolCondition(toolId, 1, -1);
    } else {
      onUpdateToolCondition(toolId, -1, 1);
    }
  };

  // Submit functions
  const submitAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName) return;
    if (onAddMaterial) {
      onAddMaterial({
        name: matName,
        category: matCategory,
        stock: Number(matStock) || 0,
        unit: matUnit,
        minStock: Number(matMinStock) || 0,
        location: matLocation
      });
    }
    // reset
    setMatName('');
    setMatCategory('HVAC');
    setMatStock('10');
    setMatUnit('pcs');
    setMatMinStock('5');
    setMatLocation('RAK A-1');
    setShowAddMaterialModal(false);
  };

  const submitEditMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    if (onUpdateMaterial) {
      onUpdateMaterial({
        ...editingMaterial,
        name: matName,
        category: matCategory,
        stock: Number(matStock) || 0,
        unit: matUnit,
        minStock: Number(matMinStock) || 0,
        location: matLocation
      });
    }
    setEditingMaterial(null);
  };

  const submitAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName) return;
    const qty = Number(toolTotalQty) || 1;
    if (onAddTool) {
      onAddTool({
        name: toolName,
        totalQuantity: qty,
        goodCondition: qty,
        badCondition: 0,
        location: toolLocation
      });
    }
    setToolName('');
    setToolTotalQty('5');
    setToolLocation('LEMARI B-2');
    setShowAddToolModal(false);
  };

  const submitEditTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;
    const qty = Number(toolTotalQty) || 1;
    if (onUpdateTool) {
      // Re-calculate based on new total qty, keeping bad condition up to maximum new total
      const nextBad = Math.min(editingTool.badCondition, qty);
      const nextGood = qty - nextBad;
      onUpdateTool({
        ...editingTool,
        name: toolName,
        totalQuantity: qty,
        goodCondition: nextGood,
        badCondition: nextBad,
        location: toolLocation
      });
    }
    setEditingTool(null);
  };

  const openEditMaterial = (item: MaterialItem) => {
    setEditingMaterial(item);
    setMatName(item.name);
    setMatCategory(item.category);
    setMatStock(String(item.stock));
    setMatUnit(item.unit);
    setMatMinStock(String(item.minStock));
    setMatLocation(item.location);
  };

  const openEditTool = (item: ToolItem) => {
    setEditingTool(item);
    setToolName(item.name);
    setToolTotalQty(String(item.totalQuantity));
    setToolLocation(item.location);
  };

  const deleteMat = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus material ini dari gudang?')) {
      if (onDeleteMaterial) onDeleteMaterial(id);
    }
  };

  const deleteToolItem = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus peralatan kerja ini?')) {
      if (onDeleteTool) onDeleteTool(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner / Tab selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 rounded-lg text-white">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Gudang & Suku Cadang</h2>
              {isEngineer ? (
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-indigo-600" /> Mode Edit: Engineer
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" /> Mode Baca: User
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Pencatatan inventaris alat kerja (Tools) dan sisa stok material suku cadang (Material) di gedung.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tab buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('materials'); setSearchQuery(''); }}
              className={`px-4 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'materials' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Material & Sparepart (MI)
              {alertCount > 0 && (
                <span className="bg-rose-500 text-white font-extrabold text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                  {alertCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('tools'); setSearchQuery(''); }}
              className={`px-4 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'tools' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Peralatan Kerja (TI)
            </button>
          </div>

          {/* Quick Add buttons for Engineer */}
          {isEngineer && (
            <div className="flex items-center gap-2">
              {activeTab === 'materials' ? (
                <button
                  onClick={() => {
                    setEditingMaterial(null);
                    setMatName('');
                    setMatCategory('HVAC');
                    setMatStock('10');
                    setMatUnit('pcs');
                    setMatMinStock('5');
                    setMatLocation('RAK A-1');
                    setShowAddMaterialModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  Tambah Suku Cadang
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingTool(null);
                    setToolName('');
                    setToolTotalQty('5');
                    setToolLocation('LEMARI B-2');
                    setShowAddToolModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  Tambah Alat Kerja
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Warnings & Inventory Control split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Inventory Stats & Quick action */}
        <div className="space-y-6 lg:col-span-1">
          {/* User limit disclaimer */}
          {!isEngineer && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 space-y-2 shadow-sm">
              <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="text-amber-600 w-4 h-4" />
                Akses Terbatas (User)
              </h3>
              <p className="text-[11px] text-amber-700 leading-normal">
                Peran Anda saat ini adalah <b>User</b>. Anda hanya diperbolehkan membaca sisa stok material dan lokasi simpan. 
                Suku cadang dan peralatan hanya dapat ditambah atau diubah oleh petugas <b>Engineer</b>.
              </p>
            </div>
          )}

          {/* Restock Warning Banner */}
          {alertCount > 0 && activeTab === 'materials' && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-4 space-y-3 shadow-sm">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="text-rose-600 w-4 h-4 animate-pulse" />
                Peringatan Stok Minim ({alertCount})
              </h3>
              <p className="text-[11px] text-rose-700 leading-normal">
                Suku cadang berikut berada di bawah ambang batas minimum. Segera buat purchase request (PR) untuk restock!
              </p>
              
              <div className="space-y-1.5">
                {materials.filter(m => m.stock <= m.minStock).map(m => (
                  <div key={m.id} className="bg-white border border-rose-100/60 rounded p-2 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800 line-clamp-1">{m.name}</span>
                    <span className="font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded shrink-0">
                      Stok: {m.stock} {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Tool Control Explainer */}
          {activeTab === 'tools' && (
            <div className="bg-amber-50/50 border border-amber-100/80 rounded-xl p-4 text-xs space-y-3">
              <h3 className="font-bold text-amber-900 flex items-center gap-1">
                <Info className="w-4 h-4 text-amber-700" />
                Panduan Alat Kerja (TI)
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Setiap peralatan kerja wajib diperiksa kelayakannya. Jika ada alat yang rusak diperbaiki, atau alat baik rusak saat pengerjaan di lapangan, gunakan tombol <span className="font-bold">Set Rusak</span> atau <span className="font-bold">Set Bagus</span> untuk memperbarui kondisi kelayakan.
              </p>
              <div className="bg-white border border-slate-100 rounded-lg p-3 space-y-1">
                <span className="font-bold text-slate-800 block">Status Baik (Good):</span>
                <p className="text-[11px] text-slate-500">Dapat dipinjam teknisi untuk pengerjaan helpdesk.</p>
                <span className="font-bold text-slate-800 block mt-2">Status Rusak (Bad):</span>
                <p className="text-[11px] text-slate-500">Sedang diperbaiki atau ditarik dari lapangan.</p>
              </div>
            </div>
          )}

          {/* Interactive Stock Adjuster Box */}
          {selectedItemId && activeTab === 'materials' && isEngineer && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-md animate-in fade-in-50 duration-200">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider block">Kelola Stok Material</h4>
                <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                  {materials.find(m => m.id === selectedItemId)?.name}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Penyesuaian</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-bold outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500">
                    {materials.find(m => m.id === selectedItemId)?.unit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleAdjustStock(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Stok
                </button>
                <button
                  onClick={() => handleAdjustStock(false)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Minus className="w-3.5 h-3.5" />
                  Pakai Stok
                </button>
              </div>

              <button
                onClick={() => setSelectedItemId(null)}
                className="w-full text-center text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase"
              >
                Batal
              </button>
            </div>
          )}
        </div>

        {/* Right column: Inventory List Tables */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm lg:col-span-3 flex flex-col overflow-hidden">
          {/* Search bar inside table */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-slate-500" />
              Tabel Gudang {activeTab === 'materials' ? 'Bahan & Suku Cadang (MI)' : 'Peralatan Kerja (TI)'}
            </h4>

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs w-full sm:max-w-[200px]">
              <Search className="text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'materials' ? (
              /* Materials Table */
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Nama Suku Cadang</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Lokasi Rak</th>
                    <th className="p-4 text-center">Status Stok</th>
                    <th className="p-4 text-center">Aksi / Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMaterials.map(m => {
                    const isLow = m.stock <= m.minStock;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-all font-medium text-slate-700">
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{m.name}</span>
                            <span className="text-[10px] text-slate-400 block">Ambang batas aman: {m.minStock} {m.unit}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold text-[10px]">
                            {m.category}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {m.location}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <span className={`font-black text-sm px-2.5 py-0.5 rounded ${
                              isLow ? 'text-rose-700 bg-rose-50' : 'text-slate-800 bg-slate-100'
                            }`}>
                              {m.stock} {m.unit}
                            </span>
                            {isLow && (
                              <span className="text-[9px] font-extrabold text-rose-600 uppercase flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Stok Kritis
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {isEngineer ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedItemId(m.id)}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-2 py-1 rounded text-[10px] flex items-center gap-1"
                                title="Atur jumlah stok material"
                              >
                                Atur Stok
                              </button>
                              <button
                                onClick={() => openEditMaterial(m)}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 px-1.5 py-1 rounded"
                                title="Edit Detail Material"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteMat(m.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 px-1.5 py-1 rounded"
                                title="Hapus dari Gudang"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center text-slate-400 italic text-[10px] flex items-center justify-center gap-1">
                              <Lock className="w-3 h-3" /> Hanya Baca
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredMaterials.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                        Tidak ada material/suku cadang terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              /* Tools Table */
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Nama Alat Kerja</th>
                    <th className="p-4">Lokasi Simpan</th>
                    <th className="p-4 text-center">Total Jumlah</th>
                    <th className="p-4 text-center">Layak (Good)</th>
                    <th className="p-4 text-center">Rusak (Bad)</th>
                    <th className="p-4 text-center">Aksi & Kondisi Kelayakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTools.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-all font-medium text-slate-700">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{t.name}</span>
                      </td>
                      <td className="p-4 text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {t.location}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-800 text-sm">
                        {t.totalQuantity} pcs
                      </td>
                      <td className="p-4 text-center font-bold text-emerald-600">
                        {t.goodCondition} pcs
                      </td>
                      <td className="p-4 text-center font-bold text-rose-600">
                        {t.badCondition} pcs
                      </td>
                      <td className="p-4">
                        {isEngineer ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              disabled={t.goodCondition <= 0}
                              onClick={() => handleToolRepair(t.id, false)}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded text-[10px] font-bold disabled:opacity-50"
                              title="Laporkan Alat Kerja ini Rusak"
                            >
                              Set Rusak
                            </button>
                            <button
                              disabled={t.badCondition <= 0}
                              onClick={() => handleToolRepair(t.id, true)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold disabled:opacity-50"
                              title="Laporkan Alat Selesai Diperbaiki"
                            >
                              Set Bagus
                            </button>
                            <button
                              onClick={() => openEditTool(t)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 px-1.5 py-1 rounded"
                              title="Edit Detail Alat"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteToolItem(t.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 px-1.5 py-1 rounded"
                              title="Hapus Alat Kerja"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 italic text-[10px] flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Hanya Baca
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredTools.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        Tidak ada alat kerja terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* --- MODAL FOR ADDING/EDITING MATERIAL --- */}
      {(showAddMaterialModal || editingMaterial) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                {editingMaterial ? 'Ubah Suku Cadang' : 'Tambah Suku Cadang Baru'}
              </h3>
              <button 
                onClick={() => { setShowAddMaterialModal(false); setEditingMaterial(null); }}
                className="text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingMaterial ? submitEditMaterial : submitAddMaterial} className="p-5 space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Nama Suku Cadang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lampu LED Philips 14W E27"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-slate-800 focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Kategori</label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-slate-800"
                  >
                    <option value="HVAC">HVAC / Pendingin</option>
                    <option value="Kelistrikan">Kelistrikan / Elektrikal</option>
                    <option value="Plumbing">Plumbing / Pipa</option>
                    <option value="Lift/Elevator">Lift & Elevator</option>
                    <option value="Struktur">Struktur / Sipil</option>
                    <option value="Lainnya">Lainnya / Umum</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Satuan Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: pcs, rol, can, mtr"
                    value={matUnit}
                    onChange={(e) => setMatUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-slate-800 focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Stok Saat Ini</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={matStock}
                    onChange={(e) => setMatStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-slate-800 focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Stok Minimum Aman</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={matMinStock}
                    onChange={(e) => setMatMinStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-slate-800 focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Lokasi Penyimpanan Rak</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: RAK B-4 ELEKTRIKAL"
                  value={matLocation}
                  onChange={(e) => setMatLocation(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-slate-800 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddMaterialModal(false); setEditingMaterial(null); }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs"
                >
                  {editingMaterial ? 'Simpan Perubahan' : 'Daftarkan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL FOR ADDING/EDITING TOOL --- */}
      {(showAddToolModal || editingTool) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-400" />
                {editingTool ? 'Ubah Alat Kerja' : 'Tambah Peralatan Kerja Baru'}
              </h3>
              <button 
                onClick={() => { setShowAddToolModal(false); setEditingTool(null); }}
                className="text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingTool ? submitEditTool : submitAddTool} className="p-5 space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Nama Alat Kerja / Tools</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bor Cordless Bosch 18V"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-slate-800 focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Total Jumlah Alat</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={toolTotalQty}
                    onChange={(e) => setToolTotalQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-slate-800 focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Lokasi Simpan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: LEMARI B-2 TOOLS"
                    value={toolLocation}
                    onChange={(e) => setToolLocation(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              {editingTool && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-slate-600">
                  <p className="text-[11px] leading-relaxed">
                    <b>Catatan Kondisi saat ini:</b> Alat Rusak ({editingTool.badCondition} pcs), Alat Layak ({editingTool.goodCondition} pcs). 
                    Mengubah total jumlah alat akan menyesuaikan alat layak secara otomatis.
                  </p>
                </div>
              )}

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddToolModal(false); setEditingTool(null); }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs"
                >
                  {editingTool ? 'Simpan Perubahan' : 'Daftarkan Alat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
