/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type POCategory = 
  | 'Component' 
  | 'Project' 
  | 'Standard Part' 
  | 'MassPro Machining' 
  | 'MassPro Stamping' 
  | 'MassPro Injection';

export type ManufacturingDepartment =
  | 'General Admin'
  | 'Design Mekanik'
  | 'Design Electric'
  | 'Proccessing'
  | 'Assembly'
  | 'PPIC Delivery'
  | 'MassPro Machine'
  | 'MassPro Stamping'
  | 'MassPro Injection'
  | 'Pembelian'
  | 'Quality Control';

export interface PrimaryPO {
  id: string;
  poNumber: string;
  category: POCategory;
  projectName: string;
  itemName: string;
  partNo: string;
  qty: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  orderDate: string;
  targetDepartments: ManufacturingDepartment[];
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  deptStatuses: { [key in ManufacturingDepartment]?: 'Waiting' | 'In Progress' | 'Action Taken' | 'Approved' };
  notes?: string;
  customerId?: string;
  productId?: string;
}

export interface DepartmentPO {
  id: string;
  parentPOId: string;
  parentPONumber: string;
  departmentIssuer: ManufacturingDepartment;
  secondaryPONumber: string;
  vendorName: string;
  itemName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  orderDate: string;
  status: 'Issued' | 'Received' | 'Invoiced' | 'Paid';
  notes?: string;
}

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  minStock: number;
  location: string;
  vendor: string;
}

export interface PurchasingLog {
  id: string;
  date: string;
  purchaseNo: string;
  secondaryPONumber?: string;
  supplier: string;
  itemName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  tax: number; // PPN 11%
  grandTotal: number;
  status: 'Paid' | 'Unpaid';
}

export interface SalesLog {
  id: string;
  date: string;
  salesNo: string;
  primaryPONumber: string;
  clientName: string;
  itemName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  tax: number; // PPN 11%
  grandTotal: number;
  status: 'Draft' | 'Invoiced' | 'Paid';
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  dateCreated: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  primaryPOId: string;
  primaryPONumber: string;
  items: Array<{
    description: string;
    qty: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number; // PPN 11%
  grandTotal: number;
  status: 'Unpaid' | 'Paid' | 'Overdue';
  paymentDate?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  category: string; // e.g., 'Baja', 'Plastik Resin', 'Standard Parts', 'Jasa Outsource'
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  industry: string; // e.g., 'Automotive', 'Electronics', 'Heavy Equipment'
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: POCategory;
  unit: string;
  defaultPrice: number;
  description: string;
}

