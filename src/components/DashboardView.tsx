/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PrimaryPO, DepartmentPO, StockItem, PurchasingLog, SalesLog } from '../types';
import { formatIDR } from '../utils';
import { 
  FileText, 
  TrendingUp, 
  Wallet, 
  Layers, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Percent,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  primaryPOs: PrimaryPO[];
  deptPOs: DepartmentPO[];
  stockItems: StockItem[];
  purchasingLogs: PurchasingLog[];
  salesLogs: SalesLog[];
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  primaryPOs,
  deptPOs,
  stockItems,
  purchasingLogs,
  salesLogs,
  onNavigate
}: DashboardViewProps) {
  // 1. Calculations
  const activePOs = primaryPOs.filter(po => po.status === 'In Progress' || po.status === 'Pending').length;
  const completedPOsCount = primaryPOs.filter(po => po.status === 'Completed').length;
  
  const totalSales = salesLogs.reduce((acc, log) => acc + log.subtotal, 0);
  const totalPurchases = purchasingLogs.reduce((acc, log) => acc + log.subtotal, 0);
  
  // Taxes (PPN 11%)
  const ppnSales = salesLogs.reduce((acc, log) => acc + log.tax, 0);
  const ppnPurchases = purchasingLogs.reduce((acc, log) => acc + log.tax, 0);
  const nettTaxToPay = ppnSales - ppnPurchases; // Pajak Keluaran - Pajak Masukan

  // Gross profit
  const grossProfit = totalSales - totalPurchases;
  const gpMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

  // Alerts
  const lowStockItems = stockItems.filter(item => item.quantity <= item.minStock);

  // Department Workloads
  // Count how many POs are waiting / processing in each department
  const deptWorkloads: { [key: string]: number } = {};
  primaryPOs.forEach(po => {
    if (po.status === 'In Progress' || po.status === 'Pending') {
      po.targetDepartments.forEach(dept => {
        const state = po.deptStatuses[dept];
        if (state === 'Waiting' || state === 'In Progress') {
          deptWorkloads[dept] = (deptWorkloads[dept] || 0) + 1;
        }
      });
    }
  });

  // PO Categories Distribution
  const categoryCounts: { [key: string]: number } = {
    'Component': 0,
    'Project': 0,
    'Standard Part': 0,
    'MassPro Machining': 0,
    'MassPro Stamping': 0,
    'MassPro Injection': 0
  };
  primaryPOs.forEach(po => {
    if (categoryCounts[po.category] !== undefined) {
      categoryCounts[po.category]++;
    }
  });

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight" id="dashboard-title">
            Dashboard Utama ERP
          </h1>
          <p className="text-sm text-slate-500 mt-1" id="dashboard-subtitle">
            Ringkasan operasional PT. Global Manufaktur Presisi secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Server Sinkronisasi Aktif (Lokal)
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {/* KPI 1: Active POs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">PO Berjalan</span>
            <div className="text-2xl font-bold text-slate-900">{activePOs} PO</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500 inline" /> {primaryPOs.length - activePOs} selesai / dibatalkan
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Penjualan</span>
            <div className="text-2xl font-bold text-emerald-600">{formatIDR(totalSales)}</div>
            <p className="text-xs text-slate-500">
              Dari <span className="font-semibold">{salesLogs.length} transaksi</span> terkirim
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Total Purchases */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pembelian</span>
            <div className="text-2xl font-bold text-slate-900">{formatIDR(totalPurchases)}</div>
            <p className="text-xs text-slate-500">
              Realisasi pengadaan suku cadang & RM
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Margin Labar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimasi Margin Rugi Laba</span>
            <div className="text-2xl font-bold text-slate-900">{formatIDR(grossProfit)}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Percent className="w-3 h-3 text-slate-400" /> Margin: {gpMargin.toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-violet-50 text-violet-600 rounded-lg">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Primary Layout Charts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-bento">
        {/* Left Column - PO Status and Category Breakdown (SVG Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Distribusi Purchase Order (PO) Berdasarkan Kategori
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Custom Responsive SVG Donut Chart */}
            <div className="flex flex-col items-center justify-center p-2">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  {/* Stacking the circles to form segments */}
                  {(() => {
                    let cumulativePercentage = 0;
                    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#14b8a6'];
                    const data = Object.entries(categoryCounts);
                    const totalPO = primaryPOs.length || 1;

                    return data.map(([category, count], idx) => {
                      const pct = (count / totalPO) * 100;
                      if (pct === 0) return null;
                      const strokeDasharray = `${pct} ${100 - pct}`;
                      const strokeDashoffset = 100 - cumulativePercentage;
                      cumulativePercentage += pct;

                      return (
                        <circle
                          key={category}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={colors[idx % colors.length]}
                          strokeWidth="12"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Text centered inside donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{primaryPOs.length}</span>
                  <span className="text-xs text-slate-400 font-medium">Total PO</span>
                </div>
              </div>
            </div>

            {/* Chart Legend with counts */}
            <div className="space-y-2 text-sm">
              {(() => {
                const colors = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#14b8a6'];
                return Object.entries(categoryCounts).map(([cat, count], idx) => {
                  const pct = primaryPOs.length > 0 ? ((count / primaryPOs.length) * 100).toFixed(0) : '0';
                  return (
                    <div key={cat} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                        <span className="text-slate-700 font-medium">{cat}</span>
                      </div>
                      <span className="text-slate-500 font-medium">{count} PO ({pct}%)</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Right Column - Warnings, Safety Alerts and Actions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Peringatan Stok & Suku Cadang Kritis
            </h2>
            <p className="text-xs text-slate-400 mt-1">Stok di bawah batas minimum pengamanan.</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[160px] my-3 space-y-2">
            {lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-6">
                <CheckCircle className="w-10 h-10 text-emerald-500 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Level Stok Aman</span>
                <span className="text-xxs text-slate-400">Seluruh bahan baku di atas batas aman.</span>
              </div>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</div>
                    <div className="text-xxs text-slate-500">Kode: {item.code} | Lokasi: {item.location}</div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-red-700 font-bold">{item.quantity} {item.unit}</span>
                    <div className="text-xxs text-slate-400">Min: {item.minStock}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => onNavigate('stock')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
          >
            Lihat Modul Gudang & Stok <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle Grid - Departmental Workload & PPN Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Working Load Indicators */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Pembagian Beban Antar Departemen</h2>
            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">Supervisor Action</span>
          </div>
          <p className="text-xs text-slate-400">Jumlah tugas/Primary PO yang membutuhkan aksi pengadaan oleh supervisor masing-masing divisi.</p>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {Object.keys(deptWorkloads).length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Belum ada antrean tugas di departemen supervisor.
              </div>
            ) : (
              Object.entries(deptWorkloads).map(([dept, count]) => {
                const percentage = Math.min((count / primaryPOs.length) * 100, 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{dept}</span>
                      <span>{count} PO Tertunda</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PPN 11% Tax Balance Sheet Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-slate-900">Neraca Pajak PPN 11%</h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">PPN Tarif 11%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Perhitungan Pajak Keluaran (dari Penjualan) dikurangi Pajak Masukan (dari Pembelian).</p>
          </div>

          {/* Tax visual bars */}
          <div className="space-y-4 my-2">
            <div>
              <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1">
                <span>Pajak Keluaran (PPN Penjualan)</span>
                <span className="text-emerald-600 font-bold">{formatIDR(ppnSales)}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalSales > 0 ? (ppnSales / totalSales) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1">
                <span>Pajak Masukan (PPN Pembelian)</span>
                <span className="text-amber-600 font-bold">{formatIDR(ppnPurchases)}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalPurchases > 0 ? (ppnPurchases / totalPurchases) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xxs font-bold uppercase text-slate-400">Selisih Pajak (Harus Setok / Lebih Bayar)</span>
                <div className={`text-sm font-bold ${nettTaxToPay >= 0 ? "text-indigo-600" : "text-emerald-600"}`}>
                  {formatIDR(Math.abs(nettTaxToPay))} {nettTaxToPay >= 0 ? "(Kurang Bayar / Setor KPP)" : "(Lebih Bayar / Kompensasi)"}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('financial')}
            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-indigo-100"
          >
            Buka Dashboard Pajak & Keuangan <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
