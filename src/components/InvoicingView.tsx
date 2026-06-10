/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Invoice, PrimaryPO } from '../types';
import { formatIDR, generateId } from '../utils';
import { 
  FileCheck2, 
  Receipt, 
  Printer, 
  Calendar, 
  Plus, 
  TrendingUp, 
  CheckCircle,
  Eye,
  X,
  CreditCard,
  Building
} from 'lucide-react';

interface InvoicingViewProps {
  invoices: Invoice[];
  primaryPOs: PrimaryPO[];
  onAddInvoice: (newInvoice: Invoice) => void;
  onPayInvoice: (id: string) => void;
}

export default function InvoicingView({
  invoices,
  primaryPOs,
  onAddInvoice,
  onPayInvoice
}: InvoicingViewProps) {
  // UI states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);

  // New Invoice Generator states
  const [selectedPOId, setSelectedPOId] = useState('');
  const [dueDateOffset, setDueDateOffset] = useState<number>(30); // Net 30 default
  const [notes, setNotes] = useState('Pembayaran dilakukan via Transfer Bank Mandiri, Cabang Cikarang.');

  // Eligible POs for invoicing (not already completely invoiced)
  const invoicedPOIds = invoices.map(i => i.primaryPOId);
  const eligiblePOs = primaryPOs.filter(po => !invoicedPOIds.includes(po.id));

  // Submit invoice generator
  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPOId) {
      alert('Pilih Purchase Order yang ingin ditagihkan.');
      return;
    }

    const matchedPO = primaryPOs.find(po => po.id === selectedPOId);
    if (!matchedPO) return;

    const invoiceNum = `INV-PTG-2026-06-0${invoices.length + 10}`;
    const dateCreated = new Date().toISOString().split('T')[0];
    
    const d = new Date();
    d.setDate(d.getDate() + dueDateOffset);
    const dueDate = d.toISOString().split('T')[0];

    // Client detailed placeholder maps
    const addresses: Record<string, string> = {
      'Toyota Yaris Tooling & Jig': 'PT. Toyota Motor Manufacturing Indonesia, Karawang Assembly Plant, Jawa Barat',
      'Honda Brio Seat Slider Refinement': 'PT. Honda Prospect Motor, Kawasan Industri Mitrakarawang, Karawang',
      'Yamaha NMAX Facelift Cover Panel': 'PT. Yamaha Indonesia Motor Mfg., Pulo Gadung, Jakarta Timur',
      'Mitsubishi Triton Under-Run Tooling': 'PT. Mitsubishi Motors Krama Yudha Indonesia, GIIC Cikarang',
      'Hyundai Ioniq 5 Battery Tray Base': 'PT. Hyundai Motor Manufacturing Indonesia, Cikarang Pusat, Bekasi'
    };

    const subtotal = matchedPO.totalPrice;
    const tax = subtotal * 0.11; // 11%

    const newInv: Invoice = {
      id: generateId('inv'),
      invoiceNo: invoiceNum,
      dateCreated,
      dueDate,
      clientName: matchedPO.projectName,
      clientAddress: addresses[matchedPO.projectName] || 'Kawasan Industri Greenland International Industrial Center, Cikarang',
      primaryPOId: matchedPO.id,
      primaryPONumber: matchedPO.poNumber,
      items: [
        {
          description: `Pekerjaan Produksi Cetakan / Jig / Mass-Pro: ${matchedPO.itemName} (No Part: ${matchedPO.partNo})`,
          qty: matchedPO.qty,
          unit: matchedPO.unit,
          unitPrice: matchedPO.unitPrice,
          total: subtotal
        }
      ],
      subtotal,
      tax,
      grandTotal: subtotal + tax,
      status: 'Unpaid',
      notes
    };

    onAddInvoice(newInv);
    setSelectedInvoice(newInv);
    setShowGeneratePanel(false);
    setSelectedPOId('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="invoicing-view-flow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <Receipt className="w-5 h-5 text-indigo-600" /> Penagihan & Downstream Invoicing Klien
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Terbitkan faktur tagihan komersial lengkap dengan PPN 11% untuk client berdasarkan progres PO yang diselesaikan.
          </p>
        </div>
        <button
          onClick={() => setShowGeneratePanel(!showGeneratePanel)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors self-start"
        >
          <Plus className="w-4 h-4" /> Buat Faktur Penagihan Baru
        </button>
      </div>

      {/* Expandable generator panel */}
      {showGeneratePanel && (
        <form onSubmit={handleGenerateInvoice} className="bg-white p-5 rounded-xl border border-indigo-200 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-rose-100 pb-2 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-rose-500" /> Generate Commercial Invoice
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Pilih PO Selesai / Siap Tagih</label>
              <select
                required
                value={selectedPOId}
                onChange={e => setSelectedPOId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Pilih Purchase Order --</option>
                {eligiblePOs.map(po => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} - {po.projectName} ({formatIDR(po.totalPrice)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Termin Pembayaran (TOP)</label>
              <select
                value={dueDateOffset}
                onChange={e => setDueDateOffset(parseInt(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value={15}>Net 15 Hari</option>
                <option value={30}>Net 30 Hari (Default)</option>
                <option value={45}>Net 45 Hari</option>
                <option value={60}>Net 60 Hari</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Catatan Rekening Pengiriman</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
            >
              Terbitkan Invoice
            </button>
            <button
              type="button"
              onClick={() => setShowGeneratePanel(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs rounded-lg"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Split screen: left list, right gorgeous invoice PDF look */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Invoice List (4/12 cols) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm xl:col-span-4 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
            Riwayat Invoice Penagihan
          </h2>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {invoices.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Belum ada invoice yang terbit.
              </div>
            ) : (
              invoices.map(inv => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all space-y-2 text-xs text-left ${
                    selectedInvoice?.id === inv.id
                      ? 'bg-indigo-50/50 border-indigo-400 shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-700">{inv.invoiceNo}</span>
                    <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded-md border ${
                      inv.status === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 truncate">{inv.clientName}</h3>
                    <div className="text-slate-400 text-xxs flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Jatuh Tempo: {inv.dueDate}
                    </div>
                  </div>

                  <div className="text-right text-xs font-extrabold text-slate-800 font-mono">
                    {formatIDR(inv.grandTotal)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoice Preview Pane (8/12 cols) */}
        <div className="xl:col-span-8 space-y-4">
          {selectedInvoice ? (
            <div className="space-y-4">
              {/* Payment & Action row directly above invoice template */}
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200/60 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5Packed font-semibold leading">
                  Status Pembayaran: 
                  <span className={`font-bold uppercase ${selectedInvoice.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedInvoice.status}
                  </span>
                </span>
                
                <div className="flex gap-2">
                  {selectedInvoice.status !== 'Paid' && (
                    <button
                      type="button"
                      onClick={() => onPayInvoice(selectedInvoice.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xxs rounded flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Konfirmasi Pelunasan (Dibayar Klien)
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-extrabold text-xxs rounded flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Simulasi Cetak Cetak Faktur/PDF
                  </button>
                </div>
              </div>

              {/* Detailed Commercial PDF Sheet */}
              <div className="bg-white p-8 border border-slate-300/80 rounded-xl shadow-lg space-y-6 font-sans relative overflow-hidden text-slate-800 invoice-paper">
                {/* Simulated corporate banner watermark */}
                <div className="absolute right-[-60px] top-[40px] rotate-[38deg] bg-indigo-50 border-y border-indigo-100 py-1.5 px-24 opacity-60 text-xxs tracking-widest uppercase font-black text-indigo-400 text-center select-none pointer-events-none">
                  Faktur Asli
                </div>

                {/* Header row: PT Bio and Invoice label */}
                <div className="flex flex-col sm:flex-row sm:justify-between items-start border-b border-slate-200 pb-5 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-900 rounded-lg text-white font-black text-xs">GMP</div>
                      <span className="font-extrabold text-base tracking-tight text-slate-900">PT. Global Manufaktur Presisi</span>
                    </div>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                      Kawasan Industri Delta Silicon II, Blok F12 No. 8A, Cikarang Selatan, Bekasi, Jawa Barat 17530
                      <br />Telp: (021) 8990-2821 | Email: billing@globalpresisi.co.id
                    </p>
                  </div>
                  <div className="text-left sm:text-right space-y-1">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">FAKTUR KOMERSIAL</h2>
                    <div className="font-mono text-xs text-slate-700 font-bold">Faktur No: {selectedInvoice.invoiceNo}</div>
                    <p className="text-xxs text-slate-400">Rujukan PO: <span className="font-bold text-slate-700 font-mono">{selectedInvoice.primaryPONumber}</span></p>
                  </div>
                </div>

                {/* Address block: Bill To & invoice schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-widest block">Ditagihkan Kepada (Bill To):</span>
                    <div className="font-bold text-slate-900 text-sm">{selectedInvoice.clientName}</div>
                    <p className="text-slate-500 text-[11px] leading-relaxed max-w-sm">{selectedInvoice.clientAddress}</p>
                  </div>
                  <div className="space-y-1 md:text-right text-xs">
                    <div className="grid grid-cols-2 gap-2 max-w-xs md:ml-auto">
                      <span className="text-slate-400 font-semibold select-none">Tanggal Terbit:</span>
                      <span className="text-slate-700 font-medium font-mono">{selectedInvoice.dateCreated}</span>
                      <span className="text-slate-400 font-semibold select-none">Jatuh Tempo:</span>
                      <span className="text-slate-800 font-bold font-mono">{selectedInvoice.dueDate}</span>
                      <span className="text-slate-400 font-semibold select-none">Termin (TOP):</span>
                      <span className="text-slate-700 font-medium font-mono">Net 30</span>
                    </div>
                  </div>
                </div>

                {/* Grid Table of invoice products */}
                <div className="space-y-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-300">
                        <th className="p-3">Deskripsi Produk & Pengiriman</th>
                        <th className="p-3 text-right">Kuantitas</th>
                        <th className="p-3 text-right">Harga Satuan</th>
                        <th className="p-3 text-right">Harga Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{item.description}</div>
                          </td>
                          <td className="p-3 text-right font-mono">{item.qty} {item.unit}</td>
                          <td className="p-3 text-right font-mono">{formatIDR(item.unitPrice)}</td>
                          <td className="p-3 text-right font-bold text-slate-900 font-mono">{formatIDR(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Taxes calculation panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 pt-6 gap-6 text-xs">
                  {/* Notes / Tnc column */}
                  <div className="space-y-2">
                    <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider block">Catatan Pembayaran & Rekening:</span>
                    <p className="text-slate-500 text-xxs leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200/50">
                      {selectedInvoice.notes}
                      <br />Mandiri Cabang Cikarang: <strong>156-00-149221-1</strong>
                      <br />Atas Nama: <strong>PT. Global Manufaktur Presisi</strong>
                    </p>
                  </div>

                  {/* Pricing breakout */}
                  <div className="space-y-1.5 text-xs max-w-sm ml-auto w-full">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Subtotal Penjualan (DPP):</span>
                      <span className="font-bold text-slate-800 font-mono">{formatIDR(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        PPN (Tarif PPN 11%):
                      </span>
                      <span className="font-bold text-indigo-700 font-mono">+{formatIDR(selectedInvoice.tax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                      <span>Grand Total Tagihan:</span>
                      <span className="font-mono text-indigo-900">{formatIDR(selectedInvoice.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Signature Block row mimicking an ISO certified factory process */}
                <div className="grid grid-cols-2 pt-12 text-center text-[10px] text-slate-500 gap-12">
                  <div>
                    <p className="mb-14">Diterima / Disetujui Oleh,</p>
                    <div className="border-b border-dashed border-slate-300 w-44 mx-auto pb-1 font-bold text-slate-800">( Client Procurement Manager )</div>
                    <span className="text-slate-400">Tanda Tangan & Cap PT</span>
                  </div>
                  <div>
                    <p className="mb-14 flex items-center justify-center gap-1 select-none">
                      Hormat Kami, <span className="text-[8px] bg-slate-900 text-white font-extrabold px-1 py-0.2 rounded scale-75">ASLI</span>
                    </p>
                    <div className="border-b border-dashed border-slate-300 w-44 mx-auto pb-1 font-bold text-indigo-900">Cynthia Adibrata, S.E.</div>
                    <span className="text-slate-400">Manager Keuangan PT. GMP</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white py-24 text-center text-slate-400 border border-slate-200 rounded-xl shadow-sm">
              Pilih salah satu invoice di samping atau buat invoice baru dari proyek PO siap cetak.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
