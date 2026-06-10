/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PrimaryPO, 
  DepartmentPO, 
  StockItem, 
  PurchasingLog, 
  SalesLog, 
  Invoice,
  ManufacturingDepartment,
  Supplier,
  Customer,
  Product
} from './types';
import { 
  INITIAL_PRIMARY_POS, 
  INITIAL_DEPT_POS, 
  INITIAL_STOCK_ITEMS, 
  INITIAL_PURCHASING_LOGS, 
  INITIAL_SALES_LOGS, 
  INITIAL_INVOICES,
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS
} from './data/initialData';
import { formatIDR, DEPARTMENTS } from './utils';
import { DbService } from './supabaseClient';

// Import Views
import DashboardView from './components/DashboardView';
import SuperadminView from './components/SuperadminView';
import SupervisorView from './components/SupervisorView';
import InventoryView from './components/InventoryView';
import PurchasingSalesView from './components/PurchasingSalesView';
import InvoicingView from './components/InvoicingView';
import FinancialView from './components/FinancialView';
import MasterDataView from './components/MasterDataView';

// Icons
import { 
  LayoutDashboard, 
  UserSquare2, 
  Users2, 
  PackageSearch, 
  ReceiptIndianRupee, 
  ReceiptText, 
  PiggyBank, 
  Coins,
  Cpu,
  Menu,
  X,
  Building2,
  Users,
  Boxes,
  ShieldCheck,
  Lock,
  ChevronDown,
  UserCheck,
  Briefcase
} from 'lucide-react';

// Unified Role simulation matrix
const SIMULATED_ROLES = [
  { id: 'superadmin', name: 'Superadmin (Akses Penuh)' },
  { id: 'supervisor', name: 'Supervisor Departemen' },
  { id: 'staff_dept', name: 'Staf per Departemen' },
  { id: 'staf_stok', name: 'Staf Stok' },
  { id: 'staf_pembelian', name: 'Staf Pembelian' },
  { id: 'staf_penjualan', name: 'Staf Penjualan' },
  { id: 'staf_sales', name: 'Staf Sales' },
  { id: 'staf_keuangan', name: 'Staf Keuangan' }
];

// Returns permitted tabs list per simulated role
const getAllowedTabsForRole = (role: string): string[] => {
  switch (role) {
    case 'superadmin':
      // Superadmin can see everything
      return ['dashboard', 'superadmin', 'supervisor', 'partners', 'stock', 'transactions', 'invoicing', 'financial'];
    case 'supervisor':
    case 'staff_dept':
      // Supervisor can see core production flow and Master Register
      return ['dashboard', 'supervisor', 'partners'];
    case 'staf_stok':
      // Stock staff only sees warehouse ledger
      return ['dashboard', 'stock'];
    case 'staf_pembelian':
      // Purchasing staff only sees purchasing/sales ledger
      return ['dashboard', 'transactions'];
    case 'staf_penjualan':
      // Sales staff only sees purchasing/sales ledger
      return ['dashboard', 'transactions'];
    case 'staf_sales':
      // Sales staff only sees client invoicing
      return ['dashboard', 'invoicing'];
    case 'staf_keuangan':
      // Financial staff sees commerce logs, invoicing, and reports
      return ['dashboard', 'transactions', 'invoicing', 'financial'];
    default:
      return ['dashboard'];
  }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core CRM/ERP States with live Supabase synchronization
  const [primaryPOs, setPrimaryPOs] = useState<PrimaryPO[]>([]);
  const [deptPOs, setDeptPOs] = useState<DepartmentPO[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [purchasingLogs, setPurchasingLogs] = useState<PurchasingLog[]>([]);
  const [salesLogs, setSalesLogs] = useState<SalesLog[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [cashBalance, setCashBalance] = useState<number>(1585000000);

  // Master Data States
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Connection & Sync Stats
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<string>('Menyambungkan...');

  // User simulated role and department states details
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem('erp_sim_role') || 'superadmin';
  });

  const [simDept, setSimDept] = useState<ManufacturingDepartment>(() => {
    return (localStorage.getItem('erp_sim_dept') as ManufacturingDepartment) || 'Design Mekanik';
  });

  // 1. Unified load hook for full Supabase Synchronization
  useEffect(() => {
    async function loadAllData() {
      setIsLoading(true);
      setSyncStatus('Menghubungkan ke live Supabase...');
      try {
        console.log('Loading collections from Supabase...');
        const [
          dbPrimary,
          dbDept,
          dbStock,
          dbPurchasing,
          dbSales,
          dbInvoices,
          dbSuppliers,
          dbCustomers,
          dbProducts
        ] = await Promise.all([
          DbService.getPrimaryPOs(),
          DbService.getDeptPOs(),
          DbService.getStockItems(),
          DbService.getPurchasingLogs(),
          DbService.getSalesLogs(),
          DbService.getInvoices(),
          DbService.getSuppliers(),
          DbService.getCustomers(),
          DbService.getProducts()
        ]);

        console.log('Successfully loaded all collections from Supabase!');
        
        // Populate local state
        setPrimaryPOs(dbPrimary.length > 0 ? dbPrimary : INITIAL_PRIMARY_POS);
        setDeptPOs(dbDept.length > 0 ? dbDept : INITIAL_DEPT_POS);
        setStockItems(dbStock.length > 0 ? dbStock : INITIAL_STOCK_ITEMS);
        setPurchasingLogs(dbPurchasing.length > 0 ? dbPurchasing : INITIAL_PURCHASING_LOGS);
        setSalesLogs(dbSales.length > 0 ? dbSales : INITIAL_SALES_LOGS);
        setInvoices(dbInvoices.length > 0 ? dbInvoices : INITIAL_INVOICES);
        setSuppliers(dbSuppliers.length > 0 ? dbSuppliers : INITIAL_SUPPLIERS);
        setCustomers(dbCustomers.length > 0 ? dbCustomers : INITIAL_CUSTOMERS);
        setProducts(dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS);

        // Calculate cash balance: Base Rp 1.585 M + sales inflow - purchasing outflow
        const totalSalesInflow = dbSales.reduce((acc, log) => acc + log.grandTotal, 0);
        const totalPurchasingOutflow = dbPurchasing.reduce((acc, log) => acc + log.grandTotal, 0);
        const calculatedBalance = 1585000000 + totalSalesInflow - totalPurchasingOutflow;
        setCashBalance(calculatedBalance);

        setSyncStatus('Terhubung');
      } catch (err: any) {
        console.warn('Postgres/Supabase read error, using local fallback:', err);
        setSyncStatus('Offline / Lokal');
        
        // Fallback reading
        const savedPrimaryPOs = localStorage.getItem('erp_primary_pos');
        setPrimaryPOs(savedPrimaryPOs ? JSON.parse(savedPrimaryPOs) : INITIAL_PRIMARY_POS);

        const savedDeptPOs = localStorage.getItem('erp_dept_pos');
        setDeptPOs(savedDeptPOs ? JSON.parse(savedDeptPOs) : INITIAL_DEPT_POS);

        const savedStockItems = localStorage.getItem('erp_stock_items');
        setStockItems(savedStockItems ? JSON.parse(savedStockItems) : INITIAL_STOCK_ITEMS);

        const savedPurchasing = localStorage.getItem('erp_purchasing_logs');
        setPurchasingLogs(savedPurchasing ? JSON.parse(savedPurchasing) : INITIAL_PURCHASING_LOGS);

        const savedSales = localStorage.getItem('erp_sales_logs');
        setSalesLogs(savedSales ? JSON.parse(savedSales) : INITIAL_SALES_LOGS);

        const savedInvoices = localStorage.getItem('erp_invoices');
        setInvoices(savedInvoices ? JSON.parse(savedInvoices) : INITIAL_INVOICES);

        const savedCash = localStorage.getItem('erp_cash_balance');
        setCashBalance(savedCash ? parseFloat(savedCash) : 1585000000);

        const savedSuppliers = localStorage.getItem('erp_suppliers');
        setSuppliers(savedSuppliers ? JSON.parse(savedSuppliers) : INITIAL_SUPPLIERS);

        const savedCustomers = localStorage.getItem('erp_customers');
        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : INITIAL_CUSTOMERS);

        const savedProducts = localStorage.getItem('erp_products');
        setProducts(savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Sync state mutations to local storage as supplementary safety backup
  useEffect(() => {
    if (primaryPOs.length > 0) localStorage.setItem('erp_primary_pos', JSON.stringify(primaryPOs));
  }, [primaryPOs]);

  useEffect(() => {
    if (deptPOs.length > 0) localStorage.setItem('erp_dept_pos', JSON.stringify(deptPOs));
  }, [deptPOs]);

  useEffect(() => {
    if (stockItems.length > 0) localStorage.setItem('erp_stock_items', JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    if (purchasingLogs.length > 0) localStorage.setItem('erp_purchasing_logs', JSON.stringify(purchasingLogs));
  }, [purchasingLogs]);

  useEffect(() => {
    if (salesLogs.length > 0) localStorage.setItem('erp_sales_logs', JSON.stringify(salesLogs));
  }, [salesLogs]);

  useEffect(() => {
    if (invoices.length > 0) localStorage.setItem('erp_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('erp_cash_balance', cashBalance.toString());
  }, [cashBalance]);

  useEffect(() => {
    if (suppliers.length > 0) localStorage.setItem('erp_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    if (customers.length > 0) localStorage.setItem('erp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    if (products.length > 0) localStorage.setItem('erp_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('erp_sim_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('erp_sim_dept', simDept);
  }, [simDept]);

  // REDIRECT AUTO-GUARD ON ROLE SHIFT
  useEffect(() => {
    const allowed = getAllowedTabsForRole(userRole);
    if (!allowed.includes(currentTab)) {
      setCurrentTab('dashboard'); // Safe landing page
    }
  }, [userRole, currentTab]);

  // ----------------------------------------------------
  // ERP Mutators & Handlers
  // ----------------------------------------------------

  // 1. Add Primary PO (issued by Superadmin)
  const handleAddPrimaryPO = async (newPO: PrimaryPO) => {
    try {
      const { id, ...cleanPO } = newPO;
      const inserted = await DbService.insertPrimaryPO({
        ...cleanPO,
        deptStatuses: newPO.deptStatuses || {}
      });
      setPrimaryPOs(prev => [inserted, ...prev]);
    } catch (e: any) {
      console.error('Supabase write failed for primary PO:', e);
      alert(`Gagal menyimpan PO ke database Supabase:\n${e.message || e}`);
      setPrimaryPOs(prev => [newPO, ...prev]);
    }
  };

  // 2. Cancel Primary PO
  const handleCancelPrimaryPO = async (id: string) => {
    try {
      await DbService.updatePrimaryPO(id, { status: 'Cancelled' });
    } catch (e) {
      console.error('Failed to cancel PO on Supabase:', e);
    }
    setPrimaryPOs(prev => prev.map(po => po.id === id ? { ...po, status: 'Cancelled' } : po));
  };

  // 3. Issue Department PO (issued by Department Supervisor)
  const handleAddDeptPO = async (newDeptPO: DepartmentPO) => {
    try {
      const { id, ...cleanDeptPO } = newDeptPO;
      const insertedDeptPO = await DbService.insertDeptPO(cleanDeptPO);
      setDeptPOs(prev => [insertedDeptPO, ...prev]);

      // Automatically trigger purchasing log
      const subtotal = insertedDeptPO.totalPrice;
      const tax = subtotal * 0.11;
      const autoPurchaseLog: Omit<PurchasingLog, 'id'> = {
        date: insertedDeptPO.orderDate,
        purchaseNo: `PRC-AUTO-${Math.floor(100 + Math.random() * 900)}`,
        secondaryPONumber: insertedDeptPO.secondaryPONumber,
        supplier: insertedDeptPO.vendorName,
        itemName: insertedDeptPO.itemName,
        qty: insertedDeptPO.qty,
        unit: insertedDeptPO.unit,
        unitPrice: insertedDeptPO.unitPrice,
        subtotal,
        tax,
        grandTotal: subtotal + tax,
        status: 'Paid'
      };

      const insertedPurchasing = await DbService.insertPurchasingLog(autoPurchaseLog);
      setPurchasingLogs(prev => [insertedPurchasing, ...prev]);

      // Deduct cash balance for buying materials/services
      setCashBalance(prev => prev - insertedPurchasing.grandTotal);

      // Increase specific stock quantity in Supabase if matched
      const matchedStock = stockItems.find(item => 
        item.name.toLowerCase().includes(insertedDeptPO.itemName.toLowerCase()) || 
        insertedDeptPO.itemName.toLowerCase().includes(item.name.toLowerCase())
      );

      if (matchedStock) {
        const newStockQty = matchedStock.quantity + insertedDeptPO.qty;
        await DbService.updateStockItem(matchedStock.id, { quantity: newStockQty });
        setStockItems(prev => prev.map(item => item.id === matchedStock.id ? { ...item, quantity: newStockQty } : item));
      }
    } catch (e: any) {
      console.error('Supabase write failure during department PO issuance:', e);
      alert(`Gagal meramal data ke Supabase:\n${e.message || e}`);
      setDeptPOs(prev => [newDeptPO, ...prev]);
    }
  };

  // 4. Update Supervisor department progress states inside Parents Primary PO
  const handleUpdatePrimaryDeptStatus = async (
    poId: string, 
    dept: ManufacturingDepartment, 
    status: 'In Progress' | 'Action Taken' | 'Approved'
  ) => {
    const targetPO = primaryPOs.find(po => po.id === poId);
    if (!targetPO) return;

    const updatedDeptStatuses = { ...targetPO.deptStatuses, [dept]: status };
    
    let parentStatus = targetPO.status;
    const allStatuses = Object.values(updatedDeptStatuses);
    
    if (allStatuses.every(s => s === 'Approved')) {
      parentStatus = 'Completed';
    } else if (allStatuses.some(s => s === 'In Progress' || s === 'Action Taken' || s === 'Approved')) {
      parentStatus = 'In Progress';
    }

    try {
      await DbService.updatePrimaryPO(poId, {
        status: parentStatus,
        deptStatuses: updatedDeptStatuses
      });
    } catch (e) {
      console.error('Failed updating department progress on Supabase:', e);
    }

    setPrimaryPOs(prev => prev.map(po => {
      if (po.id === poId) {
        return {
          ...po,
          status: parentStatus,
          deptStatuses: updatedDeptStatuses
        };
      }
      return po;
    }));
  };

  // 5. Add custom item to warehouse stock ledger
  const handleAddStockItem = async (newItem: StockItem) => {
    try {
      const { id, ...cleanItem } = newItem;
      const inserted = await DbService.insertStockItem(cleanItem);
      setStockItems(prev => [inserted, ...prev]);
    } catch (e: any) {
      console.error('Failed to save Stock Item to Supabase:', e);
      alert(`Gagal menambah stok:\n${e.message || e}`);
      setStockItems(prev => [newItem, ...prev]);
    }
  };

  // 6. Manual Stock level adjustments
  const handleUpdateStockQty = async (id: string, newQty: number) => {
    try {
      await DbService.updateStockItem(id, { quantity: newQty });
    } catch (e) {
      console.error('Failed updating stock quantity on Supabase:', e);
    }
    setStockItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  // 7. Manual Purchase Entry Additions
  const handleAddPurchasingLog = async (newPurchase: PurchasingLog) => {
    try {
      const { id, ...cleanPurchase } = newPurchase;
      const inserted = await DbService.insertPurchasingLog(cleanPurchase);
      setPurchasingLogs(prev => [inserted, ...prev]);
      setCashBalance(prev => prev - inserted.grandTotal);
    } catch (e: any) {
      console.error('Failed to create purchase ledger entry on Supabase:', e);
      alert(`Gagal mencatat transaksi pembelian:\n${e.message || e}`);
      setPurchasingLogs(prev => [newPurchase, ...prev]);
      setCashBalance(prev => prev - newPurchase.grandTotal);
    }
  };

  // 8. Manual Sales Entry Additions
  const handleAddSalesLog = async (newSale: SalesLog) => {
    try {
      const { id, ...cleanSale } = newSale;
      const inserted = await DbService.insertSalesLog(cleanSale);
      setSalesLogs(prev => [inserted, ...prev]);
      setCashBalance(prev => prev + inserted.grandTotal);
    } catch (e: any) {
      console.error('Failed to create sales ledger entry on Supabase:', e);
      alert(`Gagal mencatat transaksi penjualan:\n${e.message || e}`);
      setSalesLogs(prev => [newSale, ...prev]);
      setCashBalance(prev => prev + newSale.grandTotal);
    }
  };

  // 9. Register Client Invoice (Penagihan)
  const handleAddInvoice = async (newInvoice: Invoice) => {
    try {
      const { id, ...cleanInvoice } = newInvoice;
      const inserted = await DbService.insertInvoice(cleanInvoice);
      setInvoices(prev => [inserted, ...prev]);
    } catch (e: any) {
      console.error('Failed to issue client invoice to Supabase:', e);
      alert(`Gagal menerbitkan Invoice ke Supabase:\n${e.message || e}`);
      setInvoices(prev => [newInvoice, ...prev]);
    }
  };

  // 10. Pay Invoice (Client settling commercial bills)
  const handlePayInvoice = async (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    const matchedPO = primaryPOs.find(p => p.id === inv.primaryPOId);
    const currentDateStr = new Date().toISOString().split('T')[0];

    try {
      // Create new sales log in Supabase
      const autoSale: Omit<SalesLog, 'id'> = {
        date: currentDateStr,
        salesNo: `SLS-AUTO-${Math.floor(100 + Math.random() * 900)}`,
        primaryPONumber: inv.primaryPONumber,
        clientName: inv.clientName,
        itemName: matchedPO ? matchedPO.itemName : inv.items[0]?.description || 'Custom Job Delivery',
        qty: matchedPO ? matchedPO.qty : 1,
        unit: matchedPO ? matchedPO.unit : 'pcs',
        unitPrice: matchedPO ? matchedPO.unitPrice : inv.subtotal,
        subtotal: inv.subtotal,
        tax: inv.tax,
        grandTotal: inv.grandTotal,
        status: 'Paid'
      };

      const [updatedInvoice, insertedSale] = await Promise.all([
        DbService.updateInvoice(id, {
          status: 'Paid',
          paymentDate: currentDateStr
        }),
        DbService.insertSalesLog(autoSale)
      ]);

      setInvoices(prev => prev.map(i => i.id === id ? updatedInvoice : i));
      setSalesLogs(prev => [insertedSale, ...prev]);
      setCashBalance(prev => prev + updatedInvoice.grandTotal);
    } catch (e: any) {
      console.error('Failed paying invoice via Supabase:', e);
      alert(`Gagal melunasi invoice via Supabase:\n${e.message || e}`);
    }
  };

  // 11. SPT Tax Payment
  const handlePayTaxes = (amountToPay: number) => {
    setCashBalance(prev => prev - amountToPay);
    alert(`Pembayaran SPT PPN sebesar ${formatIDR(amountToPay)} sukses diproses secara lokal.`);
  };

  // Master Data Mutators
  const handleAddSupplier = async (newSupplier: Supplier) => {
    try {
      const { id, ...clean } = newSupplier;
      const inserted = await DbService.insertSupplier(clean);
      setSuppliers(prev => [inserted, ...prev]);
    } catch (e: any) {
      console.error('Failed to add supplier to Supabase:', e);
      alert(`Gagal menambah supplier:\n${e.message || e}`);
      setSuppliers(prev => [newSupplier, ...prev]);
    }
  };
  const handleUpdateSupplier = async (updated: Supplier) => {
    try {
      const updatedRow = await DbService.updateSupplier(updated.id, updated);
      setSuppliers(prev => prev.map(s => s.id === updated.id ? updatedRow : s));
    } catch (e: any) {
      console.error('Failed to update supplier on Supabase:', e);
      alert(`Gagal mengupdate supplier:\n${e.message || e}`);
    }
  };
  const handleDeleteSupplier = async (id: string) => {
    try {
      await DbService.deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      console.error('Failed to delete supplier from Supabase:', e);
      alert(`Gagal menghapus supplier:\n${e.message || e}`);
    }
  };

  const handleAddCustomer = async (newCustomer: Customer) => {
    try {
      const { id, ...clean } = newCustomer;
      const inserted = await DbService.insertCustomer(clean);
      setCustomers(prev => [inserted, ...prev]);
    } catch (e: any) {
      console.error('Failed to add customer to Supabase:', e);
      alert(`Gagal menambah customer:\n${e.message || e}`);
      setCustomers(prev => [newCustomer, ...prev]);
    }
  };
  const handleUpdateCustomer = async (updated: Customer) => {
    try {
      const updatedRow = await DbService.updateCustomer(updated.id, updated);
      setCustomers(prev => prev.map(c => c.id === updated.id ? updatedRow : c));
    } catch (e: any) {
      console.error('Failed to update customer on Supabase:', e);
      alert(`Gagal mengupdate customer:\n${e.message || e}`);
    }
  };
  const handleDeleteCustomer = async (id: string) => {
    try {
      await DbService.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      console.error('Failed to delete customer from Supabase:', e);
      alert(`Gagal menghapus customer:\n${e.message || e}`);
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      const { id, ...clean } = newProduct;
      const inserted = await DbService.insertProduct(clean);
      setProducts(prev => [inserted, ...prev]);
    } catch (e: any) {
      console.error('Failed to add product to Supabase:', e);
      alert(`Gagal menambah katalog produk:\n${e.message || e}`);
      setProducts(prev => [newProduct, ...prev]);
    }
  };
  const handleUpdateProduct = async (updated: Product) => {
    try {
      const updatedRow = await DbService.updateProduct(updated.id, updated);
      setProducts(prev => prev.map(p => p.id === updated.id ? updatedRow : p));
    } catch (e: any) {
      console.error('Failed to update product on Supabase:', e);
      alert(`Gagal mengupdate katalog produk:\n${e.message || e}`);
    }
  };
  const handleDeleteProduct = async (id: string) => {
    try {
      await DbService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      console.error('Failed to delete product from Supabase:', e);
      alert(`Gagal menghapus katalog produk:\n${e.message || e}`);
    }
  };

  // Navigation menu items map representing all tabs
  const ALL_TABS = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'superadmin', label: 'Purchase Order', icon: UserSquare2 },
    { id: 'supervisor', label: 'Supervisi Dept', icon: Users2 },
    { id: 'partners', label: 'Master Register', icon: Building2 },
    { id: 'stock', label: 'Stok / Gudang', icon: PackageSearch },
    { id: 'transactions', label: 'Buku Beli & Jual', icon: ReceiptIndianRupee },
    { id: 'invoicing', label: 'Penagihan / Invoice', icon: ReceiptText },
    { id: 'financial', label: 'Laporan Keuangan', icon: PiggyBank }
  ];

  // Dynamic filter for sidebar menu based on simulated role permissions!
  // "user yang tidak berhak mengakses tidak boleh melihat fitur di dalam halaman ini."
  const allowedTabs = getAllowedTabsForRole(userRole);
  const menuItems = ALL_TABS.filter(item => allowedTabs.includes(item.id));

  const handleNavigateDirect = (tabId: string) => {
    const allowed = getAllowedTabsForRole(userRole);
    if (allowed.includes(tabId)) {
      setCurrentTab(tabId);
    } else {
      alert(`Role simulasian Anda (${userRole}) tidak diizinkan mengakses halaman '${tabId}'!`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans text-slate-300" id="erp-sync-initial-loader">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="flex justify-center p-4">
            <Cpu className="w-12 h-12 text-indigo-500 animate-spin" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">Indotech ERP System</h1>
            <p className="text-xs text-slate-400 font-medium">Manufaktur Presisi Terintegrasi Cloud</p>
          </div>
          <div className="py-2 bg-slate-950/40 rounded-xl px-4 inline-flex items-center gap-2 border border-slate-800 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-[11px] font-bold text-slate-300 font-mono tracking-tight">{syncStatus}</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Menghubungkan ke live database di Supabase. Jika koneksi bermasalah atau belum bermigrasi penuh, aplikasi akan memuat data offline cadangan agar workflow tetap berjalan lancar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans" id="erp-master-shell">
      {/* SIDEBAR CONTAINER */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out border-r border-slate-800 flex flex-col justify-between ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`} id="sidebar-layout">
        {/* Sidebar Header logotype */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <Cpu className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight leading-none block">Indotech ERP</span>
                <span className="text-[10px] text-slate-500 font-medium">Manufaktur Presisi</span>
              </div>
            </div>
            {/* Close Mobile trigger */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav links (Filtered dynamically based on simulated Role) */}
          <nav className="p-4 space-y-1">
            {menuItems.map(item => {
              const IconComp = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer detailing liquid cash ledger */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Kas Liquid Bank</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{formatIDR(cashBalance)}</span>
            </div>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
        ></div>
      )}

      {/* PRIMARY WORKSPACE */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* TOP COMPREHENSIVE ROLE SIMULATOR BAR (Desktop & Mobile) */}
        <header className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-3.5 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          {/* Mobile hamburger alignment */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                <span>Multi-Role Access Control Simulator</span>
              </div>
              <div id="supabase-sync-indicator" className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-full shadow-sm text-[11px] font-bold transition-all duration-300 ${
                syncStatus.includes('Terhubung')
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : syncStatus.includes('Offline')
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-indigo-50 border-indigo-150 text-indigo-700 animate-pulse'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus.includes('Terhubung')
                    ? 'bg-emerald-500'
                    : syncStatus.includes('Offline')
                      ? 'bg-amber-500'
                      : 'bg-indigo-500 animate-ping'
                }`} />
                <span>Supabase: {syncStatus}</span>
              </div>
            </div>
          </div>

          {/* Switcher Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Active User Role switcher */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-500">Pilih Role:</span>
              <select
                value={userRole}
                onChange={e => {
                  setUserRole(e.target.value);
                  setSidebarOpen(false);
                }}
                className="bg-transparent font-extrabold text-slate-800 cursor-pointer focus:outline-none w-[160px] truncate"
              >
                {SIMULATED_ROLES.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            {/* Simulated Department assignments */}
            {(userRole === 'supervisor' || userRole === 'staff_dept') && (
              <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 rounded-xl px-2.5 py-1.5 animate-bounce">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-bold text-indigo-600">Simulasi Divisi:</span>
                <select
                  value={simDept}
                  onChange={e => setSimDept(e.target.value as ManufacturingDepartment)}
                  className="bg-transparent font-extrabold text-indigo-900 cursor-pointer focus:outline-none w-[120px] truncate"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* Main interactive viewport wrapper */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto" id="master-page-grid">
          {currentTab === 'dashboard' && (
            <DashboardView 
              primaryPOs={primaryPOs}
              deptPOs={deptPOs}
              stockItems={stockItems}
              purchasingLogs={purchasingLogs}
              salesLogs={salesLogs}
              onNavigate={handleNavigateDirect}
            />
          )}

          {currentTab === 'superadmin' && (
            <SuperadminView 
              primaryPOs={primaryPOs}
              customers={customers}
              products={products}
              onAddPrimaryPO={handleAddPrimaryPO}
              onCancelPrimaryPO={handleCancelPrimaryPO}
              userRole={userRole}
              onNavigateDirect={handleNavigateDirect}
            />
          )}

          {currentTab === 'supervisor' && (
            <SupervisorView 
              primaryPOs={primaryPOs}
              deptPOs={deptPOs}
              onAddDeptPO={handleAddDeptPO}
              onUpdatePrimaryDeptStatus={handleUpdatePrimaryDeptStatus}
              userRole={userRole}
              simDept={simDept}
              suppliers={suppliers}
              onNavigateDirect={handleNavigateDirect}
            />
          )}

          {currentTab === 'partners' && (
            <MasterDataView 
              suppliers={suppliers}
              customers={customers}
              products={products}
              onAddSupplier={handleAddSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {currentTab === 'stock' && (
            <InventoryView 
              stockItems={stockItems}
              products={products}
              suppliers={suppliers}
              onAddStockItem={handleAddStockItem}
              onUpdateStockQty={handleUpdateStockQty}
            />
          )}

          {currentTab === 'transactions' && (
            <PurchasingSalesView 
              purchasingLogs={purchasingLogs}
              salesLogs={salesLogs}
              suppliers={suppliers}
              customers={customers}
              products={products}
              primaryPos={primaryPOs}
              onAddPurchasingLog={handleAddPurchasingLog}
              onAddSalesLog={handleAddSalesLog}
            />
          )}

          {currentTab === 'invoicing' && (
            <InvoicingView 
              invoices={invoices}
              primaryPOs={primaryPOs}
              onAddInvoice={handleAddInvoice}
              onPayInvoice={handlePayInvoice}
            />
          )}

          {currentTab === 'financial' && (
            <FinancialView 
              purchasingLogs={purchasingLogs}
              salesLogs={salesLogs}
              stockItems={stockItems}
              invoices={invoices}
              cashBalance={cashBalance}
              onPayTaxes={handlePayTaxes}
            />
          )}
        </main>
      </div>
    </div>
  );
}
