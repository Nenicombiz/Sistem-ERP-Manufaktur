/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PrimaryPO, POCategory, ManufacturingDepartment, Customer, Product } from '../types';
import { formatIDR, DEPARTMENTS, generateId, getPOStatusColor } from '../utils';
import { 
  Plus, 
  Search, 
  HelpCircle, 
  SlidersHorizontal, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Layers2,
  Lock,
  UserCheck,
  Tag,
  Building2,
  Info
} from 'lucide-react';

interface SuperadminViewProps {
  primaryPOs: PrimaryPO[];
  customers: Customer[];
  products: Product[];
  onAddPrimaryPO: (newPO: PrimaryPO) => void;
  onCancelPrimaryPO: (id: string) => void;
  userRole?: string;
  onNavigateDirect?: (tabId: string) => void;
}

const CATEGORIES: POCategory[] = [
  'Component',
  'Project',
  'Standard Part',
  'MassPro Machining',
  'MassPro Stamping',
  'MassPro Injection'
];

interface OptionTab {
  id: POCategory;
  label: string;
}

const CATEGORY_TABS: OptionTab[] = [
  { id: 'Component', label: 'Component' },
  { id: 'Project', label: 'Project' },
  { id: 'Standard Part', label: 'Standard Part' },
  { id: 'MassPro Machining', label: 'MassPro Maching' },
  { id: 'MassPro Stamping', label: 'MassPro Stamping' },
  { id: 'MassPro Injection', label: 'MassPro Injection' }
];

interface CategoryPreset {
  name: string;
  depts: ManufacturingDepartment[];
}

const PRESETS: Record<POCategory, CategoryPreset> = {
  'Component': {
    name: 'Suku Cadang Standar',
    depts: ['MassPro Machine', 'Quality Control', 'PPIC Delivery']
  },
  'Project': {
    name: 'Proyek Baru / Jig',
    depts: ['Design Mekanik', 'Proccessing', 'Assembly', 'Quality Control', 'Pembelian']
  },
  'Standard Part': {
    name: 'Standard Parts Procurement',
    depts: ['Assembly', 'Pembelian', 'General Admin']
  },
  'MassPro Machining': {
    name: 'MassPro Bubut/Milling',
    depts: ['MassPro Machine', 'PPIC Delivery', 'Quality Control', 'Pembelian']
  },
  'MassPro Stamping': {
    name: 'MassPro Pres Logam',
    depts: ['MassPro Stamping', 'PPIC Delivery', 'Quality Control', 'Pembelian']
  },
  'MassPro Injection': {
    name: 'MassPro Cetakan Plastik',
    depts: ['MassPro Injection', 'PPIC Delivery', 'Quality Control', 'Pembelian']
  }
};

export default function SuperadminView({
  primaryPOs,
  customers,
  products,
  onAddPrimaryPO,
  onCancelPrimaryPO,
  userRole = 'superadmin',
  onNavigateDirect
}: SuperadminViewProps) {
  // STRICT USER PERMISSION CHECK
  if (userRole !== 'superadmin') {
    return (
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-xl max-w-2xl mx-auto my-12 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Akses Ditolak / Tidak Berhak</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Halaman <span className="font-semibold text-slate-800">Superadmin: Input PO</span> merupakan fitur beresiko tinggi yang memerlukan tingkat otoritas penuh administrator.
          </p>
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl inline-block">
            <span className="text-xs font-bold text-rose-800 font-mono">
              Role Anda Saat Ini: {userRole.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => onNavigateDirect && onNavigateDirect('dashboard')}
            className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all"
          >
            Kembali ke Dashboard
          </button>
          <div className="text-xs text-slate-400 self-center">
            *Silakan ganti role simulasian di bilah kanan atas menjadi <span className="underline font-semibold">Superadmin</span>.
          </div>
        </div>
      </div>
    );
  }

  // Navigation & Lists UI with Component as default category tab
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<POCategory>('Component');
  const [searchTerm, setSearchTerm] = useState('');

  // Product helper selection
  const [selectedProductTemplateId, setSelectedProductTemplateId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // New PO Form States
  const [poNumber, setPoNumber] = useState(`PO-M-2026-00${primaryPOs.length + 1}`);
  const [projectName, setProjectName] = useState('');
  const [itemName, setItemName] = useState('');
  const [partNo, setPartNo] = useState('');
  const [qty, setQty] = useState<number>(0);
  const [unit, setUnit] = useState('pcs');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  
  const [targetDepts, setTargetDepts] = useState<ManufacturingDepartment[]>(PRESETS['Component'].depts);
  const [notes, setNotes] = useState('');

  // Info modal states or messages
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'err', text: string } | null>(null);

  // Toggle Department Ticks
  const handleToggleDept = (dept: ManufacturingDepartment) => {
    if (targetDepts.includes(dept)) {
      setTargetDepts(targetDepts.filter(d => d !== dept));
    } else {
      setTargetDepts([...targetDepts, dept]);
    }
  };

  // Preset Applier
  const applyPresetForCategory = (cat: POCategory) => {
    setSelectedCategoryTab(cat);
    setTargetDepts(PRESETS[cat].depts);
  };

  // Product template selector handler
  const handleSelectProductTemplate = (id: string) => {
    setSelectedProductTemplateId(id);
    if (!id) return;
    const prod = products.find(p => p.id === id);
    if (prod) {
      setItemName(prod.name);
      setPartNo(prod.code);
      setUnit(prod.unit);
      setUnitPrice(prod.defaultPrice);
      setSelectedCategoryTab(prod.category);
      setTargetDepts(PRESETS[prod.category].depts);
    }
  };

  // Customer template selector handler
  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    if (!id) return;
    const cust = customers.find(c => c.id === id);
    if (cust) {
      setProjectName(`${cust.name} - Job`);
    }
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim() || !itemName.trim() || !partNo.trim() || qty <= 0 || unitPrice <= 0) {
      setAlertMsg({ type: 'err', text: 'Mohon lengkapi seluruh kolom input dengan nilai positif.' });
      return;
    }

    if (targetDepts.length === 0) {
      setAlertMsg({ type: 'err', text: 'Pilih minimal satu departemen supervisor tujuan.' });
      return;
    }

    // Set initial statuses for designated supervisor departments
    const deptStatuses: Record<ManufacturingDepartment, 'Waiting'> = {} as any;
    targetDepts.forEach(dept => {
      deptStatuses[dept] = 'Waiting';
    });

    const newPO: PrimaryPO = {
      id: generateId('po'),
      poNumber: poNumber.trim(),
      category: selectedCategoryTab,
      projectName: projectName.trim(),
      itemName: itemName.trim(),
      partNo: partNo.trim(),
      qty,
      unit,
      unitPrice,
      totalPrice: qty * unitPrice,
      orderDate: new Date().toISOString().split('T')[0],
      targetDepartments: targetDepts,
      status: 'Pending',
      deptStatuses,
      notes: notes.trim(),
      customerId: selectedCustomerId || undefined,
      productId: selectedProductTemplateId || undefined
    };

    onAddPrimaryPO(newPO);
    setAlertMsg({ type: 'success', text: `Berhasil mengeluarkan PO #${poNumber.trim()} ke ${targetDepts.length} Departemen!` });

    // Reset Form
    setPoNumber(`PO-M-2026-00${primaryPOs.length + 2}`);
    setProjectName('');
    setItemName('');
    setPartNo('');
    setQty(0);
    setUnitPrice(0);
    setNotes('');
    setSelectedProductTemplateId('');
    setSelectedCustomerId('');

    setTimeout(() => setAlertMsg(null), 5000);
  };

  // Filtering list based on selected category tab and search term
  const filteredPOs = primaryPOs.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.partNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = po.category === selectedCategoryTab;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="superadmin-view-root">
      {/* Upper Status Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PURCHASE ORDER CONSOLE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">Penerbitan & Sirkulasi Purchase Order</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Sirkulasi Purchase Order (PO) klien berdasarkan kategori spesifik. Klik tab kategori di bawah untuk menyaring data dan melihat progres antrean.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl font-mono text-center">
            <span className="text-[9px] text-slate-400 block font-sans">TOTAL PO</span>
            <span className="text-lg font-bold text-indigo-300">{primaryPOs.length}</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl font-mono text-center">
            <span className="text-[9px] text-slate-400 block font-sans">AKTIF</span>
            <span className="text-lg font-bold text-amber-300">
              {primaryPOs.filter(p => p.status === 'In Progress' || p.status === 'Pending').length}
            </span>
          </div>
        </div>
      </div>

      {/* PRIMARY CATEGORY ROUTING TABS MENU AS REQUESTED */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block font-sans">
          Pilih Kategori Purchase Order:
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin" id="category-tab-menu">
          {CATEGORY_TABS.map(tab => {
            const count = primaryPOs.filter(po => po.category === tab.id).length;
            const isSelected = selectedCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => applyPresetForCategory(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow font-black'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                type="button"
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Layout - Form on left, List of POs on right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-fade-in" id="superadmin-grid">
        
        {/* Input Form Column (5/12 cols) */}
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5 xl:col-span-5" id="po-input-form border-indigo-600">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase">Input PO Baru</h2>
              <p className="text-xxs text-slate-500 mt-0.5">Automasi pengisian menggunakan template master data di bawah</p>
            </div>
            <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-lg uppercase">
              {selectedCategoryTab}
            </span>
          </div>

          {/* Form Alert Messaging */}
          {alertMsg && (
            <div className={`p-3 rounded-xl text-xs font-semibold border ${
              alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {alertMsg.text}
            </div>
          )}

          {/* MASTER DATA CONNECTION SHIELDS */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hubung Master Data (Autofill):</span>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">Pilih Customer (Klien)</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => handleSelectCustomer(e.target.value)}
                  className="w-full text-xxs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">-- Manual Typist --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">Pilih Product (Barang)</label>
                <select
                  value={selectedProductTemplateId}
                  onChange={e => handleSelectProductTemplate(e.target.value)}
                  className="w-full text-xxs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">-- Manual Typist --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs inside form */}
          <div className="space-y-1.5">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest block">Kategori Modul Produksi</label>
            <div className="grid grid-cols-3 gap-1.5" id="category-selector-tabs">
              {CATEGORIES.map(cat => {
                const isActive = selectedCategoryTab === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => applyPresetForCategory(cat)}
                    className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-bold transition-all border ${
                      isActive 
                        ? 'bg-slate-950 border-slate-950 text-white shadow-sm' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">No. PO Client</label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Project / Model</label>
              <input
                type="text"
                required
                placeholder="cth. Toyota Fortuner Seat Bar"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Barang / Part</label>
              <input
                type="text"
                required
                placeholder="cth. Side Bracket Stay R/L"
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">No. Part (Part ID)</label>
              <input
                type="text"
                required
                placeholder="cth. ST-44222-SF01"
                value={partNo}
                onChange={e => setPartNo(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Kuantitas</label>
              <input
                type="number"
                required
                min="1"
                value={qty || ''}
                onChange={e => setQty(parseInt(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Satuan</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="pcs">pcs</option>
                <option value="set">set</option>
                <option value="kg">kg</option>
                <option value="lot">lot</option>
                <option value="box">box</option>
              </select>
            </div>
            <div className="space-y-1 col-span-1">
              <label className="text-xs font-bold text-slate-700">Harga Satuan (IDR)</label>
              <input
                type="number"
                required
                min="1"
                value={unitPrice || ''}
                onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Price Calculation Preview */}
          {qty > 0 && unitPrice > 0 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium font-sans">Subtotal (Tanpa PPN 11%):</span>
              <span className="font-extrabold text-indigo-700 font-mono">{formatIDR(qty * unitPrice)}</span>
            </div>
          )}

          {/* Department Targets Checkbox Selection */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center">
              <label className="text-xxs font-extrabold text-slate-900 uppercase tracking-widest block">
                Target Penerima Tugas Departemen
              </label>
              <button
                type="button"
                onClick={() => setTargetDepts(DEPARTMENTS)}
                className="text-xxs font-extrabold text-indigo-600 hover:text-indigo-800"
              >
                Pilih Semua
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">Supervisor departemen yang ditandai wajib menuntaskan bagian progress lognya.</p>
            
            <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-[160px] overflow-y-auto">
              {DEPARTMENTS.map(dept => {
                const isSelected = targetDepts.includes(dept);
                return (
                  <label
                    key={dept}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors border select-none ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' 
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleDept(dept)}
                      className="rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                    />
                    <span className="text-[10px] truncate" title={dept}>{dept}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Catatan Lain / Spesifikasi Teknis</label>
            <textarea
              placeholder="cth. Toleransi presisi, Material Grade standar JIS SUS304..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 h-16 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-150"
          >
            <Plus className="w-4 h-4 text-emerald-400 animate-pulse" /> Issue Primary PO & Kirim ke Supervisor
          </button>
        </form>

        {/* PO List Column (7/12 cols) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 xl:col-span-7" id="po-list-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase">
                Antrean PO Kategori: {selectedCategoryTab}
              </h2>
              <p className="text-xxs text-slate-400">Ditemukan {filteredPOs.length} sirkulasi PO yang sesuai</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold px-2.5 py-1.5 rounded-lg uppercase">
                Sirkulasi Aktif
              </span>
            </div>
          </div>

          {/* Live Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari PO, Project, Part No, atau Nama Barang..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50"
            />
          </div>

          {/* List */}
          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredPOs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <SlidersHorizontal className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <span className="text-xs">Sirkulasi PO kosong pada bagian filter halaman ini.</span>
              </div>
            ) : (
              filteredPOs.map(po => (
                <div key={po.id} className="border border-slate-200 rounded-2xl p-4.5 space-y-3.5 hover:shadow-md transition-all relative overflow-hidden bg-white">
                  {/* Lateral indicator colored by status */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    po.status === 'Completed' ? 'bg-emerald-500' : po.status === 'In Progress' ? 'bg-amber-500' : 'bg-slate-300'
                  }`}></div>

                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xxs px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {po.category}
                        </span>
                        <span className="text-xs font-mono font-extrabold text-indigo-700">{po.poNumber}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-2">{po.projectName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{po.itemName} ({po.partNo})</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xxs font-extrabold uppercase rounded-md px-2 py-0.5 border ${getPOStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                      <div className="text-xs font-extrabold text-slate-950 mt-2 font-mono">{formatIDR(po.totalPrice)}</div>
                      <div className="text-xxs text-slate-400 font-bold">Qty: {po.qty} {po.unit}</div>
                    </div>
                  </div>

                  {/* Department Progress Tracker Circles */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Layers2 className="w-3.5 h-3.5 text-indigo-500" /> Status Kewajiban Departemen ({po.targetDepartments.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {DEPARTMENTS.map(dept => {
                        const isTarget = po.targetDepartments.includes(dept);
                        if (!isTarget) return null;
                        const currentStatus = po.deptStatuses[dept] || 'Waiting';
                        return (
                          <div
                            key={dept}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xxs font-extrabold transition-all border ${
                              currentStatus === 'Approved' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : currentStatus === 'Action Taken'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : currentStatus === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              currentStatus === 'Approved' ? 'bg-emerald-500' :
                              currentStatus === 'Action Taken' ? 'bg-blue-500' :
                              currentStatus === 'In Progress' ? 'bg-amber-500' : 'bg-slate-400'
                            }`}></span>
                            <span>{dept}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom notes and management */}
                  <div className="flex items-center justify-between text-xxs text-slate-400 border-t border-slate-50 pt-2.5">
                    <span className="font-mono">Tanggal Keluar: {po.orderDate}</span>
                    {po.status !== 'Completed' && po.status !== 'Cancelled' && (
                      <button
                        type="button"
                        onClick={() => onCancelPrimaryPO(po.id)}
                        className="hover:text-rose-600 font-extrabold hover:underline"
                      >
                        Batalkan PO Klien
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
