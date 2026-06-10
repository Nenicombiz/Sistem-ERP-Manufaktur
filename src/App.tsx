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

  // Core CRM/ERP States with Persistence
  const [primaryPOs, setPrimaryPOs] = useState<PrimaryPO[]>(() => {
    const saved = localStorage.getItem('erp_primary_pos');
    return saved ? JSON.parse(saved) : INITIAL_PRIMARY_POS;
  });

  const [deptPOs, setDeptPOs] = useState<DepartmentPO[]>(() => {
    const saved = localStorage.getItem('erp_dept_pos');
    return saved ? JSON.parse(saved) : INITIAL_DEPT_POS;
  });

  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('erp_stock_items');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
  });

  const [purchasingLogs, setPurchasingLogs] = useState<PurchasingLog[]>(() => {
    const saved = localStorage.getItem('erp_purchasing_logs');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASING_LOGS;
  });

  const [salesLogs, setSalesLogs] = useState<SalesLog[]>(() => {
    const saved = localStorage.getItem('erp_sales_logs');
    return saved ? JSON.parse(saved) : INITIAL_SALES_LOGS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('erp_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  // Corporate Liquid Cash Account
  const [cashBalance, setCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem('erp_cash_balance');
    return saved ? parseFloat(saved) : 1585000000; // Default Rp 1.585 M
  });

  // Master Data States
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('erp_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('erp_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('erp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // User simulated role and department states details
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem('erp_sim_role') || 'superadmin';
  });

  const [simDept, setSimDept] = useState<ManufacturingDepartment>(() => {
    return (localStorage.getItem('erp_sim_dept') as ManufacturingDepartment) || 'Design Mekanik';
  });

  // Persist State Updates
  useEffect(() => {
    localStorage.setItem('erp_primary_pos', JSON.stringify(primaryPOs));
  }, [primaryPOs]);

  useEffect(() => {
    localStorage.setItem('erp_dept_pos', JSON.stringify(deptPOs));
  }, [deptPOs]);

  useEffect(() => {
    localStorage.setItem('erp_stock_items', JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem('erp_purchasing_logs', JSON.stringify(purchasingLogs));
  }, [purchasingLogs]);

  useEffect(() => {
    localStorage.setItem('erp_sales_logs', JSON.stringify(salesLogs));
  }, [salesLogs]);

  useEffect(() => {
    localStorage.setItem('erp_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('erp_cash_balance', cashBalance.toString());
  }, [cashBalance]);

  useEffect(() => {
    localStorage.setItem('erp_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('erp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('erp_products', JSON.stringify(products));
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
  const handleAddPrimaryPO = (newPO: PrimaryPO) => {
    setPrimaryPOs([newPO, ...primaryPOs]);
  };

  // 2. Cancel Primary PO
  const handleCancelPrimaryPO = (id: string) => {
    setPrimaryPOs(primaryPOs.map(po => {
      if (po.id === id) {
        return { ...po, status: 'Cancelled' };
      }
      return po;
    }));
  };

  // 3. Issue Department PO (issued by Department Supervisor)
  const handleAddDeptPO = (newDeptPO: DepartmentPO) => {
    setDeptPOs([newDeptPO, ...deptPOs]);

    // Automatically trigger purchasing log (COGS cost)
    const subtotal = newDeptPO.totalPrice;
    const tax = subtotal * 0.11; // 11% PPN

    const autoPurchaseLog: PurchasingLog = {
      id: `purchase-m-${Math.random().toString(36).substring(2, 9)}`,
      date: newDeptPO.orderDate,
      purchaseNo: `PRC-AUTO-${Math.floor(100 + Math.random() * 900)}`,
      secondaryPONumber: newDeptPO.secondaryPONumber,
      supplier: newDeptPO.vendorName,
      itemName: newDeptPO.itemName,
      qty: newDeptPO.qty,
      unit: newDeptPO.unit,
      unitPrice: newDeptPO.unitPrice,
      subtotal,
      tax,
      grandTotal: subtotal + tax,
      status: 'Paid'
    };

    setPurchasingLogs(prev => [autoPurchaseLog, ...prev]);

    // Deduct cash balance for buying materials/services
    setCashBalance(prev => prev - (subtotal + tax));

    // Increase specific stock quantity if category matches raw material
    const matchedStock = stockItems.find(item => 
      item.name.toLowerCase().includes(newDeptPO.itemName.toLowerCase()) || 
      newDeptPO.itemName.toLowerCase().includes(item.name.toLowerCase())
    );

    if (matchedStock) {
      setStockItems(stockItems.map(item => {
        if (item.id === matchedStock.id) {
          return { ...item, quantity: item.quantity + newDeptPO.qty };
        }
        return item;
      }));
    }
  };

  // 4. Update Supervisor department progress states inside Parents Primary PO
  const handleUpdatePrimaryDeptStatus = (
    poId: string, 
    dept: ManufacturingDepartment, 
    status: 'In Progress' | 'Action Taken' | 'Approved'
  ) => {
    setPrimaryPOs(primaryPOs.map(po => {
      if (po.id === poId) {
        const updatedDeptStatuses = { ...po.deptStatuses, [dept]: status };
        
        // Calculate parent PO status based on progress of departments
        let parentStatus = po.status;
        const allStatuses = Object.values(updatedDeptStatuses);
        
        if (allStatuses.every(s => s === 'Approved')) {
          parentStatus = 'Completed';
        } else if (allStatuses.some(s => s === 'In Progress' || s === 'Action Taken' || s === 'Approved')) {
          parentStatus = 'In Progress';
        }

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
  const handleAddStockItem = (newItem: StockItem) => {
    setStockItems([newItem, ...stockItems]);
  };

  // 6. Manual Stock level adjustments
  const handleUpdateStockQty = (id: string, newQty: number) => {
    setStockItems(stockItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // 7. Manual Purchase Entry Additions
  const handleAddPurchasingLog = (newPurchase: PurchasingLog) => {
    setPurchasingLogs([newPurchase, ...purchasingLogs]);
    setCashBalance(prev => prev - newPurchase.grandTotal);
  };

  // 8. Manual Sales Entry Additions
  const handleAddSalesLog = (newSale: SalesLog) => {
    setSalesLogs([newSale, ...salesLogs]);
    setCashBalance(prev => prev + newSale.grandTotal);
  };

  // 9. Register Client Invoice (Penagihan)
  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
  };

  // 10. Pay Invoice (Client settling commercial bills)
  const handlePayInvoice = (id: string) => {
    setInvoices(invoices.map(inv => {
      if (inv.id === id) {
        // Find corresponding parent PO
        const matchedPO = primaryPOs.find(p => p.id === inv.primaryPOId);
        
        // Register sales entry in logs
        const newSale: SalesLog = {
          id: `sales-auto-${Math.random().toString(36).substring(2, 9)}`,
          date: new Date().toISOString().split('T')[0],
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
        
        setSalesLogs(prev => [newSale, ...prev]);

        // Inject/Add Cash Balance
        setCashBalance(prev => prev + inv.grandTotal);

        return { 
          ...inv, 
          status: 'Paid',
          paymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return inv;
    }));
  };

  // 11. SPT Tax Payment
  const handlePayTaxes = (amountToPay: number) => {
    setCashBalance(prev => prev - amountToPay);
  };

  // Master Data Mutators
  const handleAddSupplier = (newSupplier: Supplier) => {
    setSuppliers([newSupplier, ...suppliers]);
  };
  const handleUpdateSupplier = (updated: Supplier) => {
    setSuppliers(suppliers.map(s => s.id === updated.id ? updated : s));
  };
  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers([newCustomer, ...customers]);
  };
  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(customers.map(c => c.id === updated.id ? updated : c));
  };
  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
  };
  const handleUpdateProduct = (updated: Product) => {
    setProducts(products.map(p => p.id === updated.id ? updated : p));
  };
  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
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
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
              <span>Multi-Role Access Control Simulator</span>
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
              onAddStockItem={handleAddStockItem}
              onUpdateStockQty={handleUpdateStockQty}
            />
          )}

          {currentTab === 'transactions' && (
            <PurchasingSalesView 
              purchasingLogs={purchasingLogs}
              salesLogs={salesLogs}
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
