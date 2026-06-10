/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Supplier, Customer, Product, POCategory } from '../types';
import { 
  Building2, 
  Users, 
  Boxes, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Info
} from 'lucide-react';
import { formatIDR, generateId } from '../utils';

interface MasterDataViewProps {
  suppliers: Supplier[];
  customers: Customer[];
  products: Product[];
  onAddSupplier: (newSupplier: Supplier) => void;
  onUpdateSupplier: (updated: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onAddCustomer: (newCustomer: Customer) => void;
  onUpdateCustomer: (updated: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct: (updated: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const CATEGORIES: POCategory[] = [
  'Component',
  'Project',
  'Standard Part',
  'MassPro Machining',
  'MassPro Stamping',
  'MassPro Injection'
];

export default function MasterDataView({
  suppliers,
  customers,
  products,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}: MasterDataViewProps) {
  // Current active master tab (Suppliers, Customers, Products)
  const [activeSubTab, setActiveSubTab] = useState<'suppliers' | 'customers' | 'products'>('suppliers');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog / Modal Form state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'supplier' | 'customer' | 'product'>('supplier');
  const [editId, setEditId] = useState<string | null>(null);

  // Form parameters
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  // Custom type specific
  const [category, setCategory] = useState('Baja / Logam'); // For suppliers
  const [industry, setIndustry] = useState('Otomotif'); // For customers
  const [prodCategory, setProdCategory] = useState<POCategory>('Project'); // For products
  const [unit, setUnit] = useState('pcs'); // For products
  const [defaultPrice, setDefaultPrice] = useState<number>(0); // For products
  const [description, setDescription] = useState(''); // For products

  const handleOpenAddModal = (type: 'supplier' | 'customer' | 'product') => {
    setModalType(type);
    setEditId(null);
    setShowModal(true);

    // Default code suggestions based on length
    if (type === 'supplier') {
      setCode(`SPL-00${suppliers.length + 1}`);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCategory('Baja / Logam');
    } else if (type === 'customer') {
      setCode(`CST-00${customers.length + 1}`);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setIndustry('Otomotif');
    } else {
      setCode(`PRD-M0${products.length + 1}`);
      setName('');
      setUnit('pcs');
      setDefaultPrice(100000);
      setProdCategory('Project');
      setDescription('');
    }
  };

  const handleOpenEditModal = (type: 'supplier' | 'customer' | 'product', entity: any) => {
    setModalType(type);
    setEditId(entity.id);
    setShowModal(true);
    setCode(entity.code);
    setName(entity.name);
    
    if (type === 'supplier') {
      setPhone(entity.phone);
      setEmail(entity.email);
      setAddress(entity.address);
      setCategory(entity.category);
    } else if (type === 'customer') {
      setPhone(entity.phone || '');
      setEmail(entity.email || '');
      setAddress(entity.address || '');
      setIndustry(entity.industry || 'Otomotif');
    } else {
      setUnit(entity.unit);
      setDefaultPrice(entity.defaultPrice);
      setProdCategory(entity.category);
      setDescription(entity.description || '');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      alert('Nama dan Kode wajib diisi.');
      return;
    }

    if (modalType === 'supplier') {
      const payload: Supplier = {
        id: editId || generateId('spl'),
        code: code.trim(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        category: category
      };

      if (editId) {
        onUpdateSupplier(payload);
      } else {
        onAddSupplier(payload);
      }
    } else if (modalType === 'customer') {
      const payload: Customer = {
        id: editId || generateId('cust'),
        code: code.trim(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        industry: industry
      };

      if (editId) {
        onUpdateCustomer(payload);
      } else {
        onAddCustomer(payload);
      }
    } else if (modalType === 'product') {
      const payload: Product = {
        id: editId || generateId('prod'),
        code: code.trim(),
        name: name.trim(),
        category: prodCategory,
        unit: unit,
        defaultPrice: defaultPrice,
        description: description.trim()
      };

      if (editId) {
        onUpdateProduct(payload);
      } else {
        onAddProduct(payload);
      }
    }

    setShowModal(false);
  };

  // Searching lists
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" id="master-data-flow">
      {/* Module Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 animate-pulse" /> Master Register Korporat
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data dasar Supplier/Vendors, Customers, dan Product katalog yang terhubung secara bauran transaksional ke form perakitan dan sirkulasi PO.
          </p>
        </div>

        {/* Info stats */}
        <div className="flex gap-2">
          <div className="bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200 text-center font-mono">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">SUPPLIERS</span>
            <span className="text-sm font-extrabold text-slate-800">{suppliers.length}</span>
          </div>
          <div className="bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200 text-center font-mono">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">CUSTOMERS</span>
            <span className="text-sm font-extrabold text-slate-800">{customers.length}</span>
          </div>
          <div className="bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200 text-center font-mono">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">PRODUCTS</span>
            <span className="text-sm font-extrabold text-indigo-700">{products.length}</span>
          </div>
        </div>
      </div>

      {/* Connection info bar */}
      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-2 text-[11px] text-indigo-950 font-medium">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
        <span>
          <span className="font-extrabold">Integrasi Ekosistem:</span> Customer terhubung ke penerbitan PO Klien. Product terhubung ke Template PO Superadmin (Autofill data part/harga). Supplier terhubung ke PO Sekunder Supervisor (Pembelian material).
        </span>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Controls Bar */}
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/60 inline-flex">
            <button
              onClick={() => { setActiveSubTab('suppliers'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'suppliers'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Daftar Supplier / Vendor ({suppliers.length})</span>
            </button>
            <button
              onClick={() => { setActiveSubTab('customers'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'customers'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Daftar Customer ({customers.length})</span>
            </button>
            <button
              onClick={() => { setActiveSubTab('products'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'products'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Daftar Katalog Barang ({products.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Register button */}
            <button
              onClick={() => handleOpenAddModal(
                activeSubTab === 'suppliers' ? 'supplier' : activeSubTab === 'customers' ? 'customer' : 'product'
              )}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Tambah {activeSubTab === 'suppliers' ? 'Supplier' : activeSubTab === 'customers' ? 'Customer' : 'Barang'}</span>
            </button>
          </div>
        </div>

        {/* Live Filter / Search bar */}
        <div className="p-4 border-b border-slate-100 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Cari nama, kode, atau info ${activeSubTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50 font-medium"
            />
          </div>
        </div>

        {/* Tab Contents */}
        <div className="overflow-x-auto">
          {activeSubTab === 'suppliers' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Kode</th>
                  <th className="p-4">Nama Supplier</th>
                  <th className="p-4">Kategori Bahan</th>
                  <th className="p-4">Kontak / Telepon</th>
                  <th className="p-4">Email Kerja</th>
                  <th className="p-4">Alamat Kantor</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium whitespace-nowrap">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400 font-normal">
                      Saringan penelusuran supplier tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-900">{s.code}</td>
                      <td className="p-4 font-bold text-slate-800">{s.name}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] border border-indigo-100 font-bold">
                          {s.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{s.phone}</td>
                      <td className="p-4 text-slate-500">{s.email}</td>
                      <td className="p-4 truncate max-w-[180px]" title={s.address}>{s.address}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('supplier', s)}
                          className="p-1 hover:text-indigo-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin mendelete supplier ${s.name}?`)) {
                              onDeleteSupplier(s.id);
                            }
                          }}
                          className="p-1 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeSubTab === 'customers' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Kode Customer</th>
                  <th className="p-4">Nama Perusahaan Klien</th>
                  <th className="p-4">Sektor Industri</th>
                  <th className="p-4">Kontak Telepon</th>
                  <th className="p-4">Email Procurement</th>
                  <th className="p-4">Alamat Pengiriman</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium whitespace-nowrap">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400 font-normal">
                      Saringan penelusuran customer tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-900">{c.code}</td>
                      <td className="p-4 font-bold text-slate-800">{c.name}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] border border-amber-200 font-bold">
                          {c.industry}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{c.phone}</td>
                      <td className="p-4 text-slate-500">{c.email}</td>
                      <td className="p-4 truncate max-w-[185px]" title={c.address}>{c.address}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('customer', c)}
                          className="p-1 hover:text-indigo-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin mendelete customer ${c.name}?`)) {
                              onDeleteCustomer(c.id);
                            }
                          }}
                          className="p-1 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeSubTab === 'products' && (
            <table className="w-full text-left text-xs text-slate-600 font-medium">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Kode Part</th>
                  <th className="p-4">Nama Barang (Katalog)</th>
                  <th className="p-4">Kategori Modul</th>
                  <th className="p-4">Satuan Default</th>
                  <th className="p-4">Harga Acuan Default</th>
                  <th className="p-4">Catatan Deskripsi</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400 font-normal">
                      Saringan produk kosong.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-900">{p.code}</td>
                      <td className="p-4 font-bold text-slate-800">{p.name}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] border border-emerald-200 font-bold">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4">{p.unit}</td>
                      <td className="p-4 font-mono font-extrabold text-slate-900">{formatIDR(p.defaultPrice)}</td>
                      <td className="p-4 text-slate-500 truncate max-w-[200px]" title={p.description}>{p.description}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal('product', p)}
                          className="p-1 hover:text-indigo-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin mendelete barang ${p.name}?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MASTER DATA DIALOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide">
                  {editId ? 'Edit Catatan' : 'Registrasi Baru'} - {modalType.toUpperCase()}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Lengkapi isian agar metadata valid di platform</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">Kode Unik</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-mono font-bold"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">Nama / Identitas Dagang</label>
                  <input
                    type="text"
                    required
                    placeholder={modalType === 'product' ? 'cth. Bushing Core Set' : 'cth. PT. Sinar Logam'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>
              </div>

              {/* Dynamic properties based on type */}
              {modalType === 'supplier' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Kategori Material Utama</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Baja / Logam">Baja / Logam</option>
                      <option value="Plastik Resin">Plastik Resin</option>
                      <option value="Jasa Outsource">Jasa Outsource</option>
                      <option value="Standard Parts">Standard Parts</option>
                      <option value="Baut, Ring, & Pins">Baut, Ring, & Pins</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Nomor Telepon</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="021-..."
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {modalType === 'customer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Sektor Industri Utama</label>
                    <select
                      value={industry}
                      onChange={e => setIndustry(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white font-bold"
                    >
                      <option value="Otomotif">Otomotif</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Konstruksi">Konstruksi</option>
                      <option value="Dirgantara">Dirgantara</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Nomor Telepon</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="021-..."
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {modalType === 'product' && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Kategori PO Modis</label>
                    <select
                      value={prodCategory}
                      onChange={e => setProdCategory(e.target.value as POCategory)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Satuan default</label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Harga Acuan (Rp)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={defaultPrice || ''}
                      onChange={e => setDefaultPrice(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Shared contact values */}
              {modalType !== 'product' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">Email Kerja (Procuring)</label>
                  <input
                    type="email"
                    placeholder="nama@domain.co.id"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              )}

              {/* Shared Address / Description parameter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">
                  {modalType === 'product' ? 'Deskripsi Ringkas Barang' : 'Alamat Resmi Lengkap'}
                </label>
                <textarea
                  required
                  value={modalType === 'product' ? description : address}
                  onChange={e => modalType === 'product' ? setDescription(e.target.value) : setAddress(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 h-16 resize-none"
                  placeholder={modalType === 'product' ? 'Tulis fungsi atau material penyusun barang...' : 'Jl. Industri No...'}
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Urungkan
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Simpan Master</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
