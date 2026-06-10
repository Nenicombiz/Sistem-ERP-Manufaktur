-- ==========================================
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
-- Tabel Customer (Sesuai Master Register)
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

-- Tabel Supplier (Sesuai Master Register)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    category VARCHAR(100) NOT NULL, -- Baja, Plastik Resin, Standard Parts, Outsource dsb.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email VARCHAR(100);

-- Tabel Product Template (Sesuai Master Katalog Produk)
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
-- Tabel PO Klien / Primary PO
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
    dept_statuses JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"Design Mekanik": "Waiting"}
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel PO Sekunder Internal (Kebutuhan Material/Jasa Outsource Departemen)
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

-- Tabel Persediaan / Warehouse Stock Ledger
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
-- Log Pembelian (Pengeluaran COGS & PPN Masukan)
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
    tax DECIMAL(15, 2) NOT NULL, -- PPN 11%
    grand_total DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Paid' CHECK (status IN ('Paid', 'Unpaid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log Penjualan (Pendapatan & PPN Keluaran)
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
    tax DECIMAL(15, 2) NOT NULL, -- PPN 11%
    grand_total DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Paid' CHECK (status IN ('Draft', 'Invoiced', 'Paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Invoice Penagihan Klien (Komersial)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no VARCHAR(100) UNIQUE NOT NULL,
    date_created DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_address TEXT,
    primary_po_id UUID REFERENCES primary_pos(id) ON DELETE SET NULL,
    primary_po_number VARCHAR(100) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- detail pos pekerjaan komersial
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- PPN 11%
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
