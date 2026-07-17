import { 
  Ticket, 
  PMTask, 
  EnergyReading, 
  ToolItem, 
  MaterialItem, 
  CostRecord, 
  Employee 
} from '../types';

// Seed employees (Technicians, Supervisors, Chief Engineering)
export const initialEmployees: Employee[] = [
  { id: 'emp-1', name: 'HABIB HANAFI', role: 'AREA MANAGER', nik: '2501354', phone: '08522221227', email: 'wahyuhanafi88@gmail.com', status: 'Aktif', assignedBuilding: 'Palmerah' },
  { id: 'emp-2', name: 'DWI CAHYADI', role: 'SUPERVISOR MOBILE', nik: '2501356', phone: '081413530466', email: 'dwimasmitra@yahoo.com', status: 'Aktif', assignedBuilding: 'Palmerah' },
  { id: 'emp-3', name: 'DEWO PRIAMBODO', role: 'TEKNISI', nik: '2501363', phone: '081285349151', email: 'dewopriambodo1994@gmail.com', status: 'Aktif', assignedBuilding: 'Palmerah' },
  { id: 'emp-4', name: 'ARIEF WIDIANTORO', role: 'TEKNISI', nik: '2501376', phone: '087786666310', email: 'bobohodusan23@gmail.com', status: 'Aktif', assignedBuilding: 'Palmerah' },
  { id: 'emp-5', name: 'SURYAMAN', role: 'TEKNISI', nik: '2501373', phone: '0895323366710', email: 'suryamansurya57@gmail.com', status: 'Aktif', assignedBuilding: 'Palmerah' },
  { id: 'emp-6', name: 'DEDY DWI IRAWAN', role: 'TEKNISI', nik: '2501372', phone: '083814999673', email: 'dedidwiirawan231096@gmail.com', status: 'Aktif', assignedBuilding: 'Pecenongan' },
  { id: 'emp-7', name: 'ADITYA SETIAWAN', role: 'TEKNISI', nik: '', phone: '081291598326', email: 'asetiawan9595@gmail.com', status: 'Aktif', assignedBuilding: 'Pecenongan' },
  { id: 'emp-8', name: 'FAQIH BAIHAQY', role: 'TEKNISI', nik: '', phone: '088289725426', email: 'faqihbayhaqibontos18@gmail.com', status: 'Aktif', assignedBuilding: 'Gedung Sangaji' },
  { id: 'emp-9', name: 'MOHAMMAD WIDODO', role: 'TEKNISI', nik: '2501357', phone: '083808111666', email: 'widodomohamad23@yahoo.co.id', status: 'Aktif', assignedBuilding: 'Gedung Sangaji' },
  { id: 'emp-10', name: 'IMAM SYARIFUDIN', role: 'TEKNISI', nik: '2501355', phone: '082138504223', email: 'tango.vacok17@gmail.com', status: 'Aktif', assignedBuilding: 'Permata Hijau' },
  { id: 'emp-11', name: 'SYAPRUDIN', role: 'TEKNISI', nik: '2501361', phone: '087875003832', email: 'syaprudin1976@gmail.com', status: 'Aktif', assignedBuilding: 'Permata Hijau' },
  { id: 'emp-12', name: 'DANIEL AGUS SETIAWAN', role: 'TEKNISI', nik: '2501364', phone: '085817291769', email: 'danielagussetiawan81@gmail.com', status: 'Aktif', assignedBuilding: 'Palmerah' },
  { id: 'emp-13', name: 'MAULANA IBRAHIM', role: 'TEKNISI', nik: '2501371', phone: '085718989577', email: 'mulanabrhm@gmail.com', status: 'Aktif', assignedBuilding: 'Pecenongan' },
  { id: 'emp-14', name: 'SURIPTO', role: 'TEKNISI', nik: '2501358', phone: '085959238404', email: 'riffkaalpian@gmail.com', status: 'Aktif', assignedBuilding: 'Gedung Sangaji' },
  { id: 'emp-15', name: 'SETIYADI RUSTADI', role: 'TEKNISI', nik: '2501360', phone: '081289082274', email: 'setiyadirustadi9632@gmail.com', status: 'Aktif', assignedBuilding: 'Permata Hijau' },
  { id: 'emp-16', name: 'NUH FANDI', role: 'TEKNISI', nik: '2501365', phone: '08568748110', email: 'nf4nd1@gmail.com', status: 'Aktif', assignedBuilding: 'Palmerah' },
  { id: 'emp-17', name: 'RACHMAT HIDAYAT', role: 'TEKNISI', nik: '2501368', phone: '083169803569', email: 'dayatbilal3@gmail.com', status: 'Aktif', assignedBuilding: 'Pecenongan' },
  { id: 'emp-18', name: 'MALIK MUJIYANTO', role: 'TEKNISI', nik: '2501367', phone: '082328317121', email: 'malikmujiyanto58@gmail.com', status: 'Aktif', assignedBuilding: 'Gedung Sangaji' },
  { id: 'emp-19', name: 'YERI KURNIALI', role: 'TEKNISI', nik: '2501366', phone: '081222841474', email: 'yeryerot28@gmail.com', status: 'Aktif', assignedBuilding: 'Permata Hijau' },
  { id: 'emp-20', name: 'HASAN PATHONI ARRAHMAD', role: 'TEKNISI', nik: '2501359', phone: '081995421346', email: 'santonyarrahmad31@gmail.com', status: 'Aktif', assignedBuilding: 'Palmerah' },
  { id: 'emp-21', name: 'AMSORI MUSLIM', role: 'TEKNISI', nik: '2501369', phone: '089652825581', email: 'hamsorimuslim123@gmail.com', status: 'Aktif', assignedBuilding: 'Pecenongan' },
  { id: 'emp-22', name: 'DEDY SUPRIYADI', role: 'TEKNISI MOBILE', nik: '2501370', phone: '081287654344', email: '', status: 'Aktif', assignedBuilding: 'Gedung Sangaji' },
  { id: 'emp-23', name: 'DIKY INDRA GUNAWAN', role: 'TEKNISI MOBILE', nik: '2501374', phone: '08776214313', email: 'dikyindra6@gmail.com', status: 'Aktif', assignedBuilding: 'Permata Hijau' },
  { id: 'emp-24', name: 'DANA SUNANDAR', role: 'TEKNISI MOBILE', nik: '2510240', phone: '085776714660', email: 'dana.khel6@gmail.com', status: 'Aktif', assignedBuilding: 'Palmerah' },
];

// Seed Tickets (Work Orders - WO)
export const initialTickets: Ticket[] = [
  {
    id: 't-1',
    ticketNo: 'WO-2026-001',
    title: 'AC Sentral Bocor Air di Ruang Tenant 302',
    description: 'Terjadi kondensasi berlebih dan air menetes membasahi plafon gypsum tenant di lantai 3.',
    reporterName: 'Panin Palmerah Tenant 302',
    building: 'Palmerah',
    floorArea: 'Lantai 3 - Ruang Kerja Utama',
    assetType: 'HVAC/AC',
    priority: 'Tinggi',
    status: 'Dalam Pengerjaan',
    assignedTo: 'Rian Hidayat',
    createdAt: '2026-07-15T09:30:00Z',
    cost: 150000,
    photoUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=300&q=80',
    actionTaken: 'Sedang dilakukan pembersihan pipa drainase AC dan penggantian isolasi pipa yang rusak.'
  },
  {
    id: 't-2',
    ticketNo: 'WO-2026-002',
    title: 'Lift No. 2 Bergetar Keras Saat Naik',
    description: 'Lift nomor 2 mengalami getaran yang tidak wajar di antara lantai 5 dan 8. Untuk keamanan, lift sementara dinonaktifkan.',
    reporterName: 'Resepsionis Lobby',
    building: 'Pecenongan',
    floorArea: 'Lift Lobby Kanan',
    assetType: 'Lift/Elevator',
    priority: 'Tinggi',
    status: 'Baru',
    assignedTo: 'Fajar Nugroho',
    createdAt: '2026-07-16T14:15:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 't-3',
    ticketNo: 'WO-2026-003',
    title: 'Lampu Koridor Lantai 1 Redup/Flicker',
    description: '3 buah lampu LED panel di koridor timur redup and berkedip mengganggu kenyamanan.',
    reporterName: 'Security Staff',
    building: 'Palmerah',
    floorArea: 'Lantai 1 Koridor Timur',
    assetType: 'Kelistrikan',
    priority: 'Rendah',
    status: 'Selesai',
    assignedTo: 'Eko Prasetyo',
    createdAt: '2026-07-14T08:00:00Z',
    finishedAt: '2026-07-14T11:30:00Z',
    cost: 120000,
    actionTaken: 'Mengganti ballast driver dan 2 buah LED panel 12W dengan stok baru dari gudang material.',
    photoUrl: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 't-4',
    ticketNo: 'WO-2026-004',
    title: 'Pipa Kran Air Toilet Pria Lantai Basemen Bocor',
    description: 'Kran wastafel nomor 2 toilet pria basemen tidak bisa ditutup rapat, air terus mengalir.',
    reporterName: 'Cleaning Service',
    building: 'Gedung Sangaji',
    floorArea: 'Basement 1 - Toilet Umum',
    assetType: 'Plumbing/Pipa Air',
    priority: 'Sedang',
    status: 'Selesai',
    assignedTo: 'Dedi Kurniawan',
    createdAt: '2026-07-15T11:00:00Z',
    finishedAt: '2026-07-15T13:45:00Z',
    cost: 45000,
    actionTaken: 'Mengganti seal karet kran wastafel dan memasang selotip kran (seal tape) baru.',
    photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 't-5',
    ticketNo: 'WO-2026-005',
    title: 'Pintu Kaca Lobby Utama Agak Seret',
    description: 'Pintu kaca otomatis sisi kanan bergeser agak lambat dan mengeluarkan bunyi mendecit.',
    reporterName: 'Supervisor Security',
    building: 'Permata Hijau',
    floorArea: 'Lobby Utama Gedung D',
    assetType: 'Struktur Bangunan',
    priority: 'Sedang',
    status: 'Baru',
    assignedTo: 'Yudi Pratama',
    createdAt: '2026-07-16T17:30:00Z',
  }
];

// Seed Preventive Maintenance Checklist Template (AC, Kelistrikan, Plumbing)
export const initialPMTasks: PMTask[] = [
  {
    id: 'pm-1',
    code: 'PM-AC-D-01',
    title: 'Pemeriksaan Harian AC Split Wall & VRV',
    assetName: 'Sistem AC Sentral VRV & Split',
    frequency: 'Harian',
    building: 'Palmerah',
    status: 'Selesai',
    scheduledDate: '2026-07-16',
    completedDate: '2026-07-16',
    completedBy: 'Rian Hidayat',
    checklist: [
      { id: 'ch-1-1', item: 'Periksa suara abnormal atau getaran pada unit indoor', checked: true },
      { id: 'ch-1-2', item: 'Periksa suhu hembusan udara unit indoor (Target: 18°C - 22°C)', checked: true, notes: 'Rata-rata 20.5°C' },
      { id: 'ch-1-3', item: 'Pastikan drainase air kondensasi lancar dan tidak ada genangan', checked: true },
      { id: 'ch-1-4', item: 'Periksa indikator lampu alarm atau error code pada thermostat', checked: true, notes: 'Normal, tidak ada alarm' }
    ]
  },
  {
    id: 'pm-2',
    code: 'PM-AC-W-01',
    title: 'Pemeliharaan Mingguan AC Sentral & Outdoor',
    assetName: 'Outdoor Unit Compressor & Fan',
    frequency: 'Mingguan',
    building: 'Palmerah',
    status: 'Belum Selesai',
    scheduledDate: '2026-07-18',
    checklist: [
      { id: 'ch-2-1', item: 'Pembersihan kisi-kisi coil condensor outdoor unit dengan air bertekanan', checked: false },
      { id: 'ch-2-2', item: 'Ukur arus listrik (ampere) kompresor outdoor unit (cocokkan spesifikasi)', checked: false },
      { id: 'ch-2-3', item: 'Periksa tekanan refrigerant (suction & discharge pressure)', checked: false },
      { id: 'ch-2-4', item: 'Periksa kekencangan baut terminal kelistrikan outdoor', checked: false }
    ]
  },
  {
    id: 'pm-3',
    code: 'PM-AC-M-01',
    title: 'Servis Bulanan Cuci AC & Filter Cleaning',
    assetName: 'Evaporator Indoor & Filter Filter AC',
    frequency: 'Bulanan',
    building: 'Pecenongan',
    status: 'Selesai',
    scheduledDate: '2026-07-10',
    completedDate: '2026-07-12',
    completedBy: 'Fajar Nugroho',
    checklist: [
      { id: 'ch-3-1', item: 'Cuci filter udara unit indoor sampai bersih dari debu', checked: true },
      { id: 'ch-3-2', item: 'Semprot evaporator coil dengan cairan disinfektan/pembersih AC', checked: true },
      { id: 'ch-3-3', item: 'Semprot dan tembak pipa pembuangan (drain pipe) agar tidak mampet', checked: true },
      { id: 'ch-3-4', item: 'Ukur tegangan pasokan listrik AC (Target: 220V ± 10% / 380V ± 10%)', checked: true, notes: 'Tegangan stabil di 224V' },
      { id: 'ch-3-5', item: 'Periksa fisik remote control dan baterai', checked: true }
    ]
  },
  {
    id: 'pm-4',
    code: 'PM-EL-D-01',
    title: 'Pemeriksaan Harian Ruang Panel & Trafo',
    assetName: 'Main Distribution Panel (MDP)',
    frequency: 'Harian',
    building: 'Pecenongan',
    status: 'Selesai',
    scheduledDate: '2026-07-16',
    completedDate: '2026-07-16',
    completedBy: 'Hendra Setiawan',
    checklist: [
      { id: 'ch-4-1', item: 'Catat voltmeter panel MDP harian (R-S, S-T, T-R)', checked: true, notes: '398V, 399V, 400V' },
      { id: 'ch-4-2', item: 'Periksa suhu ruangan trafo/cubicle (maksimal 35°C)', checked: true, notes: 'Suhu ruangan 29°C' },
      { id: 'ch-4-3', item: 'Periksa lampu indikator fasa R-S-T menyala normal', checked: true },
      { id: 'ch-4-4', item: 'Pastikan tidak ada bau gosong atau bunyi mendengung ekstrem', checked: true }
    ]
  },
  {
    id: 'pm-5',
    code: 'PM-PL-M-01',
    title: 'Pemeliharaan Bulanan Pompa Transfer & Booster',
    assetName: 'Pompa Distribusi Air Bersih',
    frequency: 'Bulanan',
    building: 'Gedung Sangaji',
    status: 'Belum Selesai',
    scheduledDate: '2026-07-20',
    checklist: [
      { id: 'ch-5-1', item: 'Periksa kebocoran seal pompa transfer water pump', checked: false },
      { id: 'ch-5-2', item: 'Periksa fungsi pressure switch pada pompa booster', checked: false },
      { id: 'ch-5-3', item: 'Uji fungsi otomatisasi panel control WLC (Water Level Control)', checked: false },
      { id: 'ch-5-4', item: 'Bersihkan saringan inlet foot valve pompa', checked: false },
      { id: 'ch-5-5', item: 'Beri pelumas/grease pada bearing dinamo motor pompa', checked: false }
    ]
  },
  {
    id: 'pm-6',
    code: 'PM-AC-Y-01',
    title: 'Overhaul Tahunan Sistem AC Sentral VRV',
    assetName: 'AC Sentral VRV Daikin System',
    frequency: 'Tahunan',
    building: 'Palmerah',
    status: 'Belum Selesai',
    scheduledDate: '2026-11-15',
    checklist: [
      { id: 'ch-6-1', item: 'Lakukan flushing komparasi pipa tembaga sistem refrigerant', checked: false },
      { id: 'ch-6-2', item: 'Uji kebocoran menggunakan gas Nitrogen tekanan tinggi 40 bar', checked: false },
      { id: 'ch-6-3', item: 'Kalibrasi seluruh sensor suhu, thermistor, dan expansion valve', checked: false },
      { id: 'ch-6-4', item: 'Ganti oli kompresor outdoor unit dan ganti accumulator', checked: false },
      { id: 'ch-6-5', item: 'Ukur tahanan isolasi kompresor dengan Megger (Megohmmeter)', checked: false }
    ]
  }
];

// Seed Energy Logs (Past 7 Days)
export const initialEnergyReadings: EnergyReading[] = [
  { id: 'en-1', date: '2026-07-10', building: 'Palmerah', electricityReading: 1250, waterReading: 45, recordedBy: 'Rian Hidayat' },
  { id: 'en-2', date: '2026-07-11', building: 'Palmerah', electricityReading: 1280, waterReading: 48, recordedBy: 'Rian Hidayat' },
  { id: 'en-3', date: '2026-07-12', building: 'Palmerah', electricityReading: 1310, waterReading: 50, recordedBy: 'Eko Prasetyo' },
  { id: 'en-4', date: '2026-07-13', building: 'Palmerah', electricityReading: 1100, waterReading: 32, recordedBy: 'Eko Prasetyo' }, // Minggu
  { id: 'en-5', date: '2026-07-14', building: 'Palmerah', electricityReading: 1350, waterReading: 55, recordedBy: 'Rian Hidayat' },
  { id: 'en-6', date: '2026-07-15', building: 'Palmerah', electricityReading: 1380, waterReading: 58, recordedBy: 'Rian Hidayat' },
  { id: 'en-7', date: '2026-07-16', building: 'Palmerah', electricityReading: 1410, waterReading: 60, recordedBy: 'Eko Prasetyo' },

  { id: 'en-8', date: '2026-07-10', building: 'Pecenongan', electricityReading: 950, waterReading: 35, recordedBy: 'Fajar Nugroho' },
  { id: 'en-9', date: '2026-07-11', building: 'Pecenongan', electricityReading: 980, waterReading: 37, recordedBy: 'Fajar Nugroho' },
  { id: 'en-10', date: '2026-07-12', building: 'Pecenongan', electricityReading: 1010, waterReading: 40, recordedBy: 'Hendra Setiawan' },
  { id: 'en-11', date: '2026-07-13', building: 'Pecenongan', electricityReading: 750, waterReading: 22, recordedBy: 'Hendra Setiawan' }, // Minggu
  { id: 'en-12', date: '2026-07-14', building: 'Pecenongan', electricityReading: 1040, waterReading: 42, recordedBy: 'Fajar Nugroho' },
  { id: 'en-13', date: '2026-07-15', building: 'Pecenongan', electricityReading: 1070, waterReading: 45, recordedBy: 'Fajar Nugroho' },
  { id: 'en-14', date: '2026-07-16', building: 'Pecenongan', electricityReading: 1100, waterReading: 48, recordedBy: 'Hendra Setiawan' },

  { id: 'en-15', date: '2026-07-10', building: 'Gedung Sangaji', electricityReading: 800, waterReading: 28, recordedBy: 'Dedi Kurniawan' },
  { id: 'en-16', date: '2026-07-11', building: 'Gedung Sangaji', electricityReading: 820, waterReading: 30, recordedBy: 'Dedi Kurniawan' },
  { id: 'en-17', date: '2026-07-12', building: 'Gedung Sangaji', electricityReading: 840, waterReading: 32, recordedBy: 'Taufik Hidayat' },
  { id: 'en-18', date: '2026-07-13', building: 'Gedung Sangaji', electricityReading: 600, waterReading: 15, recordedBy: 'Taufik Hidayat' }, // Minggu
  { id: 'en-19', date: '2026-07-14', building: 'Gedung Sangaji', electricityReading: 850, waterReading: 33, recordedBy: 'Dedi Kurniawan' },
  { id: 'en-20', date: '2026-07-15', building: 'Gedung Sangaji', electricityReading: 880, waterReading: 35, recordedBy: 'Dedi Kurniawan' },
  { id: 'en-21', date: '2026-07-16', building: 'Gedung Sangaji', electricityReading: 910, waterReading: 38, recordedBy: 'Dedi Kurniawan' },

  { id: 'en-22', date: '2026-07-10', building: 'Permata Hijau', electricityReading: 1100, waterReading: 40, recordedBy: 'Yudi Pratama' },
  { id: 'en-23', date: '2026-07-11', building: 'Permata Hijau', electricityReading: 1130, waterReading: 42, recordedBy: 'Yudi Pratama' },
  { id: 'en-24', date: '2026-07-12', building: 'Permata Hijau', electricityReading: 1150, waterReading: 44, recordedBy: 'Roni Setiawan' },
  { id: 'en-25', date: '2026-07-13', building: 'Permata Hijau', electricityReading: 800, waterReading: 20, recordedBy: 'Roni Setiawan' }, // Minggu
  { id: 'en-26', date: '2026-07-14', building: 'Permata Hijau', electricityReading: 1180, waterReading: 46, recordedBy: 'Yudi Pratama' },
  { id: 'en-27', date: '2026-07-15', building: 'Permata Hijau', electricityReading: 1210, waterReading: 49, recordedBy: 'Yudi Pratama' },
  { id: 'en-28', date: '2026-07-16', building: 'Permata Hijau', electricityReading: 1240, waterReading: 51, recordedBy: 'Roni Setiawan' },
];

// Seed Tools Inventory (TI)
export const initialTools: ToolItem[] = [
  { id: 'tool-1', name: 'Manifold Gauge R32/R410a', totalQuantity: 4, goodCondition: 3, badCondition: 1, location: 'Gudang Engineering A' },
  { id: 'tool-2', name: 'Tang Amper Digital (Clamp Meter)', totalQuantity: 6, goodCondition: 6, badCondition: 0, location: 'Gudang Engineering A' },
  { id: 'tool-3', name: 'Pompa Steam Jet Cleaner AC', totalQuantity: 3, goodCondition: 2, badCondition: 1, location: 'Gudang Engineering B' },
  { id: 'tool-4', name: 'Megger Insulation Tester Fluke', totalQuantity: 2, goodCondition: 2, badCondition: 0, location: 'Gudang Engineering A' },
  { id: 'tool-5', name: 'Kunci Pipa Besar 18 Inch', totalQuantity: 5, goodCondition: 4, badCondition: 1, location: 'Gudang Engineering C' },
  { id: 'tool-6', name: 'Mesin Bor Beton Cordless Dewalt', totalQuantity: 3, goodCondition: 3, badCondition: 0, location: 'Gudang Engineering B' },
  { id: 'tool-7', name: 'Gas Leak Detector HVAC', totalQuantity: 2, goodCondition: 1, badCondition: 1, location: 'Gudang Engineering D' },
  { id: 'tool-8', name: 'Kunci Inggris 12 Inch Stanley', totalQuantity: 10, goodCondition: 9, badCondition: 1, location: 'Gudang Engineering C' },
];

// Seed Material Inventory (MI) - spareparts
export const initialMaterials: MaterialItem[] = [
  { id: 'mat-1', name: 'Refrigerant Freon R410a Tabung', category: 'HVAC', stock: 12, unit: 'kg', minStock: 20, location: 'Gudang Material A' }, // Alert low
  { id: 'mat-2', name: 'Lampu LED Panel Philips 12 Watt', category: 'Kelistrikan', stock: 45, unit: 'pcs', minStock: 15, location: 'Gudang Material B' },
  { id: 'mat-3', name: 'MCB Schneider 1 Phase 16A', category: 'Kelistrikan', stock: 25, unit: 'pcs', minStock: 10, location: 'Gudang Material A' },
  { id: 'mat-4', name: 'Kran Washtafel Toto T-205', category: 'Plumbing', stock: 4, unit: 'pcs', minStock: 5, location: 'Gudang Material C' }, // Alert low
  { id: 'mat-5', name: 'Kabel NYM Eterna 3x2.5mm', category: 'Kelistrikan', stock: 2, unit: 'roll', minStock: 3, location: 'Gudang Material B' }, // Alert low
  { id: 'mat-6', name: 'Seal Tape Karet Onda', category: 'Plumbing', stock: 50, unit: 'pcs', minStock: 20, location: 'Gudang Material C' },
  { id: 'mat-7', name: 'Filter AC Split 1.5 PK Standard', category: 'HVAC', stock: 30, unit: 'pcs', minStock: 10, location: 'Gudang Material A' },
  { id: 'mat-8', name: 'Pipa Tembaga AC Kembla 1/4 inch', category: 'HVAC', stock: 1, unit: 'roll', minStock: 2, location: 'Gudang Material D' }, // Alert low
];

// Seed Maintenance Cost Records (DEPCOS)
export const initialCosts: CostRecord[] = [
  { id: 'c-1', date: '2026-01', category: 'HVAC', description: 'Pengadaan Freon R32 dan penggantian kondensor Gedung A', cost: 12450000, building: 'Palmerah' },
  { id: 'c-2', date: '2026-01', category: 'Lift/Elevator', description: 'Biaya maintenance berkala Lift Schindler Gedung B', cost: 8500000, building: 'Pecenongan' },
  { id: 'c-3', date: '2026-02', category: 'Kelistrikan', description: 'Penggantian MCB panel induk yang korosi Gedung D', cost: 3400000, building: 'Permata Hijau' },
  { id: 'c-4', date: '2026-02', category: 'Plumbing', description: 'Perbaikan pompa booster air bersih Gedung C', cost: 4800000, building: 'Gedung Sangaji' },
  { id: 'c-5', date: '2026-03', category: 'HVAC', description: 'Cuci AC massal menyambut Ramadan Gedung A, B, C, D', cost: 24000000, building: 'Palmerah' },
  { id: 'c-6', date: '2026-03', category: 'Struktur', description: 'Pengecatan ulang dinding retak akibat gempa minor Gedung B', cost: 5500000, building: 'Pecenongan' },
  { id: 'c-7', date: '2026-04', category: 'Kelistrikan', description: 'Sewa Load Bank pengujian beban Genset 800kVA', cost: 15000000, building: 'Palmerah' },
  { id: 'c-8', date: '2026-04', category: 'Plumbing', description: 'Penggantian ball valve induk pemipaan tank bawah Gedung D', cost: 2900000, building: 'Permata Hijau' },
  { id: 'c-9', date: '2026-05', category: 'Lift/Elevator', description: 'Penggantian wire rope baja lift utama Gedung C', cost: 35000000, building: 'Gedung Sangaji' },
  { id: 'c-10', date: '2026-05', category: 'HVAC', description: 'Pemberian disinfektan anti kapang dan spora AHU lantai 2 Gedung B', cost: 1500000, building: 'Pecenongan' },
  { id: 'c-11', date: '2026-06', category: 'Lainnya', description: 'Sertifikasi uji kelayakan lift dan instalasi kelistrikan Disnaker', cost: 18000000, building: 'Palmerah' },
  { id: 'c-12', date: '2026-06', category: 'HVAC', description: 'Penggantian blower fan AHU Gedung C lantai 5', cost: 9500000, building: 'Gedung Sangaji' },
];
