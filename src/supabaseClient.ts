/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { 
  PrimaryPO, 
  DepartmentPO, 
  StockItem, 
  PurchasingLog, 
  SalesLog, 
  Invoice, 
  Supplier, 
  Customer, 
  Product 
} from './types';

// Supabase URL & Key from Environment with client fallback as safety net
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://jieoejtskhpcvzkwnvkh.supabase.co";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZW9lanRza2hwY3Z6a3dudmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNjQ2MzcsImV4cCI6MjA5NjY0MDYzN30.EwZtRAPI5c0vJ0yT67qDD5ycwTZqgbNPtO3fPGTj44c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// UUID check/guard for Postgres safety
function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// ----------------------------------------------------
// MAPPERS: Translate snake_case tables to camelCase types
// ----------------------------------------------------

// 1. Primary PO
export function mapFromDbPrimaryPO(row: any): PrimaryPO {
  return {
    id: row.id,
    poNumber: row.po_number,
    category: row.category,
    projectName: row.project_name,
    itemName: row.item_name,
    partNo: row.part_no,
    qty: Number(row.qty || 0),
    unit: row.unit || 'pcs',
    unitPrice: Number(row.unit_price || 0),
    totalPrice: Number(row.total_price || 0),
    orderDate: row.order_date,
    targetDepartments: row.target_departments || [],
    status: row.status,
    deptStatuses: row.dept_statuses || {},
    notes: row.notes || ''
  };
}

export function mapToDbPrimaryPO(po: Partial<PrimaryPO>): any {
  const row: any = {};
  if (po.id && isUUID(po.id)) row.id = po.id;
  if (po.poNumber !== undefined) row.po_number = po.poNumber;
  if (po.category !== undefined) row.category = po.category;
  if (po.projectName !== undefined) row.project_name = po.projectName;
  if (po.itemName !== undefined) row.item_name = po.itemName;
  if (po.partNo !== undefined) row.part_no = po.partNo;
  if (po.qty !== undefined) row.qty = Number(po.qty);
  if (po.unit !== undefined) row.unit = po.unit;
  if (po.unitPrice !== undefined) row.unit_price = Number(po.unitPrice);
  if (po.orderDate !== undefined) row.order_date = po.orderDate;
  if (po.targetDepartments !== undefined) row.target_departments = po.targetDepartments;
  if (po.status !== undefined) row.status = po.status;
  if (po.deptStatuses !== undefined) row.dept_statuses = po.deptStatuses;
  if (po.notes !== undefined) row.notes = po.notes;
  return row;
}

// 2. Department PO
export function mapFromDbDeptPO(row: any): DepartmentPO {
  return {
    id: row.id,
    parentPOId: row.parent_po_id,
    parentPONumber: row.parent_po_number,
    departmentIssuer: row.department_issuer,
    secondaryPONumber: row.secondary_po_number,
    vendorName: row.vendor_name,
    itemName: row.item_name,
    qty: Number(row.qty || 0),
    unit: row.unit || 'pcs',
    unitPrice: Number(row.unit_price || 0),
    totalPrice: Number(row.total_price || 0),
    orderDate: row.order_date,
    status: row.status,
    notes: row.notes || ''
  };
}

export function mapToDbDeptPO(po: Partial<DepartmentPO>): any {
  const row: any = {};
  if (po.id && isUUID(po.id)) row.id = po.id;
  if (po.parentPOId && isUUID(po.parentPOId)) row.parent_po_id = po.parentPOId;
  if (po.parentPONumber !== undefined) row.parent_po_number = po.parentPONumber;
  if (po.departmentIssuer !== undefined) row.department_issuer = po.departmentIssuer;
  if (po.secondaryPONumber !== undefined) row.secondary_po_number = po.secondaryPONumber;
  if (po.vendorName !== undefined) row.vendor_name = po.vendorName;
  if (po.itemName !== undefined) row.item_name = po.itemName;
  if (po.qty !== undefined) row.qty = Number(po.qty);
  if (po.unit !== undefined) row.unit = po.unit;
  if (po.unitPrice !== undefined) row.unit_price = Number(po.unitPrice);
  if (po.orderDate !== undefined) row.order_date = po.orderDate;
  if (po.status !== undefined) row.status = po.status;
  if (po.notes !== undefined) row.notes = po.notes;
  return row;
}

// 3. Stock Item
export function mapFromDbStockItem(row: any): StockItem {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    quantity: Number(row.quantity || 0),
    unit: row.unit || 'pcs',
    unitCost: Number(row.unit_cost || 0),
    minStock: Number(row.min_stock || 0),
    location: row.location || '',
    vendor: row.vendor || ''
  };
}

export function mapToDbStockItem(item: Partial<StockItem>): any {
  const row: any = {};
  if (item.id && isUUID(item.id)) row.id = item.id;
  if (item.code !== undefined) row.code = item.code;
  if (item.name !== undefined) row.name = item.name;
  if (item.category !== undefined) row.category = item.category;
  if (item.quantity !== undefined) row.quantity = Number(item.quantity);
  if (item.unit !== undefined) row.unit = item.unit;
  if (item.unitCost !== undefined) row.unit_cost = Number(item.unitCost);
  if (item.minStock !== undefined) row.min_stock = Number(item.minStock || 0);
  if (item.location !== undefined) row.location = item.location;
  if (item.vendor !== undefined) row.vendor = item.vendor;
  return row;
}

// 4. Purchasing Log
export function mapFromDbPurchasingLog(row: any): PurchasingLog {
  return {
    id: row.id,
    date: row.date,
    purchaseNo: row.purchase_no,
    secondaryPONumber: row.secondary_po_number || '',
    supplier: row.supplier,
    itemName: row.item_name,
    qty: Number(row.qty || 0),
    unit: row.unit || 'pcs',
    unitPrice: Number(row.unit_price || 0),
    subtotal: Number(row.subtotal || 0),
    tax: Number(row.tax || 0),
    grandTotal: Number(row.grand_total || 0),
    status: row.status
  };
}

export function mapToDbPurchasingLog(log: Partial<PurchasingLog>): any {
  const row: any = {};
  if (log.id && isUUID(log.id)) row.id = log.id;
  if (log.date !== undefined) row.date = log.date;
  if (log.purchaseNo !== undefined) row.purchase_no = log.purchaseNo;
  if (log.secondaryPONumber !== undefined) row.secondary_po_number = log.secondaryPONumber;
  if (log.supplier !== undefined) row.supplier = log.supplier;
  if (log.itemName !== undefined) row.item_name = log.itemName;
  if (log.qty !== undefined) row.qty = Number(log.qty);
  if (log.unit !== undefined) row.unit = log.unit;
  if (log.unitPrice !== undefined) row.unit_price = Number(log.unitPrice);
  if (log.subtotal !== undefined) row.subtotal = Number(log.subtotal);
  if (log.tax !== undefined) row.tax = Number(log.tax);
  if (log.grandTotal !== undefined) row.grand_total = Number(log.grandTotal);
  if (log.status !== undefined) row.status = log.status;
  return row;
}

// 5. Sales Log
export function mapFromDbSalesLog(row: any): SalesLog {
  return {
    id: row.id,
    date: row.date,
    salesNo: row.sales_no,
    primaryPONumber: row.primary_po_number,
    clientName: row.client_name,
    itemName: row.item_name,
    qty: Number(row.qty || 0),
    unit: row.unit || 'pcs',
    unitPrice: Number(row.unit_price || 0),
    subtotal: Number(row.subtotal || 0),
    tax: Number(row.tax || 0),
    grandTotal: Number(row.grand_total || 0),
    status: row.status
  };
}

export function mapToDbSalesLog(log: Partial<SalesLog>): any {
  const row: any = {};
  if (log.id && isUUID(log.id)) row.id = log.id;
  if (log.date !== undefined) row.date = log.date;
  if (log.salesNo !== undefined) row.sales_no = log.salesNo;
  if (log.primaryPONumber !== undefined) row.primary_po_number = log.primaryPONumber;
  if (log.clientName !== undefined) row.client_name = log.clientName;
  if (log.itemName !== undefined) row.item_name = log.itemName;
  if (log.qty !== undefined) row.qty = Number(log.qty);
  if (log.unit !== undefined) row.unit = log.unit;
  if (log.unitPrice !== undefined) row.unit_price = Number(log.unitPrice);
  if (log.subtotal !== undefined) row.subtotal = Number(log.subtotal);
  if (log.tax !== undefined) row.tax = Number(log.tax);
  if (log.grandTotal !== undefined) row.grand_total = Number(log.grandTotal);
  if (log.status !== undefined) row.status = log.status;
  return row;
}

// 6. Invoice
export function mapFromDbInvoice(row: any): Invoice {
  return {
    id: row.id,
    invoiceNo: row.invoice_no,
    dateCreated: row.date_created,
    dueDate: row.due_date,
    clientName: row.client_name,
    clientAddress: row.client_address || '',
    primaryPOId: row.primary_po_id || '',
    primaryPONumber: row.primary_po_number,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal || 0),
    tax: Number(row.tax || 0),
    grandTotal: Number(row.grand_total || 0),
    status: row.status,
    paymentDate: row.payment_date || undefined,
    notes: row.notes || ''
  };
}

export function mapToDbInvoice(inv: Partial<Invoice>): any {
  const row: any = {};
  if (inv.id && isUUID(inv.id)) row.id = inv.id;
  if (inv.invoiceNo !== undefined) row.invoice_no = inv.invoiceNo;
  if (inv.dateCreated !== undefined) row.date_created = inv.dateCreated;
  if (inv.dueDate !== undefined) row.due_date = inv.dueDate;
  if (inv.clientName !== undefined) row.client_name = inv.clientName;
  if (inv.clientAddress !== undefined) row.client_address = inv.clientAddress;
  if (inv.primaryPOId && isUUID(inv.primaryPOId)) row.primary_po_id = inv.primaryPOId;
  if (inv.primaryPONumber !== undefined) row.primary_po_number = inv.primaryPONumber;
  if (inv.items !== undefined) row.items = inv.items;
  if (inv.subtotal !== undefined) row.subtotal = Number(inv.subtotal);
  if (inv.tax !== undefined) row.tax = Number(inv.tax);
  if (inv.grandTotal !== undefined) row.grand_total = Number(inv.grandTotal);
  if (inv.status !== undefined) row.status = inv.status;
  if (inv.paymentDate !== undefined) row.payment_date = inv.paymentDate || null;
  if (inv.notes !== undefined) row.notes = inv.notes;
  return row;
}

// 7. Supplier
export function mapFromDbSupplier(row: any): Supplier {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    category: row.category || ''
  };
}

export function mapToDbSupplier(s: Partial<Supplier>): any {
  const row: any = {};
  if (s.id && isUUID(s.id)) row.id = s.id;
  if (s.code !== undefined) row.code = s.code;
  if (s.name !== undefined) row.name = s.name;
  if (s.phone !== undefined) row.phone = s.phone;
  if (s.email !== undefined) row.email = s.email;
  if (s.address !== undefined) row.address = s.address;
  if (s.category !== undefined) row.category = s.category;
  return row;
}

// 8. Customer
export function mapFromDbCustomer(row: any): Customer {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    industry: row.industry || ''
  };
}

export function mapToDbCustomer(c: Partial<Customer>): any {
  const row: any = {};
  if (c.id && isUUID(c.id)) row.id = c.id;
  if (c.code !== undefined) row.code = c.code;
  if (c.name !== undefined) row.name = c.name;
  if (c.phone !== undefined) row.phone = c.phone;
  if (c.email !== undefined) row.email = c.email;
  if (c.address !== undefined) row.address = c.address;
  if (c.industry !== undefined) row.industry = c.industry;
  return row;
}

// 9. Product
export function mapFromDbProduct(row: any): Product {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    unit: row.unit || 'pcs',
    defaultPrice: Number(row.default_price || 0),
    description: row.description || ''
  };
}

export function mapToDbProduct(p: Partial<Product>): any {
  const row: any = {};
  if (p.id && isUUID(p.id)) row.id = p.id;
  if (p.code !== undefined) row.code = p.code;
  if (p.name !== undefined) row.name = p.name;
  if (p.category !== undefined) row.category = p.category;
  if (p.unit !== undefined) row.unit = p.unit;
  if (p.defaultPrice !== undefined) row.default_price = Number(p.defaultPrice);
  if (p.description !== undefined) row.description = p.description;
  return row;
}


// ----------------------------------------------------
// DB READ & WRITE OPERATIONS
// ----------------------------------------------------

export const DbService = {
  // Primary POs
  async getPrimaryPOs(): Promise<PrimaryPO[]> {
    const { data, error } = await supabase.from('primary_pos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapFromDbPrimaryPO);
  },
  async insertPrimaryPO(po: Omit<PrimaryPO, 'id'>): Promise<PrimaryPO> {
    const dbData = mapToDbPrimaryPO(po);
    const { data, error } = await supabase.from('primary_pos').insert(dbData).select().single();
    if (error) throw error;
    return mapFromDbPrimaryPO(data);
  },
  async updatePrimaryPO(id: string, po: Partial<PrimaryPO>): Promise<PrimaryPO> {
    const dbData = mapToDbPrimaryPO(po);
    const { data, error } = await supabase.from('primary_pos').update(dbData).eq('id', id).select().single();
    if (error) throw error;
    return mapFromDbPrimaryPO(data);
  },

  // Department POs
  async getDeptPOs(): Promise<DepartmentPO[]> {
    const { data, error } = await supabase.from('department_pos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapFromDbDeptPO);
  },
  async insertDeptPO(po: Omit<DepartmentPO, 'id'>): Promise<DepartmentPO> {
    const dbData = mapToDbDeptPO(po);
    const { data, error } = await supabase.from('department_pos').insert(dbData).select().single();
    if (error) throw error;
    return mapFromDbDeptPO(data);
  },
  async updateDeptPO(id: string, po: Partial<DepartmentPO>): Promise<DepartmentPO> {
    const dbData = mapToDbDeptPO(po);
    const { data, error } = await supabase.from('department_pos').update(dbData).eq('id', id).select().single();
    if (error) throw error;
    return mapFromDbDeptPO(data);
  },

  // Stock Items
  async getStockItems(): Promise<StockItem[]> {
    const { data, error } = await supabase.from('stock_items').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapFromDbStockItem);
  },
  async insertStockItem(item: Omit<StockItem, 'id'>): Promise<StockItem> {
    const dbData = mapToDbStockItem(item);
    const { data, error } = await supabase.from('stock_items').insert(dbData).select().single();
    if (error) throw error;
    return mapFromDbStockItem(data);
  },
  async updateStockItem(id: string, item: Partial<StockItem>): Promise<StockItem> {
    const dbData = mapToDbStockItem(item);
    const { data, error } = await supabase.from('stock_items').update(dbData).eq('id', id).select().single();
    if (error) throw error;
    return mapFromDbStockItem(data);
  },

  // Purchasing Logs
  async getPurchasingLogs(): Promise<PurchasingLog[]> {
    const { data, error } = await supabase.from('purchasing_logs').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapFromDbPurchasingLog);
  },
  async insertPurchasingLog(log: Omit<PurchasingLog, 'id'>): Promise<PurchasingLog> {
    const dbData = mapToDbPurchasingLog(log);
    const { data, error } = await supabase.from('purchasing_logs').insert(dbData).select().single();
    if (error) throw error;
    return mapFromDbPurchasingLog(data);
  },

  // Sales Logs
  async getSalesLogs(): Promise<SalesLog[]> {
    const { data, error } = await supabase.from('sales_logs').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapFromDbSalesLog);
  },
  async insertSalesLog(log: Omit<SalesLog, 'id'>): Promise<SalesLog> {
    const dbData = mapToDbSalesLog(log);
    const { data, error } = await supabase.from('sales_logs').insert(dbData).select().single();
    if (error) throw error;
    return mapFromDbSalesLog(data);
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase.from('invoices').select('*').order('date_created', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapFromDbInvoice);
  },
  async insertInvoice(inv: Omit<Invoice, 'id'>): Promise<Invoice> {
    const dbData = mapToDbInvoice(inv);
    const { data, error } = await supabase.from('invoices').insert(dbData).select().single();
    if (error) throw error;
    return mapFromDbInvoice(data);
  },
  async updateInvoice(id: string, inv: Partial<Invoice>): Promise<Invoice> {
    const dbData = mapToDbInvoice(inv);
    const { data, error } = await supabase.from('invoices').update(dbData).eq('id', id).select().single();
    if (error) throw error;
    return mapFromDbInvoice(data);
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapFromDbSupplier);
  },
  async insertSupplier(sup: Omit<Supplier, 'id'>): Promise<Supplier> {
    const dbData = mapToDbSupplier(sup);
    const { data, error } = await supabase.from('suppliers').insert(dbData).select().single();
    if (error) throw error;
    return mapFromDbSupplier(data);
  },
  async updateSupplier(id: string, sup: Partial<Supplier>): Promise<Supplier> {
    const dbData = mapToDbSupplier(sup);
    const { data, error } = await supabase.from('suppliers').update(dbData).eq('id', id).select().single();
    if (error) throw error;
    return mapFromDbSupplier(data);
  },
  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase.from('customers').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapFromDbCustomer);
  },
  async insertCustomer(cust: Omit<Customer, 'id'>): Promise<Customer> {
    const dbData = mapToDbCustomer(cust);
    const { data, error } = await supabase.from('customers').insert(dbData).select().single();
    if (error) throw error;
    return mapFromDbCustomer(data);
  },
  async updateCustomer(id: string, cust: Partial<Customer>): Promise<Customer> {
    const dbData = mapToDbCustomer(cust);
    const { data, error } = await supabase.from('customers').update(dbData).eq('id', id).select().single();
    if (error) throw error;
    return mapFromDbCustomer(data);
  },
  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapFromDbProduct);
  },
  async insertProduct(prod: Omit<Product, 'id'>): Promise<Product> {
    const dbData = mapToDbProduct(prod);
    const { data, error } = await supabase.from('products').insert(dbData).select().single();
    if (error) throw error;
    return mapFromDbProduct(data);
  },
  async updateProduct(id: string, prod: Partial<Product>): Promise<Product> {
    const dbData = mapToDbProduct(prod);
    const { data, error } = await supabase.from('products').update(dbData).eq('id', id).select().single();
    if (error) throw error;
    return mapFromDbProduct(data);
  },
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }
};
