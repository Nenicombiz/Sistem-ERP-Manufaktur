/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PrimaryPO, DepartmentPO, ManufacturingDepartment, Supplier } from '../types';
import { formatIDR, DEPARTMENTS, generateId } from '../utils';
import { 
  Building2, 
  Send, 
  CheckCircle, 
  Loader, 
  FilePlus, 
  ListOrdered, 
  ShieldCheck, 
  FolderLock,
  ArrowRightLeft,
  Lock,
  Building,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

interface SupervisorViewProps {
  primaryPOs: PrimaryPO[];
  deptPOs: DepartmentPO[];
  onAddDeptPO: (newDeptPO: DepartmentPO) => void;
  onUpdatePrimaryDeptStatus: (poId: string, dept: ManufacturingDepartment, status: any) => void;
  userRole?: string;
  simDept?: ManufacturingDepartment;
  suppliers?: Supplier[];
  onNavigateDirect?: (tabId: string) => void;
}

export default function SupervisorView({
  primaryPOs,
  deptPOs,
  onAddDeptPO,
  onUpdatePrimaryDeptStatus,
  userRole = 'superadmin',
  simDept = 'Design Mekanik',
  suppliers = [],
  onNavigateDirect
}: SupervisorViewProps) {
  
  // VERIFY AUTHORIZED ROLE
  const isAuthorized = userRole === 'superadmin' || userRole === 'supervisor' || userRole === 'staff_dept';
  
  if (!isAuthorized) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-xl max-w-2xl mx-auto my-12 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Halaman Supervisor Dibatasi</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Halaman ini eksklusif untuk <span className="font-semibold text-slate-800">Supervisi per Departemen</span> atau <span className="font-semibold text-slate-800">Staf per Departemen</span>. 
          </p>
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl inline-block">
            <span className="text-xs font-bold text-rose-800 font-mono">
              Role Anda: {userRole.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => onNavigateDirect && onNavigateDirect('dashboard')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all"
          >
            Kembali ke Dashboard
          </button>
          <div className="text-xs text-slate-400 self-center">
            *Silakan ganti role simulasian di bilah kanan atas menjadi <span className="underline font-semibold">Supervisor Dept</span> atau <span className="underline font-semibold">Staf per Departemen</span>.
          </div>
        </div>
      </div>
    );
  }

  // Active department page state.
  // "Ubah halaman Supervisor Dept terpisah page sendiri-sendiri sesuai departemennya. user yang tidak berhak mengakses tidak boleh melihat fitur di dalam halaman ini."
  // If the simulated role is a department supervisor or staff, lock them strictly to their designated department page!
  const isSuperadmin = userRole === 'superadmin';
  const [activeDept, setActiveDept] = useState<ManufacturingDepartment>(() => {
    return isSuperadmin ? 'Design Mekanik' : simDept;
  });

  // Make sure to sync activeDept if the simDept simulation shifts on the simulator bar
  useEffect(() => {
    if (!isSuperadmin) {
      setActiveDept(simDept);
    }
  }, [simDept, userRole, isSuperadmin]);

  // Secondary PO Form Trigger State
  const [selectedParentPO, setSelectedParentPO] = useState<PrimaryPO | null>(null);

  // Secondary PO Form Inputs
  const [vendorName, setVendorName] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState<number>(0);
  const [unit, setUnit] = useState('pcs');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Filter Primary POs that are dispatched to the selected active department
  const incomingPOs = primaryPOs.filter(po => 
    po.targetDepartments.includes(activeDept)
  );

  // Filter issued department POs that were made by this active department
  const issuedSecondaryPOs = deptPOs.filter(po => 
    po.departmentIssuer === activeDept
  );

  // Initiate Secondary PO Creator
  const handleOpenCreator = (po: PrimaryPO) => {
    setSelectedParentPO(po);
    // Pre-fill fields for ease of use
    setItemName(`Bahan / Jasa Subkon untuk - ${po.itemName}`);
    setQty(1);
    setUnitPrice(Math.round(po.unitPrice * 0.15)); // Estimate 15% cost
    setSelectedSupplierId('');
    setVendorName('');
  };

  // Supplier Dropdown prefill selector
  const handleSelectSupplierTemplate = (id: string) => {
    setSelectedSupplierId(id);
    if (!id) {
      setVendorName('');
      return;
    }
    const splObj = suppliers.find(s => s.id === id);
    if (splObj) {
      setVendorName(splObj.name);
    }
  };

  // Submit Secondary PO
  const handleCreateSecondaryPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentPO) return;

    if (!vendorName.trim() || !itemName.trim() || qty <= 0 || unitPrice <= 0) {
      alert('Mohon isi seluruh parameter pengadaan vendor dengan benar.');
      return;
    }

    // BLOCK STAFF FROM ISSUING POs (Only Supervisor can issue POs)
    if (userRole === 'staff_dept') {
      alert('Akses Ditolak: Hanya "Supervisor per Departemen" yang berwenang untuk menerbitkan PO Sekunder dan memesan material.');
      return;
    }

    const secondaryPONum = `SPO-${activeDept.toUpperCase().substring(0, 4)}-2026-00${issuedSecondaryPOs.length + 1}`;

    const newSecPO: DepartmentPO = {
      id: generateId('dpo'),
      parentPOId: selectedParentPO.id,
      parentPONumber: selectedParentPO.poNumber,
      departmentIssuer: activeDept,
      secondaryPONumber: secondaryPONum,
      vendorName: vendorName.trim(),
      itemName: itemName.trim(),
      qty,
      unit,
      unitPrice,
      totalPrice: qty * unitPrice,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Issued',
      notes: notes.trim()
    };

    onAddDeptPO(newSecPO);

    // Automatically promote the supervisor status on this Parent PO to 'Action Taken'
    onUpdatePrimaryDeptStatus(selectedParentPO.id, activeDept, 'Action Taken');

    setAlertMsg(`Sukses menerbitkan PO Sekunder ${secondaryPONum} untuk vendor ${vendorName}!`);
    setTimeout(() => setAlertMsg(null), 4000);

    // Reset Inputs
    setSelectedParentPO(null);
    setVendorName('');
    setSelectedSupplierId('');
    setItemName('');
    setQty(0);
    setUnitPrice(0);
    setNotes('');
  };

  // Quick State Promoter
  const handlePromoteStatus = (poId: string, status: 'In Progress' | 'Approved') => {
    // BLOCK STAFF FROM CLOSING CHECKS
    if (userRole === 'staff_dept') {
      alert('Akses Ditolak: Hanya "Supervisor per Departemen" yang berwenang mengubah atau menyetujui status penugasan.');
      return;
    }
    onUpdatePrimaryDeptStatus(poId, activeDept, status);
  };

  return (
    <div className="space-y-6" id="supervisor-view-flow">
      {/* Dynamic Header highlighting Simulated Otoritas */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
            <span className="text-[10px] font-extrabold text-indigo-700 tracking-wider uppercase font-mono">
              OTORITAS: {userRole === 'superadmin' ? 'SUPERADMIN (AKSES UTUH)' : `${userRole.toUpperCase()} - DEPT ${simDept}`}
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">Portal Supervisi & Progress Divisi</h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Sirkulasi tugas masuk dari klien, delegasikan pesanan material lokal melalui PO Sekunder, dan validasi penyelesahian tugas per departemen.
          </p>
        </div>

        {/* Status display of Active simulated session */}
        <div className="flex gap-2">
          <div className="bg-slate-50 py-2 px-3.5 rounded-xl border border-slate-200">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Halaman Aktif</span>
            <span className="text-xs font-bold text-slate-800">{activeDept}</span>
          </div>
          <div className="bg-slate-50 py-2 px-3.5 rounded-xl border border-slate-200 text-center">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Incoming Tasks</span>
            <span className="text-xs font-bold text-indigo-700">{incomingPOs.length}</span>
          </div>
        </div>
      </div>

      {/* DEPARTMENT-BY-DEPARTMENT PAGE ROUTING CONTROL (Separate pages as requested) */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block">
          Pilih Halaman Supervisi Departemen:
        </label>
        
        {isSuperadmin ? (
          /* Superadmin can browse ANY department supervisor page recursively! */
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {DEPARTMENTS.map(dept => {
              const count = primaryPOs.filter(po => po.targetDepartments.includes(dept)).length;
              const isSelected = activeDept === dept;
              return (
                <button
                  key={dept}
                  onClick={() => {
                    setActiveDept(dept);
                    setSelectedParentPO(null);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-slate-950 border-slate-950 text-white shadow'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{dept}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* NON-SUPERADMIN roles are blockaded to ONLY see and access their own department! */
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2.5 max-w-3xl">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <div>
              <span className="font-extrabold">Akses Terkunci / Tersegregasi: </span> 
              Identitas Anda terverifikasi sebagai staf/supervisor <span className="underline font-bold font-mono">{simDept}</span>. 
              Anda diblokir dari melihat halaman atau mengolah tugas dari departemen lain demi kepatuhan SOP perusahaan.
            </div>
          </div>
        )}
      </div>

      {alertMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold animate-pulse">
          {alertMsg}
        </div>
      )}

      {/* Grid Layout of Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Dispatched Tasks Table / Stack (7/12 cols) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm xl:col-span-7 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-slate-400" /> Tugas Masuk ({activeDept})
              </h2>
              <p className="text-xxs text-slate-400">Total {incomingPOs.length} arahan penugasan dari Superadmin</p>
            </div>
            
            {userRole === 'staff_dept' && (
              <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-xxs font-bold">
                Mode Peninjauan (Read-Only)
              </span>
            )}
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
            {incomingPOs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <FolderLock className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <span className="text-xs block font-bold">Antrean Tugas Kosong</span>
                <span className="text-xxs text-slate-400">Belum ada delegasi yang masuk ke departemen {activeDept}.</span>
              </div>
            ) : (
              incomingPOs.map(po => {
                const myStatus = po.deptStatuses[activeDept] || 'Waiting';
                return (
                  <div key={po.id} className="p-4.5 border border-slate-200 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-all space-y-4">
                    {/* Header line of item */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold text-indigo-700">{po.poNumber}</span>
                          <span className={`text-xxs px-2 py-0.5 rounded-md font-extrabold ${
                            myStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            myStatus === 'Action Taken' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            myStatus === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            Status: {myStatus === 'Waiting' ? 'Belum Dikerjakan' : myStatus}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mt-1.5">{po.projectName}</h4>
                        <p className="text-xs text-slate-500 font-medium">Spesifikasi Target: <span className="font-semibold text-slate-700">{po.itemName}</span> (Part: {po.partNo})</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xxs text-slate-400 block font-bold uppercase">Volume Pesanan</span>
                        <span className="text-xs font-extrabold text-slate-700 font-mono">{po.qty} {po.unit}</span>
                      </div>
                    </div>

                    {/* Quick technical or instruction note */}
                    {po.notes && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200/50 text-xxs text-slate-500 italic">
                        <span className="font-bold text-slate-700 not-italic block mb-0.5">Catatan Superadmin:</span>
                        "{po.notes}"
                      </div>
                    )}

                    {/* ACTIONS BAR FOR DIVISION SUPERVISOR */}
                    <div className="border-t border-slate-200/80 pt-3 flex flex-wrap gap-2 justify-between items-center">
                      <div className="flex gap-1.5">
                        {myStatus === 'Waiting' && (
                          <button
                            type="button"
                            disabled={userRole === 'staff_dept'}
                            onClick={() => handlePromoteStatus(po.id, 'In Progress')}
                            className={`text-xxs font-extrabold px-3 py-1.5 rounded-lg transition-all ${
                              userRole === 'staff_dept'
                                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}
                          >
                            Mulai Kerjakan
                          </button>
                        )}
                        {myStatus !== 'Approved' && (
                          <button
                            type="button"
                            disabled={userRole === 'staff_dept'}
                            onClick={() => handlePromoteStatus(po.id, 'Approved')}
                            className={`text-xxs font-extrabold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                              userRole === 'staff_dept'
                                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approved / Selesai
                          </button>
                        )}
                      </div>

                      {/* Issue child PO to vender */}
                      <button
                        type="button"
                        disabled={userRole === 'staff_dept'}
                        onClick={() => handleOpenCreator(po)}
                        className={`text-xxs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                          userRole === 'staff_dept'
                            ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                      >
                        <FilePlus className="w-3.5 h-3.5" /> Issue PO Sekunder ke Vendor
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Hand: Action Form / Issued Secondary PO List (5/12 cols) */}
        <div className="space-y-6 xl:col-span-5" id="supervisor-right-column">
          
          {/* Creator Form Window */}
          {selectedParentPO ? (
            <form onSubmit={handleCreateSecondaryPO} className="bg-white p-5 rounded-2xl border-2 border-indigo-500 shadow-md space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Penerbitan PO Sekunder</span>
                  <h3 className="text-xs font-bold text-slate-800">Tergantung pada PO: {selectedParentPO.poNumber}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedParentPO(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Batal
                </button>
              </div>

              {/* INTEGRATION WITH SUPPLIERS MASTER DATA */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mitra Vendor (Master Data)</span>
                <select
                  value={selectedSupplierId}
                  onChange={e => handleSelectSupplierTemplate(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">-- Manual Typist --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>[{s.category}] {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Nama Toko / Vendor Tujuan</label>
                <input
                  type="text"
                  required
                  placeholder="PT. Toray Plastics, PT. Krakatau Steel..."
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Spesifikasi Detail Barang / Jasa Pendukung</label>
                <input
                  type="text"
                  required
                  placeholder="cth. Carbon Steel SPCC Coil Tebal 1.6mm"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Qty</label>
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
                  <label className="text-xs font-bold text-slate-600">Satuan</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Unit Price</label>
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

              {qty > 0 && unitPrice > 0 && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Beban Biaya Pengadaan:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatIDR(qty * unitPrice)}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Catatan Order Vendor</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 h-16 resize-none"
                  placeholder="Spesifikasi JIS, toleransi, jadwal terima di gudang..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow transition-all"
              >
                <Send className="w-4 h-4" /> Kirim Pembelian (Auto-Deduct Kas)
              </button>
            </form>
          ) : null}

          {/* List of Issued Secondary POs (POs issued by this department supervisor to vendor suppliers) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase">
                Buku PO Sekunder Keluar ({issuedSecondaryPOs.length})
              </h2>
              <p className="text-xxs text-slate-400">Pengadaan material/jasa penunjang bauran produksi divisi {activeDept}</p>
            </div>

            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
              {issuedSecondaryPOs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Building className="w-8 h-8 mx-auto opacity-30 mb-2" />
                  <span className="text-xxs block">Belum menerbitkan PO sekunder.</span>
                </div>
              ) : (
                issuedSecondaryPOs.map(spo => (
                  <div key={spo.id} className="p-3.5 border border-slate-200 rounded-xl space-y-2 relative bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-700 block">
                          {spo.secondaryPONumber}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-0.5">Vendor: {spo.vendorName}</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {spo.status}
                      </span>
                    </div>

                    <div className="text-xxs text-slate-500 space-y-0.5">
                      <p><span className="font-semibold text-slate-600">Material:</span> {spo.itemName}</p>
                      <p><span className="font-semibold text-slate-600">Parent PO:</span> {spo.parentPONumber}</p>
                      <p className="font-mono text-slate-700 font-extrabold">Total: {formatIDR(spo.totalPrice)} ({spo.qty} {spo.unit})</p>
                    </div>

                    <div className="text-[9px] text-slate-400 border-t border-slate-50 pt-1.5 mt-1.5 flex justify-between">
                      <span>Keluar: {spo.orderDate}</span>
                      <span className="italic truncate max-w-[150px]">{spo.notes}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
