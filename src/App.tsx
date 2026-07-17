import React, { useState, useEffect } from 'react';
import { 
  BuildingName, 
  Ticket, 
  PMTask, 
  EnergyReading, 
  ToolItem, 
  MaterialItem, 
  CostRecord, 
  Employee,
  ChecklistItem,
  TicketStatus
} from './types';
import { 
  initialEmployees, 
  initialTickets, 
  initialPMTasks, 
  initialEnergyReadings, 
  initialTools, 
  initialMaterials, 
  initialCosts 
} from './data/mockData';

// Component Imports
import DashboardOverview from './components/DashboardOverview';
import HelpdeskTickets from './components/HelpdeskTickets';
import PreventiveMaintenance from './components/PreventiveMaintenance';
import EnergyLogs from './components/EnergyLogs';
import InventoryManagement from './components/InventoryManagement';
import ReportGenerator from './components/ReportGenerator';
import EmployeeManagement from './components/EmployeeManagement';
import Login from './components/Login';

import { 
  LayoutDashboard, 
  Wrench, 
  Calendar, 
  Activity, 
  Package, 
  FileText, 
  HardHat, 
  Building, 
  AlertCircle,
  TrendingUp,
  User,
  Power,
  RefreshCw
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'helpdesk' | 'preventive' | 'energy' | 'inventory' | 'reports' | 'employees'>('dashboard');

  // User Authentication State
  const [user, setUser] = useState<{ role: 'User' | 'Engineer'; name: string } | null>(() => {
    const saved = localStorage.getItem('eng_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (role: 'User' | 'Engineer', name: string) => {
    const newUser = { role, name };
    setUser(newUser);
    localStorage.setItem('eng_current_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('eng_current_user');
  };

  // Unified persistent states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pmTasks, setPmTasks] = useState<PMTask[]>([]);
  const [energyReadings, setEnergyReadings] = useState<EnergyReading[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [costs, setCosts] = useState<CostRecord[]>([]);

  // Load from LocalStorage or seed defaults
  useEffect(() => {
    const savedEmployees = localStorage.getItem('eng_employees');
    const savedTickets = localStorage.getItem('eng_tickets');
    const savedPM = localStorage.getItem('eng_pmTasks');
    const savedEnergy = localStorage.getItem('eng_energyReadings');
    const savedTools = localStorage.getItem('eng_tools');
    const savedMaterials = localStorage.getItem('eng_materials');
    const savedCosts = localStorage.getItem('eng_costs');

    setEmployees(savedEmployees ? JSON.parse(savedEmployees) : initialEmployees);
    setTickets(savedTickets ? JSON.parse(savedTickets) : initialTickets);
    setPmTasks(savedPM ? JSON.parse(savedPM) : initialPMTasks);
    setEnergyReadings(savedEnergy ? JSON.parse(savedEnergy) : initialEnergyReadings);
    setTools(savedTools ? JSON.parse(savedTools) : initialTools);
    setMaterials(savedMaterials ? JSON.parse(savedMaterials) : initialMaterials);
    setCosts(savedCosts ? JSON.parse(savedCosts) : initialCosts);
  }, []);

  // Sync to LocalStorage upon changes
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --- ACTIONS HANDLERS ---

  // 1. Add Ticket (Helpdesk)
  const handleAddTicket = (newTicketData: Omit<Ticket, 'id' | 'ticketNo' | 'createdAt'>) => {
    const ticketNo = `WO-2026-${String(tickets.length + 1).padStart(3, '0')}`;
    const newTicket: Ticket = {
      ...newTicketData,
      id: `t-${Date.now()}`,
      ticketNo,
      createdAt: new Date().toISOString()
    };
    
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    saveToStorage('eng_tickets', updated);
  };

  // 2. Update Ticket Status (Transitions to In Progress or Completed)
  const handleUpdateTicketStatus = (
    id: string, 
    status: TicketStatus, 
    details?: { actionTaken?: string; cost?: number; assignedTo?: string }
  ) => {
    const updated = tickets.map(t => {
      if (t.id === id) {
        const tCopy = { ...t, status };
        if (details?.assignedTo) tCopy.assignedTo = details.assignedTo;
        if (details?.actionTaken) tCopy.actionTaken = details.actionTaken;
        if (details?.cost !== undefined) tCopy.cost = details.cost;
        
        if (status === 'Selesai') {
          tCopy.finishedAt = new Date().toISOString();
          
          // Deduct from materials or register a cost in DEPCOS automatically
          if (details?.cost && details.cost > 0) {
            const newCost: CostRecord = {
              id: `c-${Date.now()}`,
              date: new Date().toISOString().substring(0, 7), // YYYY-MM
              category: t.assetType === 'HVAC/AC' ? 'HVAC' : 
                        t.assetType === 'Lift/Elevator' ? 'Lift/Elevator' :
                        t.assetType === 'Kelistrikan' ? 'Kelistrikan' :
                        t.assetType === 'Plumbing/Pipa Air' ? 'Plumbing' : 
                        t.assetType === 'Struktur Bangunan' ? 'Struktur' : 'Lainnya',
              description: `Material perbaikan WO: ${t.ticketNo} - ${t.title}`,
              cost: details.cost,
              building: t.building
            };
            const updatedCosts = [newCost, ...costs];
            setCosts(updatedCosts);
            saveToStorage('eng_costs', updatedCosts);
          }
        }
        return tCopy;
      }
      return t;
    });

    setTickets(updated);
    saveToStorage('eng_tickets', updated);
  };

  // 3. Complete Preventive Maintenance Task (with checklist verification)
  const handleCompletePMTask = (id: string, completedBy: string, checklist: ChecklistItem[]) => {
    const updated = pmTasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          status: 'Selesai' as const,
          completedBy,
          completedDate: new Date().toISOString().split('T')[0],
          checklist
        };
      }
      return task;
    });

    setPmTasks(updated);
    saveToStorage('eng_pmTasks', updated);
  };

  // 4. Create custom PM task
  const handleAddPMTask = (task: Omit<PMTask, 'id' | 'status'>) => {
    const newTask: PMTask = {
      ...task,
      id: `pm-${Date.now()}`,
      status: 'Belum Selesai'
    };
    const updated = [newTask, ...pmTasks];
    setPmTasks(updated);
    saveToStorage('eng_pmTasks', updated);
  };

  // 5. Save daily utility logger
  const handleAddReading = (reading: Omit<EnergyReading, 'id'>) => {
    const newReading: EnergyReading = {
      ...reading,
      id: `en-${Date.now()}`
    };
    const updated = [newReading, ...energyReadings];
    setEnergyReadings(updated);
    saveToStorage('eng_energyReadings', updated);
  };

  // 6. Adjust tool good/bad quantities
  const handleUpdateToolCondition = (id: string, goodDiff: number, badDiff: number) => {
    const updated = tools.map(t => {
      if (t.id === id) {
        const nextGood = Math.max(0, t.goodCondition + goodDiff);
        const nextBad = Math.max(0, t.badCondition + badDiff);
        return {
          ...t,
          goodCondition: nextGood,
          badCondition: nextBad,
          totalQuantity: nextGood + nextBad
        };
      }
      return t;
    });
    setTools(updated);
    saveToStorage('eng_tools', updated);
  };

  // 7. Deduct or replenish stock of warehouse items
  const handleUpdateMaterialStock = (id: string, qtyDiff: number) => {
    const updated = materials.map(m => {
      if (m.id === id) {
        return {
          ...m,
          stock: Math.max(0, m.stock + qtyDiff)
        };
      }
      return m;
    });
    setMaterials(updated);
    saveToStorage('eng_materials', updated);
  };

  // 12. Add Tool
  const handleAddTool = (newTool: Omit<ToolItem, 'id'>) => {
    const item: ToolItem = {
      ...newTool,
      id: `tool-${Date.now()}`
    };
    const updated = [...tools, item];
    setTools(updated);
    saveToStorage('eng_tools', updated);
  };

  // 13. Update Tool
  const handleUpdateTool = (updatedTool: ToolItem) => {
    const updated = tools.map(t => t.id === updatedTool.id ? updatedTool : t);
    setTools(updated);
    saveToStorage('eng_tools', updated);
  };

  // 14. Delete Tool
  const handleDeleteTool = (id: string) => {
    const updated = tools.filter(t => t.id !== id);
    setTools(updated);
    saveToStorage('eng_tools', updated);
  };

  // 15. Add Material
  const handleAddMaterial = (newMaterial: Omit<MaterialItem, 'id'>) => {
    const item: MaterialItem = {
      ...newMaterial,
      id: `mat-${Date.now()}`
    };
    const updated = [...materials, item];
    setMaterials(updated);
    saveToStorage('eng_materials', updated);
  };

  // 16. Update Material
  const handleUpdateMaterial = (updatedMaterial: MaterialItem) => {
    const updated = materials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m);
    setMaterials(updated);
    saveToStorage('eng_materials', updated);
  };

  // 17. Delete Material
  const handleDeleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    saveToStorage('eng_materials', updated);
  };

  // 9. Add Employee
  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`
    };
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    saveToStorage('eng_employees', updated);
  };

  // 10. Update Employee
  const handleUpdateEmployee = (updatedEmp: Employee) => {
    const updated = employees.map(e => e.id === updatedEmp.id ? updatedEmp : e);
    setEmployees(updated);
    saveToStorage('eng_employees', updated);
  };

  // 11. Delete Employee
  const handleDeleteEmployee = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    saveToStorage('eng_employees', updated);
  };

  // 8. Wipe data to return to defaults
  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang seluruh data kembali ke setelan pabrik? Tindakan ini akan menghapus log baru.')) {
      localStorage.clear();
      setEmployees(initialEmployees);
      setTickets(initialTickets);
      setPmTasks(initialPMTasks);
      setEnergyReadings(initialEnergyReadings);
      setTools(initialTools);
      setMaterials(initialMaterials);
      setCosts(initialCosts);
      setActiveTab('dashboard');
    }
  };

  // Computations for global health banner indicators
  const activeTechniciansCount = employees.filter(e => e.role.toLowerCase().includes('teknisi') && e.status === 'Aktif').length;
  const pmPendingCount = pmTasks.filter(p => p.status === 'Belum Selesai').length;
  const criticalMaterialsCount = materials.filter(m => m.stock <= m.minStock).length;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. Global Header - Navy Blue dominant */}
      <header className="bg-slate-900 text-white shadow-md print:hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <HardHat className="w-6 h-6 stroke-2" />
              </div>
              <div>
                <span className="font-black text-sm tracking-wider uppercase block">PANIN PALMERAH</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block -mt-1">Engineering System</span>
              </div>
            </div>

            {/* Right: User Profile (personalized dynamically based on login) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                <div className="text-right">
                  <span className="text-xs font-black block text-slate-100">{user.name}</span>
                  <span className="text-[10px] font-semibold text-indigo-400 block -mt-0.5">
                    {user.role === 'Engineer' ? 'AM / Engineer' : 'User Umum'}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-indigo-500 flex items-center justify-center text-indigo-900 font-extrabold text-xs">
                  {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all text-[11px] font-black uppercase rounded border border-rose-500/20"
                title="Keluar dari sistem"
              >
                <Power className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. Stat indicators sub-header - HIDDEN during printing */}
      <section className="bg-slate-950 text-slate-300 py-2.5 px-4 print:hidden border-b border-slate-900 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              Status: <b className="text-emerald-400">4 Gedung Terpantau</b>
            </span>
            <span className="flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-slate-500" />
              Karyawan: <b className="text-slate-100">{employees.length} Orang</b> (Technician Roster)
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              PM Tertunda: <b className={`font-black ${pmPendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{pmPendingCount} Agenda</b>
            </span>
            {criticalMaterialsCount > 0 && (
              <span className="flex items-center gap-1.5 text-rose-400 animate-pulse font-bold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {criticalMaterialsCount} Suku Cadang Kritis!
              </span>
            )}
          </div>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-all uppercase tracking-wider font-bold"
            title="Setel ulang data bawaan excel harian/bulanan"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Data Bawaan
          </button>
        </div>
      </section>

      {/* 3. Main Frame Navigation tabs */}
      <nav className="bg-white border-b border-slate-200 print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex space-x-1 py-1.5">
            {[
              { id: 'dashboard', label: 'Dasbor Utama', icon: LayoutDashboard },
              { id: 'helpdesk', label: 'Tiket & Helpdesk', icon: Wrench },
              { id: 'preventive', label: 'Perawatan Preventif (PM)', icon: Calendar },
              { id: 'energy', label: 'Catatan Meter Energi', icon: Activity },
              { id: 'inventory', label: 'Gudang & Suku Cadang', icon: Package },
              { id: 'employees', label: 'Daftar Karyawan', icon: User },
              { id: 'reports', label: 'Cetak Laporan', icon: FileText },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 4. Scrollable Container for Dynamic Pages */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview 
            tickets={tickets} 
            pmTasks={pmTasks} 
            energyReadings={energyReadings} 
            costs={costs} 
          />
        )}

        {activeTab === 'helpdesk' && (
          <HelpdeskTickets 
            tickets={tickets} 
            employees={employees}
            onAddTicket={handleAddTicket} 
            onUpdateTicketStatus={handleUpdateTicketStatus} 
            userRole={user.role}
          />
        )}

        {activeTab === 'preventive' && (
          <PreventiveMaintenance 
            pmTasks={pmTasks} 
            employees={employees}
            onCompletePMTask={handleCompletePMTask} 
            onAddPMTask={handleAddPMTask} 
          />
        )}

        {activeTab === 'energy' && (
          <EnergyLogs 
            energyReadings={energyReadings} 
            employees={employees}
            onAddReading={handleAddReading} 
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManagement 
            tools={tools} 
            materials={materials} 
            onUpdateToolCondition={handleUpdateToolCondition}
            onUpdateMaterialStock={handleUpdateMaterialStock}
            userRole={user.role}
            onAddTool={handleAddTool}
            onUpdateTool={handleUpdateTool}
            onDeleteTool={handleDeleteTool}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeManagement 
            employees={employees} 
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            userRole={user.role}
          />
        )}

        {activeTab === 'reports' && (
          <ReportGenerator 
            tickets={tickets} 
            pmTasks={pmTasks} 
            energyReadings={energyReadings} 
            costs={costs} 
            employees={employees} 
          />
        )}
      </main>

      {/* 5. Minimalist Footer */}
      <footer className="bg-slate-900 text-slate-500 py-4 text-center text-xs border-t border-slate-800 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <span>© 2026 Panin Palmerah Building Management. Seluruh Hak Cipta Dilindungi.</span>
          <span className="block text-[10px] text-slate-600 mt-1">Sistem Pemeliharaan Aset & Fasilitas Gedung Versi Digital • 4 Gedung Jakarta</span>
        </div>
      </footer>

    </div>
  );
}
