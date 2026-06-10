/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StockItem } from '../types';
import { formatIDR } from '../utils';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  Settings, 
  ExternalLink,
  ChevronDown,
  Wrench
} from 'lucide-react';

interface InventoryViewProps {
  stockItems: StockItem[];
  onAddStockItem: (newItem: StockItem) => void;
  onUpdateStockQty: (id: string, newQty: number) => void;
}

export default function InventoryView({
  stockItems,
  onAddStockItem,
  onUpdateStockQty
}: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | StockItem['category']>('All');

  // Form states for manual additions
  const [showAddForm, setShowAddForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StockItem['category']>('Raw Material');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('pcs');
  const [unitCost, setUnitCost] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(10);
  const [location, setLocation] = useState('');
  const [vendor, setVendor] = useState('');

  // Stock Adjustment State
  const [adjustmentItemId, setAdjustmentItemId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || quantity < 0 || unitCost < 0) {
      alert('Mohon isi formulir inventaris dengan benar.');
      return;
    }

    const newItem: StockItem = {
      id: `stock-${Math.random().toString(36).substring(2, 9)}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      quantity,
      unit,
      unitCost,
      minStock,
      location: location.trim() || 'Gudang Utama',
      vendor: vendor.trim() || 'Supplier Lokal'
    };

    onAddStockItem(newItem);
    setShowAddForm(false);

    // Reset Form
    setCode('');
    setName('');
    setQuantity(0);
    setUnitCost(0);
    setMinStock(10);
    setLocation('');
    setVendor('');
  };

  const handleAdjustSubmit = (id: string) => {
    onUpdateStockQty(id, adjustQty);
    setAdjustmentItemId(null);
  };

  // Filter items
  const filteredItems = stockItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="inventory-view-flow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <Package className="w-5 h-5 text-indigo-600" /> Manajemen Stok & Logistik Gudang
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor persediaan material logam (stamping), resin (injection), serta standard parts dan finished goods pendukung manufaktur.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors self-start"
        >
          <Plus className="w-4 h-4" /> Tambah Item Baru
        </button>
      </div>

      {/* Add New Stock Item form collapsing panel */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-indigo-200 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Registrasi Suku Cadang/Bahan Baku Baru</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Kode Suku Cadang (Part No/SKU)</label>
              <input
                type="text"
                required
                placeholder="cth. RM-STEEL-S50C"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg uppercase"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Nama Barang / Deskripsi Material</label>
              <input
                type="text"
                required
                placeholder="cth. Carbon Steel Plate JIS S50C Thick 50mm"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Kategori</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as StockItem['category'])}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Raw Material">Raw Material (Bahan Baku)</option>
                <option value="Standard Part">Standard Part (Kebutuhan Cetak)</option>
                <option value="Sub-Assembly">Sub-Assembly (Komponen Rakitan)</option>
                <option value="Finished Goods">Finished Goods (Produk Akhir)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Jumlah Stok Awal</label>
              <input
                type="number"
                required
                min="0"
                value={quantity || ''}
                onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Satuan</label>
              <input
                type="text"
                required
                placeholder="cth. pcs, kg, tons..."
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Harga Per Unit (IDR)</label>
              <input
                type="number"
                required
                min="0"
                value={unitCost || ''}
                onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Batas Minimum Pengamanan</label>
              <input
                type="number"
                required
                min="1"
                value={minStock || ''}
                onChange={e => setMinStock(parseInt(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Lokasi Penempatan Gudang</label>
              <input
                type="text"
                placeholder="cth. Silo C-Plastic Assembly, Cabinet 2A..."
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Nama Rekanan Utama / Supplier</label>
              <input
                type="text"
                placeholder="PT. Srikandi Supplier Metal..."
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Simpan Registrasi Item
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Grid: Main Inventory Table and Statistics Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
          <div className="flex items-center gap-2 w-full md:max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari suku cadang, kode, supplier..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-lg bg-slate-50 px-3 py-2 font-medium"
            >
              <option value="All">Semua Kategori Persediaan</option>
              <option value="Raw Material">Raw Material</option>
              <option value="Standard Part">Standard Part</option>
              <option value="Sub-Assembly">Sub-Assembly</option>
              <option value="Finished Goods">Finished Goods</option>
            </select>
          </div>
        </div>

        {/* Ledger table */}
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="p-3 font-semibold">Kode Part</th>
                <th className="p-3 font-semibold">Nama Persediaan</th>
                <th className="p-3 font-semibold">Kategori</th>
                <th className="p-3 font-semibold text-right">Stok Aktif</th>
                <th className="p-3 font-semibold text-right">Harga Unit</th>
                <th className="p-3 font-semibold text-right font-medium">Nilai Total Aset</th>
                <th className="p-3 font-semibold">Penyimpanan</th>
                <th className="p-3 font-semibold text-center">Atur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Tidak ada log inventaris yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isLow = item.quantity <= item.minStock;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/50 ${isLow ? 'bg-rose-50/20' : ''}`}>
                      <td className="p-3 font-mono font-bold text-slate-700">{item.code}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {item.name}
                          {isLow && (
                            <span className="inline-flex items-center gap-0.5 xxs px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[9px] font-bold">
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-500" /> Kritis
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">Supplier: {item.vendor}</div>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 p-1 rounded">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                          {item.quantity} {item.unit}
                        </span>
                        <div className="text-[10px] text-slate-400">Min: {item.minStock}</div>
                      </td>
                      <td className="p-3 text-right text-slate-600 font-mono">{formatIDR(item.unitCost)}</td>
                      <td className="p-3 text-right font-bold text-slate-900 font-mono">
                        {formatIDR(item.quantity * item.unitCost)}
                      </td>
                      <td className="p-3 text-slate-500 max-w-[140px] truncate">{item.location}</td>
                      <td className="p-3 text-center">
                        {adjustmentItemId === item.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              required
                              min="0"
                              value={adjustQty}
                              onChange={e => setAdjustQty(parseInt(e.target.value) || 0)}
                              className="w-16 text-center border px-1 py-0.5 text-xs text-slate-800"
                            />
                            <button
                              onClick={() => handleAdjustSubmit(item.id)}
                              className="bg-emerald-500 text-white rounded px-1.5 py-0.5 text-xxs font-bold"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setAdjustmentItemId(null)}
                              className="bg-slate-300 text-slate-600 rounded px-1.5 py-0.5 text-xxs"
                            >
                              x
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAdjustmentItemId(item.id);
                              setAdjustQty(item.quantity);
                            }}
                            className="text-xxs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-1 mx-auto"
                          >
                            <Wrench className="w-3 h-3" /> Set Stok
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
