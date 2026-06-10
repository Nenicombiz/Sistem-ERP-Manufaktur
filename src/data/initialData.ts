/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrimaryPO, DepartmentPO, StockItem, PurchasingLog, SalesLog, Invoice, Supplier, Customer, Product } from '../types';

export const INITIAL_PRIMARY_POS: PrimaryPO[] = [
  {
    id: 'po-1',
    poNumber: 'PO-M-2026-001',
    category: 'Project',
    projectName: 'Toyota Yaris Tooling & Jig',
    itemName: 'Main Bracket Jig Assembly',
    partNo: 'T-YJ-2026-04A',
    qty: 5,
    unit: 'set',
    unitPrice: 45000000,
    totalPrice: 225000000,
    orderDate: '2026-05-15',
    targetDepartments: ['Design Mekanik', 'Proccessing', 'Assembly', 'Quality Control', 'Pembelian'],
    status: 'In Progress',
    deptStatuses: {
      'Design Mekanik': 'Action Taken',
      'Proccessing': 'In Progress',
      'Assembly': 'Waiting',
      'Quality Control': 'Waiting',
      'Pembelian': 'Action Taken'
    },
    notes: 'Urgent Project. Jig must meet high precision tolerance ±0.02mm.'
  },
  {
    id: 'po-2',
    poNumber: 'PO-M-2026-002',
    category: 'MassPro Stamping',
    projectName: 'Honda Brio Seat Slider Refinement',
    itemName: 'Stopper Plate Metal Stamping',
    partNo: 'H-SP-8822B',
    qty: 15000,
    unit: 'pcs',
    unitPrice: 8500,
    totalPrice: 127500000,
    orderDate: '2026-05-20',
    targetDepartments: ['MassPro Stamping', 'PPIC Delivery', 'Quality Control', 'Pembelian'],
    status: 'In Progress',
    deptStatuses: {
      'MassPro Stamping': 'In Progress',
      'PPIC Delivery': 'Waiting',
      'Quality Control': 'Waiting',
      'Pembelian': 'Action Taken'
    },
    notes: 'Regular monthly shipping schedulings. Target delivery 15th June.'
  },
  {
    id: 'po-3',
    poNumber: 'PO-M-2026-003',
    category: 'MassPro Injection',
    projectName: 'Yamaha NMAX Facelift Cover Panel',
    itemName: 'Yamaha Front Cover L/R Plastic Injection',
    partNo: 'Y-FC-991A',
    qty: 8000,
    unit: 'pcs',
    unitPrice: 16200,
    totalPrice: 129600000,
    orderDate: '2026-05-25',
    targetDepartments: ['MassPro Injection', 'PPIC Delivery', 'Quality Control', 'Pembelian'],
    status: 'In Progress',
    deptStatuses: {
      'MassPro Injection': 'In Progress',
      'PPIC Delivery': 'Waiting',
      'Quality Control': 'Waiting',
      'Pembelian': 'Action Taken'
    },
    notes: 'Requires Premium ABS Plastic Resin. Painted Matte Black styling.'
  },
  {
    id: 'po-4',
    poNumber: 'PO-M-2026-004',
    category: 'Standard Part',
    projectName: 'Mitsubishi Triton Under-Run Tooling',
    itemName: 'Guide Pins and Bushing Sets',
    partNo: 'M-GP-1211',
    qty: 120,
    unit: 'pcs',
    unitPrice: 1250000,
    totalPrice: 150000000,
    orderDate: '2026-06-01',
    targetDepartments: ['Assembly', 'Pembelian', 'General Admin'],
    status: 'Pending',
    deptStatuses: {
      'Assembly': 'Waiting',
      'Pembelian': 'Waiting',
      'General Admin': 'Waiting'
    },
    notes: 'Urgent parts procurement for tooling setup.'
  },
  {
    id: 'po-5',
    poNumber: 'PO-M-2026-005',
    category: 'Component',
    projectName: 'Hyundai Ioniq 5 Battery Tray Base',
    itemName: 'Aluminum Spacer Custom Milling',
    partNo: 'H-AS-091A',
    qty: 500,
    unit: 'pcs',
    unitPrice: 180000,
    totalPrice: 90000000,
    orderDate: '2026-04-10',
    targetDepartments: ['MassPro Machine', 'Quality Control', 'PPIC Delivery'],
    status: 'Completed',
    deptStatuses: {
      'MassPro Machine': 'Approved',
      'Quality Control': 'Approved',
      'PPIC Delivery': 'Approved'
    },
    notes: 'Fully shipped, inspection reports accepted, invoice is sent.'
  }
];

export const INITIAL_DEPT_POS: DepartmentPO[] = [
  {
    id: 'dpo-1',
    parentPOId: 'po-1',
    parentPONumber: 'PO-M-2026-001',
    departmentIssuer: 'Pembelian',
    secondaryPONumber: 'SPO-PEMB-2026-001',
    vendorName: 'PT. Steel Supply Center Indonesia',
    itemName: 'S50C Carbon Steel Block (120x300x500mm)',
    qty: 5,
    unit: 'pcs',
    unitPrice: 4200000,
    totalPrice: 21000000,
    orderDate: '2026-05-17',
    status: 'Received',
    notes: 'Raw material block for making the main jig bases.'
  },
  {
    id: 'dpo-2',
    parentPOId: 'po-1',
    parentPONumber: 'PO-M-2026-001',
    departmentIssuer: 'Design Mekanik',
    secondaryPONumber: 'SPO-DSN-2026-001',
    vendorName: 'PT. Jasa CNC Presisi',
    itemName: 'Precision Wire-Cut EDM Services (Milling Slots)',
    qty: 1,
    unit: 'lot',
    unitPrice: 12000000,
    totalPrice: 12000000,
    orderDate: '2026-05-22',
    status: 'Issued',
    notes: 'Outsource processing sub-job for complex internal lock geometries.'
  },
  {
    id: 'dpo-3',
    parentPOId: 'po-2',
    parentPONumber: 'PO-M-2026-002',
    departmentIssuer: 'Pembelian',
    secondaryPONumber: 'SPO-PEMB-2026-002',
    vendorName: 'PT. Krakatau Steel',
    itemName: 'SPCC Cold Rolled Steel Coil 1.6mm Thick',
    qty: 3,
    unit: 'tons',
    unitPrice: 15500000,
    totalPrice: 46500000,
    orderDate: '2026-05-22',
    status: 'Received',
    notes: 'Stamping raw material requirement.'
  },
  {
    id: 'dpo-4',
    parentPOId: 'po-3',
    parentPONumber: 'PO-M-2026-003',
    departmentIssuer: 'Pembelian',
    secondaryPONumber: 'SPO-PEMB-2026-003',
    vendorName: 'PT. Toray Plastics Indonesia',
    itemName: 'ABS Plastic Resin - Matte Grade (Black)',
    qty: 2500,
    unit: 'kg',
    unitPrice: 32000,
    totalPrice: 80000000,
    orderDate: '2026-05-27',
    status: 'Received',
    notes: 'Resin pellets for Yamaha front cover mass-production injections.'
  }
];

export const INITIAL_STOCK_ITEMS: StockItem[] = [
  {
    id: 'stock-1',
    code: 'RM-S50C-M',
    name: 'S50C Carbon Steel Block (120x300x500mm)',
    category: 'Raw Material',
    quantity: 12,
    unit: 'pcs',
    unitCost: 4200000,
    minStock: 5,
    location: 'Warehouse A - Metal Block',
    vendor: 'PT. Steel Supply Center Indonesia'
  },
  {
    id: 'stock-2',
    code: 'RM-SPCC-16',
    name: 'SPCC Cold Rolled Steel Coil 1.6mm',
    category: 'Raw Material',
    quantity: 6.5,
    unit: 'tons',
    unitCost: 15500000,
    minStock: 2.0,
    location: 'Warehouse B - Heavy Coil Yard',
    vendor: 'PT. Krakatau Steel'
  },
  {
    id: 'stock-3',
    code: 'RM-ABS-MB',
    name: 'ABS Plastic Resin - Matte Grade (Black)',
    category: 'Raw Material',
    quantity: 4200,
    unit: 'kg',
    unitCost: 32000,
    minStock: 1000,
    location: 'Warehouse C - Plastic Silo',
    vendor: 'PT. Toray Plastics Indonesia'
  },
  {
    id: 'stock-4',
    code: 'SP-GP-MISUMI',
    name: 'Misumi Guide Pin 25x150mm',
    category: 'Standard Part',
    quantity: 45,
    unit: 'pcs',
    unitCost: 280000,
    minStock: 20,
    location: 'Cabinet 04 - Press Die Standard',
    vendor: 'PT. Misumi Indonesia'
  },
  {
    id: 'stock-5',
    code: 'SP-BUSH-25',
    name: 'Guide Bushing bronze self-lubricating 25mm',
    category: 'Standard Part',
    quantity: 38,
    unit: 'pcs',
    unitCost: 185000,
    minStock: 15,
    location: 'Cabinet 04 - Press Die Standard',
    vendor: 'PT. Misumi Indonesia'
  },
  {
    id: 'stock-6',
    code: 'FG-TY-MAINJIG',
    name: 'Main Bracket Jig - Toyota Yaris',
    category: 'Finished Goods',
    quantity: 0,
    unit: 'set',
    unitCost: 28500000,
    minStock: 0,
    location: 'Warehouse D - Outgoing Racks',
    vendor: 'Internal Production'
  },
  {
    id: 'stock-7',
    code: 'FG-HI-SPACER',
    name: 'Aluminum Spacer - Hyundai Ioniq 5',
    category: 'Finished Goods',
    quantity: 0,
    unit: 'pcs',
    unitCost: 110000,
    minStock: 0,
    location: 'Warehouse D - Outgoing Racks',
    vendor: 'Internal Production'
  }
];

export const INITIAL_PURCHASING_LOGS: PurchasingLog[] = [
  {
    id: 'p-log-1',
    date: '2026-05-18',
    purchaseNo: 'PRC-2026-05-001',
    secondaryPONumber: 'SPO-PEMB-2026-001',
    supplier: 'PT. Steel Supply Center Indonesia',
    itemName: 'S50C Carbon Steel Block (120x300x500mm)',
    qty: 5,
    unit: 'pcs',
    unitPrice: 4200000,
    subtotal: 21000000,
    tax: 2310000, // 11% PPN
    grandTotal: 23310000,
    status: 'Paid'
  },
  {
    id: 'p-log-2',
    date: '2026-05-23',
    purchaseNo: 'PRC-2026-05-002',
    secondaryPONumber: 'SPO-PEMB-2026-002',
    supplier: 'PT. Krakatau Steel',
    itemName: 'SPCC Cold Rolled Steel Coil 1.6mm Thick',
    qty: 3,
    unit: 'tons',
    unitPrice: 15500000,
    subtotal: 46500000,
    tax: 5115000,
    grandTotal: 51615000,
    status: 'Paid'
  },
  {
    id: 'p-log-3',
    date: '2026-05-28',
    purchaseNo: 'PRC-2026-05-003',
    secondaryPONumber: 'SPO-PEMB-2026-003',
    supplier: 'PT. Toray Plastics Indonesia',
    itemName: 'ABS Plastic Resin - Matte Grade (Black)',
    qty: 2500,
    unit: 'kg',
    unitPrice: 32000,
    subtotal: 80000000,
    tax: 8800000,
    grandTotal: 88800000,
    status: 'Unpaid'
  }
];

export const INITIAL_SALES_LOGS: SalesLog[] = [
  {
    id: 's-log-1',
    date: '2026-04-20',
    salesNo: 'SLS-2026-04-001',
    primaryPONumber: 'PO-M-2026-005',
    clientName: 'PT. Hyundai Motor Manufacturing Indonesia',
    itemName: 'Aluminum Spacer Custom Milling (H-AS-091A)',
    qty: 500,
    unit: 'pcs',
    unitPrice: 180000,
    subtotal: 90000000,
    tax: 9900000, // 11% PPN
    grandTotal: 99900000,
    status: 'Paid'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-PTG-2026-04-010',
    dateCreated: '2026-04-20',
    dueDate: '2026-05-20',
    clientName: 'PT. Hyundai Motor Manufacturing Indonesia',
    clientAddress: 'Kawasan GIIC Blok CG No. 1, Cikarang Pusat, Bekasi 17530',
    primaryPOId: 'po-5',
    primaryPONumber: 'PO-M-2026-005',
    items: [
      {
        description: 'Aluminum Spacer Custom Milling (Part No. H-AS-091A) - Completed Production Job',
        qty: 500,
        unit: 'pcs',
        unitPrice: 180000,
        total: 90000000
      }
    ],
    subtotal: 90000000,
    tax: 9900000,
    grandTotal: 99900000,
    status: 'Paid',
    paymentDate: '2026-05-18',
    notes: 'Terima kasih atas kerja sama Anda.'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'spl-1',
    code: 'SPL-001',
    name: 'PT. Steel Supply Center Indonesia',
    phone: '021-8983000',
    email: 'sales@steelsupply.co.id',
    address: 'Kawasan Industri Jababeka II, Cikarang',
    category: 'Baja / Logam'
  },
  {
    id: 'spl-2',
    code: 'SPL-002',
    name: 'PT. Toray Plastics Indonesia',
    phone: '021-3908000',
    email: 'info@toray.co.id',
    address: 'Kawasan Industri MM2100, Cibitung',
    category: 'Plastik Resin'
  },
  {
    id: 'spl-3',
    code: 'SPL-003',
    name: 'PT. Jasa CNC Presisi',
    phone: '021-8240001',
    email: 'cnc.precision@domain.id',
    address: 'Jl. Tekno Raya No. 4, Karawang',
    category: 'Jasa Outsource'
  },
  {
    id: 'spl-4',
    code: 'SPL-004',
    name: 'PT. Krakatau Steel',
    phone: '0254-392111',
    email: 'partnership@krakatausteel.com',
    address: 'Cilegon, Banten',
    category: 'Baja / Logam'
  },
  {
    id: 'spl-5',
    code: 'SPL-005',
    name: 'PT. Misumi Indonesia',
    phone: '021-8971000',
    email: 'cs@misumi.co.id',
    address: 'Lippo Cikarang, Bekasi',
    category: 'Standard Parts'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    code: 'CST-001',
    name: 'PT. Hyundai Motor Manufacturing Indonesia',
    phone: '021-50808000',
    email: 'procurement@hyundai-indonesia.com',
    address: 'Kawasan GIIC Blok CG No. 1, Cikarang Pusat, Bekasi 17530',
    industry: 'Otomotif'
  },
  {
    id: 'cust-2',
    code: 'CST-002',
    name: 'PT. Astra Honda Motor',
    phone: '021-6518080',
    email: 'vendor.relation@ahm.co.id',
    address: 'Jl. Laksda Yos Sudarso, Sunter I, Jakarta',
    industry: 'Otomotif'
  },
  {
    id: 'cust-3',
    code: 'CST-003',
    name: 'PT. Yamaha Indonesia Motor Mfg.',
    phone: '021-4603100',
    email: 'purchase@yamaha-motor.co.id',
    address: 'Jl. Dr. KRT Radjiman Widyodiningrat, Cakung, Jakarta',
    industry: 'Otomotif'
  },
  {
    id: 'cust-4',
    code: 'CST-004',
    name: 'PT. Toyota Motor Manufacturing Indonesia',
    phone: '021-6515555',
    email: 'purchasing@toyota.co.id',
    address: 'Kawasan Industri KIIC, Karawang',
    industry: 'Otomotif'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'PRD-M026',
    name: 'Main Bracket Jig Assembly',
    category: 'Project',
    unit: 'set',
    defaultPrice: 45000000,
    description: 'Fixture jembatan untuk bracket penahan robotik pengelasan bodi.'
  },
  {
    id: 'prod-2',
    code: 'PRD-P051',
    name: 'Stopper Plate Metal Stamping',
    category: 'MassPro Stamping',
    unit: 'pcs',
    defaultPrice: 8500,
    description: 'Stopper penggeser kursi baris tengah.'
  },
  {
    id: 'prod-3',
    code: 'PRD-I088',
    name: 'Yamaha Front Cover L/R Plastic Injection',
    category: 'MassPro Injection',
    unit: 'pcs',
    defaultPrice: 16200,
    description: 'Cover panel depan berbahan resin ABS tahan benturan.'
  },
  {
    id: 'prod-4',
    code: 'PRD-S011',
    name: 'Guide Pins and Bushing Sets',
    category: 'Standard Part',
    unit: 'pcs',
    defaultPrice: 1250000,
    description: 'Set pin pelurus dan cetakan dies presisi tinggi.'
  },
  {
    id: 'prod-5',
    code: 'PRD-C099',
    name: 'Aluminum Spacer Custom Milling',
    category: 'Component',
    unit: 'pcs',
    defaultPrice: 180000,
    description: 'Spacer mesin cetakan bodi baterai mobil listrik.'
  }
];

