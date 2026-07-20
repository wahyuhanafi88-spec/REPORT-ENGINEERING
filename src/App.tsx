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

// Firebase and Google Sheets Integration Imports
import { 
  initAuth,
  googleSignIn,
  logout as googleLogout
} from './lib/firebase';

import {
  findOrCreateSpreadsheet,
  loadSheetData,
  saveSheetData,
  syncAllToSheets
} from './lib/sheetsSync';

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
  RefreshCw,
  Database,
  Cloud,
  CloudOff
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'helpdesk' | 'preventive' | 'energy' | 'inventory' | 'reports' | 'employees'>('dashboard');

  // User Authentication State
  const [user, setUser] = useState<{ role: 'Super Admin' | 'Admin' | 'Teknisi'; name: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bss_manual_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Unified persistent states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pmTasks, setPmTasks] = useState<PMTask[]>([]);
  const [energyReadings, setEnergyReadings] = useState<EnergyReading[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [costs, setCosts] = useState<CostRecord[]>([]);

  // Sync status
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error' | 'not-configured'>('idle');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Belum pernah');
  const [nextSyncCountdown, setNextSyncCountdown] = useState<number>(300);

  const stateRef = React.useRef({ employees, tickets, pmTasks, energyReadings, tools, materials, costs });
  
  useEffect(() => {
    stateRef.current = { employees, tickets, pmTasks, energyReadings, tools, materials, costs };
  }, [employees, tickets, pmTasks, energyReadings, tools, materials, costs]);

  // Helper to load and seed all sheets if empty
  const loadAndSeedAllSheets = async (sheetId: string, token: string) => {
    // 1. Load employees
    let loadedEmployees = await loadSheetData(sheetId, 'employees', token);
    if (!loadedEmployees || loadedEmployees.length === 0) {
      await saveSheetData(sheetId, 'employees', initialEmployees, token);
      loadedEmployees = initialEmployees;
    }

    // 2. Load tickets
    let loadedTickets = await loadSheetData(sheetId, 'tickets', token);
    if (!loadedTickets || loadedTickets.length === 0) {
      await saveSheetData(sheetId, 'tickets', initialTickets, token);
      loadedTickets = initialTickets;
    }

    // 3. Load pmTasks
    let loadedPmTasks = await loadSheetData(sheetId, 'pmTasks', token);
    if (!loadedPmTasks || loadedPmTasks.length === 0) {
      await saveSheetData(sheetId, 'pmTasks', initialPMTasks, token);
      loadedPmTasks = initialPMTasks;
    }

    // 4. Load energyReadings
    let loadedEnergy = await loadSheetData(sheetId, 'energyReadings', token);
    if (!loadedEnergy || loadedEnergy.length === 0) {
      await saveSheetData(sheetId, 'energyReadings', initialEnergyReadings, token);
      loadedEnergy = initialEnergyReadings;
    }

    // 5. Load tools
    let loadedTools = await loadSheetData(sheetId, 'tools', token);
    if (!loadedTools || loadedTools.length === 0) {
      await saveSheetData(sheetId, 'tools', initialTools, token);
      loadedTools = initialTools;
    }

    // 6. Load materials
    let loadedMaterials = await loadSheetData(sheetId, 'materials', token);
    if (!loadedMaterials || loadedMaterials.length === 0) {
      await saveSheetData(sheetId, 'materials', initialMaterials, token);
      loadedMaterials = initialMaterials;
    }

    // 7. Load costs
    let loadedCosts = await loadSheetData(sheetId, 'costs', token);
    if (!loadedCosts || loadedCosts.length === 0) {
      await saveSheetData(sheetId, 'costs', initialCosts, token);
      loadedCosts = initialCosts;
    }

    return {
      employees: loadedEmployees,
      tickets: loadedTickets,
      pmTasks: loadedPmTasks,
      energyReadings: loadedEnergy,
      tools: loadedTools,
      materials: loadedMaterials,
      costs: loadedCosts
    };
  };

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      async (fbUser, token) => {
        const emailLower = fbUser.email?.toLowerCase() || '';
        const allowedEmails = ['engineeringbss78@gmail.com', 'engineering78@gmail.com', 'wahyuhanafi88@gmail.com', 'wahyuhnafi88@gmail.com', 'engineer4@gmail.com'];
        if (allowedEmails.includes(emailLower)) {
          let role: 'Super Admin' | 'Admin' | 'Teknisi' = 'Teknisi';
          let roleLabel = 'Teknisi';
          if (emailLower === 'wahyuhanafi88@gmail.com' || emailLower === 'wahyuhnafi88@gmail.com') {
            role = 'Super Admin';
            roleLabel = 'Super Admin';
          } else if (emailLower === 'engineeringbss78@gmail.com' || emailLower === 'engineering78@gmail.com') {
            role = 'Admin';
            roleLabel = 'Admin';
          }

          setUser({
            role,
            name: fbUser.displayName || roleLabel
          });

          // Redirect Restricted Roles away from forbidden tabs
          if (role === 'Teknisi') {
            setActiveTab(prev => (prev === 'inventory' || prev === 'employees' ? 'dashboard' : prev));
          }

          setAccessToken(token);
          setFirebaseSyncStatus('syncing');
          try {
            const sheetId = await findOrCreateSpreadsheet(token);
            setSpreadsheetId(sheetId);
            const sheetsData = await loadAndSeedAllSheets(sheetId, token);
            setEmployees(sheetsData.employees);
            setTickets(sheetsData.tickets);
            setPmTasks(sheetsData.pmTasks);
            setEnergyReadings(sheetsData.energyReadings);
            setTools(sheetsData.tools);
            setMaterials(sheetsData.materials);
            setCosts(sheetsData.costs);
            setFirebaseSyncStatus('synced');
            setLastSyncedTime(new Date().toLocaleTimeString('id-ID'));
          } catch (e: any) {
            console.error('Error auto-syncing from Sheets:', e);
            setFirebaseSyncStatus('error');
            const errMsg = e?.message || String(e);
            if (errMsg.includes('401') || errMsg.toLowerCase().includes('unauthorized') || errMsg.toLowerCase().includes('token') || errMsg.toLowerCase().includes('auth')) {
              await googleLogout();
              setLoginError('Sesi sinkronisasi Google Sheets kedaluwarsa atau tidak sah. Silakan masuk kembali.');
              setUser(null);
            }
          }
        } else {
          // Force sign out if not allowed
          await googleLogout();
          setLoginError('Akses Dibatasi. Silakan masuk menggunakan email resmi yang terdaftar.');
          setUser(null);
        }
      },
      () => {
        // Prevent manual local session from being reset on initial Google Auth state checking failure
        if (typeof window !== 'undefined' && !localStorage.getItem('bss_manual_user')) {
          setUser(null);
        }
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Load initial data (from Sheets if OAuth is active, or from LocalStorage if manual)
  useEffect(() => {
    if (user && !accessToken) {
      // Manual login / Local mode
      const getOrSeed = (key: string, initialData: any) => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch (e) {
            return initialData;
          }
        } else {
          localStorage.setItem(key, JSON.stringify(initialData));
          return initialData;
        }
      };

      setEmployees(getOrSeed('eng_employees', initialEmployees));
      setTickets(getOrSeed('eng_tickets', initialTickets));
      setPmTasks(getOrSeed('eng_pmTasks', initialPMTasks));
      setEnergyReadings(getOrSeed('eng_energyReadings', initialEnergyReadings));
      setTools(getOrSeed('eng_tools', initialTools));
      setMaterials(getOrSeed('eng_materials', initialMaterials));
      setCosts(getOrSeed('eng_costs', initialCosts));
      setFirebaseSyncStatus('not-configured'); // Indicates local mode
    }
  }, [user, accessToken]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const result = await googleSignIn();
      if (result) {
        const { user: fbUser, accessToken: token } = result;
        const emailLower = fbUser.email?.toLowerCase() || '';
        const allowedEmails = ['engineeringbss78@gmail.com', 'wahyuhanafi88@gmail.com', 'wahyuhnafi88@gmail.com', 'engineer4@gmail.com'];
        if (!allowedEmails.includes(emailLower)) {
          await googleLogout();
          throw new Error('Akses Dibatasi. Silakan masuk menggunakan email resmi yang terdaftar.');
        }

        let role: 'Super Admin' | 'Admin' | 'Teknisi' = 'Teknisi';
        let roleLabel = 'Teknisi';
        if (emailLower === 'wahyuhanafi88@gmail.com' || emailLower === 'wahyuhnafi88@gmail.com') {
          role = 'Super Admin';
          roleLabel = 'Super Admin';
        } else if (emailLower === 'engineeringbss78@gmail.com') {
          role = 'Admin';
          roleLabel = 'Admin';
        }

        setUser({
          role,
          name: fbUser.displayName || roleLabel
        });

        // Redirect Restricted Roles away from forbidden tabs
        if (role === 'Teknisi') {
          setActiveTab(prev => (prev === 'inventory' || prev === 'employees' ? 'dashboard' : prev));
        }

        setAccessToken(token);

        setFirebaseSyncStatus('syncing');
        const sheetId = await findOrCreateSpreadsheet(token);
        setSpreadsheetId(sheetId);

        const sheetsData = await loadAndSeedAllSheets(sheetId, token);
        setEmployees(sheetsData.employees);
        setTickets(sheetsData.tickets);
        setPmTasks(sheetsData.pmTasks);
        setEnergyReadings(sheetsData.energyReadings);
        setTools(sheetsData.tools);
        setMaterials(sheetsData.materials);
        setCosts(sheetsData.costs);

        setFirebaseSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString('id-ID'));
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setLoginError(err.message || 'Gagal masuk dengan Google');
      setUser(null);
      setAccessToken(null);
      setSpreadsheetId(null);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleManualLogin = (email: string, role: 'Super Admin' | 'Admin' | 'Teknisi', name: string) => {
    const newUser = { role, name };
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bss_manual_user', JSON.stringify(newUser));
    }
    // Redirect Restricted Roles away from forbidden tabs
    if (role === 'Teknisi') {
      setActiveTab(prev => (prev === 'inventory' || prev === 'employees' ? 'dashboard' : prev));
    }
  };

  const handleLogout = async () => {
    try {
      await googleLogout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setAccessToken(null);
    setSpreadsheetId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bss_manual_user');
    }
  };

  // Full Synchronizer function that can be called manually or run automatically every 5 minutes
  const handleFullSyncSheets = async (customToken?: string, customSpreadsheetId?: string) => {
    const activeToken = customToken || accessToken;
    const activeSpreadsheetId = customSpreadsheetId || spreadsheetId;
    if (!activeToken || !activeSpreadsheetId) {
      console.log('Sync to Google Sheets skipped: No active token or spreadsheet ID.');
      return;
    }
    setFirebaseSyncStatus('syncing');
    try {
      const dataToSync = stateRef.current;
      await syncAllToSheets(activeSpreadsheetId, dataToSync, activeToken);
      setFirebaseSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString('id-ID'));
      setNextSyncCountdown(300); // Reset countdown to 5 minutes
      console.log('Full sync with Google Sheets succeeded at ' + new Date().toLocaleTimeString('id-ID'));
    } catch (error: any) {
      console.error('Error in full sync:', error);
      setFirebaseSyncStatus('error');
      const errMsg = error?.message || String(error);
      if (errMsg.includes('401') || errMsg.toLowerCase().includes('unauthorized') || errMsg.toLowerCase().includes('token') || errMsg.toLowerCase().includes('auth')) {
        await googleLogout();
        setLoginError('Sesi sinkronisasi Google Sheets kedaluwarsa atau tidak sah. Silakan masuk kembali.');
        setUser(null);
      }
    }
  };

  // Run automatic full synchronization countdown (5 minutes / 300 seconds)
  useEffect(() => {
    if (!accessToken || !spreadsheetId) return;

    setNextSyncCountdown(300); // Reset to 300s on login
    const intervalId = setInterval(() => {
      setNextSyncCountdown(prev => {
        if (prev <= 1) {
          handleFullSyncSheets();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [accessToken, spreadsheetId]);

  // Sync to LocalStorage AND Google Sheets upon changes
  const saveToStorage = (
    key: string, 
    data: any, 
    singleItem?: { collection: string; id: string; action: 'save' | 'delete' }
  ) => {
    localStorage.setItem(key, JSON.stringify(data));
    
    if (spreadsheetId && accessToken) {
      setFirebaseSyncStatus('syncing');
      (async () => {
        try {
          const collectionMap: Record<string, string> = {
            'eng_employees': 'employees',
            'eng_tickets': 'tickets',
            'eng_pmTasks': 'pmTasks',
            'eng_energyReadings': 'energyReadings',
            'eng_tools': 'tools',
            'eng_materials': 'materials',
            'eng_costs': 'costs'
          };
          const mappedName = collectionMap[key];
          if (mappedName) {
            await saveSheetData(spreadsheetId, mappedName, data, accessToken);
            setFirebaseSyncStatus('synced');
          }
        } catch (error: any) {
          console.error('Error syncing write to Google Sheets:', error);
          setFirebaseSyncStatus('error');
          const errMsg = error?.message || String(error);
          if (errMsg.includes('401') || errMsg.toLowerCase().includes('unauthorized') || errMsg.toLowerCase().includes('token') || errMsg.toLowerCase().includes('auth')) {
            await googleLogout();
            setLoginError('Sesi sinkronisasi Google Sheets kedaluwarsa atau tidak sah. Silakan masuk kembali.');
            setUser(null);
          }
        }
      })();
    }
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
    saveToStorage('eng_tickets', updated, { collection: 'tickets', id: newTicket.id, action: 'save' });
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
            saveToStorage('eng_costs', updatedCosts, { collection: 'costs', id: newCost.id, action: 'save' });
          }
        }
        return tCopy;
      }
      return t;
    });

    setTickets(updated);
    saveToStorage('eng_tickets', updated, { collection: 'tickets', id, action: 'save' });
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
    saveToStorage('eng_pmTasks', updated, { collection: 'pmTasks', id, action: 'save' });
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
    saveToStorage('eng_pmTasks', updated, { collection: 'pmTasks', id: newTask.id, action: 'save' });
  };

  // 5. Save daily utility logger
  const handleAddReading = (reading: Omit<EnergyReading, 'id'>) => {
    const newReading: EnergyReading = {
      ...reading,
      id: `en-${Date.now()}`
    };
    const updated = [newReading, ...energyReadings];
    setEnergyReadings(updated);
    saveToStorage('eng_energyReadings', updated, { collection: 'energyReadings', id: newReading.id, action: 'save' });
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
    saveToStorage('eng_tools', updated, { collection: 'tools', id, action: 'save' });
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
    saveToStorage('eng_materials', updated, { collection: 'materials', id, action: 'save' });
  };

  // 12. Add Tool
  const handleAddTool = (newTool: Omit<ToolItem, 'id'>) => {
    const item: ToolItem = {
      ...newTool,
      id: `tool-${Date.now()}`
    };
    const updated = [...tools, item];
    setTools(updated);
    saveToStorage('eng_tools', updated, { collection: 'tools', id: item.id, action: 'save' });
  };

  // 13. Update Tool
  const handleUpdateTool = (updatedTool: ToolItem) => {
    const updated = tools.map(t => t.id === updatedTool.id ? updatedTool : t);
    setTools(updated);
    saveToStorage('eng_tools', updated, { collection: 'tools', id: updatedTool.id, action: 'save' });
  };

  // 14. Delete Tool
  const handleDeleteTool = (id: string) => {
    const updated = tools.filter(t => t.id !== id);
    setTools(updated);
    saveToStorage('eng_tools', updated, { collection: 'tools', id, action: 'delete' });
  };

  // 15. Add Material
  const handleAddMaterial = (newMaterial: Omit<MaterialItem, 'id'>) => {
    const item: MaterialItem = {
      ...newMaterial,
      id: `mat-${Date.now()}`
    };
    const updated = [...materials, item];
    setMaterials(updated);
    saveToStorage('eng_materials', updated, { collection: 'materials', id: item.id, action: 'save' });
  };

  // 16. Update Material
  const handleUpdateMaterial = (updatedMaterial: MaterialItem) => {
    const updated = materials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m);
    setMaterials(updated);
    saveToStorage('eng_materials', updated, { collection: 'materials', id: updatedMaterial.id, action: 'save' });
  };

  // 17. Delete Material
  const handleDeleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    saveToStorage('eng_materials', updated, { collection: 'materials', id, action: 'delete' });
  };

  // 9. Add Employee
  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`
    };
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    saveToStorage('eng_employees', updated, { collection: 'employees', id: newEmployee.id, action: 'save' });
  };

  // 10. Update Employee
  const handleUpdateEmployee = (updatedEmp: Employee) => {
    const updated = employees.map(e => e.id === updatedEmp.id ? updatedEmp : e);
    setEmployees(updated);
    saveToStorage('eng_employees', updated, { collection: 'employees', id: updatedEmp.id, action: 'save' });
  };

  // 11. Delete Employee
  const handleDeleteEmployee = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    saveToStorage('eng_employees', updated, { collection: 'employees', id, action: 'delete' });
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

      // Force-overwrite all collections back to defaults in Firestore
      saveToStorage('eng_employees', initialEmployees);
      saveToStorage('eng_tickets', initialTickets);
      saveToStorage('eng_pmTasks', initialPMTasks);
      saveToStorage('eng_energyReadings', initialEnergyReadings);
      saveToStorage('eng_tools', initialTools);
      saveToStorage('eng_materials', initialMaterials);
      saveToStorage('eng_costs', initialCosts);

      setActiveTab('dashboard');
    }
  };

  // Computations for global health banner indicators
  const activeTechniciansCount = employees.filter(e => e.role.toLowerCase().includes('teknisi') && e.status === 'Aktif').length;
  const pmPendingCount = pmTasks.filter(p => p.status === 'Belum Selesai').length;
  const criticalMaterialsCount = materials.filter(m => m.stock <= m.minStock).length;

  if (!user) {
    return (
      <Login 
        onGoogleLogin={handleGoogleLogin} 
        onManualLogin={handleManualLogin}
        isLoggingIn={isLoggingIn} 
        loginError={loginError} 
      />
    );
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
                    {user.role}
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

          <div className="flex flex-wrap items-center gap-4">
            {/* Google Sheets Sync Status Badge */}
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold">
                {accessToken && spreadsheetId ? (
                  <>
                    {firebaseSyncStatus === 'synced' ? (
                      <span className="flex items-center gap-1.5 text-emerald-400" title="Data berhasil disinkronkan ke Google Sheets Anda">
                        <Cloud className="w-3.5 h-3.5 shrink-0" />
                        <span>Sheets Terhubung</span>
                      </span>
                    ) : firebaseSyncStatus === 'syncing' ? (
                      <span className="flex items-center gap-1.5 text-indigo-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>Sinkronisasi...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-400" title="Gagal menyambung ke Google Sheets.">
                        <CloudOff className="w-3.5 h-3.5 shrink-0" />
                        <span>Sinkronisasi Gagal</span>
                      </span>
                    )}
                    
                    <span className="text-slate-500 border-l border-slate-800 pl-2">
                      Last Sync: <span className="text-slate-300">{lastSyncedTime}</span>
                    </span>

                    <span className="text-slate-500 border-l border-slate-800 pl-2 font-mono">
                      Next: <span className="text-indigo-400 font-bold">{Math.floor(nextSyncCountdown / 60)}m {nextSyncCountdown % 60}s</span>
                    </span>

                    <button
                      onClick={() => handleFullSyncSheets()}
                      disabled={firebaseSyncStatus === 'syncing'}
                      className="ml-1 px-2 py-0.5 rounded bg-indigo-600/20 hover:bg-indigo-600 active:bg-indigo-700 text-indigo-300 hover:text-white transition-all text-[10px] font-extrabold uppercase disabled:opacity-50 flex items-center gap-1"
                      title="Paksa sinkronisasi seluruh perubahan data ke Google Drive sekarang"
                    >
                      <RefreshCw className={`w-3 h-3 ${firebaseSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>Sinkron Sekarang</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Database className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mode Lokal (Masuk via Google untuk Auto-Sync 5 Menit ke Drive)</span>
                  </div>
                )}
              </div>
            </div>

            {user.role === 'Super Admin' && (
              <button
                onClick={handleResetData}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-all uppercase tracking-wider font-bold"
                title="Setel ulang data bawaan excel harian/bulanan"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Data Bawaan
              </button>
            )}
          </div>
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
            ].filter(tab => {
              if (user.role === 'Teknisi') {
                return ['dashboard', 'helpdesk', 'preventive', 'energy', 'reports'].includes(tab.id);
              }
              return true;
            }).map(tab => {
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
