/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BuildingName = 'Palmerah' | 'Pecenongan' | 'Gedung Sangaji' | 'Permata Hijau';

export type AssetType = 'HVAC/AC' | 'Lift/Elevator' | 'Kelistrikan' | 'Plumbing/Pipa Air' | 'Struktur Bangunan' | 'Lainnya';

export type TicketPriority = 'Rendah' | 'Sedang' | 'Tinggi';

export type TicketStatus = 'Baru' | 'Dalam Pengerjaan' | 'Selesai';

export type PMFrequency = 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan';

export interface Ticket {
  id: string;
  ticketNo: string;
  title: string;
  description: string;
  reporterName: string;
  building: BuildingName;
  floorArea: string;
  assetType: AssetType;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  createdAt: string;
  finishedAt?: string;
  cost?: number;
  photoUrl?: string;
  actionTaken?: string;
}

export interface ChecklistItem {
  id: string;
  item: string;
  checked: boolean;
  notes?: string;
}

export interface PMTask {
  id: string;
  code: string;
  title: string;
  assetName: string;
  frequency: PMFrequency;
  building: BuildingName;
  checklist: ChecklistItem[];
  status: 'Belum Selesai' | 'Selesai';
  scheduledDate: string;
  completedDate?: string;
  completedBy?: string;
}

export interface EnergyReading {
  id: string;
  date: string; // YYYY-MM-DD
  building: BuildingName;
  electricityReading: number; // kWh
  waterReading: number; // m3
  recordedBy: string;
}

export interface ToolItem {
  id: string;
  name: string;
  totalQuantity: number;
  goodCondition: number;
  badCondition: number;
  location: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string; // pcs, rol, kg, pack
  minStock: number;
  location: string;
}

export interface CostRecord {
  id: string;
  date: string; // YYYY-MM
  category: 'HVAC' | 'Lift/Elevator' | 'Kelistrikan' | 'Plumbing' | 'Struktur' | 'Lainnya';
  description: string;
  cost: number;
  building: BuildingName;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  nik?: string;
  phone: string;
  email: string;
  status: 'Aktif' | 'Cuti' | 'Off';
  assignedBuilding?: BuildingName;
}
