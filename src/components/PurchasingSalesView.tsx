/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PurchasingLog, SalesLog, Supplier, Customer, Product, PrimaryPO } from '../types';
import { formatIDR, generateId } from '../utils';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search,
  Percent,
  Calculator
} from 'lucide-react';

interface PurchasingSalesViewProps {
  purchasingLogs: PurchasingLog[];
  salesLogs: SalesLog[];
  suppliers: Supplier[];
  customers: Customer[];
  products: Product[];
  primaryPos: PrimaryPO[];
  onAddPurchasingLog: (newPurchase: PurchasingLog) => void;
  onAddSalesLog: (newSale: SalesLog) => void;
}

export default function PurchasingSalesView({
  purchasingLogs,
  salesLogs,
  suppliers,
  customers,
  products,
  primaryPos,
  onAddPurchasingLog,
  onAddSalesLog
}: PurchasingSalesViewProps) {
  const [activeTab, setActiveTab] = useState<'purchasing' | 'sales'>('purchasing');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states - Manual Purchase Log
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [pItemName, setPItemName] = useState('');
  const [pQty, setPQty] = useState<number>(0);
  const [pUnit, setPUnit] = useState('pcs');
  const [pUnitPrice, setPUnitPrice] = useState<number>(0);

  // Form states - Manual Sales Log
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [sItemName, setSItemName] = useState('');
  const [sQty, setSQty] = useState<number>(0);
  const [sUnit, setSUnit] = useState('pcs');
  const [sUnitPrice, setSUnitPrice] = useState<number>(0);
  const [parentPONumber, setParentPONumber] = useState('');

  const submitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim() || !pItemName.trim() || pQty <= 0 || pUnitPrice <= 0) {
      alert('Isi detail pembelian dengan parameter positif.');
      return;
    }

    const subtotal = pQty * pUnitPrice;
    const tax = subtotal * 0.11; // 11% PPN

    const newPurchase: PurchasingLog = {
      id: generateId('purchase-m'),
      date: new Date().toISOString().split('T')[0],
      purchaseNo: `PRC-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplier: supplier.trim(),
      itemName: pItemName.trim(),
      qty: pQty,
      unit: pUnit,
      unitPrice: pUnitPrice,
      subtotal,
      tax,
      grandTotal: subtotal + tax,
      status: 'Paid'
    };

    onAddPurchasingLog(newPurchase);
    setShowPurchaseForm(false);
    
    // Reset Form
    setSupplier('');
    setPItemName('');
    setPQty(0);
    setPUnitPrice(0);
  };

  const submitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !sItemName.trim() || sQty <= 0 || sUnitPrice <= 0) {
      alert('Isi detail penjualan dengan parameter positif.');
      return;
    }

    const subtotal = sQty * sUnitPrice;
    const tax = subtotal * 0.11; // 11% PPN

    const newSale: SalesLog = {
      id: generateId('sales-m'),
      date: new Date().toISOString().split('T')[0],
      salesNo: `SLS-2026-${Math.floor(100 + Math.random() * 900)}`,
      primaryPONumber: parentPONumber.trim() || 'MANUAL-NONE',
      clientName: clientName.trim(),
      itemName: sItemName.trim(),
      qty: sQty,
      unit: sUnit,
      unitPrice: sUnitPrice,
      subtotal,
      tax,
      grandTotal: subtotal + tax,
      status: 'Invoiced'
    };

    onAddSalesLog(newSale);
    setShowSalesForm(false);

    // Reset Form
    setClientName('');
    setSItemName('');
    setSQty(0);
    setSUnitPrice(0);
    setParentPONumber('');
  };

  // Calculations
  const totalPurchaseNet = purchasingLogs.reduce((acc, log) => acc + log.subtotal, 0);
  const totalPurchasePPN = purchasingLogs.reduce((acc, log) => acc + log.tax, 0);
  const totalPurchaseTotal = purchasingLogs.reduce((acc, log) => acc + log.grandTotal, 0);

  const totalSalesNet = salesLogs.reduce((acc, log) => acc + log.subtotal, 0);
  const totalSalesPPN = salesLogs.reduce((acc, log) => acc + log.tax, 0);
  const totalSalesTotal = salesLogs.reduce((acc, log) => acc + log.grandTotal, 0);

  return (
    <div className="space-y-6" id="purchasing-sales-flow">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
          <DollarSign className="w-5 h-5 text-indigo-600" /> Transaksi Pembelian & Penjualan
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola bukti pembayaran (Invoice Supplier), pengeluaran belanja bahan, serta pencatatan pendapatan penjualan hasil produksi.
        </p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Purchasing Aggregate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-lg">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Total Pengeluaran (Pembelian)</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{formatIDR(totalPurchaseNet)}</span>
            <span className="text-xxs text-red-600 font-medium block mt-0.5">PPN Masukan (11%): {formatIDR(totalPurchasePPN)}</span>
          </div>
        </div>

        {/* Sales Aggregate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Total Pendapatan (Penjualan)</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{formatIDR(totalSalesNet)}</span>
            <span className="text-xxs text-emerald-600 font-medium block mt-0.5">PPN Keluaran (11%): {formatIDR(totalSalesPPN)}</span>
          </div>
        </div>
      </div>

      {/* Top Slider menu */}
      <div className="flex border-b border-slate-200" id="tx-column-tabber">
        <button
          onClick={() => { setActiveTab('purchasing'); setSearchTerm(''); }}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'purchasing' 
              ? 'border-rose-600 text-rose-700 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" /> Buku Pembelian (Kredit)
        </button>
        <button
          onClick={() => { setActiveTab('sales'); setSearchTerm(''); }}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'sales' 
              ? 'border-emerald-600 text-emerald-700 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Buku Penjualan (Debet)
        </button>
      </div>

      {/* Search and manual trigger row */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'purchasing' ? "Cari supplier, nomor purchase..." : "Cari klien, item, nomor PO..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {activeTab === 'purchasing' ? (
          <button
            onClick={() => setShowPurchaseForm(!showPurchaseForm)}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors self-start"
          >
            <Plus className="w-4 h-4" /> Catat Pembelian Manual
          </button>
        ) : (
          <button
            onClick={() => setShowSalesForm(!showSalesForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors self-start"
          >
            <Plus className="w-4 h-4" /> Catat Penjualan Manual
          </button>
        )}
      </div>

      {/* Manuel Forms */}
      {showPurchaseForm && activeTab === 'purchasing' && (
        <form onSubmit={submitPurchase} className="bg-white p-5 rounded-xl border border-rose-200 shadow-lg space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-rose-700">Form Pengeluaran / Pembelian Suku Cadang Manual (Saved to: `purchasing_logs` table)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Nama Supplier / Kontraktor</label>
              <select
                required
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Pilih Supplier --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Material / Jasa Yang Dibeli</label>
              <select
                required
                value={pItemName}
                onChange={e => {
                  const val = e.target.value;
                  setPItemName(val);
                  const found = products.find(p => p.name === val);
                  if (found) {
                    setPUnit(found.unit || 'pcs');
                    setPUnitPrice(found.defaultPrice || 0);
                  }
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Pilih Material/Barang --</option>
                {products.map(p => (
                  <option key={p.id} value={p.name}>[{p.code}] {p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Qty & Satuan</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  required
                  min="1"
                  value={pQty || ''}
                  onChange={e => setPQty(parseInt(e.target.value) || 0)}
                  className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="pcs"
                  value={pUnit}
                  onChange={e => setPUnit(e.target.value)}
                  className="w-16 text-xs px-2 py-2 border border-slate-200 rounded-lg text-center"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Harga Satuan (IDR - Exc. PPN)</label>
              <input
                type="number"
                required
                min="1"
                value={pUnitPrice || ''}
                onChange={e => setPUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg mb-2">
              Kunci Transaksi Beli
            </button>
            <button type="button" onClick={() => setShowPurchaseForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs rounded-lg mb-2">
              Batal
            </button>
          </div>
        </form>
      )}

      {showSalesForm && activeTab === 'sales' && (
        <form onSubmit={submitSale} className="bg-white p-5 rounded-xl border border-emerald-200 shadow-lg space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-emerald-700">Form Pendapatan / Penjualan Manual (Saved to: `sales_logs` table)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Klien / Buyer PT Nama</label>
              <select
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Pilih Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Produk Hasil Produksi / Lot Terjual</label>
              <select
                required
                value={sItemName}
                onChange={e => {
                  const val = e.target.value;
                  setSItemName(val);
                  const found = products.find(p => p.name === val);
                  if (found) {
                    setSUnit(found.unit || 'pcs');
                    setSUnitPrice(found.defaultPrice || 0);
                  }
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Pilih Produk/Barang --</option>
                {products.map(p => (
                  <option key={p.id} value={p.name}>[{p.code}] {p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Qty & Satuan</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  required
                  min="1"
                  value={sQty || ''}
                  onChange={e => setSQty(parseInt(e.target.value) || 0)}
                  className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="pcs"
                  value={sUnit}
                  onChange={e => setSUnit(e.target.value)}
                  className="w-16 text-xs px-2 py-2 border border-slate-200 rounded-lg text-center"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Harga Jual Unit (Exc. PPN)</label>
              <input
                type="number"
                required
                min="1"
                value={sUnitPrice || ''}
                onChange={e => setSUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Hubungkan Ke No PO (Jika Ada)</label>
              <select
                value={parentPONumber}
                onChange={e => setParentPONumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Manual/None atau Pilih PO Rujukan --</option>
                {primaryPos.map(po => (
                  <option key={po.id} value={po.poNumber}>{po.poNumber} ({po.itemName})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg mb-2">
              Kunci Transaksi Jual
            </button>
            <button type="button" onClick={() => setShowSalesForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs rounded-lg mb-2">
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Ledger UI display */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm" id="ledger-tables-container">
        {activeTab === 'purchasing' ? (
          <div className="space-y-4">
            <div className="border-b border-rose-100 pb-2">
              <h2 className="text-sm font-bold text-rose-800">Buku Pembelian, Pengadaan & Material In</h2>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="p-3 font-semibold">Tgl Transaksi</th>
                    <th className="p-3 font-semibold">No. Purchase</th>
                    <th className="p-3 font-semibold font-mono">No. PO Sekunder</th>
                    <th className="p-3 font-semibold">Vendor / Supplier</th>
                    <th className="p-3 font-semibold">Detail Material</th>
                    <th className="p-3 font-semibold text-right">Nilai DPP</th>
                    <th className="p-3 font-semibold text-right">PPN (11%)</th>
                    <th className="p-3 font-semibold text-right">Total Tagihan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchasingLogs
                    .filter(log => 
                      log.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      log.purchaseNo.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/40">
                        <td className="p-3 font-medium text-slate-600">{log.date}</td>
                        <td className="p-3 font-bold text-slate-700">{log.purchaseNo}</td>
                        <td className="p-3 font-mono text-indigo-700">{log.secondaryPONumber || '-'}</td>
                        <td className="p-3 font-semibold text-slate-800">{log.supplier}</td>
                        <td className="p-3">
                          <div>{log.itemName}</div>
                          <div className="text-[10px] text-slate-400">Qty: {log.qty} {log.unit} @ {formatIDR(log.unitPrice)}</div>
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-700 font-mono">{formatIDR(log.subtotal)}</td>
                        <td className="p-3 text-right text-rose-600 font-mono">+{formatIDR(log.tax)}</td>
                        <td className="p-3 text-right font-bold text-slate-900 font-mono">{formatIDR(log.grandTotal)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-b border-emerald-100 pb-2">
              <h2 className="text-sm font-bold text-emerald-800">Buku Penjualan & Tagihan Out</h2>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="p-3 font-semibold">Tgl Transaksi</th>
                    <th className="p-3 font-semibold">No. Invoice Out</th>
                    <th className="p-3 font-semibold">Rujukan PO Utama</th>
                    <th className="p-3 font-semibold">Nama Klien / Perusahaan</th>
                    <th className="p-3 font-semibold">Deskripsi Pekerjaan Jig/Part</th>
                    <th className="p-3 font-semibold text-right">Nilai DPP</th>
                    <th className="p-3 font-semibold text-right">PPN (11%)</th>
                    <th className="p-3 font-semibold text-right">Total Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesLogs
                    .filter(log => 
                      log.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      log.salesNo.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/40">
                        <td className="p-3 font-medium text-slate-600">{log.date}</td>
                        <td className="p-3 font-bold text-slate-700">{log.salesNo}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{log.primaryPONumber}</td>
                        <td className="p-3 font-semibold text-slate-800">{log.clientName}</td>
                        <td className="p-3">
                          <div>{log.itemName}</div>
                          <div className="text-[10px] text-slate-400">Qty: {log.qty} {log.unit} @ {formatIDR(log.unitPrice)}</div>
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-700 font-mono">{formatIDR(log.subtotal)}</td>
                        <td className="p-3 text-right text-indigo-600 font-mono">+{formatIDR(log.tax)}</td>
                        <td className="p-3 text-right font-bold text-slate-900 font-mono">{formatIDR(log.grandTotal)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
