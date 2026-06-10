/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ManufacturingDepartment, PrimaryPO } from './types';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

export const DEPARTMENTS: ManufacturingDepartment[] = [
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
];

export function getDeptColor(status?: string): string {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-500 text-white';
    case 'Action Taken':
      return 'bg-blue-500 text-white';
    case 'In Progress':
      return 'bg-amber-500 text-white';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700';
  }
}

export function getPOStatusColor(status: PrimaryPO['status']): string {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'In Progress':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
}
