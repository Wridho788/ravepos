import {NativeModules} from 'react-native';

type Row = Record<string, string | number | null>;
type SqlResult = {rows?: Row[]; changes?: number; insertId?: number};
type Statement = {sql: string; params?: unknown[]};
type SqliteBridge = {
  execute(sql: string, params: unknown[]): Promise<SqlResult>;
  executeBatch(statements: Statement[]): Promise<SqlResult[]>;
  saveFile(contents: string, filename: string, mimeType: string): Promise<string>;
  saveExcel(contents: string, filename: string): Promise<string>;
};

const nativeDb = NativeModules.RavaSqlite as SqliteBridge;
if (!NativeModules.RavaSqlite) { throw new Error('SQLite Android module tidak terpasang.'); }

const run = (sql: string, params: unknown[] = []) => nativeDb.execute(sql, params);
const batch = (statements: Statement[]) => nativeDb.executeBatch(statements.map(item => ({...item, params: item.params ?? []})));
const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
const now = () => new Date().toISOString();

export type Product = {id: string; name: string; category: string; sku: string; price: number; cost: number; stock: number; lowStock: number; unit: string; active: number};
export type Customer = {id: string; name: string; phone: string; note: string};
export type Expense = {id: string; category: string; amount: number; spentAt: string; note: string};
export type CartLine = {product: Product; quantity: number};

const product = (row: Row): Product => ({id: String(row.id), name: String(row.name), category: String(row.category ?? 'Umum'), sku: String(row.sku ?? ''), price: Number(row.salePrice), cost: Number(row.costPrice ?? 0), stock: Number(row.stockQty), lowStock: Number(row.lowStockThreshold ?? 0), unit: String(row.unit ?? 'pcs'), active: Number(row.isActive)});
const customer = (row: Row): Customer => ({id: String(row.id), name: String(row.name), phone: String(row.phone ?? ''), note: String(row.note ?? '')});
const expense = (row: Row): Expense => ({id: String(row.id), category: String(row.category), amount: Number(row.amount), spentAt: String(row.spentAt), note: String(row.note ?? '')});

let initialized: Promise<void> | undefined;
export function initializeDatabase(): Promise<void> {
  if (initialized) return initialized;
  initialized = (async () => {
    await run('PRAGMA foreign_keys = ON');
    const version = await run('PRAGMA user_version');
    if (Number(version.rows?.[0]?.user_version ?? 0) > 1) throw new Error('Database dibuat oleh versi aplikasi yang lebih baru.');
    const tables = [
      `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updatedAt TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, sku TEXT, barcode TEXT, categoryId TEXT REFERENCES categories(id), salePrice INTEGER NOT NULL CHECK(salePrice>=0), costPrice INTEGER, stockQty INTEGER NOT NULL DEFAULT 0 CHECK(stockQty>=0), lowStockThreshold INTEGER NOT NULL DEFAULT 0, unit TEXT NOT NULL DEFAULT 'pcs', isActive INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT, note TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS sales (id TEXT PRIMARY KEY, receiptNumber TEXT NOT NULL UNIQUE, soldAt TEXT NOT NULL, subtotal INTEGER NOT NULL, discountAmount INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL, paymentMethod TEXT NOT NULL, amountPaid INTEGER NOT NULL, changeAmount INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'COMPLETED', customerId TEXT REFERENCES customers(id), note TEXT, voidReason TEXT, createdAt TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS saleItems (id TEXT PRIMARY KEY, saleId TEXT NOT NULL REFERENCES sales(id), productId TEXT REFERENCES products(id), productName TEXT NOT NULL, sku TEXT, unitPrice INTEGER NOT NULL, quantity INTEGER NOT NULL, discountAmount INTEGER NOT NULL DEFAULT 0, lineTotal INTEGER NOT NULL, costPriceSnapshot INTEGER)`,
      `CREATE TABLE IF NOT EXISTS stockMovements (id TEXT PRIMARY KEY, productId TEXT NOT NULL REFERENCES products(id), type TEXT NOT NULL, quantityDelta INTEGER NOT NULL, referenceId TEXT, reason TEXT, createdAt TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS receivables (id TEXT PRIMARY KEY, saleId TEXT NOT NULL UNIQUE REFERENCES sales(id), customerId TEXT REFERENCES customers(id), originalAmount INTEGER NOT NULL, paidAmount INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'UNPAID', createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS receivablePayments (id TEXT PRIMARY KEY, receivableId TEXT NOT NULL REFERENCES receivables(id), amount INTEGER NOT NULL CHECK(amount>0), paidAt TEXT NOT NULL, method TEXT NOT NULL, note TEXT)`,
      `CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, category TEXT NOT NULL, amount INTEGER NOT NULL CHECK(amount>0), spentAt TEXT NOT NULL, note TEXT, createdAt TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS auditEvents (id TEXT PRIMARY KEY, entityType TEXT NOT NULL, entityId TEXT NOT NULL, action TEXT NOT NULL, reason TEXT, createdAt TEXT NOT NULL)`,
      `CREATE INDEX IF NOT EXISTS idx_sales_soldAt ON sales(soldAt)`,
      `CREATE INDEX IF NOT EXISTS idx_items_product ON saleItems(productId)`,
      `CREATE INDEX IF NOT EXISTS idx_expenses_spentAt ON expenses(spentAt)`,
      `CREATE TRIGGER IF NOT EXISTS prevent_negative_stock BEFORE UPDATE OF stockQty ON products WHEN NEW.stockQty < 0 BEGIN SELECT RAISE(ABORT, 'Stok tidak cukup'); END`,
      `CREATE TRIGGER IF NOT EXISTS prevent_overpayment BEFORE INSERT ON receivablePayments WHEN (SELECT paidAmount + NEW.amount > originalAmount FROM receivables WHERE id=NEW.receivableId) BEGIN SELECT RAISE(ABORT, 'Pembayaran melebihi saldo'); END`,
      `CREATE TRIGGER IF NOT EXISTS apply_receivable_payment AFTER INSERT ON receivablePayments BEGIN UPDATE receivables SET paidAmount=paidAmount+NEW.amount, status=CASE WHEN paidAmount+NEW.amount>=originalAmount THEN 'PAID' ELSE 'PARTIAL' END, updatedAt=NEW.paidAt WHERE id=NEW.receivableId; END`,
    ];
    await batch([...tables.map(sql => ({sql})), {sql: 'PRAGMA user_version = 1'}]);
    const settings = await run(`SELECT value FROM settings WHERE key='storeName'`);
    if (!settings.rows?.length) {
      const stamp = now();
      await batch([
        {sql: 'INSERT INTO settings(key,value,updatedAt) VALUES(?,?,?)', params: ['storeName', 'Toko Saya', stamp]},
        {sql: 'INSERT INTO settings(key,value,updatedAt) VALUES(?,?,?)', params: ['setupComplete', '0', stamp]},
      ]);
    }
  })().catch(error => { initialized = undefined; throw error; });
  return initialized;
}

export async function getSetting(key: string): Promise<string> {
  const result = await run('SELECT value FROM settings WHERE key=?', [key]);
  return String(result.rows?.[0]?.value ?? '');
}
export async function setSetting(key: string, value: string) {
  await run('INSERT INTO settings(key,value,updatedAt) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updatedAt=excluded.updatedAt', [key, value, now()]);
}
export async function listProducts(): Promise<Product[]> {
  const result = await run('SELECT p.*,COALESCE(c.name,\'Umum\') AS category FROM products p LEFT JOIN categories c ON c.id=p.categoryId WHERE p.isActive=1 ORDER BY p.name COLLATE NOCASE');
  return (result.rows ?? []).map(product);
}
export async function saveProduct(value: Omit<Product, 'id'|'active'> & {id?: string}) {
  const productId = value.id ?? id(); const stamp = now(); const categoryId = id();
  await batch([
    {sql: 'INSERT INTO categories(id,name,createdAt,updatedAt) VALUES(?,?,?,?) ON CONFLICT(name) DO NOTHING', params: [categoryId, value.category || 'Umum', stamp, stamp]},
    {sql: 'INSERT INTO products(id,name,sku,categoryId,salePrice,costPrice,stockQty,lowStockThreshold,unit,isActive,createdAt,updatedAt) VALUES(?,?,?,(SELECT id FROM categories WHERE name=?),?,?,?,?,?,1,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,sku=excluded.sku,categoryId=excluded.categoryId,salePrice=excluded.salePrice,costPrice=excluded.costPrice,lowStockThreshold=excluded.lowStockThreshold,unit=excluded.unit,updatedAt=excluded.updatedAt', params: [productId, value.name, value.sku || null, value.category || 'Umum', value.price, value.cost || null, value.stock, value.lowStock, value.unit || 'pcs', stamp, stamp]},
  ]);
  if (!value.id && value.stock > 0) await run('INSERT INTO stockMovements(id,productId,type,quantityDelta,reason,createdAt) VALUES(?,?,?,?,?,?)', [id(), productId, 'OPENING', value.stock, 'Stok awal', stamp]);
}
export async function adjustStock(productId: string, delta: number, reason: string) {
  if (!Number.isInteger(delta) || delta === 0) throw new Error('Jumlah penyesuaian harus bilangan bulat bukan nol.');
  await batch([
    {sql: 'UPDATE products SET stockQty=stockQty+?,updatedAt=? WHERE id=?', params: [delta, now(), productId]},
    {sql: 'INSERT INTO stockMovements(id,productId,type,quantityDelta,reason,createdAt) VALUES(?,?,?,?,?,?)', params: [id(), productId, 'ADJUSTMENT', delta, reason.trim(), now()]},
  ]);
}
export async function listCustomers(): Promise<Customer[]> {
  const result = await run('SELECT * FROM customers ORDER BY name COLLATE NOCASE'); return (result.rows ?? []).map(customer);
}
export async function saveCustomer(name: string, phone: string, note = '') {
  const stamp = now(); await run('INSERT INTO customers(id,name,phone,note,createdAt,updatedAt) VALUES(?,?,?,?,?,?)', [id(), name.trim(), phone.trim() || null, note.trim() || null, stamp, stamp]);
}
export async function listReceivables(): Promise<Row[]> {
  const result = await run(`SELECT r.*,c.name AS customerName,s.receiptNumber FROM receivables r LEFT JOIN customers c ON c.id=r.customerId JOIN sales s ON s.id=r.saleId WHERE r.status IN ('UNPAID','PARTIAL') ORDER BY r.createdAt`); return result.rows ?? [];
}
export async function addReceivablePayment(receivableId: string, amount: number) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Nominal pembayaran harus lebih dari nol.');
  await run('INSERT INTO receivablePayments(id,receivableId,amount,paidAt,method) VALUES(?,?,?,?,?)', [id(), receivableId, amount, now(), 'Tunai']);
}
export async function listExpenses(): Promise<Expense[]> {
  const result = await run('SELECT * FROM expenses ORDER BY spentAt DESC,createdAt DESC'); return (result.rows ?? []).map(expense);
}
export async function addExpense(category: string, amount: number, note: string) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Nominal pengeluaran harus lebih dari nol.');
  const stamp = now(); await run('INSERT INTO expenses(id,category,amount,spentAt,note,createdAt) VALUES(?,?,?,?,?,?)', [id(), category.trim(), amount, stamp, note.trim() || null, stamp]);
}
export async function resetBusinessData() {
  await batch(['auditEvents','expenses','receivablePayments','receivables','stockMovements','saleItems','sales','customers','products','categories'].map(table => ({sql: `DELETE FROM ${table}`})));
}
export async function seedDemoData() {
  if ((await listProducts()).length) throw new Error('Data contoh hanya dapat ditambahkan ke toko yang masih kosong.');
  const items = [
    ['Air Mineral 600 ml','Minuman',4000,2200,18,5],['Mi Goreng','Makanan',3500,2600,24,6],['Kopi Susu','Minuman',6000,3500,9,3],
    ['Roti Cokelat','Makanan',5000,3000,7,3],['Sabun Mandi','Rumah tangga',6500,4200,12,4],['Teh Botol','Minuman',5000,3200,15,4],
  ] as const;
  for (const [name,category,price,cost,stock,lowStock] of items) await saveProduct({name,category,sku:'',price,cost,stock,lowStock,unit:'pcs'});
  await saveCustomer('Pelanggan Demo','');
}
export async function checkout(lines: CartLine[], method: string, amountPaid: number, customerId: string | null, onCredit: boolean) {
  if (!lines.length) throw new Error('Keranjang masih kosong.');
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const paid = onCredit ? 0 : method === 'Tunai' ? amountPaid : total;
  if (paid < total && !onCredit) throw new Error('Pembayaran belum mencukupi.');
  if (onCredit && !customerId) throw new Error('Pilih pelanggan untuk transaksi piutang.');
  const saleId = id(); const stamp = now(); const receipt = `R${Date.now()}`;
  const statements: Statement[] = [{sql: 'INSERT INTO sales(id,receiptNumber,soldAt,subtotal,total,paymentMethod,amountPaid,changeAmount,status,customerId,createdAt) VALUES(?,?,?,?,?,?,?,?,?,?,?)', params: [saleId, receipt, stamp, total, total, onCredit ? 'PIUTANG' : method, paid, Math.max(0, paid-total), 'COMPLETED', customerId, stamp]}];
  for (const line of lines) {
    statements.push({sql: 'UPDATE products SET stockQty=stockQty-?,updatedAt=? WHERE id=? AND isActive=1', params: [line.quantity, stamp, line.product.id]});
    statements.push({sql: 'INSERT INTO saleItems(id,saleId,productId,productName,sku,unitPrice,quantity,lineTotal,costPriceSnapshot) VALUES(?,?,?,?,?,?,?,?,?)', params: [id(), saleId, line.product.id, line.product.name, line.product.sku || null, line.product.price, line.quantity, line.product.price * line.quantity, line.product.cost]});
    statements.push({sql: 'INSERT INTO stockMovements(id,productId,type,quantityDelta,referenceId,reason,createdAt) VALUES(?,?,?,?,?,?,?)', params: [id(), line.product.id, 'SALE', -line.quantity, saleId, `Penjualan ${receipt}`, stamp]});
  }
  if (onCredit) statements.push({sql: 'INSERT INTO receivables(id,saleId,customerId,originalAmount,paidAmount,status,createdAt,updatedAt) VALUES(?,?,?,?,0,?,?,?)', params: [id(), saleId, customerId, total, 'UNPAID', stamp, stamp]});
  statements.push({sql: 'INSERT INTO auditEvents(id,entityType,entityId,action,createdAt) VALUES(?,?,?,?,?)', params: [id(), 'sale', saleId, 'CHECKOUT', stamp]});
  await batch(statements);
  return {saleId, receipt, total, change: Math.max(0, paid-total)};
}

export async function getReport() {
  const today = new Date(); today.setHours(0,0,0,0);
  const start = today.toISOString();
  const sums = await run(`SELECT COUNT(*) AS count,COALESCE(SUM(total),0) AS sales FROM sales WHERE status='COMPLETED' AND soldAt>=?`, [start]);
  const expenses = await run('SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE spentAt>=?', [start]);
  const best = await run('SELECT productName,SUM(quantity) AS quantity,SUM(lineTotal) AS total FROM saleItems JOIN sales ON sales.id=saleItems.saleId WHERE sales.status=\'COMPLETED\' AND sales.soldAt>=? GROUP BY productName ORDER BY quantity DESC LIMIT 5', [start]);
  const methods = await run('SELECT paymentMethod,COUNT(*) AS count,SUM(total) AS total FROM sales WHERE status=\'COMPLETED\' AND soldAt>=? GROUP BY paymentMethod ORDER BY total DESC', [start]);
  return {count: Number(sums.rows?.[0]?.count ?? 0), sales: Number(sums.rows?.[0]?.sales ?? 0), expenses: Number(expenses.rows?.[0]?.total ?? 0), best: best.rows ?? [], methods: methods.rows ?? []};
}
export type ExportKind = 'sales'|'products'|'expenses'|'customers';
const exportFields: Record<ExportKind, [string, string][]> = {
  sales: [['Nomor struk','receiptNumber'],['Tanggal','soldAt'],['Total (Rp)','total'],['Metode pembayaran','paymentMethod'],['Dibayar (Rp)','amountPaid'],['Status','status']],
  products: [['Nama produk','name'],['SKU','sku'],['Kategori','category'],['Harga jual (Rp)','salePrice'],['Harga modal (Rp)','costPrice'],['Stok','stockQty'],['Satuan','unit']],
  expenses: [['Kategori','category'],['Jumlah (Rp)','amount'],['Tanggal','spentAt'],['Catatan','note']],
  customers: [['Nama pelanggan','name'],['Telepon','phone'],['Catatan','note']],
};
async function getExportRows(kind: ExportKind): Promise<Row[]> {
  const queries: Record<ExportKind, string> = {
    sales: 'SELECT receiptNumber,soldAt,total,paymentMethod,amountPaid,status FROM sales ORDER BY soldAt DESC',
    products: 'SELECT products.name,sku,categories.name AS category,salePrice,costPrice,stockQty,unit FROM products LEFT JOIN categories ON categories.id=products.categoryId WHERE isActive=1 ORDER BY products.name',
    expenses: 'SELECT category,amount,spentAt,note FROM expenses ORDER BY spentAt DESC',
    customers: 'SELECT name,phone,note FROM customers ORDER BY name COLLATE NOCASE',
  };
  return (await run(queries[kind])).rows ?? [];
}
export async function exportCsv(kind: ExportKind) {
  const rows = await getExportRows(kind);
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const fields = exportFields[kind];
  const csv = [fields.map(([label]) => escape(label)).join(','), ...rows.map(row => fields.map(([, key]) => escape(row[key])).join(','))].join('\r\n');
  return nativeDb.saveFile('\ufeff' + csv, `ravapos-${kind}-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
}
export async function exportExcel(kind: ExportKind) {
  const rows = await getExportRows(kind);
  const fields = exportFields[kind];
  const headers = fields.map(([label]) => label);
  const values = rows.map(row => fields.map(([, key]) => row[key] ?? ''));
  return nativeDb.saveExcel(JSON.stringify({headers, rows: values}), `ravapos-${kind}-${new Date().toISOString().slice(0,10)}.xlsx`);
}
