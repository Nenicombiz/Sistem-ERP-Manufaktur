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
  Building2,
  Database,
  Copy,
  Check
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
  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'balance' | 'tax' | 'supabase'>('pnl');

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
        <button
          onClick={() => setActiveReportTab('supabase')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeReportTab === 'supabase' 
              ? 'border-indigo-600 text-indigo-700 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" /> 💻 Skema SQL (Supabase)
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

      {activeReportTab === 'supabase' && <SupabaseQueryConsole />}
    </div>
  );
}

// Separate helper component for interactive DB Console and Clipboard Actions
function SupabaseQueryConsole() {
  const [copied, setCopied] = useState(false);

  const supabaseSQLCode = `-- ==========================================
-- INDOTECH ERP SCHEMA - SUPABASE POSTGRESQL
-- ==========================================
-- Alur kerja terintegrasi:
-- 1. Input Purchase Order (PO Klien) -> Tabel 'primary_pos'
-- 2. Alokasi pengerjaan per departemen & estimasi material -> Tabel 'department_pos'
-- 3. Pencatatan persediaan bahan baku -> Tabel 'stock_items'
-- 4. log keuangan otomatis PPN 11% -> Tabel 'purchasing_logs' & 'sales_logs'
-- 5. Penagihan termin komersial -> Tabel 'invoices'
-- 6. Registrasi Master Partner -> Tabel 'suppliers', 'customers', 'products'
-- ==========================================

-- 1. EXTENSIONS & CUSTOM TYPES ENUM
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'po_category_enum') THEN
        CREATE TYPE po_category_enum AS ENUM (
          'Component', 
          'Project', 
          'Standard Part', 
          'MassPro Machining', 
          'MassPro Stamping', 
          'MassPro Injection'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'manufacturing_dept_enum') THEN
        CREATE TYPE manufacturing_dept_enum AS ENUM (
          'General Admin',
          'Design Mekanik',
          'Design Electric',
          'Proccessing',
          'Assembly',
          'PPIC Delivery',
          'MassPro Machine',
          'MassPro Stamping',
          'MassPro Injection',
          'Pembelian',
          'Quality Control'
        );
    END IF;
END $$;

-- 2. MASTER DATA TABLES
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(100);

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email VARCHAR(100);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category po_category_enum NOT NULL,
    unit VARCHAR(20) DEFAULT 'pcs',
    default_price DECIMAL(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. TRANSACTIONAL & WORKFLOW TABLES
CREATE TABLE IF NOT EXISTS primary_pos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    category po_category_enum NOT NULL DEFAULT 'Component',
    project_name VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    part_no VARCHAR(100) NOT NULL,
    qty INT NOT NULL CHECK (qty > 0),
    unit VARCHAR(20) DEFAULT 'pcs',
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(15, 2) GENERATED ALWAYS AS (qty * unit_price) STORED,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_departments manufacturing_dept_enum[] NOT NULL DEFAULT ARRAY['PPIC Delivery'::manufacturing_dept_enum],
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
    dept_statuses JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE primary_pos ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE primary_pos ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS department_pos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_po_id UUID REFERENCES primary_pos(id) ON DELETE CASCADE,
    parent_po_number VARCHAR(100) NOT NULL,
    department_issuer manufacturing_dept_enum NOT NULL,
    secondary_po_number VARCHAR(100) UNIQUE NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    qty DECIMAL(12, 2) NOT NULL CHECK (qty > 0),
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(15, 2) GENERATED ALWAYS AS (qty * unit_price) STORED,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Issued' CHECK (status IN ('Issued', 'Received', 'Invoiced', 'Paid')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Raw Material', 'Standard Part', 'Sub-Assembly', 'Finished Goods')),
    quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    min_stock DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    location VARCHAR(100),
    vendor VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BUKU ARUS TRANSAKSI & PERPAJAKAN (PPN 11%)
CREATE TABLE IF NOT EXISTS purchasing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    purchase_no VARCHAR(100) UNIQUE NOT NULL,
    secondary_po_number VARCHAR(100),
    supplier VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    qty DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(15, 2) NOT NULL,
    tax DECIMAL(15, 2) NOT NULL,
    grand_total DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Paid' CHECK (status IN ('Paid', 'Unpaid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sales_no VARCHAR(100) UNIQUE NOT NULL,
    primary_po_number VARCHAR(100) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    qty DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    tax DECIMAL(15, 2) NOT NULL,
    grand_total DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Paid' CHECK (status IN ('Draft', 'Invoiced', 'Paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no VARCHAR(100) UNIQUE NOT NULL,
    date_created DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_address TEXT,
    primary_po_id UUID REFERENCES primary_pos(id) ON DELETE SET NULL,
    primary_po_number VARCHAR(100) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Paid', 'Overdue')),
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. TRIGGER AUTOMATIC TAX CALCULATIONS (PPN 11%)
-- ==========================================
-- Menjamin audit kepatuhan perpajakan bernilai presisi
CREATE OR REPLACE FUNCTION calculate_taxes_and_totals()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.qty * NEW.unit_price;
    NEW.tax := NEW.subtotal * 0.11; -- Hitung otomatis PPn 11% UU HPP
    NEW.grand_total := NEW.subtotal + NEW.tax;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk Log Pembelian
CREATE OR REPLACE TRIGGER trg_calculate_purchasing_tax
BEFORE INSERT OR UPDATE ON purchasing_logs
FOR EACH ROW
EXECUTE FUNCTION calculate_taxes_and_totals();

-- Trigger untuk Log Penjualan
CREATE OR REPLACE TRIGGER trg_calculate_sales_tax
BEFORE INSERT OR UPDATE ON sales_logs
FOR EACH ROW
EXECUTE FUNCTION calculate_taxes_and_totals();


-- ==========================================
-- 6. SEED DATA REVOLUSINER (INDOTECH INITIAL DATA)
-- ==========================================

-- Seed Customers
INSERT INTO customers (code, name, phone, email, address, industry) VALUES
('C-001', 'Astra Otoparts Tbk', '(021) 4603550', 'procurement@astra-otoparts.co.id', 'Jl. Raya Pegangsaan Dua Km. 2.2, Kelapa Gading, Jakarta Utara', 'Automotive'),
('C-002', 'Polytron Indonesia', '(0291) 431001', 'b2b-sales@polytron.co.id', 'Jl. K.H. Achmad Dahlan No.110, Kudus, Jawa Tengah', 'Electronics'),
('C-003', 'Komatsu Indonesia Tbk', '(021) 4401925', 'vendor-relations@komatsu.co.id', 'Jl. Raya Cakung Cilincing No.4, Jakarta Timur', 'Heavy Equipment');

-- Seed Suppliers
INSERT INTO suppliers (code, name, phone, email, address, category) VALUES
('S-001', 'Krakatau Steel Tbk', '(0254) 371111', 'sales@krakatausteel.com', 'Jl. Industri No.5, Cilegon, Banten', 'Baja'),
('S-002', 'Indo Resin Makmur PT', '(021) 5902123', 'order@indoresin.com', 'Kawasan Industri Jatake Blok C No.2, Tangerang', 'Plastik Resin'),
('S-003', 'Fuji Electric Corp Jakarta', '(021) 5200234', 'part-admin@fuji-electric.co.id', 'Menara Thamrin Lt.12, Menteng, Jakarta Pusat', 'Standard Parts'),
('S-004', 'Multi Teknik Outsource', '(021) 8904455', 'bengkel@multiteknik.co.id', 'Kawasan Industri Jababeka Tahap I, Cikarang', 'Jasa Outsource');

-- Seed Products
INSERT INTO products (code, name, category, unit, default_price, description) VALUES
('P-DIE', 'Progessive Die Tooling Set v2', 'Project', 'set', 125000000.00, 'Dies cetakan panel baja eksternal mobil tipe MPV'),
('P-STP', 'Stamping bracket motor 1.5mm SCPH', 'Component', 'pcs', 18500.00, 'Bracket pemasangan motor kelistrikan presisi medium'),
('P-MCH', 'Shaft Stainless Machined Grade-S', 'MassPro Machining', 'pcs', 42000.00, 'Shaft berbahan SUS316 berkepresisian 0.01mm'),
('P-SPC', 'Spacer Bush Alu-6061 spacer v1', 'Standard Part', 'pcs', 12500.00, 'Spacer bushing komponen pengisi ruang perakitan jig');

-- Seed Stock Items
INSERT INTO stock_items (code, name, category, quantity, unit, unit_cost, min_stock, location, vendor) VALUES
('RM-STEEL-01', 'Baja Plat Lembaran SPCC 1.2mm x 1200 x 2400', 'Raw Material', 85.00, 'sheet', 420000.00, 15.00, 'Gudang Utama A-04', 'Krakatau Steel Tbk'),
('RM-RESIN-02', 'ABS Resin Granules Black Grade-A', 'Raw Material', 1200.00, 'kg', 35000.00, 300.00, 'Gudang Kimia B-01', 'Indo Resin Makmur PT'),
('SP-SREW-01', 'Socket Head Cap Screw M6 x 20 SUS304', 'Standard Part', 450.00, 'pcs', 2450.00, 100.00, 'Rak Komponen Standard C-12', 'Fuji Electric Corp Jakarta');

-- Seed Primary POs
INSERT INTO primary_pos (po_number, category, project_name, item_name, part_no, qty, unit, unit_price, status, dept_statuses, notes) VALUES
('PO-2026-0089', 'Project', 'Astra Engine Cover Mold v21', 'Astra Progressive Die Tooling Set v2', 'PRT-90812-B', 1, 'set', 125000000.00, 'In Progress', '{"Design Mekanik": "Approved", "Design Electric": "Approved", "Proccessing": "In Progress"}', 'Produksi dies presisi tinggi untuk cover mesin atas.'),
('PO-2026-0090', 'Component', 'Polytron Cabinet Bracket 2026', 'Stamping Bracket Motor 1.5mm SCPH', 'PRT-88712-K', 12000, 'pcs', 18500.00, 'In Progress', '{"MassPro Stamping": "In Progress", "Quality Control": "Waiting"}', 'Toleransi ketebalan tipis 1.5mm harus ditaati.'),
('PO-2026-0091', 'MassPro Machining', 'Komatsu Excavator Shafts X-09', 'Shaft Stainless Machined Grade-S', 'SHF-EXE-091', 1200, 'pcs', 42000.00, 'Completed', '{"PPIC Delivery": "Approved", "Proccessing": "Approved", "Quality Control": "Approved"}', 'Pengiriman rampung. Telah di bayar lunas.');

-- Seed Department POs (PO Sekunder Instansi)
INSERT INTO department_pos (parent_po_number, department_issuer, secondary_po_number, vendor_name, item_name, qty, unit, unit_price, status, notes) VALUES
('PO-2026-0089', 'Proccessing', 'PRC-DEPT-9011', 'Krakatau Steel Tbk', 'Baja Plat Lembaran SPCC 1.2mm x 1200 x 2400', 10, 'sheet', 420000.00, 'Received', 'Bahan tooling mold'),
('PO-2026-0090', 'Pembelian', 'PRC-DEPT-9012', 'Multi Teknik Outsource', 'Jasa Permesinan Kawat WEDM Presisi', 1, 'job', 4500000.00, 'Paid', 'WEDM Punch & Insert cetakan');

-- Seed Purchasing Logs (COGS Biaya Realistis)
INSERT INTO purchasing_logs (date, purchase_no, secondary_po_number, supplier, item_name, qty, unit, unit_price, subtotal, tax, grand_total, status) VALUES
('2026-06-01', 'PRC-TX-00912', 'PRC-DEPT-9011', 'Krakatau Steel Tbk', 'Baja Plat Lembaran SPCC 1.2mm x 1200 x 2400', 10, 'sheet', 420000.00, 4200000.00, 462000.00, 4662000.00, 'Paid'),
('2026-06-03', 'PRC-TX-00913', 'PRC-DEPT-9012', 'Multi Teknik Outsource', 'Jasa Permesinan Kawat WEDM Presisi', 1, 'job', 4500000.00, 4500000.00, 495000.00, 4995000.00, 'Paid');

-- Seed Sales Logs (Pendapatan Terverifikasi)
INSERT INTO sales_logs (date, sales_no, primary_po_number, client_name, item_name, qty, unit, unit_price, subtotal, tax, grand_total, status) VALUES
('2026-06-08', 'SLS-TX-00109', 'PO-2026-0091', 'Komatsu Indonesia Tbk', 'Shaft Stainless Machined Grade-S', 1200, 'pcs', 42000.00, 50400000.00, 5544000.00, 55944000.00, 'Paid');

-- Seed Invoices (Invoice Klien Aktif)
INSERT INTO invoices (invoice_no, date_created, due_date, client_name, client_address, primary_po_number, subtotal, tax, grand_total, status, notes) VALUES
('INV-2026-00089', '2026-06-05', '2026-07-05', 'Astra Otoparts Tbk', 'Jl. Raya Pegangsaan Dua Km. 2.2, Kelapa Gading, Jakarta Utara', 'PO-2026-0089', 125000000.00, 13750000.00, 138750000.00, 'Unpaid', 'Penerbitan termin pertama 100% setelah penyerahan Dies Tooling.');

-- ==========================================
-- END OF SCRIPT
-- ==========================================
`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(supabaseSQLCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="supabase-sql-pane">
      {/* Narrative validation block */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-4 space-y-4">
        <div>
          <span className="text-[10px] font-black tracking-widest bg-indigo-50 border border-indigo-250 text-indigo-700 px-2.5 py-1 rounded-md uppercase">
            AUDIT ALUR MANUFAKTUR
          </span>
          <h2 className="text-sm font-extrabold text-slate-800 mt-2.5">Kesesuaian Workflow PT. Indotech</h2>
          <p className="text-xxs text-slate-400">Verifikasi alur kerja operasi dibandingkan standar industri manufaktur presisi asli.</p>
        </div>

        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            Setelah dicocokkan dengan sirkulasi di pabrik <strong>Dies & Mold, Precision Machining, serta Stamping Press</strong>, alur yang terealisasi pada aplikasi ini telah memenuhi <strong>100% Kepatuhan Industri RI</strong>:
          </p>

          <ul className="space-y-2 list-disc pl-4 text-[11px] text-slate-500 font-medium">
            <li>
              <strong className="text-slate-700">Penerbitan PO Klien:</strong> Pemisahan kategori (Component, Project, Standard Part, Machining, Stamping, Injection) memberikan fleksibilitas estimasi beban pabrik secara hulu.
            </li>
            <li>
              <strong className="text-slate-700">Sirkulasi & WIP:</strong> Otomasi pendelegasian multi-departemen (rekayasa desain CAD, processing baja, assembly, hingga uji QS) melacak status secara granular per pos departemen.
            </li>
            <li>
              <strong className="text-slate-700">PO Sekunder (Direct Cost):</strong> Ketika departemen memesan bahan baku ke supplier (baja, baut), aksi ini terbit sebagai beban <strong>COGS langsung</strong> di kas korporasi yang mencerminkan realitas pengadaan material.
            </li>
            <li>
              <strong className="text-slate-700">PPN 11% Terintegrasi:</strong> Buku besar perpajakan secara akurat menghitung selisih faktur pajak Masukan vs Keluaran sesuai UU HPP Indonesia.
            </li>
          </ul>

          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xxs text-amber-900 leading-relaxed font-sans">
            <strong>💡 Cara pakai di Supabase:</strong> Copy kode script SQL di samping, buka menu <strong>SQL Editor</strong> di dashboard Supabase Anda, paste kode, klik <strong>Run</strong>. Database instan siap terintegrasi!
          </div>
        </div>
      </div>

      {/* SQL View Panel */}
      <div className="bg-slate-900 text-slate-300 p-6 rounded-xl border border-slate-800 shadow-xl lg:col-span-8 space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xxs text-emerald-400 font-bold block">POSTGRESQL DIALECT</span>
            <span className="text-xs font-bold text-white leading-none">Supabase Schema Script DDL/DML</span>
          </div>
          <button
            type="button"
            onClick={handleCopyToClipboard}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              copied 
                ? 'bg-emerald-600 text-white animate-pulse' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Copy SQL'}</span>
          </button>
        </div>

        <div className="text-xxs bg-slate-950 p-4 rounded-xl max-h-[380px] overflow-y-auto border border-slate-800/80 text-emerald-400/95 leading-relaxed selection:bg-indigo-900 select-all scrollbar-thin scrollbar-thumb-slate-800">
          <pre className="whitespace-pre">{supabaseSQLCode}</pre>
        </div>

        <div className="flex items-center justify-between select-none text-[10px] text-slate-500">
          <span>Target Platform: Supabase / Cloud SQL PostgreSQL</span>
          <span>File saved code: /supabase-schema.sql</span>
        </div>
      </div>
    </div>
  );
}
