/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PurchasingLog, SalesLog, StockItem, Invoice } from '../types';
import { formatIDR } from '../utils';
import { 
  BarChart3, 
  Scale, 
  Percent, 
  Calculator, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Coins,
  CheckCircle,
  Building2
} from 'lucide-react';

interface FinancialViewProps {
  purchasingLogs: PurchasingLog[];
  salesLogs: SalesLog[];
  stockItems: StockItem[];
  invoices: Invoice[];
  cashBalance: number;
  onPayTaxes: (amountToPay: number) => void;
}

export default function FinancialView({
  purchasingLogs,
  salesLogs,
  stockItems,
  invoices,
  cashBalance,
  onPayTaxes
}: FinancialViewProps) {
  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'balance' | 'tax'>('pnl');

  // 1. Profit & Loss calculations
  const totalSalesNet = salesLogs.reduce((acc, log) => acc + log.subtotal, 0);
  const totalCOGS = purchasingLogs.reduce((acc, log) => acc + log.subtotal, 0); // Raw materials and outsourced industrial processing
  const grossProfit = totalSalesNet - totalCOGS;
  const gpPercentage = totalSalesNet > 0 ? (grossProfit / totalSalesNet) * 100 : 0;

  // Mock operating overhead expenses standard to a factory
  const opExpenses = [
    { name: 'Gaji Tenaga Kerja & Operator (Assembly/Processing)', amount: 24000000 },
    { name: 'PLN Meteran Industri & Listrik Mesin Stamping', amount: 8500000 },
    { name: 'Sewa Gudang Logistik & Kantor Administrasi', amount: 12000000 },
    { name: 'Pemeliharaan Mesin & Kalibrasi Alat Presisi QS', amount: 3500000 }
  ];
  const totalOpExpenses = opExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const operatingProfit = grossProfit - totalOpExpenses;

  // Corporate Income Tax (Mock PPh Badan 22%)
  const incomeTaxRate = 0.22;
  const corporateIncomeTax = operatingProfit > 0 ? operatingProfit * incomeTaxRate : 0;
  const netProfit = operatingProfit - corporateIncomeTax;

  // 2. Balance Sheet calculations
  // Assets
  const accountsReceivable = invoices.filter(inv => inv.status === 'Unpaid').reduce((acc, inv) => acc + inv.grandTotal, 0);
  const inventoryValue = stockItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
  const fixedEquipmentValue = 850000000; // Value of milling/shaping machines in catalog
  const totalAssets = cashBalance + accountsReceivable + inventoryValue + fixedEquipmentValue;

  // Liabilities
  const accountsPayable = purchasingLogs.filter(p => p.status === 'Unpaid').reduce((acc, p) => acc + p.grandTotal, 0);
  
  // Tax PPN due calculations
  const ppnSales = salesLogs.reduce((acc, log) => acc + log.tax, 0);
  const ppnPurchases = purchasingLogs.reduce((acc, log) => acc + log.tax, 0);
  const ppnPayable = Math.max(0, ppnSales - ppnPurchases);

  const totalLiabilities = accountsPayable + ppnPayable;
  const capitalEquity = totalAssets - totalLiabilities; // Always balance

  // 3. Tax Dashboard (Faktur Pajak logs summary)
  const isPPNMoreBayar = ppnPurchases > ppnSales;
  const [taxSuccess, setTaxSuccess] = useState(false);

  const handlePayPPN = () => {
    if (ppnPayable <= 0) return;
    onPayTaxes(ppnPayable);
    setTaxSuccess(true);
    setTimeout(() => setTaxSuccess(false), 4000);
  };

  return (
    <div className="space-y-6" id="finances-reporting-view">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
          <BarChart3 className="w-5 h-5 text-indigo-600" /> Akuntansi, Laporan Pajak & Neraca
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ikhtisar akuntansi komprehensif pabrik: Laporan Laba Rugi bulanan, Neraca Saldo, dan kepatuhan perpajakan SPT Masa PPN 11%.
        </p>
      </div>

      {/* Selector switches */}
      <div className="flex border-b border-slate-200" id="finances-tabs font-bold">
        <button
          onClick={() => setActiveReportTab('pnl')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeReportTab === 'pnl' 
              ? 'border-indigo-600 text-indigo-700 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" /> Laporan Laba Rugi
        </button>
        <button
          onClick={() => setActiveReportTab('balance')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeReportTab === 'balance' 
              ? 'border-indigo-600 text-indigo-700 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" /> Neraca Keuangan (Balance Sheet)
        </button>
        <button
          onClick={() => setActiveReportTab('tax')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeReportTab === 'tax' 
              ? 'border-indigo-600 text-indigo-700 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" /> Posisi Pajak PPN 11%
        </button>
      </div>

      {/* Render selected tabs */}
      {activeReportTab === 'pnl' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Profit & Loss Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-8 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800">Laporan Laba Rugi (Profit & Loss Statement)</h2>
              <p className="text-xxs text-slate-400">Periode berjalan s/d hari ini | Denominasi: Rupiah Indonesia (IDR)</p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              {/* Revenue */}
              <div className="flex justify-between items-center py-1 bg-slate-50 px-2 rounded font-semibold text-slate-800">
                <span>Pendapatan Kotor (Penjualan / Sales - Net DPP)</span>
                <span className="font-mono font-bold">{formatIDR(totalSalesNet)}</span>
              </div>

              {/* COGS */}
              <div className="flex justify-between items-center py-1 px-2">
                <span className="text-slate-500 font-medium">Beban Pokok Penjualan / COGS (Pembelian Bahan Baku & Subkon)</span>
                <span className="font-mono text-slate-600">({formatIDR(totalCOGS)})</span>
              </div>

              <hr className="border-slate-100" />

              {/* Gross Profit */}
              <div className="flex justify-between items-center py-2 bg-indigo-50/50 px-2 rounded font-bold text-slate-900 border border-indigo-100">
                <span>Laba Kotor (Gross Profit)</span>
                <span className="font-mono font-extrabold text-indigo-800">{formatIDR(grossProfit)}</span>
              </div>

              <div className="px-2 text-xxs text-slate-500 flex justify-between select-none">
                <span>Persentase Margin Laba Kotor:</span>
                <span className="font-bold text-slate-700">{gpPercentage.toFixed(2)}%</span>
              </div>

              {/* Operating Expenses list */}
              <div className="space-y-1.5 pt-3">
                <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-wide px-2 block">Pengeluaran Operasional Pabrik:</span>
                {opExpenses.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-center px-2 py-0.5">
                    <span className="text-slate-500">{exp.name}</span>
                    <span className="font-mono text-slate-600">({formatIDR(exp.amount)})</span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center px-2 pt-2 border-t border-slate-100 font-semibold text-slate-600">
                  <span>Total Pengeluaran Operasional (OPEX)</span>
                  <span className="font-mono">({formatIDR(totalOpExpenses)})</span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Operating Profit */}
              <div className="flex justify-between items-center py-1.5 px-2 bg-slate-100/60 rounded font-bold text-slate-800">
                <span>Laba Operasional (Operating Profit / EBIT)</span>
                <span className="font-mono">{formatIDR(operatingProfit)}</span>
              </div>

              {/* Taxes */}
              <div className="flex justify-between items-center px-2 py-1 select-none text-[11px]">
                <span className="text-slate-500 font-medium">Estimasi PPh Badan (Tarif PPh 22% dari Laba Operasional)</span>
                <span className="font-mono text-slate-500">({formatIDR(corporateIncomeTax)})</span>
              </div>

              {/* Nett profit */}
              <div className="flex justify-between items-center py-2.5 bg-slate-900 text-white px-3 rounded-lg font-bold text-sm">
                <span>Laba Bersih Setelah Pajak (Net Profit After Tax)</span>
                <span className="font-mono text-emerald-400 font-black">{formatIDR(netProfit)}</span>
              </div>
            </div>
          </div>

          {/* Side stats widget for PNL */}
          <div className="space-y-4 lg:col-span-4" id="pnl-insights-card">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
              <span className="font-extrabold text-slate-800 block uppercase tracking-wider text-xxs text-indigo-600">💡 Analisis Manufaktur:</span>
              <p>Struktur Laba Rugi mencerminkan margin kotor manufaktur logam presisi (die press). Margin kotor idealnya berkisar antara <span className="font-bold text-slate-800">20% s/d 45%</span>.</p>
              <p>Pengadaan bahan baku melalui <strong>PO Sekunder</strong> di modul supervisor secara langsung terakumulasi sebagai COGS pengeluaran bahan utama pemicu Laba Kotor.</p>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Balance sheet structure */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-12 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-800">Laporan Neraca Saldo (Balance Sheet)</h2>
                <p className="text-xxs text-slate-400">Menyajikan posisi kepemilikan aset dibandingkan kewajiban dan modal perusahaan.</p>
              </div>
              <span className="text-xxs font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded">
                Status: Balanced (Sesuai Persamaan Akuntansi)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-800" id="balance-sheet-tables">
              {/* Assets Section */}
              <div className="space-y-4 border-r border-slate-100 pr-4">
                <span className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-1.5">
                  <Coins className="w-4 h-4 text-indigo-600" /> Aset (Assets)
                </span>

                <div className="space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 font-semibold">Kas Liquid & Bank Mandiri</span>
                    <span className="font-mono font-bold text-slate-900">{formatIDR(cashBalance)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 font-semibold">Piutang Usaha (Invoice Klien Bertahan Unpaid)</span>
                    <span className="font-mono font-bold text-slate-900">{formatIDR(accountsReceivable)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 font-semibold">Aset Bahan Baku di Gudang (Buku Persediaan)</span>
                    <span className="font-mono font-bold text-slate-900">{formatIDR(inventoryValue)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-slate-100 pt-1 text-[11px] text-slate-500">
                    <span className="font-medium">Peralatan Pabrik & Mesin CNC (Nilai Buku Terpelihara)</span>
                    <span className="font-mono font-medium">{formatIDR(fixedEquipmentValue)}</span>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-t-2 border-slate-300 font-black text-slate-950 bg-slate-50 px-2 rounded mt-4">
                  <span>TOTAL SELURUH ASET (A):</span>
                  <span className="font-mono font-extrabold">{formatIDR(totalAssets)}</span>
                </div>
              </div>

              {/* Liabilities and Equities Section */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-rose-700 tracking-wider flex items-center gap-1.5 border-b border-rose-100 pb-1.5">
                  <Scale className="w-4 h-4 text-rose-600" /> Kewajiban & Ekuitas (Liabilities & Equity)
                </span>

                <div className="space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 font-semibold">Hutang Usaha (PO Sekunder Vendor Belum Dilunasi)</span>
                    <span className="font-mono font-bold text-slate-900">{formatIDR(accountsPayable)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 font-semibold">Kewajiban Setor PPN (Selisih PPN 11%)</span>
                    <span className="font-mono font-bold text-slate-900">{formatIDR(ppnPayable)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-slate-100 pt-1">
                    <span className="text-slate-600 font-semibold">Modal Pendiri & Laba Ditahan</span>
                    <span className="font-mono font-bold text-slate-900">{formatIDR(capitalEquity)}</span>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-t-2 border-slate-300 font-black text-slate-950 bg-slate-50 px-2 rounded mt-6">
                  <span>TOTAL KEWAJIBAN & EKUITAS (L+E):</span>
                  <span className="font-mono font-extrabold">{formatIDR(totalAssets)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'tax' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* TAX PPN Calculator Dashboard widget */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-8 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800">SPT Masa Kepatuhan PPN Bulanan (Tarif 11%)</h2>
              <p className="text-xxs text-slate-400">Surat Pemberitahuan yang merangkum Pajak Masukan dan Pajak Keluaran pabrik.</p>
            </div>

            {taxSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold animate-bounce">
                Sukses menyetorkan pembayaran SPT PPN 11% Ke kas negara lewat e-Billing kode SSP! Kas liquid terpotong nominal.
              </div>
            )}

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex justify-between items-center py-2.5 bg-emerald-50 text-emerald-900 border border-emerald-100 px-3 rounded-lg">
                <div>
                  <span className="font-bold text-slate-800">Pajak Keluaran (PPN 11% Penjualan Klien)</span>
                  <div className="text-[10px] text-slate-500 font-normal">Pajak yang dipungut PT. GMP dari invoice terkirim ke customer</div>
                </div>
                <span className="font-mono font-extrabold text-sm">{formatIDR(ppnSales)}</span>
              </div>

              <div className="flex justify-between items-center py-2.5 bg-amber-50 text-amber-950 border border-amber-100 px-3 rounded-lg">
                <div>
                  <span className="font-bold text-slate-800">Pajak Masukan (PPN 11% Pembelian Raw Material)</span>
                  <div className="text-[10px] text-slate-500 font-normal">Pajak yang dibayar PT. GMP kepada supplier logam atau ABS resin</div>
                </div>
                <span className="font-mono font-extrabold text-xs">{formatIDR(ppnPurchases)}</span>
              </div>

              <hr className="border-slate-100" />

              <div className="bg-slate-50 p-4 border rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Hasil Selisih Pajak (Kurang Bayar/Setor):</span>
                  <div className="text-base font-black text-rose-600 font-mono mt-0.5">{formatIDR(ppnPayable)}</div>
                  <p className="text-xxs text-slate-400 max-w-sm mt-1 leading-relaxed">Artinya PT. GMP wajib menyetorkan kekurangan kas PPN ini melalui NTPN sebelum batas akhir pelaporan pajak masa selanjutnya.</p>
                </div>

                {ppnPayable > 0 ? (
                  <button
                    onClick={handlePayPPN}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    Setor PPN Masal ke Negara
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold leading-none select-none">
                    <CheckCircle className="w-4 h-4" /> Nihil / Lebih Bayar
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Indotech taxation insights column */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed lg:col-span-4" id="tax-insights-card">
            <span className="font-extrabold text-indigo-600 block uppercase tracking-wider text-xxs flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Kepatuhan SPT Masa Pajak
            </span>
            <p>Sistem ini telah mendukung implementasi <strong>Undang-Undang Harmonisasi Peraturan Perpajakan (UU HPP)</strong> dengan pengenaan tarif <strong>PPN 11%</strong> untuk penyerahan barang kena pajak hasil industri manufaktur.</p>
            <p>Pajak Masukan dikumpulkan secara dinamis dari file PO Sekunder supervisor, sedangkan Pajak Keluaran dihitung dari invoice pembayaran klien.</p>
          </div>
        </div>
      )}
    </div>
  );
}
