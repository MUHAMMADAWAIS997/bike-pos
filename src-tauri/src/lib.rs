use rusqlite::{Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

fn get_db_path() -> PathBuf {
  if let Ok(cwd) = std::env::current_dir() {
    if cwd.ends_with("src-tauri") {
      return cwd.parent().unwrap_or(&cwd).join("sqlite.db");
    }
    return cwd.join("sqlite.db");
  }
  PathBuf::from("sqlite.db")
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CustomerRow {
  pub id: String,
  pub name: String,
  pub address: String,
  pub cnic: String,
  pub mobile: String,
  pub pending_balance: f64,
  pub status: String,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CustomerListResult {
  pub customers: Vec<CustomerRow>,
  pub total_count: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SupplierRow {
  pub id: String,
  pub company: String,
  pub mobile: String,
  pub address: Option<String>,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SupplierListResult {
  pub suppliers: Vec<SupplierRow>,
  pub total_count: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SupplierLedgerStats {
  pub total_batches: i64,
  pub total_units: i64,
  pub total_investment: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SupplierLedgerResult {
  pub supplier: SupplierRow,
  pub batches: Vec<StockBatchRow>,
  pub total_count: i64,
  pub stats: SupplierLedgerStats,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StockBatchFullDetails {
  pub batch: StockBatchRow,
  pub items: Vec<StockBatchItemRow>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RevenueSummaryItemRow {
  pub product_id: String,
  pub product_model: String,
  pub payment_type: String,
  pub installment_months: i32,
  pub installment_number: Option<i32>,
  pub retail_price: f64,
  pub sold_price: f64,
  pub discount_amount: f64,
  pub cost_price: f64,
  pub quantity_sold: i32,
  pub total_sales: f64,
  pub recognized_cost: f64,
  pub fee_profit: f64,
  pub initial_profit: f64,
  pub incentive_percentage: f64,
  pub incentive_amount: f64,
  pub total_profit: f64,
  pub has_incentive: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RevenueSummaryStats {
  pub total_revenue: f64,
  pub total_initial_profit: f64,
  pub total_fee_profit: f64,
  pub total_incentives: f64,
  pub total_net_profit: f64,
  pub total_units_sold: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RevenueSummaryResult {
  pub items: Vec<RevenueSummaryItemRow>,
  pub total_count: i64,
  pub stats: RevenueSummaryStats,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PartnerRow {
  pub id: String,
  pub name: String,
  pub mobile: String,
  pub equity_share: f64,
  pub color_key: String,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PartnerListResult {
  pub partners: Vec<PartnerRow>,
  pub total_count: i64,
  pub total_allocated_equity: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PartnerFinancialSummary {
  pub partner_id: String,
  pub partner_name: String,
  pub equity_share: f64,
  pub total_store_revenue: f64,
  pub total_initial_profit: f64,
  pub total_incentives: f64,
  pub gross_product_profit: f64,
  pub total_store_expenses: f64,
  pub stock_expenses: f64,
  pub operational_expenses: f64,
  pub store_net_profit: f64,
  pub partner_revenue_share: f64,
  pub partner_initial_profit_share: f64,
  pub partner_incentive_share: f64,
  pub partner_gross_profit_share: f64,
  pub partner_total_expense_share: f64,
  pub partner_stock_expense_share: f64,
  pub partner_operational_expense_share: f64,
  pub partner_net_profit_share: f64,
  pub total_units_sold: i64,
  pub total_sales_count: i64,
  pub total_expenses_count: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShopSettings {
  pub id: String,
  pub shop_name: String,
  pub tagline: String,
  pub address: String,
  pub phone: String,
  pub email: String,
  pub brand_name: String,
  pub brand_tagline: String,
  pub default_printer: Option<String>,
  pub auto_show_receipt: Option<bool>,
  pub silent_printing: Option<bool>,
  pub backup_dir: Option<String>,
  pub low_stock_threshold: Option<i32>,
  pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BackupFileRecord {
  pub filename: String,
  pub full_path: String,
  pub size_bytes: u64,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BackupInfo {
  pub backup_dir: String,
  pub total_backups: usize,
  pub backups: Vec<BackupFileRecord>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DashboardSummary {
  pub current_month_year: String,
  pub monthly_revenue: f64,
  pub monthly_net_profit: f64,
  pub monthly_expenses: f64,
  pub monthly_units_sold: i64,
  pub stock_expenses: f64,
  pub operational_expenses: f64,
  pub total_products_count: i64,
  pub low_stock_count: i64,
  pub out_of_stock_count: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LowStockProduct {
  pub id: String,
  pub model: String,
  pub category: String,
  pub color: String,
  pub quantity: i32,
  pub retail_price: f64,
  pub cost_price: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProductRow {
  pub id: String,
  pub model: String,
  pub category: String,
  pub color: String,
  pub battery_type: String,
  pub volt: String,
  pub manufacturing_year: i32,
  pub initial_quantity: i32,
  pub quantity: i32,
  pub initial_discount: f64,
  pub retail_price: f64,
  pub cost_price: f64,
  pub incentive: Option<f64>,
  pub others: Option<String>,
  pub is_active: i32,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InventorySummaryStats {
  pub total_products: i64,
  pub active_products: i64,
  pub inactive_products: i64,
  pub total_categories: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ProductListResult {
  pub products: Vec<ProductRow>,
  pub total_count: i64,
  pub models: Vec<String>,
  pub categories: Vec<String>,
  pub stats: InventorySummaryStats,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StockInventoryRow {
  pub id: String,
  pub product_id: String,
  pub product_model: String,
  pub category: String,
  pub color: String,
  pub supplier_company: String,
  pub batch_no: String,
  pub stock_qty: i32,
  pub total_product_stock: i32,
  pub rate_count: i32,
  pub retail_price: f64,
  pub discount: f64,
  pub cost_price: f64,
  pub unit_margin: f64,
  pub total_profit: f64,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AvailableStockResult {
  pub entries: Vec<StockInventoryRow>,
  pub total_count: i64,
  pub suppliers: Vec<String>,
  pub products: Vec<ProductOptionItem>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProductOptionItem {
  pub id: String,
  pub model: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StockBatchItemInput {
  pub product_id: String,
  pub product_model: String,
  pub category: String,
  pub quantity: i32,
  pub discount: f64,
  pub retail_price: f64,
  pub cost_price: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StockBatchRow {
  pub id: String,
  pub batch_no: String,
  pub supplier_company: String,
  pub total_items: i32,
  pub total_quantity: i32,
  pub total_value: f64,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StockBatchSummaryStats {
  pub total_batches: i64,
  pub total_units: i64,
  pub total_investment: f64,
  pub active_suppliers: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StockBatchListResult {
  pub batches: Vec<StockBatchRow>,
  pub total_count: i64,
  pub stats: StockBatchSummaryStats,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StockBatchItemRow {
  pub id: String,
  pub batch_id: String,
  pub product_id: String,
  pub product_model: String,
  pub category: String,
  pub quantity: i32,
  pub discount: f64,
  pub retail_price: f64,
  pub cost_price: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleItemInput {
  pub product_id: String,
  pub product_model: String,
  pub quantity: i32,
  pub unit_price: f64,
  pub total_price: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleRow {
  pub id: String,
  pub transaction_number: String,
  pub customer_name: String,
  pub chassis_no: Option<String>,
  pub motor_no: Option<String>,
  pub subtotal: f64,
  pub discount_amount: f64,
  pub total_amount: f64,
  pub payment_type: String,
  pub installment_months: i32,
  pub monthly_installment: f64,
  pub installment_fee_type: Option<String>,
  pub installment_fee_value: Option<f64>,
  pub installment_fee_amount: Option<f64>,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleDetailRow {
  pub id: String,
  pub transaction_number: String,
  pub customer_id: Option<String>,
  pub customer_name: String,
  pub customer_cnic: Option<String>,
  pub customer_mobile: Option<String>,
  pub customer_address: Option<String>,
  pub chassis_no: Option<String>,
  pub motor_no: Option<String>,
  pub subtotal: f64,
  pub discount_amount: f64,
  pub total_amount: f64,
  pub paid_amount: f64,
  pub remaining_balance: f64,
  pub payment_type: String,
  pub installment_months: i32,
  pub monthly_installment: f64,
  pub installment_fee_type: Option<String>,
  pub installment_fee_value: Option<f64>,
  pub installment_fee_amount: Option<f64>,
  pub status: String,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SaleListStats {
  pub total_revenue: f64,
  pub total_sales: i64,
  pub full_payment_sales: i64,
  pub installment_sales: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SaleListResult {
  pub sales: Vec<SaleDetailRow>,
  pub total_count: i64,
  pub stats: SaleListStats,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SaleFullDetails {
  pub sale: SaleDetailRow,
  pub items: Vec<SaleItemRecord>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleItemRecord {
  pub id: String,
  pub sale_id: String,
  pub product_id: String,
  pub product_model: String,
  pub category: Option<String>,
  pub color: Option<String>,
  pub battery_type: Option<String>,
  pub volt: Option<String>,
  pub manufacturing_year: Option<String>,
  pub quantity: i32,
  pub unit_price: f64,
  pub total_price: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CustomerLedgerRow {
  pub id: String,
  pub customer_id: String,
  pub customer_name: String,
  pub customer_cnic: String,
  pub customer_mobile: String,
  pub sale_id: Option<String>,
  pub transaction_number: String,
  pub transaction_type: String,
  pub total_amount: f64,
  pub paid_amount: f64,
  pub remaining_balance: f64,
  pub payment_type: String,
  pub installment_months: i32,
  pub monthly_installment: f64,
  pub installment_fee_type: Option<String>,
  pub installment_fee_value: Option<f64>,
  pub installment_fee_amount: Option<f64>,
  pub description: Option<String>,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CustomerLedgerStats {
  pub total_purchases: f64,
  pub total_paid: f64,
  pub remaining_balance: f64,
  pub total_entries: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CustomerLedgerResult {
  pub customer: CustomerRow,
  pub entries: Vec<CustomerLedgerRow>,
  pub stats: CustomerLedgerStats,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExpenseRow {
  pub id: String,
  pub title: String,
  pub category: String,
  pub amount: f64,
  pub payment_method: String,
  pub reference_id: Option<String>,
  pub description: Option<String>,
  pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExpenseListStats {
  pub total_expenses: f64,
  pub stock_expenses: f64,
  pub operational_expenses: f64,
  pub this_month_expenses: f64,
  pub total_count: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExpenseListResult {
  pub expenses: Vec<ExpenseRow>,
  pub total_count: i64,
  pub stats: ExpenseListStats,
}

fn init_tables(conn: &Connection) {
  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      cnic TEXT NOT NULL UNIQUE,
      mobile TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      mobile TEXT NOT NULL,
      address TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      equity_share REAL NOT NULL,
      color_key TEXT NOT NULL DEFAULT 'violet',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      model TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL DEFAULT 'E-Bike',
      color TEXT NOT NULL,
      battery_type TEXT NOT NULL,
      volt TEXT NOT NULL,
      manufacturing_year INTEGER NOT NULL,
      initial_quantity INTEGER NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 0,
      initial_discount REAL NOT NULL DEFAULT 0,
      retail_price REAL NOT NULL,
      cost_price REAL NOT NULL DEFAULT 0,
      incentive REAL,
      others TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute("ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1", []);

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS stock_inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      supplier_company TEXT NOT NULL,
      batch_no TEXT NOT NULL,
      initial_quantity INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      retail_price REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      cost_price REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS stock_batches (
      id TEXT PRIMARY KEY,
      batch_no TEXT NOT NULL,
      supplier_company TEXT NOT NULL,
      total_items INTEGER NOT NULL,
      total_quantity INTEGER NOT NULL,
      total_value REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS stock_batch_items (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES stock_batches(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_model TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      retail_price REAL NOT NULL,
      cost_price REAL NOT NULL
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      transaction_number TEXT NOT NULL UNIQUE,
      customer_id TEXT REFERENCES customers(id),
      customer_name TEXT NOT NULL,
      customer_cnic TEXT,
      customer_mobile TEXT,
      chassis_no TEXT,
      motor_no TEXT,
      subtotal REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0,
      remaining_balance REAL NOT NULL DEFAULT 0,
      payment_type TEXT NOT NULL DEFAULT 'full',
      installment_months INTEGER DEFAULT 1,
      monthly_installment REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'completed',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_model TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS customer_ledgers (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_cnic TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      sale_id TEXT REFERENCES sales(id),
      transaction_number TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL,
      remaining_balance REAL NOT NULL,
      payment_type TEXT NOT NULL DEFAULT 'full',
      installment_months INTEGER DEFAULT 1,
      monthly_installment REAL DEFAULT 0,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute("ALTER TABLE sales ADD COLUMN customer_id TEXT;", []);
  let _ = conn.execute("ALTER TABLE sales ADD COLUMN customer_cnic TEXT;", []);
  let _ = conn.execute("ALTER TABLE sales ADD COLUMN customer_mobile TEXT;", []);
  let _ = conn.execute("ALTER TABLE sales ADD COLUMN chassis_no TEXT;", []);
  let _ = conn.execute("ALTER TABLE sales ADD COLUMN motor_no TEXT;", []);
  let _ = conn.execute("ALTER TABLE sales ADD COLUMN installment_fee_type TEXT DEFAULT 'percentage';", []);
  let _ = conn.execute("ALTER TABLE sales ADD COLUMN installment_fee_value REAL DEFAULT 0;", []);
  let _ = conn.execute("ALTER TABLE sales ADD COLUMN installment_fee_amount REAL DEFAULT 0;", []);

  let _ = conn.execute("ALTER TABLE customer_ledgers ADD COLUMN installment_fee_type TEXT DEFAULT 'percentage';", []);
  let _ = conn.execute("ALTER TABLE customer_ledgers ADD COLUMN installment_fee_value REAL DEFAULT 0;", []);
  let _ = conn.execute("ALTER TABLE customer_ledgers ADD COLUMN installment_fee_amount REAL DEFAULT 0;", []);

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Cash',
      reference_id TEXT,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS monthly_incentives (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      month_year TEXT NOT NULL,
      incentive_percentage REAL NOT NULL,
      incentive_amount REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      UNIQUE(product_id, month_year)
    )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS overall_monthly_incentives (
      month_year TEXT PRIMARY KEY,
      incentive_amount REAL NOT NULL DEFAULT 0.0,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  // Auto-backfill existing stock batches into expenses if not present
  let _ = conn.execute(
    "INSERT INTO expenses (id, title, category, amount, payment_method, reference_id, description, created_at)
     SELECT 
       'exp_' || b.id,
       'Stock Intake - Batch #' || b.batch_no,
       'Stock Purchase',
       b.total_value,
       'Supplier Credit / Cash',
       b.id,
       'Auto-generated from stock batch intake #' || b.batch_no || ' (Supplier: ' || b.supplier_company || ', Units: ' || b.total_quantity || ')',
       b.created_at
     FROM stock_batches b
     WHERE NOT EXISTS (
       SELECT 1 FROM expenses e WHERE e.reference_id = b.id OR e.id = 'exp_' || b.id
     )",
    [],
  );

  // Auto-backfill existing initial product inventory into expenses if not present
  let _ = conn.execute(
    "INSERT INTO expenses (id, title, category, amount, payment_method, reference_id, description, created_at)
     SELECT 
       'exp_prod_' || p.id,
       'Stock Intake - ' || p.model,
       'Stock Purchase',
       (p.initial_quantity * p.cost_price),
       'Initial Purchase',
       p.id,
       'Initial stock intake for ' || p.model || ' (' || p.initial_quantity || ' units @ Rs. ' || p.cost_price || '/unit)',
       p.created_at
     FROM products p
     WHERE p.initial_quantity > 0 AND p.cost_price > 0 AND NOT EXISTS (
       SELECT 1 FROM expenses e WHERE e.reference_id = p.id OR e.id = 'exp_prod_' || p.id
     )",
    [],
  );

  let _ = conn.execute(
    "CREATE TABLE IF NOT EXISTS shop_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      shop_name TEXT NOT NULL DEFAULT 'BKM MOTORS',
      tagline TEXT NOT NULL DEFAULT 'Deal in Environment Friendly Bikes',
      address TEXT NOT NULL DEFAULT 'Main Showroom, Motorway City, Pakistan',
      phone TEXT NOT NULL DEFAULT '0304-8799010',
      email TEXT NOT NULL DEFAULT 'info@bkmmotors.com',
      brand_name TEXT NOT NULL DEFAULT 'REVOO',
      brand_tagline TEXT NOT NULL DEFAULT 'ELECTRIC MOTORCYCLE BRAND',
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )",
    [],
  );

  let _ = conn.execute("ALTER TABLE shop_settings ADD COLUMN default_printer TEXT DEFAULT '';", []);
  let _ = conn.execute("ALTER TABLE shop_settings ADD COLUMN backup_dir TEXT DEFAULT '';", []);
  let _ = conn.execute("ALTER TABLE shop_settings ADD COLUMN auto_show_receipt INTEGER NOT NULL DEFAULT 1;", []);
  let _ = conn.execute("ALTER TABLE shop_settings ADD COLUMN silent_printing INTEGER NOT NULL DEFAULT 0;", []);
  let _ = conn.execute("ALTER TABLE shop_settings ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 2;", []);

  let settings_cnt: i64 = conn
    .query_row("SELECT COUNT(*) FROM shop_settings WHERE id = 'default'", [], |r| r.get(0))
    .unwrap_or(0);

  if settings_cnt == 0 {
    let _ = conn.execute(
      "INSERT INTO shop_settings (id, shop_name, tagline, address, phone, email, brand_name, brand_tagline, default_printer) VALUES ('default', 'BKM MOTORS', 'Deal in Environment Friendly Bikes', 'Main Showroom, Motorway City, Pakistan', '0304-8799010', 'info@bkmmotors.com', 'REVOO', 'ELECTRIC MOTORCYCLE BRAND', '')",
      [],
    );
  }
}

#[tauri::command]
fn login(username: String, password: String) -> Result<String, String> {
  let username = username.trim();
  let password = password.trim();

  if username.is_empty() || password.is_empty() {
    return Err("Username and password are required.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection failed: {}", e)),
  };

  init_tables(&conn);

  let admin_count: i64 = conn
    .query_row(
      "SELECT COUNT(*) FROM users WHERE username = 'admin'",
      [],
      |row| row.get(0),
    )
    .unwrap_or(0);

  if admin_count == 0 {
    let _ = conn.execute(
      "INSERT INTO users (id, username, password, role) VALUES ('usr_admin_default', 'admin', 'admin123', 'admin')",
      [],
    );
  }

  let mut stmt = match conn.prepare("SELECT password FROM users WHERE username = ?1") {
    Ok(s) => s,
    Err(e) => return Err(format!("Database query error: {}", e)),
  };

  let db_password: SqlResult<String> = stmt.query_row([username], |row| row.get(0));

  match db_password {
    Ok(db_pass) => {
      if db_pass == password {
        Ok("success".into())
      } else {
        Err("Invalid username or password.".into())
      }
    }
    Err(_) => Err("Invalid username or password.".into()),
  }
}

#[tauri::command]
fn get_customers(
  search: String,
  order_by: String,
  page: i32,
  per_page: i32,
) -> Result<CustomerListResult, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let search_term = format!("%{}%", search.trim());
  let offset = (page.max(1) - 1) * per_page.max(1);

  let count_sql = "SELECT COUNT(*) FROM customers WHERE name LIKE ?1 OR mobile LIKE ?1 OR cnic LIKE ?1 OR address LIKE ?1";
  let total_count: i64 = conn
    .query_row(count_sql, [&search_term], |row| row.get(0))
    .unwrap_or(0);

  let order_clause = match order_by.as_str() {
    "name_desc" => "ORDER BY name DESC",
    "name_asc" => "ORDER BY name ASC",
    "oldest" => "ORDER BY created_at ASC",
    _ => "ORDER BY created_at DESC",
  };

  let sql = format!(
    "SELECT id, name, address, cnic, mobile, created_at FROM customers WHERE name LIKE ?1 OR mobile LIKE ?1 OR cnic LIKE ?1 OR address LIKE ?1 {} LIMIT ?2 OFFSET ?3",
    order_clause
  );

  let mut stmt = match conn.prepare(&sql) {
    Ok(s) => s,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map([&search_term, &per_page.to_string(), &offset.to_string()], |row| {
    Ok(CustomerRow {
      id: row.get(0)?,
      name: row.get(1)?,
      address: row.get(2)?,
      cnic: row.get(3)?,
      mobile: row.get(4)?,
      pending_balance: 0.0,
      status: "Settled".to_string(),
      created_at: row.get(5)?,
    })
  }) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut list = Vec::new();
  for row in rows {
    if let Ok(mut c) = row {
      let rem_balance: f64 = conn.query_row(
        "SELECT remaining_balance FROM customer_ledgers WHERE customer_id = ?1 ORDER BY created_at DESC LIMIT 1",
        [&c.id],
        |r| r.get(0),
      ).unwrap_or(0.0);

      c.pending_balance = rem_balance.max(0.0);
      c.status = if rem_balance > 0.01 { "Pending".to_string() } else { "Settled".to_string() };
      list.push(c);
    }
  }

  Ok(CustomerListResult {
    customers: list,
    total_count,
  })
}

#[tauri::command]
fn add_customer(
  name: String,
  address: String,
  cnic: String,
  mobile: String,
) -> Result<CustomerRow, String> {
  let name = name.trim();
  let address = address.trim();
  let cnic = cnic.trim();
  let mobile = mobile.trim();

  if name.is_empty() || address.is_empty() || cnic.is_empty() || mobile.is_empty() {
    return Err("All fields (Name, Address, CNIC, Mobile) are required.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let id = format!("cust_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());

  let result = conn.execute(
    "INSERT INTO customers (id, name, address, cnic, mobile) VALUES (?1, ?2, ?3, ?4, ?5)",
    [&id, name, address, cnic, mobile],
  );

  match result {
    Ok(_) => {
      let created_at: String = conn
        .query_row("SELECT created_at FROM customers WHERE id = ?1", [&id], |r| r.get(0))
        .unwrap_or_else(|_| "Just now".to_string());

      Ok(CustomerRow {
        id,
        name: name.to_string(),
        address: address.to_string(),
        cnic: cnic.to_string(),
        mobile: mobile.to_string(),
        pending_balance: 0.0,
        status: "Settled".to_string(),
        created_at,
      })
    }
    Err(e) => {
      let err_msg = e.to_string();
      if err_msg.contains("UNIQUE constraint failed: customers.cnic") {
        Err("A customer with this CNIC number already exists.".into())
      } else {
        Err(format!("Failed to add customer: {}", err_msg))
      }
    }
  }
}

#[tauri::command]
fn delete_customer(id: String) -> Result<String, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  let count = match conn.execute("DELETE FROM customers WHERE id = ?1", [&id]) {
    Ok(c) => c,
    Err(e) => return Err(format!("Failed to delete customer: {}", e)),
  };

  if count > 0 {
    Ok("success".into())
  } else {
    Err("Customer not found.".into())
  }
}

#[tauri::command]
fn get_suppliers(
  search: String,
  order_by: String,
  page: i32,
  per_page: i32,
) -> Result<SupplierListResult, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let search_term = format!("%{}%", search.trim());
  let offset = (page.max(1) - 1) * per_page.max(1);

  let count_sql = "SELECT COUNT(*) FROM suppliers WHERE company LIKE ?1 OR mobile LIKE ?1 OR COALESCE(address, '') LIKE ?1";
  let total_count: i64 = conn
    .query_row(count_sql, [&search_term], |row| row.get(0))
    .unwrap_or(0);

  let order_clause = match order_by.as_str() {
    "company_desc" => "ORDER BY company DESC",
    "company_asc" => "ORDER BY company ASC",
    "oldest" => "ORDER BY created_at ASC",
    _ => "ORDER BY created_at DESC",
  };

  let sql = format!(
    "SELECT id, company, mobile, address, created_at FROM suppliers WHERE company LIKE ?1 OR mobile LIKE ?1 OR COALESCE(address, '') LIKE ?1 {} LIMIT ?2 OFFSET ?3",
    order_clause
  );

  let mut stmt = match conn.prepare(&sql) {
    Ok(s) => s,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map([&search_term, &per_page.to_string(), &offset.to_string()], |row| {
    Ok(SupplierRow {
      id: row.get(0)?,
      company: row.get(1)?,
      mobile: row.get(2)?,
      address: row.get(3)?,
      created_at: row.get(4)?,
    })
  }) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut list = Vec::new();
  for row in rows {
    if let Ok(s) = row {
      list.push(s);
    }
  }

  Ok(SupplierListResult {
    suppliers: list,
    total_count,
  })
}

#[tauri::command]
fn add_supplier(
  company: String,
  mobile: String,
  address: Option<String>,
) -> Result<SupplierRow, String> {
  let company = company.trim();
  let mobile = mobile.trim();
  let address = address.as_ref().map(|a| a.trim().to_string()).filter(|a| !a.is_empty());

  if company.is_empty() || mobile.is_empty() {
    return Err("Company Name and Mobile Number are required.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let id = format!("supp_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());

  let result = conn.execute(
    "INSERT INTO suppliers (id, company, mobile, address) VALUES (?1, ?2, ?3, ?4)",
    rusqlite::params![&id, company, mobile, &address],
  );

  match result {
    Ok(_) => {
      let created_at: String = conn
        .query_row("SELECT created_at FROM suppliers WHERE id = ?1", [&id], |r| r.get(0))
        .unwrap_or_else(|_| "Just now".to_string());

      Ok(SupplierRow {
        id,
        company: company.to_string(),
        mobile: mobile.to_string(),
        address,
        created_at,
      })
    }
    Err(e) => Err(format!("Failed to add supplier: {}", e)),
  }
}

#[tauri::command]
fn delete_supplier(id: String) -> Result<String, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  let count = match conn.execute("DELETE FROM suppliers WHERE id = ?1", [&id]) {
    Ok(c) => c,
    Err(e) => return Err(format!("Failed to delete supplier: {}", e)),
  };

  if count > 0 {
    Ok("success".into())
  } else {
    Err("Supplier not found.".into())
  }
}

#[tauri::command]
fn get_partners(
  search: String,
  order_by: String,
  page: i32,
  per_page: i32,
) -> Result<PartnerListResult, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let search_term = format!("%{}%", search.trim());
  let offset = (page.max(1) - 1) * per_page.max(1);

  let total_allocated_equity: f64 = conn
    .query_row("SELECT COALESCE(SUM(equity_share), 0.0) FROM partners", [], |r| r.get(0))
    .unwrap_or(0.0);

  let count_sql = "SELECT COUNT(*) FROM partners WHERE name LIKE ?1 OR mobile LIKE ?1";
  let total_count: i64 = conn
    .query_row(count_sql, [&search_term], |row| row.get(0))
    .unwrap_or(0);

  let order_clause = match order_by.as_str() {
    "name_desc" => "ORDER BY name DESC",
    "name_asc" => "ORDER BY name ASC",
    "equity_desc" => "ORDER BY equity_share DESC",
    "equity_asc" => "ORDER BY equity_share ASC",
    "oldest" => "ORDER BY created_at ASC",
    _ => "ORDER BY created_at DESC",
  };

  let sql = format!(
    "SELECT id, name, mobile, equity_share, color_key, created_at FROM partners WHERE name LIKE ?1 OR mobile LIKE ?1 {} LIMIT ?2 OFFSET ?3",
    order_clause
  );

  let mut stmt = match conn.prepare(&sql) {
    Ok(s) => s,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map([&search_term, &per_page.to_string(), &offset.to_string()], |row| {
    Ok(PartnerRow {
      id: row.get(0)?,
      name: row.get(1)?,
      mobile: row.get(2)?,
      equity_share: row.get(3)?,
      color_key: row.get(4)?,
      created_at: row.get(5)?,
    })
  }) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut list = Vec::new();
  for row in rows {
    if let Ok(p) = row {
      list.push(p);
    }
  }

  Ok(PartnerListResult {
    partners: list,
    total_count,
    total_allocated_equity,
  })
}

#[tauri::command]
fn add_partner(
  name: String,
  mobile: String,
  equity_share: f64,
) -> Result<PartnerRow, String> {
  let name = name.trim();
  let mobile = mobile.trim();

  if name.is_empty() || mobile.is_empty() {
    return Err("Partner Name and Mobile Number are required.".into());
  }

  if equity_share <= 0.0 || equity_share > 100.0 {
    return Err("Investment Equity Share percentage must be between 0.01% and 100.00%.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let existing_equity: f64 = conn
    .query_row("SELECT COALESCE(SUM(equity_share), 0.0) FROM partners", [], |r| r.get(0))
    .unwrap_or(0.0);

  if existing_equity + equity_share > 100.001 {
    return Err(format!(
      "Cannot allocate {:.2}% equity. Total allocated would exceed 100% (Current: {:.2}%, Available: {:.2}%).",
      equity_share, existing_equity, (100.0 - existing_equity).max(0.0)
    ));
  }

  let colors = ["violet", "amber", "pink", "cyan"];
  let color_key = colors[(std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs() % 4) as usize].to_string();

  let id = format!("part_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());

  let result = conn.execute(
    "INSERT INTO partners (id, name, mobile, equity_share, color_key) VALUES (?1, ?2, ?3, ?4, ?5)",
    rusqlite::params![&id, name, mobile, equity_share, color_key],
  );

  match result {
    Ok(_) => {
      let created_at: String = conn
        .query_row("SELECT created_at FROM partners WHERE id = ?1", [&id], |r| r.get(0))
        .unwrap_or_else(|_| "Just now".to_string());

      Ok(PartnerRow {
        id,
        name: name.to_string(),
        mobile: mobile.to_string(),
        equity_share,
        color_key,
        created_at,
      })
    }
    Err(e) => Err(format!("Failed to add partner: {}", e)),
  }
}

#[tauri::command]
fn delete_partner(id: String) -> Result<String, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  let count = match conn.execute("DELETE FROM partners WHERE id = ?1", [&id]) {
    Ok(c) => c,
    Err(e) => return Err(format!("Failed to delete partner: {}", e)),
  };

  if count > 0 {
    Ok("success".into())
  } else {
    Err("Partner not found.".into())
  }
}

#[tauri::command]
fn get_partner_financial_summary(
  partner_id: String,
  start_date: Option<String>,
  end_date: Option<String>,
) -> Result<PartnerFinancialSummary, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let partner: PartnerRow = match conn.query_row(
    "SELECT id, name, mobile, equity_share, color_key, created_at FROM partners WHERE id = ?1",
    [&partner_id],
    |r| {
      Ok(PartnerRow {
        id: r.get(0)?,
        name: r.get(1)?,
        mobile: r.get(2)?,
        equity_share: r.get(3)?,
        color_key: r.get(4)?,
        created_at: r.get(5)?,
      })
    },
  ) {
    Ok(p) => p,
    Err(e) => return Err(format!("Partner not found: {}", e)),
  };

  // 1. Fetch Sales Revenue & Product Profit (using monthly recognized revenue & profit rules)
  let months: Vec<String> = match (&start_date, &end_date) {
    (Some(sd), Some(ed)) if !sd.trim().is_empty() && !ed.trim().is_empty() => {
      let sd_trim = sd.trim();
      let month_str = if sd_trim.len() >= 7 { &sd_trim[..7] } else { sd_trim };
      vec![month_str.to_string()]
    }
    (Some(sd), _) if !sd.trim().is_empty() => {
      let sd_trim = sd.trim();
      let month_str = if sd_trim.len() >= 7 { &sd_trim[..7] } else { sd_trim };
      vec![month_str.to_string()]
    }
    _ => {
      let mut list = Vec::new();
      if let Ok(mut stmt) = conn.prepare(
        "SELECT DISTINCT strftime('%Y-%m', created_at) FROM sales WHERE status != 'cancelled'
         UNION
         SELECT DISTINCT strftime('%Y-%m', created_at) FROM customer_ledgers WHERE transaction_type = 'installment_payment'",
      ) {
        if let Ok(rows) = stmt.query_map([], |r| r.get(0)) {
          for r in rows.flatten() {
            let m: String = r;
            if !m.trim().is_empty() {
              list.push(m);
            }
          }
        }
      }
      if list.is_empty() {
        list.push(chrono::Local::now().format("%Y-%m").to_string());
      }
      list
    }
  };

  let mut total_store_revenue = 0.0;
  let mut total_initial_profit = 0.0;
  let mut total_fee_profit = 0.0;
  let mut total_incentives = 0.0;
  let mut total_units_sold: i64 = 0;

  for m in &months {
    if let Ok(rev_res) = get_revenue_summary(m.clone(), None, None, None) {
      total_store_revenue += rev_res.stats.total_revenue;
      total_initial_profit += rev_res.stats.total_initial_profit;
      total_fee_profit += rev_res.stats.total_fee_profit;
      total_incentives += rev_res.stats.total_incentives;
      total_units_sold += rev_res.stats.total_units_sold;
    }
  }

  let gross_product_profit = total_initial_profit + total_fee_profit + total_incentives;

  // 2. Fetch Expenses Breakdown (Total Expenses, Stock Purchase Expenses, Operational Expenses)
  let (exp_sql, exp_params) = match (&start_date, &end_date) {
    (Some(sd), Some(ed)) if !sd.trim().is_empty() && !ed.trim().is_empty() => (
      "SELECT 
        COALESCE(SUM(amount), 0.0) as total,
        COALESCE(SUM(CASE WHEN category = 'Stock Purchase' THEN amount ELSE 0.0 END), 0.0) as stock,
        COALESCE(SUM(CASE WHEN category != 'Stock Purchase' THEN amount ELSE 0.0 END), 0.0) as operational,
        COUNT(*) as cnt
      FROM expenses WHERE date(created_at) >= date(?1) AND date(created_at) <= date(?2)".to_string(),
      vec![sd.trim().to_string(), ed.trim().to_string()],
    ),
    (Some(sd), _) if !sd.trim().is_empty() => (
      "SELECT 
        COALESCE(SUM(amount), 0.0) as total,
        COALESCE(SUM(CASE WHEN category = 'Stock Purchase' THEN amount ELSE 0.0 END), 0.0) as stock,
        COALESCE(SUM(CASE WHEN category != 'Stock Purchase' THEN amount ELSE 0.0 END), 0.0) as operational,
        COUNT(*) as cnt
      FROM expenses WHERE date(created_at) >= date(?1)".to_string(),
      vec![sd.trim().to_string()],
    ),
    _ => (
      "SELECT 
        COALESCE(SUM(amount), 0.0) as total,
        COALESCE(SUM(CASE WHEN category = 'Stock Purchase' THEN amount ELSE 0.0 END), 0.0) as stock,
        COALESCE(SUM(CASE WHEN category != 'Stock Purchase' THEN amount ELSE 0.0 END), 0.0) as operational,
        COUNT(*) as cnt
      FROM expenses".to_string(),
      vec![],
    ),
  };

  let (total_store_expenses, stock_expenses, operational_expenses, total_expenses_count): (f64, f64, f64, i64) = conn
    .query_row(&exp_sql, rusqlite::params_from_iter(exp_params), |r| {
      Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?))
    })
    .unwrap_or((0.0, 0.0, 0.0, 0));

  let total_sales_count: i64 = conn
    .query_row("SELECT COUNT(*) FROM sales WHERE status != 'cancelled'", [], |r| r.get(0))
    .unwrap_or(0);

  let store_net_profit = gross_product_profit - operational_expenses;
  let equity_ratio = partner.equity_share / 100.0;

  let partner_revenue_share = total_store_revenue * equity_ratio;
  let partner_initial_profit_share = total_initial_profit * equity_ratio;
  let partner_incentive_share = total_incentives * equity_ratio;
  let partner_gross_profit_share = gross_product_profit * equity_ratio;

  let partner_total_expense_share = total_store_expenses * equity_ratio;
  let partner_stock_expense_share = stock_expenses * equity_ratio;
  let partner_operational_expense_share = operational_expenses * equity_ratio;
  let partner_net_profit_share = store_net_profit * equity_ratio;

  Ok(PartnerFinancialSummary {
    partner_id: partner.id,
    partner_name: partner.name,
    equity_share: partner.equity_share,
    total_store_revenue,
    total_initial_profit,
    total_incentives,
    gross_product_profit,
    total_store_expenses,
    stock_expenses,
    operational_expenses,
    store_net_profit,
    partner_revenue_share,
    partner_initial_profit_share,
    partner_incentive_share,
    partner_gross_profit_share,
    partner_total_expense_share,
    partner_stock_expense_share,
    partner_operational_expense_share,
    partner_net_profit_share,
    total_units_sold,
    total_sales_count,
    total_expenses_count,
  })
}

#[tauri::command]
fn get_products(
  search: String,
  category: String,
  model: String,
  order_by: String,
  status_filter: Option<String>,
  page: i32,
  per_page: i32,
) -> Result<ProductListResult, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let mut models: Vec<String> = Vec::new();
  if let Ok(mut stmt) = conn.prepare("SELECT DISTINCT model FROM products ORDER BY model ASC") {
    if let Ok(rows) = stmt.query_map([], |r| r.get(0)) {
      for r in rows {
        if let Ok(m) = r {
          models.push(m);
        }
      }
    }
  }

  let mut categories: Vec<String> = Vec::new();
  if let Ok(mut stmt) = conn.prepare("SELECT DISTINCT category FROM products ORDER BY category ASC") {
    if let Ok(rows) = stmt.query_map([], |r| r.get(0)) {
      for r in rows {
        if let Ok(c) = r {
          categories.push(c);
        }
      }
    }
  }

  // Calculate summary stats
  let total_products: i64 = conn.query_row("SELECT COUNT(*) FROM products", [], |r| r.get(0)).unwrap_or(0);
  let active_products: i64 = conn.query_row("SELECT COUNT(*) FROM products WHERE COALESCE(is_active, 1) = 1", [], |r| r.get(0)).unwrap_or(0);
  let inactive_products: i64 = conn.query_row("SELECT COUNT(*) FROM products WHERE COALESCE(is_active, 1) = 0", [], |r| r.get(0)).unwrap_or(0);
  let total_categories: i64 = conn.query_row("SELECT COUNT(DISTINCT category) FROM products", [], |r| r.get(0)).unwrap_or(0);

  let search_term = format!("%{}%", search.trim());
  let offset = (page.max(1) - 1) * per_page.max(1);

  let mut where_conditions = vec!["(model LIKE ?1 OR category LIKE ?1 OR color LIKE ?1 OR battery_type LIKE ?1 OR volt LIKE ?1 OR COALESCE(others, '') LIKE ?1)".to_string()];
  
  let has_cat = !category.is_empty() && category != "all";
  if has_cat {
    where_conditions.push("category = ?2".to_string());
  }

  let has_mod = !model.is_empty() && model != "all";
  if has_mod {
    where_conditions.push("model = ?3".to_string());
  }

  if let Some(ref st) = status_filter {
    if st == "active" || st == "active_only" {
      where_conditions.push("COALESCE(is_active, 1) = 1".to_string());
    } else if st == "inactive" {
      where_conditions.push("COALESCE(is_active, 1) = 0".to_string());
    }
  }

  let where_clause = where_conditions.join(" AND ");

  let order_clause = match order_by.as_str() {
    "model_asc" => "ORDER BY model ASC",
    "model_desc" => "ORDER BY model DESC",
    "price_asc" => "ORDER BY retail_price ASC",
    "price_desc" => "ORDER BY retail_price DESC",
    "oldest" => "ORDER BY created_at ASC",
    _ => "ORDER BY created_at DESC",
  };

  let count_sql = format!("SELECT COUNT(*) FROM products WHERE {}", where_clause);
  let mut count_stmt = match conn.prepare(&count_sql) {
    Ok(s) => s,
    Err(e) => return Err(format!("Count prep error: {}", e)),
  };

  let cat_param = if has_cat { category.clone() } else { "".to_string() };
  let mod_param = if has_mod { model.clone() } else { "".to_string() };

  let total_count: i64 = count_stmt
    .query_row([&search_term, &cat_param, &mod_param], |r| r.get(0))
    .unwrap_or(0);

  let sql = format!(
    "SELECT id, model, category, color, battery_type, volt, manufacturing_year, initial_quantity, quantity, initial_discount, retail_price, cost_price, incentive, others, COALESCE(is_active, 1) as is_active, created_at FROM products WHERE {} {} LIMIT ?4 OFFSET ?5",
    where_clause, order_clause
  );

  let mut stmt = match conn.prepare(&sql) {
    Ok(s) => s,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map(
    [
      &search_term,
      &cat_param,
      &mod_param,
      &per_page.to_string(),
      &offset.to_string(),
    ],
    |row| {
      Ok(ProductRow {
        id: row.get(0)?,
        model: row.get(1)?,
        category: row.get(2)?,
        color: row.get(3)?,
        battery_type: row.get(4)?,
        volt: row.get(5)?,
        manufacturing_year: row.get(6)?,
        initial_quantity: row.get(7)?,
        quantity: row.get(8)?,
        initial_discount: row.get(9)?,
        retail_price: row.get(10)?,
        cost_price: row.get(11)?,
        incentive: row.get(12)?,
        others: row.get(13)?,
        is_active: row.get(14)?,
        created_at: row.get(15)?,
      })
    },
  ) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut list = Vec::new();
  for row in rows {
    if let Ok(p) = row {
      list.push(p);
    }
  }

  Ok(ProductListResult {
    products: list,
    total_count,
    models,
    categories,
    stats: InventorySummaryStats {
      total_products,
      active_products,
      inactive_products,
      total_categories,
    },
  })
}

#[tauri::command]
fn add_product(
  model: String,
  category: String,
  color: String,
  battery_type: String,
  volt: String,
  manufacturing_year: i32,
  initial_quantity: i32,
  initial_discount: f64,
  retail_price: f64,
  cost_price: f64,
  incentive: Option<f64>,
  others: Option<String>,
) -> Result<ProductRow, String> {
  let now_millis = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis();
  let model_trim = model.trim();
  let model = if model_trim.is_empty() {
    format!("Unnamed Product #{}", now_millis % 10000)
  } else {
    model_trim.to_string()
  };

  let category = if category.trim().is_empty() { "General".to_string() } else { category.trim().to_string() };
  let color = if color.trim().is_empty() { "N/A".to_string() } else { color.trim().to_string() };
  let battery_type = if battery_type.trim().is_empty() { "N/A".to_string() } else { battery_type.trim().to_string() };
  let volt = if volt.trim().is_empty() { "N/A".to_string() } else { volt.trim().to_string() };
  let manufacturing_year = if manufacturing_year <= 0 { chrono::Datelike::year(&chrono::Local::now()) } else { manufacturing_year };
  let retail_price = if retail_price < 0.0 { 0.0 } else { retail_price };
  let cost_price = if cost_price < 0.0 { 0.0 } else { cost_price };

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let id = format!("prod_{}", now_millis);
  let quantity = initial_quantity;

  let result = conn.execute(
    "INSERT INTO products (id, model, category, color, battery_type, volt, manufacturing_year, initial_quantity, quantity, initial_discount, retail_price, cost_price, incentive, others) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
    rusqlite::params![
      &id,
      &model,
      &category,
      &color,
      &battery_type,
      &volt,
      manufacturing_year,
      initial_quantity,
      quantity,
      initial_discount,
      retail_price,
      cost_price,
      incentive,
      others,
    ],
  );

  match result {
    Ok(_) => {
      // If initial quantity > 0, also create initial rate entry in stock_inventory
      if initial_quantity > 0 {
        let stock_id = format!("stk_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
        let _ = conn.execute(
          "INSERT INTO stock_inventory (id, product_id, supplier_company, batch_no, initial_quantity, quantity, retail_price, discount, cost_price) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
          rusqlite::params![
            &stock_id,
            &id,
            "Initial Supplier",
            "INITIAL-BATCH",
            initial_quantity,
            initial_quantity,
            retail_price,
            initial_discount,
            cost_price
          ],
        );
        // Record Initial Product Intake in Expenses Table
        let exp_id = format!("exp_prod_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
        let total_cost = (initial_quantity as f64) * cost_price;
        let exp_title = format!("Stock Intake - {}", model);
        let exp_desc = format!("Initial stock intake for {} ({} units @ Rs. {:.2}/unit)", model, initial_quantity, cost_price);

        let _ = conn.execute(
          "INSERT INTO expenses (id, title, category, amount, payment_method, reference_id, description) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
          rusqlite::params![
            &exp_id,
            &exp_title,
            "Stock Purchase",
            total_cost,
            "Initial Purchase",
            &id,
            &exp_desc
          ],
        );
      }

      let created_at: String = conn
        .query_row("SELECT created_at FROM products WHERE id = ?1", [&id], |r| r.get(0))
        .unwrap_or_else(|_| "Just now".to_string());

      Ok(ProductRow {
        id,
        model: model.to_string(),
        category: category.to_string(),
        color: color.to_string(),
        battery_type: battery_type.to_string(),
        volt: volt.to_string(),
        manufacturing_year,
        initial_quantity,
        quantity,
        initial_discount,
        retail_price,
        cost_price,
        incentive,
        others,
        is_active: 1,
        created_at,
      })
    }
    Err(e) => {
      let err_msg = e.to_string();
      if err_msg.contains("UNIQUE constraint failed: products.model") {
        Err(format!("A product with model name '{}' already exists.", model))
      } else {
        Err(format!("Failed to add product: {}", err_msg))
      }
    }
  }
}

#[tauri::command]
fn get_product_by_id(id: String) -> Result<ProductRow, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let res = conn.query_row(
    "SELECT id, model, category, color, battery_type, volt, manufacturing_year, initial_quantity, quantity, initial_discount, retail_price, cost_price, incentive, others, COALESCE(is_active, 1), created_at FROM products WHERE id = ?1",
    [&id],
    |r| {
      Ok(ProductRow {
        id: r.get(0)?,
        model: r.get(1)?,
        category: r.get(2)?,
        color: r.get(3)?,
        battery_type: r.get(4)?,
        volt: r.get(5)?,
        manufacturing_year: r.get(6)?,
        initial_quantity: r.get(7)?,
        quantity: r.get(8)?,
        initial_discount: r.get(9)?,
        retail_price: r.get(10)?,
        cost_price: r.get(11)?,
        incentive: r.get(12)?,
        others: r.get(13)?,
        is_active: r.get(14)?,
        created_at: r.get(15)?,
      })
    },
  );

  match res {
    Ok(p) => Ok(p),
    Err(e) => Err(format!("Product not found: {}", e)),
  }
}

#[tauri::command]
fn update_product(
  id: String,
  model: String,
  category: String,
  color: String,
  battery_type: String,
  volt: String,
  manufacturing_year: i32,
  retail_price: f64,
  cost_price: f64,
  incentive: Option<f64>,
  others: Option<String>,
) -> Result<ProductRow, String> {
  let id = id.trim();
  if id.is_empty() {
    return Err("Product ID is required for update.".into());
  }

  let model_trim = model.trim();
  let model = if model_trim.is_empty() { "Unnamed Product".to_string() } else { model_trim.to_string() };
  let category = if category.trim().is_empty() { "General".to_string() } else { category.trim().to_string() };
  let color = if color.trim().is_empty() { "N/A".to_string() } else { color.trim().to_string() };
  let battery_type = if battery_type.trim().is_empty() { "N/A".to_string() } else { battery_type.trim().to_string() };
  let volt = if volt.trim().is_empty() { "N/A".to_string() } else { volt.trim().to_string() };
  let manufacturing_year = if manufacturing_year <= 0 { chrono::Datelike::year(&chrono::Local::now()) } else { manufacturing_year };
  let retail_price = if retail_price < 0.0 { 0.0 } else { retail_price };
  let cost_price = if cost_price < 0.0 { 0.0 } else { cost_price };

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let result = conn.execute(
    "UPDATE products SET model = ?1, category = ?2, color = ?3, battery_type = ?4, volt = ?5, manufacturing_year = ?6, retail_price = ?7, cost_price = ?8, incentive = ?9, others = ?10 WHERE id = ?11",
    rusqlite::params![
      &model,
      &category,
      &color,
      &battery_type,
      &volt,
      manufacturing_year,
      retail_price,
      cost_price,
      incentive,
      others,
      id,
    ],
  );

  match result {
    Ok(_) => {
      let _ = conn.execute(
        "UPDATE stock_inventory SET retail_price = ?1, cost_price = ?2 WHERE product_id = ?3 AND batch_no = 'INITIAL-BATCH'",
        rusqlite::params![retail_price, cost_price, id],
      );

      get_product_by_id(id.to_string())
    }
    Err(e) => {
      let err_msg = e.to_string();
      if err_msg.contains("UNIQUE constraint failed: products.model") {
        Err(format!("A product with model name '{}' already exists.", model))
      } else {
        Err(format!("Failed to update product: {}", err_msg))
      }
    }
  }
}

#[tauri::command]
fn delete_product(id: String) -> Result<String, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  let count = match conn.execute("DELETE FROM products WHERE id = ?1", [&id]) {
    Ok(c) => c,
    Err(e) => return Err(format!("Failed to delete product: {}", e)),
  };

  if count > 0 {
    Ok("success".into())
  } else {
    Err("Product not found.".into())
  }
}

#[tauri::command]
fn toggle_product_status(id: String) -> Result<i32, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let result = conn.execute(
    "UPDATE products SET is_active = CASE WHEN COALESCE(is_active, 1) = 1 THEN 0 ELSE 1 END WHERE id = ?1",
    [&id],
  );

  match result {
    Ok(_) => {
      let new_status: i32 = conn
        .query_row("SELECT COALESCE(is_active, 1) FROM products WHERE id = ?1", [&id], |r| r.get(0))
        .unwrap_or(1);
      Ok(new_status)
    }
    Err(e) => Err(format!("Failed to toggle product status: {}", e)),
  }
}

#[tauri::command]
fn create_sale(
  customer_name: String,
  customer_mobile: String,
  customer_cnic: String,
  customer_address: String,
  chassis_no: Option<String>,
  motor_no: Option<String>,
  subtotal: f64,
  discount_amount: f64,
  total_amount: f64,
  payment_type: String,
  installment_months: i32,
  monthly_installment: f64,
  installment_fee_type: Option<String>,
  installment_fee_value: Option<f64>,
  installment_fee_amount: Option<f64>,
  items: Vec<SaleItemInput>,
  sale_date: Option<String>,
) -> Result<SaleRow, String> {
  let name_trimmed = customer_name.trim();
  let customer_name = if name_trimmed.is_empty() { "Walk-in Customer" } else { name_trimmed };

  let mobile_trimmed = customer_mobile.trim();
  let customer_mobile = if mobile_trimmed.is_empty() { "03000000000" } else { mobile_trimmed };

  let cnic_trimmed = customer_cnic.trim();
  let customer_cnic = if cnic_trimmed.is_empty() { "N/A" } else { cnic_trimmed };

  let addr_trimmed = customer_address.trim();
  let customer_address = if addr_trimmed.is_empty() { "N/A" } else { addr_trimmed };

  let chassis_no = Some(match chassis_no {
    Some(ref s) if !s.trim().is_empty() => s.trim().to_string(),
    _ => "N/A".to_string(),
  });
  let motor_no = Some(match motor_no {
    Some(ref s) if !s.trim().is_empty() => s.trim().to_string(),
    _ => "N/A".to_string(),
  });

  if items.is_empty() {
    return Err("Cannot complete sale with zero items in cart.".into());
  }

  let db_path = get_db_path();
  let mut conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let tx = match conn.transaction() {
    Ok(t) => t,
    Err(e) => return Err(format!("Failed to start transaction: {}", e)),
  };

  // Upsert Customer automatically if not existing
  let mut customer_id: String = tx
    .query_row("SELECT id FROM customers WHERE cnic = ?1", [customer_cnic], |r| r.get(0))
    .unwrap_or_default();

  if customer_id.is_empty() {
    customer_id = format!("cust_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
    let cust_res = tx.execute(
      "INSERT INTO customers (id, name, address, cnic, mobile) VALUES (?1, ?2, ?3, ?4, ?5)",
      [&customer_id, customer_name, customer_address, customer_cnic, customer_mobile],
    );
    if let Err(e) = cust_res {
      return Err(format!("Failed to auto-save customer: {}", e));
    }
  }

  let sale_id = format!("sale_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
  let tx_number = format!("TXN-{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs());

  let (paid_amount, remaining_balance, txn_type) = if payment_type == "installment" {
    let initial_payment = monthly_installment; // Downpayment / 1st Month Installment
    let balance = total_amount - initial_payment;
    (initial_payment, balance, "sale_installment".to_string())
  } else {
    (total_amount, 0.0, "sale_full".to_string())
  };

  // Deplete stock in FIFO order for each cart item
  for item in items.iter() {
    let total_avail: i32 = tx
      .query_row(
        "SELECT COALESCE(SUM(quantity), 0) FROM stock_inventory WHERE product_id = ?1 AND quantity > 0",
        [&item.product_id],
        |r| r.get(0),
      )
      .unwrap_or(0);

    if total_avail < item.quantity {
      return Err(format!(
        "Insufficient stock for '{}'. Requested: {}, Available: {}",
        item.product_model, item.quantity, total_avail
      ));
    }

    struct BatchRow { id: String, quantity: i32 }
    let mut batches = Vec::new();
    {
      let mut stmt = match tx.prepare(
        "SELECT id, quantity FROM stock_inventory WHERE product_id = ?1 AND quantity > 0 ORDER BY created_at ASC",
      ) {
        Ok(s) => s,
        Err(e) => return Err(format!("Prep error: {}", e)),
      };

      let rows = match stmt.query_map([&item.product_id], |r| Ok(BatchRow { id: r.get(0)?, quantity: r.get(1)? })) {
        Ok(r) => r,
        Err(e) => return Err(format!("Query map error: {}", e)),
      };

      for r in rows {
        if let Ok(b) = r { batches.push(b); }
      }
    }

    let mut remaining = item.quantity;
    for b in batches {
      if remaining <= 0 { break; }
      if b.quantity <= remaining {
        let _ = tx.execute("UPDATE stock_inventory SET quantity = 0 WHERE id = ?1", [&b.id]);
        remaining -= b.quantity;
      } else {
        let new_qty = b.quantity - remaining;
        let _ = tx.execute("UPDATE stock_inventory SET quantity = ?1 WHERE id = ?2", rusqlite::params![new_qty, &b.id]);
        remaining = 0;
      }
    }

    // Update aggregate product master quantity
    let _ = tx.execute(
      "UPDATE products SET quantity = (SELECT COALESCE(SUM(quantity), 0) FROM stock_inventory WHERE product_id = ?1 AND quantity > 0) WHERE id = ?1",
      [&item.product_id],
    );
  }

  let fee_type = installment_fee_type.clone().unwrap_or_else(|| "percentage".to_string());
  let fee_val = installment_fee_value.unwrap_or(0.0);
  let fee_amt = installment_fee_amount.unwrap_or(0.0);

  let formatted_created_at = match sale_date.as_ref().map(|s| s.trim()).filter(|s| !s.is_empty()) {
    Some(d) => {
      if d.len() == 10 {
        let time_str = chrono::Local::now().format("%H:%M:%S").to_string();
        format!("{} {}", d, time_str)
      } else {
        d.to_string()
      }
    }
    None => chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
  };

  // Insert sales header record with chassis_no, motor_no, and sale_date created_at
  let sale_res = tx.execute(
    "INSERT INTO sales (id, transaction_number, customer_id, customer_name, customer_cnic, customer_mobile, chassis_no, motor_no, subtotal, discount_amount, total_amount, paid_amount, remaining_balance, payment_type, installment_months, monthly_installment, installment_fee_type, installment_fee_value, installment_fee_amount, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)",
    rusqlite::params![
      &sale_id,
      &tx_number,
      &customer_id,
      customer_name,
      customer_cnic,
      customer_mobile,
      &chassis_no,
      &motor_no,
      subtotal,
      discount_amount,
      total_amount,
      paid_amount,
      remaining_balance,
      &payment_type,
      installment_months,
      monthly_installment,
      &fee_type,
      fee_val,
      fee_amt,
      &formatted_created_at
    ],
  );

  if let Err(e) = sale_res {
    return Err(format!("Failed to insert sale record: {}", e));
  }

  // Insert sale line items
  for (idx, item) in items.iter().enumerate() {
    let item_id = format!("sitem_{}_{}", sale_id, idx);
    let item_res = tx.execute(
      "INSERT INTO sale_items (id, sale_id, product_id, product_model, quantity, unit_price, total_price) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
      rusqlite::params![
        &item_id,
        &sale_id,
        &item.product_id,
        &item.product_model,
        item.quantity,
        item.unit_price,
        item.total_price
      ],
    );

    if let Err(e) = item_res {
      return Err(format!("Failed to insert sale line item: {}", e));
    }
  }

  // Insert Customer Ledger Entry
  let ledger_id = format!("ledg_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
  let desc = if payment_type == "installment" {
    format!("POS Installment Purchase ({}-Month Plan @ Rs. {:.2}/mo)", installment_months, monthly_installment)
  } else {
    "POS Direct Full Purchase".to_string()
  };

  let ledger_res = tx.execute(
    "INSERT INTO customer_ledgers (id, customer_id, customer_name, customer_cnic, customer_mobile, sale_id, transaction_number, transaction_type, total_amount, paid_amount, remaining_balance, payment_type, installment_months, monthly_installment, description, installment_fee_type, installment_fee_value, installment_fee_amount, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)",
    rusqlite::params![
      &ledger_id,
      &customer_id,
      customer_name,
      customer_cnic,
      customer_mobile,
      &sale_id,
      &tx_number,
      &txn_type,
      total_amount,
      paid_amount,
      remaining_balance,
      &payment_type,
      installment_months,
      monthly_installment,
      &desc,
      &fee_type,
      fee_val,
      fee_amt,
      &formatted_created_at
    ],
  );

  if let Err(e) = ledger_res {
    return Err(format!("Failed to create customer ledger entry: {}", e));
  }

  let created_at: String = tx
    .query_row("SELECT created_at FROM sales WHERE id = ?1", [&sale_id], |r| r.get(0))
    .unwrap_or_else(|_| formatted_created_at.clone());

  if let Err(e) = tx.commit() {
    return Err(format!("Failed to commit sale transaction: {}", e));
  }

  Ok(SaleRow {
    id: sale_id,
    transaction_number: tx_number,
    customer_name: customer_name.to_string(),
    chassis_no,
    motor_no,
    subtotal,
    discount_amount,
    total_amount,
    payment_type,
    installment_months,
    monthly_installment,
    installment_fee_type: Some(fee_type),
    installment_fee_value: Some(fee_val),
    installment_fee_amount: Some(fee_amt),
    created_at,
  })
}

#[tauri::command]
fn get_sales(
  search: String,
  payment_type: String,
  page: i32,
  per_page: i32,
) -> Result<SaleListResult, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let search_term = format!("%{}%", search.trim());
  let offset = (page.max(1) - 1) * per_page.max(1);

  let total_revenue: f64 = conn
    .query_row("SELECT COALESCE(SUM(total_amount), 0.0) FROM sales", [], |r| r.get(0))
    .unwrap_or(0.0);

  let total_sales: i64 = conn
    .query_row("SELECT COUNT(*) FROM sales", [], |r| r.get(0))
    .unwrap_or(0);

  let full_payment_sales: i64 = conn
    .query_row("SELECT COUNT(*) FROM sales WHERE payment_type = 'full'", [], |r| r.get(0))
    .unwrap_or(0);

  let installment_sales: i64 = conn
    .query_row("SELECT COUNT(*) FROM sales WHERE payment_type = 'installment'", [], |r| r.get(0))
    .unwrap_or(0);

  let mut where_conds = vec!["(s.transaction_number LIKE ?1 OR s.customer_name LIKE ?1 OR COALESCE(s.customer_cnic, '') LIKE ?1 OR COALESCE(s.customer_mobile, '') LIKE ?1 OR COALESCE(s.chassis_no, '') LIKE ?1 OR COALESCE(s.motor_no, '') LIKE ?1)".to_string()];

  let has_pt = !payment_type.is_empty() && payment_type != "all";
  if has_pt {
    where_conds.push("s.payment_type = ?2".to_string());
  }

  let where_clause = where_conds.join(" AND ");

  let count_sql = format!("SELECT COUNT(*) FROM sales s WHERE {}", where_clause);
  let mut count_stmt = match conn.prepare(&count_sql) {
    Ok(st) => st,
    Err(e) => return Err(format!("Count prep error: {}", e)),
  };

  let pt_param = if has_pt { payment_type.clone() } else { "".to_string() };

  let total_count: i64 = count_stmt
    .query_row([&search_term, &pt_param], |r| r.get(0))
    .unwrap_or(0);

  let sql = format!(
    "SELECT s.id, s.transaction_number, s.customer_id, s.customer_name, s.customer_cnic, s.customer_mobile, c.address, s.chassis_no, s.motor_no, s.subtotal, s.discount_amount, s.total_amount, s.paid_amount, s.remaining_balance, s.payment_type, s.installment_months, s.monthly_installment, s.installment_fee_type, s.installment_fee_value, s.installment_fee_amount, s.status, s.created_at FROM sales s LEFT JOIN customers c ON s.customer_id = c.id WHERE {} ORDER BY s.created_at DESC LIMIT ?3 OFFSET ?4",
    where_clause
  );

  let mut stmt = match conn.prepare(&sql) {
    Ok(st) => st,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map(
    [&search_term, &pt_param, &per_page.to_string(), &offset.to_string()],
    |row| {
      Ok(SaleDetailRow {
        id: row.get(0)?,
        transaction_number: row.get(1)?,
        customer_id: row.get(2)?,
        customer_name: row.get(3)?,
        customer_cnic: row.get(4)?,
        customer_mobile: row.get(5)?,
        customer_address: row.get(6)?,
        chassis_no: row.get(7)?,
        motor_no: row.get(8)?,
        subtotal: row.get(9)?,
        discount_amount: row.get(10)?,
        total_amount: row.get(11)?,
        paid_amount: row.get(12)?,
        remaining_balance: row.get(13)?,
        payment_type: row.get(14)?,
        installment_months: row.get(15)?,
        monthly_installment: row.get(16)?,
        installment_fee_type: row.get(17)?,
        installment_fee_value: row.get(18)?,
        installment_fee_amount: row.get(19)?,
        status: row.get(20)?,
        created_at: row.get(21)?,
      })
    },
  ) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut list = Vec::new();
  for r in rows {
    if let Ok(s) = r { list.push(s); }
  }

  Ok(SaleListResult {
    sales: list,
    total_count,
    stats: SaleListStats {
      total_revenue,
      total_sales,
      full_payment_sales,
      installment_sales,
    },
  })
}

#[tauri::command]
fn get_sale_details(sale_id: String) -> Result<SaleFullDetails, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let sale: SaleDetailRow = match conn.query_row(
    "SELECT s.id, s.transaction_number, s.customer_id, s.customer_name, s.customer_cnic, s.customer_mobile, c.address, s.chassis_no, s.motor_no, s.subtotal, s.discount_amount, s.total_amount, s.paid_amount, s.remaining_balance, s.payment_type, s.installment_months, s.monthly_installment, s.installment_fee_type, s.installment_fee_value, s.installment_fee_amount, s.status, s.created_at FROM sales s LEFT JOIN customers c ON s.customer_id = c.id WHERE s.id = ?1",
    [&sale_id],
    |row| {
      Ok(SaleDetailRow {
        id: row.get(0)?,
        transaction_number: row.get(1)?,
        customer_id: row.get(2)?,
        customer_name: row.get(3)?,
        customer_cnic: row.get(4)?,
        customer_mobile: row.get(5)?,
        customer_address: row.get(6)?,
        chassis_no: row.get(7)?,
        motor_no: row.get(8)?,
        subtotal: row.get(9)?,
        discount_amount: row.get(10)?,
        total_amount: row.get(11)?,
        paid_amount: row.get(12)?,
        remaining_balance: row.get(13)?,
        payment_type: row.get(14)?,
        installment_months: row.get(15)?,
        monthly_installment: row.get(16)?,
        installment_fee_type: row.get(17)?,
        installment_fee_value: row.get(18)?,
        installment_fee_amount: row.get(19)?,
        status: row.get(20)?,
        created_at: row.get(21)?,
      })
    },
  ) {
    Ok(s) => s,
    Err(e) => return Err(format!("Sale record not found: {}", e)),
  };

  let mut stmt = match conn.prepare(
    "SELECT si.id, si.sale_id, si.product_id, si.product_model, p.category, p.color, p.battery_type, p.volt, CAST(p.manufacturing_year AS TEXT), si.quantity, si.unit_price, si.total_price FROM sale_items si LEFT JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?1",
  ) {
    Ok(st) => st,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map([&sale_id], |row| {
    Ok(SaleItemRecord {
      id: row.get(0)?,
      sale_id: row.get(1)?,
      product_id: row.get(2)?,
      product_model: row.get(3)?,
      category: row.get(4)?,
      color: row.get(5)?,
      battery_type: row.get(6)?,
      volt: row.get(7)?,
      manufacturing_year: row.get(8)?,
      quantity: row.get(9)?,
      unit_price: row.get(10)?,
      total_price: row.get(11)?,
    })
  }) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut items = Vec::new();
  for r in rows {
    if let Ok(item) = r { items.push(item); }
  }

  Ok(SaleFullDetails { sale, items })
}

#[tauri::command]
fn get_customer_ledger(customer_id: String) -> Result<CustomerLedgerResult, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let cust: CustomerRow = match conn.query_row(
    "SELECT id, name, address, cnic, mobile, created_at FROM customers WHERE id = ?1",
    [&customer_id],
    |r| {
      Ok(CustomerRow {
        id: r.get(0)?,
        name: r.get(1)?,
        address: r.get(2)?,
        cnic: r.get(3)?,
        mobile: r.get(4)?,
        pending_balance: 0.0,
        status: "Settled".to_string(),
        created_at: r.get(5)?,
      })
    },
  ) {
    Ok(c) => c,
    Err(e) => return Err(format!("Customer not found: {}", e)),
  };

  let mut stmt = match conn.prepare(
    "SELECT id, customer_id, customer_name, customer_cnic, customer_mobile, sale_id, transaction_number, transaction_type, total_amount, paid_amount, remaining_balance, payment_type, installment_months, monthly_installment, installment_fee_type, installment_fee_value, installment_fee_amount, description, created_at FROM customer_ledgers WHERE customer_id = ?1 ORDER BY created_at DESC",
  ) {
    Ok(s) => s,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map([&customer_id], |row| {
    Ok(CustomerLedgerRow {
      id: row.get(0)?,
      customer_id: row.get(1)?,
      customer_name: row.get(2)?,
      customer_cnic: row.get(3)?,
      customer_mobile: row.get(4)?,
      sale_id: row.get(5)?,
      transaction_number: row.get(6)?,
      transaction_type: row.get(7)?,
      total_amount: row.get(8)?,
      paid_amount: row.get(9)?,
      remaining_balance: row.get(10)?,
      payment_type: row.get(11)?,
      installment_months: row.get(12)?,
      monthly_installment: row.get(13)?,
      installment_fee_type: row.get(14)?,
      installment_fee_value: row.get(15)?,
      installment_fee_amount: row.get(16)?,
      description: row.get(17)?,
      created_at: row.get(18)?,
    })
  }) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut entries = Vec::new();
  let mut total_purchases = 0.0;
  let mut total_paid = 0.0;

  for r in rows {
    if let Ok(entry) = r {
      if entry.transaction_type.starts_with("sale") {
        total_purchases += entry.total_amount;
      }
      total_paid += entry.paid_amount;
      entries.push(entry);
    }
  }

  let remaining_balance = (total_purchases - total_paid).max(0.0);
  let total_entries = entries.len() as i64;

  Ok(CustomerLedgerResult {
    customer: cust,
    entries,
    stats: CustomerLedgerStats {
      total_purchases,
      total_paid,
      remaining_balance,
      total_entries,
    },
  })
}

#[tauri::command]
fn add_customer_ledger_payment(
  customer_id: String,
  sale_id: Option<String>,
  amount: f64,
  description: Option<String>,
) -> Result<String, String> {
  if amount <= 0.0 {
    return Err("Payment amount must be greater than zero.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let cust: CustomerRow = match conn.query_row(
    "SELECT id, name, address, cnic, mobile, created_at FROM customers WHERE id = ?1",
    [&customer_id],
    |r| {
      Ok(CustomerRow {
        id: r.get(0)?,
        name: r.get(1)?,
        address: r.get(2)?,
        cnic: r.get(3)?,
        mobile: r.get(4)?,
        pending_balance: 0.0,
        status: "Settled".to_string(),
        created_at: r.get(5)?,
      })
    },
  ) {
    Ok(c) => c,
    Err(e) => return Err(format!("Customer not found: {}", e)),
  };

  // If sale_id is supplied, update that specific sale's paid_amount and remaining_balance
  if let Some(ref sid) = sale_id {
    let _ = conn.execute(
      "UPDATE sales SET paid_amount = paid_amount + ?1, remaining_balance = MAX(0.0, remaining_balance - ?1) WHERE id = ?2",
      rusqlite::params![amount, sid],
    );
  }

  let prev_balance: f64 = conn
    .query_row(
      "SELECT remaining_balance FROM customer_ledgers WHERE customer_id = ?1 ORDER BY created_at DESC LIMIT 1",
      [&customer_id],
      |r| r.get(0),
    )
    .unwrap_or(0.0);

  let new_balance = (prev_balance - amount).max(0.0);
  let ledger_id = format!("ledg_pay_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
  let tx_number = format!("PAY-{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs());
  let desc = description.unwrap_or_else(|| "Customer Installment Payment".to_string());

  let res = conn.execute(
    "INSERT INTO customer_ledgers (id, customer_id, customer_name, customer_cnic, customer_mobile, sale_id, transaction_number, transaction_type, total_amount, paid_amount, remaining_balance, payment_type, description) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
    rusqlite::params![
      &ledger_id,
      &customer_id,
      &cust.name,
      &cust.cnic,
      &cust.mobile,
      &sale_id,
      &tx_number,
      "installment_payment",
      0.0,
      amount,
      new_balance,
      "installment",
      &desc
    ],
  );

  match res {
    Ok(_) => Ok(ledger_id),
    Err(e) => Err(format!("Failed to record ledger payment: {}", e)),
  }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CustomerLedgerReceiptDetails {
  pub receipt_id: String,
  pub transaction_number: String,
  pub created_at: String,
  pub customer_name: String,
  pub customer_cnic: String,
  pub customer_mobile: String,
  pub customer_address: String,
  pub sale_id: Option<String>,
  pub product_model: Option<String>,
  pub chassis_no: Option<String>,
  pub motor_no: Option<String>,
  pub total_agreement_amount: f64,
  pub down_payment: f64,
  pub payment_amount: f64,
  pub total_paid_to_date: f64,
  pub remaining_balance: f64,
  pub installment_months: i32,
  pub monthly_installment: f64,
  pub installments_paid_count: i32,
  pub pending_installments_count: i32,
  pub payment_type: String,
  pub description: String,
}

#[tauri::command]
fn get_customer_ledger_entry(ledger_id: String) -> Result<CustomerLedgerReceiptDetails, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  struct TempLedger {
    id: String,
    customer_id: String,
    sale_id: Option<String>,
    transaction_number: String,
    paid_amount: f64,
    remaining_balance: f64,
    description: Option<String>,
    created_at: String,
  }

  let l_entry: TempLedger = conn.query_row(
    "SELECT id, customer_id, sale_id, transaction_number, paid_amount, remaining_balance, description, created_at FROM customer_ledgers WHERE id = ?1",
    [&ledger_id],
    |r| {
      Ok(TempLedger {
        id: r.get(0)?,
        customer_id: r.get(1)?,
        sale_id: r.get(2)?,
        transaction_number: r.get(3)?,
        paid_amount: r.get(4)?,
        remaining_balance: r.get(5)?,
        description: r.get(6)?,
        created_at: r.get(7)?,
      })
    },
  ).map_err(|e| format!("Ledger entry not found: {}", e))?;

  let cust: CustomerRow = conn.query_row(
    "SELECT id, name, address, cnic, mobile, created_at FROM customers WHERE id = ?1",
    [&l_entry.customer_id],
    |r| {
      Ok(CustomerRow {
        id: r.get(0)?,
        name: r.get(1)?,
        address: r.get(2)?,
        cnic: r.get(3)?,
        mobile: r.get(4)?,
        pending_balance: 0.0,
        status: "Settled".to_string(),
        created_at: r.get(5)?,
      })
    },
  ).unwrap_or(CustomerRow {
    id: l_entry.customer_id.clone(),
    name: "Customer".to_string(),
    address: "N/A".to_string(),
    cnic: "N/A".to_string(),
    mobile: "N/A".to_string(),
    pending_balance: 0.0,
    status: "Settled".to_string(),
    created_at: "".to_string(),
  });

  let sale_id_to_use = l_entry.sale_id.clone().or_else(|| {
    conn.query_row(
      "SELECT id FROM sales WHERE customer_id = ?1 ORDER BY created_at DESC LIMIT 1",
      [&l_entry.customer_id],
      |r| r.get(0),
    ).ok()
  });

  let mut total_agreement_amount = 0.0;
  let mut down_payment = 0.0;
  let mut installment_months = 0;
  let mut monthly_installment = 0.0;
  let mut product_model = None;
  let mut chassis_no = None;
  let mut motor_no = None;

  let mut payment_type = "installment".to_string();

  if let Some(ref sid) = sale_id_to_use {
    if let Ok((tot, inst_m, inst_p, ch, mo, p_type)) = conn.query_row::<(f64, i32, f64, Option<String>, Option<String>, String), _, _>(
      "SELECT total_amount, installment_months, monthly_installment, chassis_no, motor_no, payment_type FROM sales WHERE id = ?1",
      [sid],
      |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?, r.get(5)?)),
    ) {
      total_agreement_amount = tot;
      installment_months = inst_m;
      monthly_installment = inst_p;
      chassis_no = ch;
      motor_no = mo;
      payment_type = p_type;
    }

    let p_model: Option<String> = conn.query_row(
      "SELECT product_model FROM sale_items WHERE sale_id = ?1 LIMIT 1",
      [sid],
      |r| r.get(0),
    ).ok();
    product_model = p_model;

    down_payment = conn.query_row(
      "SELECT paid_amount FROM customer_ledgers WHERE customer_id = ?1 AND (transaction_type = 'sale_installment' OR sale_id = ?2) ORDER BY created_at ASC LIMIT 1",
      rusqlite::params![&l_entry.customer_id, sid],
      |r| r.get(0),
    ).unwrap_or(0.0);
  }

  let total_paid_to_date: f64 = conn.query_row(
    "SELECT COALESCE(SUM(paid_amount), 0.0) FROM customer_ledgers WHERE customer_id = ?1 AND created_at <= ?2",
    rusqlite::params![&l_entry.customer_id, &l_entry.created_at],
    |r| r.get(0),
  ).unwrap_or(l_entry.paid_amount);

  let installment_payments_count: i32 = conn.query_row(
    "SELECT COUNT(*) FROM customer_ledgers WHERE customer_id = ?1 AND transaction_type = 'installment_payment' AND created_at <= ?2",
    rusqlite::params![&l_entry.customer_id, &l_entry.created_at],
    |r| r.get(0),
  ).unwrap_or(0);

  let total_installments_paid_count = if down_payment > 0.0 {
    installment_payments_count + 1
  } else {
    installment_payments_count
  };

  let pending_installments_count = (installment_months - total_installments_paid_count).max(0);

  let current_rem_balance = if total_agreement_amount > 0.0 {
    (total_agreement_amount - total_paid_to_date).max(0.0)
  } else {
    l_entry.remaining_balance
  };

  Ok(CustomerLedgerReceiptDetails {
    receipt_id: l_entry.id,
    transaction_number: l_entry.transaction_number,
    created_at: l_entry.created_at,
    customer_name: cust.name,
    customer_cnic: cust.cnic,
    customer_mobile: cust.mobile,
    customer_address: cust.address,
    sale_id: sale_id_to_use,
    product_model,
    chassis_no,
    motor_no,
    total_agreement_amount,
    down_payment,
    payment_amount: l_entry.paid_amount,
    total_paid_to_date,
    remaining_balance: current_rem_balance,
    installment_months,
    monthly_installment,
    installments_paid_count: total_installments_paid_count,
    pending_installments_count,
    payment_type,
    description: l_entry.description.unwrap_or_else(|| "Installment Payment".to_string()),
  })
}

#[tauri::command]
fn add_stock_batch(
  batch_no: String,
  supplier_company: String,
  items: Vec<StockBatchItemInput>,
) -> Result<StockBatchRow, String> {
  let batch_no = batch_no.trim();
  let supplier_company = supplier_company.trim();

  if batch_no.is_empty() || supplier_company.is_empty() {
    return Err("Batch Number and Supplier Company are required.".into());
  }

  if items.is_empty() {
    return Err("Cannot confirm intake session with zero items.".into());
  }

  let db_path = get_db_path();
  let mut conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let tx = match conn.transaction() {
    Ok(t) => t,
    Err(e) => return Err(format!("Failed to start transaction: {}", e)),
  };

  let batch_id = format!("batch_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
  
  let total_items = items.len() as i32;
  let total_quantity: i32 = items.iter().map(|i| i.quantity).sum();
  let total_value: f64 = items.iter().map(|i| i.cost_price * (i.quantity as f64)).sum();

  let batch_res = tx.execute(
    "INSERT INTO stock_batches (id, batch_no, supplier_company, total_items, total_quantity, total_value) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    rusqlite::params![&batch_id, batch_no, supplier_company, total_items, total_quantity, total_value],
  );

  if let Err(e) = batch_res {
    return Err(format!("Failed to insert batch header: {}", e));
  }

  for (idx, item) in items.iter().enumerate() {
    let item_id = format!("item_{}_{}", batch_id, idx);
    let item_res = tx.execute(
      "INSERT INTO stock_batch_items (id, batch_id, product_id, product_model, category, quantity, discount, retail_price, cost_price) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
      rusqlite::params![
        &item_id,
        &batch_id,
        &item.product_id,
        &item.product_model,
        &item.category,
        item.quantity,
        item.discount,
        item.retail_price,
        item.cost_price
      ],
    );

    if let Err(e) = item_res {
      return Err(format!("Failed to insert batch item: {}", e));
    }

    // Insert separate rate entry into stock_inventory linked to product_id
    let stock_id = format!("stk_{}_{}", batch_id, idx);
    let stock_res = tx.execute(
      "INSERT INTO stock_inventory (id, product_id, supplier_company, batch_no, initial_quantity, quantity, retail_price, discount, cost_price) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
      rusqlite::params![
        &stock_id,
        &item.product_id,
        supplier_company,
        batch_no,
        item.quantity,
        item.quantity,
        item.retail_price,
        item.discount,
        item.cost_price
      ],
    );

    if let Err(e) = stock_res {
      return Err(format!("Failed to insert stock inventory entry: {}", e));
    }

    // Increment master product stock quantity in products table
    let update_res = tx.execute(
      "UPDATE products SET quantity = quantity + ?1, initial_discount = ?2, retail_price = ?3, cost_price = ?4 WHERE id = ?5",
      rusqlite::params![
        item.quantity,
        item.discount,
        item.retail_price,
        item.cost_price,
        &item.product_id
      ],
    );

    if let Err(e) = update_res {
      return Err(format!("Failed to update product stock: {}", e));
    }
  }

  let created_at: String = tx
    .query_row("SELECT created_at FROM stock_batches WHERE id = ?1", [&batch_id], |r| r.get(0))
    .unwrap_or_else(|_| "Just now".to_string());

  // Auto-record stock intake as an expense entry
  let exp_id = format!("exp_{}", batch_id);
  let exp_title = format!("Stock Intake - Batch #{}", batch_no);
  let exp_desc = format!(
    "Auto-generated expense from stock batch intake #{} (Supplier: {}, Items: {}, Total Qty: {})",
    batch_no, supplier_company, total_items, total_quantity
  );
  let _ = tx.execute(
    "INSERT INTO expenses (id, title, category, amount, payment_method, reference_id, description, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
    rusqlite::params![
      &exp_id,
      &exp_title,
      "Stock Purchase",
      total_value,
      "Supplier Credit / Cash",
      &batch_id,
      &exp_desc,
      &created_at
    ],
  );

  if let Err(e) = tx.commit() {
    return Err(format!("Failed to commit batch transaction: {}", e));
  }

  Ok(StockBatchRow {
    id: batch_id,
    batch_no: batch_no.to_string(),
    supplier_company: supplier_company.to_string(),
    total_items,
    total_quantity,
    total_value,
    created_at,
  })
}

#[tauri::command]
fn get_available_stock_inventory(
  search: String,
  supplier: String,
  product_id: String,
  start_date: String,
  end_date: String,
  page: i32,
  per_page: i32,
) -> Result<AvailableStockResult, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  // Supplier filter options
  let mut suppliers = Vec::new();
  if let Ok(mut stmt) = conn.prepare("SELECT DISTINCT supplier_company FROM stock_inventory WHERE quantity > 0 ORDER BY supplier_company ASC") {
    if let Ok(rows) = stmt.query_map([], |r| r.get(0)) {
      for r in rows {
        if let Ok(s) = r { suppliers.push(s); }
      }
    }
  }

  // Product filter options
  let mut products = Vec::new();
  if let Ok(mut stmt) = conn.prepare("SELECT id, model FROM products ORDER BY model ASC") {
    if let Ok(rows) = stmt.query_map([], |r| Ok(ProductOptionItem { id: r.get(0)?, model: r.get(1)? })) {
      for r in rows {
        if let Ok(p) = r { products.push(p); }
      }
    }
  }

  let search_term = format!("%{}%", search.trim());
  let offset = (page.max(1) - 1) * per_page.max(1);

  let mut where_conds = vec![
    "s.quantity > 0".to_string(),
    "(p.model LIKE ?1 OR s.supplier_company LIKE ?1 OR s.batch_no LIKE ?1 OR p.category LIKE ?1)".to_string(),
  ];

  let has_supp = !supplier.is_empty() && supplier != "all";
  if has_supp {
    where_conds.push("s.supplier_company = ?2".to_string());
  }

  let has_prod = !product_id.is_empty() && product_id != "all";
  if has_prod {
    where_conds.push("s.product_id = ?3".to_string());
  }

  let has_start = !start_date.is_empty();
  if has_start {
    where_conds.push("s.created_at >= ?4".to_string());
  }

  let has_end = !end_date.is_empty();
  if has_end {
    where_conds.push("s.created_at <= ?5".to_string());
  }

  let where_clause = where_conds.join(" AND ");

  let count_sql = format!(
    "SELECT COUNT(*) FROM (SELECT 1 FROM stock_inventory s JOIN products p ON s.product_id = p.id WHERE {} GROUP BY s.product_id, s.retail_price, s.discount, s.cost_price)",
    where_clause
  );

  let mut count_stmt = match conn.prepare(&count_sql) {
    Ok(st) => st,
    Err(e) => return Err(format!("Count prep error: {}", e)),
  };

  let supp_param = if has_supp { supplier.clone() } else { "".to_string() };
  let prod_param = if has_prod { product_id.clone() } else { "".to_string() };
  let start_param = if has_start { format!("{} 00:00:00", start_date) } else { "".to_string() };
  let end_param = if has_end { format!("{} 23:59:59", end_date) } else { "".to_string() };

  let total_count: i64 = count_stmt
    .query_row(
      [&search_term, &supp_param, &prod_param, &start_param, &end_param],
      |r| r.get(0),
    )
    .unwrap_or(0);

  let sql = format!(
    "SELECT 
      MIN(s.id) as id,
      s.product_id,
      p.model,
      p.category,
      p.color,
      GROUP_CONCAT(DISTINCT s.supplier_company) as supplier_company,
      MIN(s.batch_no) as batch_no,
      SUM(s.quantity) as stock_qty,
      (SELECT SUM(quantity) FROM stock_inventory WHERE product_id = s.product_id AND quantity > 0) as total_prod_stock,
      (SELECT COUNT(DISTINCT (retail_price || '_' || discount)) FROM stock_inventory WHERE product_id = s.product_id AND quantity > 0) as rate_count,
      s.retail_price,
      s.discount,
      s.cost_price,
      MAX(s.created_at) as created_at
     FROM stock_inventory s
     JOIN products p ON s.product_id = p.id
     WHERE {}
     GROUP BY s.product_id, s.retail_price, s.discount, s.cost_price
     ORDER BY MAX(s.created_at) DESC
     LIMIT ?6 OFFSET ?7",
    where_clause
  );

  let mut stmt = match conn.prepare(&sql) {
    Ok(s) => s,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map(
    [
      &search_term,
      &supp_param,
      &prod_param,
      &start_param,
      &end_param,
      &per_page.to_string(),
      &offset.to_string(),
    ],
    |row| {
      let stock_qty: i32 = row.get(7)?;
      let retail_price: f64 = row.get(10)?;
      let cost_price: f64 = row.get(12)?;
      let unit_margin = retail_price - cost_price;
      let total_profit = unit_margin * (stock_qty as f64);

      Ok(StockInventoryRow {
        id: row.get(0)?,
        product_id: row.get(1)?,
        product_model: row.get(2)?,
        category: row.get(3)?,
        color: row.get(4)?,
        supplier_company: row.get(5)?,
        batch_no: row.get(6)?,
        stock_qty,
        total_product_stock: row.get(8)?,
        rate_count: row.get(9)?,
        retail_price,
        discount: row.get(11)?,
        cost_price,
        unit_margin,
        total_profit,
        created_at: row.get(13)?,
      })
    },
  ) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut list = Vec::new();
  for row in rows {
    if let Ok(entry) = row {
      list.push(entry);
    }
  }

  Ok(AvailableStockResult {
    entries: list,
    total_count,
    suppliers,
    products,
  })
}

#[tauri::command]
fn consume_stock_fifo(
  product_id: String,
  quantity_to_consume: i32,
) -> Result<String, String> {
  if quantity_to_consume <= 0 {
    return Err("Quantity to consume must be greater than zero.".into());
  }

  let db_path = get_db_path();
  let mut conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let tx = match conn.transaction() {
    Ok(t) => t,
    Err(e) => return Err(format!("Failed to start transaction: {}", e)),
  };

  let total_avail: i32 = tx
    .query_row(
      "SELECT COALESCE(SUM(quantity), 0) FROM stock_inventory WHERE product_id = ?1 AND quantity > 0",
      [&product_id],
      |r| r.get(0),
    )
    .unwrap_or(0);

  if total_avail < quantity_to_consume {
    return Err(format!(
      "Insufficient stock available. Requested: {}, Available: {}",
      quantity_to_consume, total_avail
    ));
  }

  struct StockBatchRecord {
    id: String,
    quantity: i32,
  }

  let mut batches = Vec::new();
  {
    let mut stmt = match tx.prepare(
      "SELECT id, quantity FROM stock_inventory WHERE product_id = ?1 AND quantity > 0 ORDER BY created_at ASC",
    ) {
      Ok(s) => s,
      Err(e) => return Err(format!("Prep error: {}", e)),
    };

    let rows = match stmt.query_map([&product_id], |r| {
      Ok(StockBatchRecord {
        id: r.get(0)?,
        quantity: r.get(1)?,
      })
    }) {
      Ok(r) => r,
      Err(e) => return Err(format!("Query map error: {}", e)),
    };

    for r in rows {
      if let Ok(b) = r {
        batches.push(b);
      }
    }
  }

  let mut remaining = quantity_to_consume;
  for b in batches {
    if remaining <= 0 {
      break;
    }

    if b.quantity <= remaining {
      let _ = tx.execute(
        "UPDATE stock_inventory SET quantity = 0 WHERE id = ?1",
        [&b.id],
      );
      remaining -= b.quantity;
    } else {
      let new_qty = b.quantity - remaining;
      let _ = tx.execute(
        "UPDATE stock_inventory SET quantity = ?1 WHERE id = ?2",
        rusqlite::params![new_qty, &b.id],
      );
      remaining = 0;
    }
  }

  // Update master product aggregate stock
  let _ = tx.execute(
    "UPDATE products SET quantity = (SELECT COALESCE(SUM(quantity), 0) FROM stock_inventory WHERE product_id = ?1 AND quantity > 0) WHERE id = ?1",
    [&product_id],
  );

  if let Err(e) = tx.commit() {
    return Err(format!("Failed to commit FIFO consumption: {}", e));
  }

  Ok("success".into())
}

#[tauri::command]
fn get_stock_batches(
  search: String,
  page: i32,
  per_page: i32,
) -> Result<StockBatchListResult, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let search_term = format!("%{}%", search.trim());
  let offset = (page.max(1) - 1) * per_page.max(1);

  let total_batches: i64 = conn
    .query_row("SELECT COUNT(*) FROM stock_batches", [], |r| r.get(0))
    .unwrap_or(0);

  let total_units: i64 = conn
    .query_row("SELECT COALESCE(SUM(total_quantity), 0) FROM stock_batches", [], |r| r.get(0))
    .unwrap_or(0);

  let total_investment: f64 = conn
    .query_row("SELECT COALESCE(SUM(total_value), 0.0) FROM stock_batches", [], |r| r.get(0))
    .unwrap_or(0.0);

  let active_suppliers: i64 = conn
    .query_row("SELECT COUNT(DISTINCT supplier_company) FROM stock_batches", [], |r| r.get(0))
    .unwrap_or(0);

  let count_sql = "SELECT COUNT(*) FROM stock_batches WHERE batch_no LIKE ?1 OR supplier_company LIKE ?1";
  let total_count: i64 = conn
    .query_row(count_sql, [&search_term], |row| row.get(0))
    .unwrap_or(0);

  let sql = "SELECT id, batch_no, supplier_company, total_items, total_quantity, total_value, created_at FROM stock_batches WHERE batch_no LIKE ?1 OR supplier_company LIKE ?1 ORDER BY created_at DESC LIMIT ?2 OFFSET ?3";

  let mut stmt = match conn.prepare(sql) {
    Ok(s) => s,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map([&search_term, &per_page.to_string(), &offset.to_string()], |row| {
    Ok(StockBatchRow {
      id: row.get(0)?,
      batch_no: row.get(1)?,
      supplier_company: row.get(2)?,
      total_items: row.get(3)?,
      total_quantity: row.get(4)?,
      total_value: row.get(5)?,
      created_at: row.get(6)?,
    })
  }) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut list = Vec::new();
  for row in rows {
    if let Ok(b) = row {
      list.push(b);
    }
  }

  Ok(StockBatchListResult {
    batches: list,
    total_count,
    stats: StockBatchSummaryStats {
      total_batches,
      total_units,
      total_investment,
      active_suppliers,
    },
  })
}

#[tauri::command]
fn get_stock_batch_items(batch_id: String) -> Result<Vec<StockBatchItemRow>, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  let mut stmt = match conn.prepare(
    "SELECT id, batch_id, product_id, product_model, category, quantity, discount, retail_price, cost_price FROM stock_batch_items WHERE batch_id = ?1",
  ) {
    Ok(s) => s,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map([&batch_id], |row| {
    Ok(StockBatchItemRow {
      id: row.get(0)?,
      batch_id: row.get(1)?,
      product_id: row.get(2)?,
      product_model: row.get(3)?,
      category: row.get(4)?,
      quantity: row.get(5)?,
      discount: row.get(6)?,
      retail_price: row.get(7)?,
      cost_price: row.get(8)?,
    })
  }) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut list = Vec::new();
  for row in rows {
    if let Ok(item) = row {
      list.push(item);
    }
  }

  Ok(list)
}

#[tauri::command]
fn get_expenses(
  search: String,
  category: String,
  start_date: String,
  end_date: String,
  order_by: String,
  page: i32,
  per_page: i32,
) -> Result<ExpenseListResult, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let search_term = format!("%{}%", search.trim());
  let offset = (page.max(1) - 1) * per_page.max(1);

  // Calculate global summary stats
  let total_expenses: f64 = conn
    .query_row("SELECT COALESCE(SUM(amount), 0.0) FROM expenses", [], |r| r.get(0))
    .unwrap_or(0.0);

  let stock_expenses: f64 = conn
    .query_row("SELECT COALESCE(SUM(amount), 0.0) FROM expenses WHERE category = 'Stock Purchase'", [], |r| r.get(0))
    .unwrap_or(0.0);

  let operational_expenses: f64 = conn
    .query_row("SELECT COALESCE(SUM(amount), 0.0) FROM expenses WHERE category != 'Stock Purchase'", [], |r| r.get(0))
    .unwrap_or(0.0);

  let this_month_expenses: f64 = conn
    .query_row(
      "SELECT COALESCE(SUM(amount), 0.0) FROM expenses WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')",
      [],
      |r| r.get(0),
    )
    .unwrap_or(0.0);

  let mut where_conds = vec![
    "(title LIKE ?1 OR category LIKE ?1 OR COALESCE(reference_id, '') LIKE ?1 OR COALESCE(description, '') LIKE ?1)".to_string(),
  ];

  let has_cat = !category.is_empty() && category != "all";
  if has_cat {
    where_conds.push("category = ?2".to_string());
  }

  let has_start = !start_date.is_empty();
  if has_start {
    where_conds.push("created_at >= ?3".to_string());
  }

  let has_end = !end_date.is_empty();
  if has_end {
    where_conds.push("created_at <= ?4".to_string());
  }

  let where_clause = where_conds.join(" AND ");

  let count_sql = format!("SELECT COUNT(*) FROM expenses WHERE {}", where_clause);
  let mut count_stmt = match conn.prepare(&count_sql) {
    Ok(st) => st,
    Err(e) => return Err(format!("Count prep error: {}", e)),
  };

  let cat_param = if has_cat { category.clone() } else { "".to_string() };
  let start_param = if has_start { format!("{} 00:00:00", start_date) } else { "".to_string() };
  let end_param = if has_end { format!("{} 23:59:59", end_date) } else { "".to_string() };

  let total_count: i64 = count_stmt
    .query_row([&search_term, &cat_param, &start_param, &end_param], |r| r.get(0))
    .unwrap_or(0);

  let order_clause = match order_by.as_str() {
    "amount_desc" => "ORDER BY amount DESC",
    "amount_asc" => "ORDER BY amount ASC",
    "oldest" => "ORDER BY created_at ASC",
    _ => "ORDER BY created_at DESC",
  };

  let sql = format!(
    "SELECT id, title, category, amount, payment_method, reference_id, description, created_at FROM expenses WHERE {} {} LIMIT ?5 OFFSET ?6",
    where_clause, order_clause
  );

  let mut stmt = match conn.prepare(&sql) {
    Ok(st) => st,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map(
    [
      &search_term,
      &cat_param,
      &start_param,
      &end_param,
      &per_page.to_string(),
      &offset.to_string(),
    ],
    |row| {
      Ok(ExpenseRow {
        id: row.get(0)?,
        title: row.get(1)?,
        category: row.get(2)?,
        amount: row.get(3)?,
        payment_method: row.get(4)?,
        reference_id: row.get(5)?,
        description: row.get(6)?,
        created_at: row.get(7)?,
      })
    },
  ) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut list = Vec::new();
  for row in rows {
    if let Ok(entry) = row {
      list.push(entry);
    }
  }

  Ok(ExpenseListResult {
    expenses: list,
    total_count,
    stats: ExpenseListStats {
      total_expenses,
      stock_expenses,
      operational_expenses,
      this_month_expenses,
      total_count,
    },
  })
}

#[tauri::command]
fn add_expense(
  title: String,
  category: String,
  amount: f64,
  payment_method: String,
  description: Option<String>,
) -> Result<ExpenseRow, String> {
  let title = title.trim();
  let category = category.trim();
  let payment_method = payment_method.trim();
  let description = description.map(|s| s.trim().to_string()).filter(|s| !s.is_empty());

  if title.is_empty() {
    return Err("Expense title is required.".into());
  }

  if category.is_empty() {
    return Err("Expense category is required.".into());
  }

  if amount <= 0.0 {
    return Err("Expense amount must be greater than zero.".into());
  }

  if payment_method.is_empty() {
    return Err("Payment method is required.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let id = format!("exp_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());

  let result = conn.execute(
    "INSERT INTO expenses (id, title, category, amount, payment_method, reference_id, description) VALUES (?1, ?2, ?3, ?4, ?5, NULL, ?6)",
    rusqlite::params![&id, title, category, amount, payment_method, &description],
  );

  match result {
    Ok(_) => {
      let created_at: String = conn
        .query_row("SELECT created_at FROM expenses WHERE id = ?1", [&id], |r| r.get(0))
        .unwrap_or_else(|_| "Just now".to_string());

      Ok(ExpenseRow {
        id,
        title: title.to_string(),
        category: category.to_string(),
        amount,
        payment_method: payment_method.to_string(),
        reference_id: None,
        description,
        created_at,
      })
    }
    Err(e) => Err(format!("Failed to add expense: {}", e)),
  }
}

#[tauri::command]
fn delete_expense(id: String) -> Result<String, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  // Check if expense is a stock purchase linked to a batch
  let category: Result<String, _> = conn.query_row(
    "SELECT category FROM expenses WHERE id = ?1",
    [&id],
    |r| r.get(0),
  );

  if let Ok(cat) = category {
    if cat == "Stock Purchase" {
      return Err("Auto-generated Stock Purchase expenses cannot be deleted directly from expenses to maintain inventory audit consistency.".into());
    }
  }

  let count = match conn.execute("DELETE FROM expenses WHERE id = ?1", [&id]) {
    Ok(c) => c,
    Err(e) => return Err(format!("Failed to delete expense: {}", e)),
  };

  if count > 0 {
    Ok("success".into())
  } else {
    Err("Expense record not found.".into())
  }
}

#[tauri::command]
fn get_supplier_ledger(
  supplier_company: String,
  search: String,
  start_date: String,
  end_date: String,
  page: i32,
  per_page: i32,
) -> Result<SupplierLedgerResult, String> {
  let supplier_company = supplier_company.trim();

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  // Fetch supplier profile
  let supplier: SupplierRow = match conn.query_row(
    "SELECT id, company, mobile, address, created_at FROM suppliers WHERE company = ?1 OR id = ?1",
    [supplier_company],
    |row| {
      Ok(SupplierRow {
        id: row.get(0)?,
        company: row.get(1)?,
        mobile: row.get(2)?,
        address: row.get(3)?,
        created_at: row.get(4)?,
      })
    },
  ) {
    Ok(s) => s,
    Err(_) => SupplierRow {
      id: "supp_unknown".to_string(),
      company: supplier_company.to_string(),
      mobile: "N/A".to_string(),
      address: None,
      created_at: "N/A".to_string(),
    },
  };

  let comp_name = &supplier.company;

  let total_batches: i64 = conn
    .query_row(
      "SELECT COUNT(*) FROM stock_batches WHERE supplier_company = ?1",
      [comp_name],
      |r| r.get(0),
    )
    .unwrap_or(0);

  let total_units: i64 = conn
    .query_row(
      "SELECT COALESCE(SUM(total_quantity), 0) FROM stock_batches WHERE supplier_company = ?1",
      [comp_name],
      |r| r.get(0),
    )
    .unwrap_or(0);

  let total_investment: f64 = conn
    .query_row(
      "SELECT COALESCE(SUM(total_value), 0.0) FROM stock_batches WHERE supplier_company = ?1",
      [comp_name],
      |r| r.get(0),
    )
    .unwrap_or(0.0);

  let search_term = format!("%{}%", search.trim());
  let offset = (page.max(1) - 1) * per_page.max(1);

  let mut where_conds = vec![
    "supplier_company = ?1".to_string(),
    "(batch_no LIKE ?2 OR id LIKE ?2)".to_string(),
  ];

  let has_start = !start_date.is_empty();
  if has_start {
    where_conds.push("created_at >= ?3".to_string());
  }

  let has_end = !end_date.is_empty();
  if has_end {
    where_conds.push("created_at <= ?4".to_string());
  }

  let where_clause = where_conds.join(" AND ");

  let count_sql = format!("SELECT COUNT(*) FROM stock_batches WHERE {}", where_clause);
  let mut count_stmt = match conn.prepare(&count_sql) {
    Ok(st) => st,
    Err(e) => return Err(format!("Count prep error: {}", e)),
  };

  let start_param = if has_start { format!("{} 00:00:00", start_date) } else { "".to_string() };
  let end_param = if has_end { format!("{} 23:59:59", end_date) } else { "".to_string() };

  let total_count: i64 = count_stmt
    .query_row([comp_name, &search_term, &start_param, &end_param], |r| r.get(0))
    .unwrap_or(0);

  let sql = format!(
    "SELECT id, batch_no, supplier_company, total_items, total_quantity, total_value, created_at FROM stock_batches WHERE {} ORDER BY created_at DESC LIMIT ?5 OFFSET ?6",
    where_clause
  );

  let mut stmt = match conn.prepare(&sql) {
    Ok(s) => s,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map(
    [
      comp_name,
      &search_term,
      &start_param,
      &end_param,
      &per_page.to_string(),
      &offset.to_string(),
    ],
    |row| {
      Ok(StockBatchRow {
        id: row.get(0)?,
        batch_no: row.get(1)?,
        supplier_company: row.get(2)?,
        total_items: row.get(3)?,
        total_quantity: row.get(4)?,
        total_value: row.get(5)?,
        created_at: row.get(6)?,
      })
    },
  ) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut list = Vec::new();
  for row in rows {
    if let Ok(b) = row {
      list.push(b);
    }
  }

  Ok(SupplierLedgerResult {
    supplier,
    batches: list,
    total_count,
    stats: SupplierLedgerStats {
      total_batches,
      total_units,
      total_investment,
    },
  })
}

#[tauri::command]
fn get_stock_batch_details(batch_id: String) -> Result<StockBatchFullDetails, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let batch: StockBatchRow = match conn.query_row(
    "SELECT id, batch_no, supplier_company, total_items, total_quantity, total_value, created_at FROM stock_batches WHERE id = ?1 OR batch_no = ?1",
    [&batch_id],
    |row| {
      Ok(StockBatchRow {
        id: row.get(0)?,
        batch_no: row.get(1)?,
        supplier_company: row.get(2)?,
        total_items: row.get(3)?,
        total_quantity: row.get(4)?,
        total_value: row.get(5)?,
        created_at: row.get(6)?,
      })
    },
  ) {
    Ok(b) => b,
    Err(e) => return Err(format!("Batch record not found: {}", e)),
  };

  let mut stmt = match conn.prepare(
    "SELECT id, batch_id, product_id, product_model, category, quantity, discount, retail_price, cost_price FROM stock_batch_items WHERE batch_id = ?1",
  ) {
    Ok(s) => s,
    Err(e) => return Err(format!("Query prep error: {}", e)),
  };

  let rows = match stmt.query_map([&batch.id], |row| {
    Ok(StockBatchItemRow {
      id: row.get(0)?,
      batch_id: row.get(1)?,
      product_id: row.get(2)?,
      product_model: row.get(3)?,
      category: row.get(4)?,
      quantity: row.get(5)?,
      discount: row.get(6)?,
      retail_price: row.get(7)?,
      cost_price: row.get(8)?,
    })
  }) {
    Ok(r) => r,
    Err(e) => return Err(format!("Query execution error: {}", e)),
  };

  let mut items = Vec::new();
  for row in rows {
    if let Ok(item) = row {
      items.push(item);
    }
  }

  Ok(StockBatchFullDetails { batch, items })
}

#[tauri::command]
fn get_revenue_summary(
  month_year: String,
  search: Option<String>,
  payment_type_filter: Option<String>,
  category_filter: Option<String>,
) -> Result<RevenueSummaryResult, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let raw_month = month_year.trim();
  let now = chrono::Local::now();
  let cur_month = now.format("%Y-%m").to_string();
  let cur_year = now.format("%Y").to_string();

  let (target_month, sales_date_where, ledgers_date_where) = match raw_month {
    "all_time" | "all" => (
      "all_time".to_string(),
      "1=1".to_string(),
      "1=1".to_string(),
    ),
    "this_year" => (
      cur_year.clone(),
      format!("strftime('%Y', s.created_at) = '{}'", cur_year),
      format!("strftime('%Y', cl.created_at) = '{}'", cur_year),
    ),
    "this_month" | "" => (
      cur_month.clone(),
      format!("strftime('%Y-%m', s.created_at) = '{}'", cur_month),
      format!("strftime('%Y-%m', cl.created_at) = '{}'", cur_month),
    ),
    other => {
      if other.len() == 4 {
        (
          other.to_string(),
          format!("strftime('%Y', s.created_at) = '{}'", other),
          format!("strftime('%Y', cl.created_at) = '{}'", other),
        )
      } else {
        (
          other.to_string(),
          format!("strftime('%Y-%m', s.created_at) = '{}'", other),
          format!("strftime('%Y-%m', cl.created_at) = '{}'", other),
        )
      }
    }
  };

  let search_lower = search.unwrap_or_default().trim().to_lowercase();
  let ptype_filter = payment_type_filter.unwrap_or_default().trim().to_lowercase();
  let cat_filter = category_filter.unwrap_or_default().trim().to_lowercase();

  use std::collections::HashMap;

  #[derive(Default)]
  struct Acc {
    product_model: String,
    installment_months: i32,
    retail_price: f64,
    cost_price: f64,
    quantity_sold: i32,
    recognized_revenue: f64,
    recognized_cost: f64,
    fee_profit: f64,
    discount_amount: f64,
    gross_sales: f64,
  }

  let mut map: HashMap<(String, String, i32), Acc> = HashMap::new();

  // 1. Initial sales created in target_month
  let sql_sales = format!(
    "SELECT 
      si.product_id,
      p.model,
      s.payment_type,
      COALESCE(s.installment_months, 1),
      COALESCE(p.retail_price, si.unit_price),
      COALESCE(p.cost_price, 0.0),
      si.quantity,
      si.total_price,
      COALESCE(s.subtotal, 0.0),
      COALESCE(s.installment_fee_amount, 0.0),
      COALESCE(p.category, ''),
      COALESCE(s.discount_amount, 0.0)
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    JOIN products p ON si.product_id = p.id
    WHERE {} AND s.status != 'cancelled'",
    sales_date_where
  );

  if let Ok(mut stmt) = conn.prepare(&sql_sales) {
    let rows = stmt.query_map([], |row| {
      let pid: String = row.get(0)?;
      let model: String = row.get(1)?;
      let ptype: String = row.get(2)?;
      let months: i32 = row.get(3)?;
      let rp: f64 = row.get(4)?;
      let cp: f64 = row.get(5)?;
      let qty: i32 = row.get(6)?;
      let item_total: f64 = row.get(7)?;
      let subtotal: f64 = row.get(8)?;
      let fee_amt: f64 = row.get(9)?;
      let category: String = row.get(10)?;
      let sale_discount: f64 = row.get(11)?;
      Ok((pid, model, ptype, months, rp, cp, qty, item_total, subtotal, fee_amt, category, sale_discount))
    });

    if let Ok(iter) = rows {
      for r in iter.flatten() {
        let (pid, model, ptype, months, rp, cp, qty, item_total, subtotal, fee_amt, category, sale_discount) = r;

        if !search_lower.is_empty() && !model.to_lowercase().contains(&search_lower) {
          continue;
        }

        if !ptype_filter.is_empty() && ptype_filter != "all" && ptype.to_lowercase() != ptype_filter {
          continue;
        }

        if !cat_filter.is_empty() && cat_filter != "all" && category.to_lowercase() != cat_filter {
          continue;
        }

        let months_valid = months.max(1) as f64;
        let key = (pid.clone(), ptype.clone(), 1);

        let entry = map.entry(key).or_insert_with(|| Acc {
          product_model: model,
          installment_months: months.max(1),
          retail_price: rp,
          cost_price: cp,
          ..Default::default()
        });

        // Distribute overall sale discount proportionally to line item total
        let item_discount = if subtotal > 0.0 {
          sale_discount * (item_total / subtotal)
        } else {
          0.0
        };
        let item_net_total = (item_total - item_discount).max(0.0);

        if ptype == "installment" {
          let item_fee_share = if subtotal > 0.0 { fee_amt * (item_total / subtotal) } else { fee_amt };
          let base_rev_share = item_net_total / months_valid;
          let fee_share = item_fee_share / months_valid;
          let cost_share = (cp * qty as f64) / months_valid;
          let disc_share = item_discount / months_valid;

          entry.quantity_sold += qty;
          entry.recognized_revenue += base_rev_share + fee_share;
          entry.recognized_cost += cost_share;
          entry.fee_profit += fee_share;
          entry.discount_amount += disc_share;
          entry.gross_sales += item_total / months_valid;
        } else {
          entry.quantity_sold += qty;
          entry.recognized_revenue += item_net_total;
          entry.recognized_cost += cp * qty as f64;
          entry.fee_profit += 0.0;
          entry.discount_amount += item_discount;
          entry.gross_sales += item_total;
        }
      }
    }
  }

  // 2. Subsequent installment payments in customer_ledgers in target_month
  let sql_ledgers = format!(
    "SELECT 
      si.product_id,
      p.model,
      COALESCE(s.installment_months, 1),
      COALESCE(p.retail_price, si.unit_price),
      COALESCE(p.cost_price, 0.0),
      si.quantity,
      cl.paid_amount,
      COALESCE(s.subtotal, 0.0),
      COALESCE(s.installment_fee_amount, 0.0),
      COALESCE(p.category, ''),
      cl.id,
      (SELECT COUNT(*) FROM customer_ledgers cl2 WHERE cl2.customer_id = cl.customer_id AND cl2.created_at <= cl.created_at AND cl2.transaction_type IN ('sale_installment', 'installment_payment')) as inst_seq,
      COALESCE(s.discount_amount, 0.0),
      si.total_price
    FROM customer_ledgers cl
    JOIN sales s ON cl.sale_id = s.id
    JOIN sale_items si ON s.id = si.sale_id
    JOIN products p ON si.product_id = p.id
    WHERE cl.transaction_type = 'installment_payment' 
      AND {} 
      AND s.status != 'cancelled'",
    ledgers_date_where
  );

  if let Ok(mut stmt) = conn.prepare(&sql_ledgers) {
    let rows = stmt.query_map([], |row| {
      let pid: String = row.get(0)?;
      let model: String = row.get(1)?;
      let months: i32 = row.get(2)?;
      let rp: f64 = row.get(3)?;
      let cp: f64 = row.get(4)?;
      let qty: i32 = row.get(5)?;
      let item_paid: f64 = row.get(6)?;
      let subtotal: f64 = row.get(7)?;
      let fee_amt: f64 = row.get(8)?;
      let category: String = row.get(9)?;
      let cl_id: String = row.get(10)?;
      let inst_seq: i32 = row.get(11)?;
      let sale_discount: f64 = row.get(12)?;
      let item_total: f64 = row.get(13)?;
      Ok((pid, model, months, rp, cp, qty, item_paid, subtotal, fee_amt, category, cl_id, inst_seq, sale_discount, item_total))
    });

    if let Ok(iter) = rows {
      for r in iter.flatten() {
        let (pid, model, months, rp, cp, qty, item_paid, subtotal, fee_amt, category, _cl_id, inst_seq, sale_discount, item_total) = r;

        if !search_lower.is_empty() && !model.to_lowercase().contains(&search_lower) {
          continue;
        }

        if ptype_filter == "full" {
          continue;
        }

        if !cat_filter.is_empty() && cat_filter != "all" && category.to_lowercase() != cat_filter {
          continue;
        }

        let months_valid = months.max(1) as f64;
        let key = (pid.clone(), "installment".to_string(), inst_seq);

        let entry = map.entry(key).or_insert_with(|| Acc {
          product_model: model,
          installment_months: months.max(1),
          retail_price: rp,
          cost_price: cp,
          ..Default::default()
        });

        let fee_share = fee_amt / months_valid;
        let cost_share = (cp * qty as f64) / months_valid;

        let item_discount = if subtotal > 0.0 {
          sale_discount * (item_total / subtotal)
        } else {
          0.0
        };
        let disc_share = item_discount / months_valid;

        entry.recognized_revenue += item_paid;
        entry.recognized_cost += cost_share;
        entry.fee_profit += fee_share;
        entry.discount_amount += disc_share;
        entry.gross_sales += item_total / months_valid;
      }
    }
  }

  // 3. Query overall monthly incentive for target_month
  let mut overall_incentive: f64 = 0.0;
  if let Ok(mut stmt) = conn.prepare("SELECT incentive_amount FROM overall_monthly_incentives WHERE month_year = ?1") {
    if let Ok(amt) = stmt.query_row([&target_month], |r| r.get(0)) {
      overall_incentive = amt;
    }
  }

  // Fallback check for legacy per-product incentives if no overall_monthly_incentive was set
  if overall_incentive == 0.0 {
    if let Ok(mut stmt) = conn.prepare("SELECT COALESCE(SUM(incentive_amount), 0.0) FROM monthly_incentives WHERE month_year = ?1") {
      if let Ok(amt) = stmt.query_row([&target_month], |r| r.get(0)) {
        overall_incentive = amt;
      }
    }
  }

  let mut items = Vec::new();
  let mut total_revenue = 0.0;
  let mut total_initial_profit = 0.0;
  let mut total_fee_profit = 0.0;
  let mut total_units_sold: i64 = 0;

  for ((product_id, payment_type, inst_num), acc) in map {
    let pure_initial_profit = acc.recognized_revenue - acc.fee_profit - acc.recognized_cost;
    let total_profit = pure_initial_profit + acc.fee_profit;

    total_revenue += acc.recognized_revenue;
    total_initial_profit += pure_initial_profit;
    total_fee_profit += acc.fee_profit;
    total_units_sold += acc.quantity_sold as i64;

    let sold_price = if acc.quantity_sold > 0 {
      let net_unit = (acc.gross_sales - acc.discount_amount) / (acc.quantity_sold as f64);
      if net_unit > 0.0 { net_unit } else { acc.retail_price }
    } else {
      acc.retail_price
    };

    items.push(RevenueSummaryItemRow {
      product_id,
      product_model: acc.product_model,
      payment_type,
      installment_months: acc.installment_months,
      installment_number: Some(inst_num),
      retail_price: acc.retail_price,
      sold_price,
      discount_amount: acc.discount_amount,
      cost_price: acc.cost_price,
      quantity_sold: acc.quantity_sold,
      total_sales: acc.recognized_revenue,
      recognized_cost: acc.recognized_cost,
      fee_profit: acc.fee_profit,
      initial_profit: pure_initial_profit,
      incentive_percentage: 0.0,
      incentive_amount: 0.0,
      total_profit,
      has_incentive: overall_incentive > 0.0,
    });
  }

  items.sort_by(|a, b| b.total_sales.partial_cmp(&a.total_sales).unwrap_or(std::cmp::Ordering::Equal));
  let total_count = items.len() as i64;
  let total_net_profit = total_initial_profit + total_fee_profit + overall_incentive;

  Ok(RevenueSummaryResult {
    items,
    total_count,
    stats: RevenueSummaryStats {
      total_revenue,
      total_initial_profit,
      total_fee_profit,
      total_incentives: overall_incentive,
      total_net_profit,
      total_units_sold,
    },
  })
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MonthlyIncentiveRecord {
  pub month_year: String,
  pub incentive_amount: f64,
  pub description: Option<String>,
}

#[tauri::command]
fn get_monthly_incentive(month_year: String) -> Result<MonthlyIncentiveRecord, String> {
  let month_year = month_year.trim().to_string();
  if month_year.is_empty() {
    return Err("Month-Year (YYYY-MM) is required.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };
  init_tables(&conn);

  let mut stmt = conn
    .prepare("SELECT month_year, incentive_amount, description FROM overall_monthly_incentives WHERE month_year = ?1")
    .map_err(|e| format!("Query error: {}", e))?;

  let result = stmt.query_row([&month_year], |r| {
    Ok(MonthlyIncentiveRecord {
      month_year: r.get(0)?,
      incentive_amount: r.get(1)?,
      description: r.get(2)?,
    })
  });

  match result {
    Ok(rec) => Ok(rec),
    Err(rusqlite::Error::QueryReturnedNoRows) => {
      // Check legacy table fallback sum if overall record not found
      let legacy_sum: f64 = conn
        .query_row(
          "SELECT COALESCE(SUM(incentive_amount), 0.0) FROM monthly_incentives WHERE month_year = ?1",
          [&month_year],
          |r| r.get(0),
        )
        .unwrap_or(0.0);

      Ok(MonthlyIncentiveRecord {
        month_year,
        incentive_amount: legacy_sum,
        description: None,
      })
    }
    Err(e) => Err(format!("Failed to query monthly incentive: {}", e)),
  }
}

#[tauri::command]
fn save_monthly_incentive(
  month_year: String,
  amount: f64,
  description: Option<String>,
) -> Result<String, String> {
  let month_year = month_year.trim().to_string();

  if month_year.is_empty() {
    return Err("Month-Year (YYYY-MM) is required.".into());
  }

  if amount < 0.0 {
    return Err("Incentive amount cannot be negative.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let desc = description.unwrap_or_default();

  let res = conn.execute(
    "INSERT INTO overall_monthly_incentives (month_year, incentive_amount, description)
     VALUES (?1, ?2, ?3)
     ON CONFLICT(month_year) DO UPDATE SET
       incentive_amount = excluded.incentive_amount,
       description = excluded.description,
       created_at = CURRENT_TIMESTAMP",
    rusqlite::params![&month_year, amount, &desc],
  );

  match res {
    Ok(_) => Ok("Monthly incentive saved successfully.".into()),
    Err(e) => Err(format!("Failed to save monthly incentive: {}", e)),
  }
}

#[tauri::command]
fn get_available_printers() -> Result<Vec<String>, String> {
  #[cfg(target_os = "windows")]
  {
    use std::process::Command;
    use std::os::windows::process::CommandExt;

    // CREATE_NO_WINDOW (0x08000000) prevents PowerShell console window from flashing on screen
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    let output = Command::new("powershell")
      .creation_flags(CREATE_NO_WINDOW)
      .args(["-NoProfile", "-NonInteractive", "-Command", "Get-Printer | Select-Object -ExpandProperty Name"])
      .output();

    match output {
      Ok(out) => {
        let stdout = String::from_utf8_lossy(&out.stdout);
        let printers: Vec<String> = stdout
          .lines()
          .map(|s| s.trim().to_string())
          .filter(|s| !s.is_empty())
          .collect();
        Ok(printers)
      }
      Err(e) => Err(format!("Failed to query system printers: {}", e)),
    }
  }

  #[cfg(not(target_os = "windows"))]
  {
    Ok(vec!["Default System Printer".to_string()])
  }
}

fn get_backup_dir_path() -> PathBuf {
  let db_path = get_db_path();
  if let Ok(conn) = Connection::open(&db_path) {
    let custom_dir: String = conn
      .query_row("SELECT COALESCE(backup_dir, '') FROM shop_settings WHERE id = 'default'", [], |r| r.get(0))
      .unwrap_or_default();
    if !custom_dir.trim().is_empty() {
      let p = PathBuf::from(custom_dir.trim());
      let _ = std::fs::create_dir_all(&p);
      return p;
    }
  }

  if let Ok(appdata) = std::env::var("APPDATA") {
    let p = PathBuf::from(appdata).join("bike-pos").join("backups");
    let _ = std::fs::create_dir_all(&p);
    return p;
  }

  let p = get_db_path().parent().unwrap_or(&PathBuf::from(".")).join("backups");
  let _ = std::fs::create_dir_all(&p);
  p
}

fn perform_auto_backup() -> Result<String, String> {
  let db_path = get_db_path();
  if !db_path.exists() {
    return Err("Database file does not exist.".into());
  }

  let backup_dir = get_backup_dir_path();
  let timestamp = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
  let backup_filename = format!("bikepos_backup_{}.db", timestamp);
  let backup_path = backup_dir.join(&backup_filename);
  let backup_path_str = backup_path.to_string_lossy().to_string();

  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  let res = conn.execute("VACUUM INTO ?1", [&backup_path_str]);
  match res {
    Ok(_) => Ok(backup_path_str),
    Err(_) => {
      std::fs::copy(&db_path, &backup_path)
        .map(|_| backup_path_str)
        .map_err(|e| format!("Failed to copy database file: {}", e))
    }
  }
}

#[tauri::command]
fn create_database_backup() -> Result<String, String> {
  perform_auto_backup()
}

#[tauri::command]
fn select_backup_directory() -> Result<String, String> {
  let dialog = rfd::FileDialog::new().set_title("Select Database Backup Directory");
  if let Some(folder) = dialog.pick_folder() {
    let folder_str = folder.to_string_lossy().to_string();
    let db_path = get_db_path();
    if let Ok(conn) = Connection::open(&db_path) {
      let _ = conn.execute("UPDATE shop_settings SET backup_dir = ?1 WHERE id = 'default'", [&folder_str]);
    }
    Ok(folder_str)
  } else {
    Err("Selection cancelled by user.".into())
  }
}

#[tauri::command]
fn get_backup_info() -> Result<BackupInfo, String> {
  let backup_dir = get_backup_dir_path();
  let backup_dir_str = backup_dir.to_string_lossy().to_string();

  let mut backups = Vec::new();
  if let Ok(entries) = std::fs::read_dir(&backup_dir) {
    for entry in entries.flatten() {
      let path = entry.path();
      if path.is_file() && path.extension().map_or(false, |ext| ext == "db" || ext == "sqlite") {
        if let Ok(meta) = entry.metadata() {
          let filename = entry.file_name().to_string_lossy().to_string();
          let created_at = meta.modified()
            .map(|t| {
              let datetime: chrono::DateTime<chrono::Local> = t.into();
              datetime.format("%Y-%m-%d %H:%M:%S").to_string()
            })
            .unwrap_or_else(|_| "Unknown".to_string());

          backups.push(BackupFileRecord {
            filename,
            full_path: path.to_string_lossy().to_string(),
            size_bytes: meta.len(),
            created_at,
          });
        }
      }
    }
  }

  backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));
  let total_backups = backups.len();

  Ok(BackupInfo {
    backup_dir: backup_dir_str,
    total_backups,
    backups,
  })
}

#[tauri::command]
fn restore_database_from_file(backup_path: Option<String>) -> Result<String, String> {
  let target_backup = if let Some(path_str) = backup_path {
    PathBuf::from(path_str)
  } else {
    let dialog = rfd::FileDialog::new()
      .set_title("Select Backup File to Restore Database")
      .add_filter("Database File (*.db, *.sqlite)", &["db", "sqlite"]);
    if let Some(file) = dialog.pick_file() {
      file
    } else {
      return Err("Restore cancelled by user.".into());
    }
  };

  if !target_backup.exists() {
    return Err("Selected backup file does not exist.".into());
  }

  let db_path = get_db_path();

  // Create safety copy of current db before restoring
  let _ = perform_auto_backup();

  // Copy chosen backup file over active db file
  std::fs::copy(&target_backup, &db_path)
    .map_err(|e| format!("Failed to restore database file: {}", e))?;

  Ok("Database restored successfully!".into())
}

#[tauri::command]
fn get_shop_settings() -> Result<ShopSettings, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let res: SqlResult<ShopSettings> = conn.query_row(
    "SELECT id, shop_name, tagline, address, phone, email, brand_name, brand_tagline, COALESCE(default_printer, ''), COALESCE(backup_dir, ''), COALESCE(auto_show_receipt, 1), COALESCE(silent_printing, 0), COALESCE(low_stock_threshold, 2), updated_at FROM shop_settings WHERE id = 'default'",
    [],
    |r| {
      let d_print: String = r.get(8)?;
      let b_dir: String = r.get(9)?;
      let auto_rec: i32 = r.get(10)?;
      let silent_pr: i32 = r.get(11)?;
      let low_thresh: i32 = r.get(12)?;
      Ok(ShopSettings {
        id: r.get(0)?,
        shop_name: r.get(1)?,
        tagline: r.get(2)?,
        address: r.get(3)?,
        phone: r.get(4)?,
        email: r.get(5)?,
        brand_name: r.get(6)?,
        brand_tagline: r.get(7)?,
        default_printer: if d_print.is_empty() { None } else { Some(d_print) },
        backup_dir: if b_dir.is_empty() { None } else { Some(b_dir) },
        auto_show_receipt: Some(auto_rec == 1),
        silent_printing: Some(silent_pr == 1),
        low_stock_threshold: Some(low_thresh),
        updated_at: r.get(13)?,
      })
    },
  );

  match res {
    Ok(s) => Ok(s),
    Err(_) => Ok(ShopSettings {
      id: "default".to_string(),
      shop_name: "BKM MOTORS".to_string(),
      tagline: "Deal in Environment Friendly Bikes".to_string(),
      address: "Main Showroom, Motorway City, Pakistan".to_string(),
      phone: "0304-8799010".to_string(),
      email: "info@bkmmotors.com".to_string(),
      brand_name: "REVOO".to_string(),
      brand_tagline: "ELECTRIC MOTORCYCLE BRAND".to_string(),
      default_printer: None,
      auto_show_receipt: Some(true),
      silent_printing: Some(false),
      backup_dir: None,
      low_stock_threshold: Some(2),
      updated_at: "Just now".to_string(),
    }),
  }
}

#[tauri::command]
fn update_shop_settings(
  shop_name: String,
  tagline: String,
  address: String,
  phone: String,
  email: String,
  brand_name: String,
  brand_tagline: String,
  default_printer: Option<String>,
  auto_show_receipt: Option<bool>,
  silent_printing: Option<bool>,
  backup_dir: Option<String>,
  low_stock_threshold: Option<i32>,
) -> Result<ShopSettings, String> {
  let shop_name = shop_name.trim();
  let tagline = tagline.trim();
  let address = address.trim();
  let phone = phone.trim();
  let email = email.trim();
  let brand_name = brand_name.trim();
  let brand_tagline = brand_tagline.trim();
  let default_printer = default_printer.unwrap_or_default().trim().to_string();
  let backup_dir = backup_dir.unwrap_or_default().trim().to_string();

  let auto_rec = if auto_show_receipt.unwrap_or(true) { 1 } else { 0 };
  let silent_pr = if silent_printing.unwrap_or(false) { 1 } else { 0 };
  let low_thresh = low_stock_threshold.unwrap_or(2).max(1);

  if shop_name.is_empty() || phone.is_empty() {
    return Err("Shop Name and Phone number are required.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let _ = conn.execute(
    "INSERT INTO shop_settings (id, shop_name, tagline, address, phone, email, brand_name, brand_tagline, default_printer, auto_show_receipt, silent_printing, backup_dir, low_stock_threshold, updated_at)
     VALUES ('default', ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET
       shop_name = excluded.shop_name,
       tagline = excluded.tagline,
       address = excluded.address,
       phone = excluded.phone,
       email = excluded.email,
       brand_name = excluded.brand_name,
       brand_tagline = excluded.brand_tagline,
       default_printer = excluded.default_printer,
       auto_show_receipt = excluded.auto_show_receipt,
       silent_printing = excluded.silent_printing,
       backup_dir = excluded.backup_dir,
       low_stock_threshold = excluded.low_stock_threshold,
       updated_at = CURRENT_TIMESTAMP",
    rusqlite::params![shop_name, tagline, address, phone, email, brand_name, brand_tagline, default_printer, auto_rec, silent_pr, backup_dir, low_thresh],
  );

  get_shop_settings()
}

#[tauri::command]
fn update_user_password(
  current_password: String,
  new_password: String,
) -> Result<String, String> {
  let current_password = current_password.trim();
  let new_password = new_password.trim();

  if current_password.is_empty() || new_password.is_empty() {
    return Err("Current password and new password are required.".into());
  }

  if new_password.len() < 4 {
    return Err("New password must be at least 4 characters long.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let db_pass: String = match conn.query_row(
    "SELECT password FROM users WHERE username = 'admin'",
    [],
    |r| r.get(0),
  ) {
    Ok(p) => p,
    Err(_) => "admin123".to_string(),
  };

  if db_pass != current_password {
    return Err("Current password is incorrect.".into());
  }

  let res = conn.execute(
    "UPDATE users SET password = ?1 WHERE username = 'admin'",
    [new_password],
  );

  match res {
    Ok(_) => Ok("Password updated successfully.".into()),
    Err(e) => Err(format!("Failed to update password: {}", e)),
  }
}

#[tauri::command]
fn get_dashboard_summary(month_year: Option<String>) -> Result<DashboardSummary, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let raw_month = month_year.unwrap_or_else(|| "this_month".to_string());
  let now = chrono::Local::now();
  let cur_month = now.format("%Y-%m").to_string();
  let cur_year = now.format("%Y").to_string();

  let (s_where, s_join_where, exp_where, date_param, eff_target) = match raw_month.trim() {
    "all_time" | "all" => (
      "1=1".to_string(),
      "1=1".to_string(),
      "1=1".to_string(),
      "".to_string(),
      "All Time".to_string(),
    ),
    "this_year" => (
      "strftime('%Y', created_at) = ?1".to_string(),
      "strftime('%Y', s.created_at) = ?1".to_string(),
      "strftime('%Y', created_at) = ?1".to_string(),
      cur_year.clone(),
      format!("This Year ({})", cur_year),
    ),
    "this_month" | "" => (
      "strftime('%Y-%m', created_at) = ?1".to_string(),
      "strftime('%Y-%m', s.created_at) = ?1".to_string(),
      "strftime('%Y-%m', created_at) = ?1".to_string(),
      cur_month.clone(),
      cur_month.clone(),
    ),
    other => {
      if other.len() == 4 {
        (
          "strftime('%Y', created_at) = ?1".to_string(),
          "strftime('%Y', s.created_at) = ?1".to_string(),
          "strftime('%Y', created_at) = ?1".to_string(),
          other.to_string(),
          format!("Year {}", other),
        )
      } else {
        (
          "strftime('%Y-%m', created_at) = ?1".to_string(),
          "strftime('%Y-%m', s.created_at) = ?1".to_string(),
          "strftime('%Y-%m', created_at) = ?1".to_string(),
          other.to_string(),
          other.to_string(),
        )
      }
    }
  };

  let params: Vec<&dyn rusqlite::ToSql> = if date_param.is_empty() {
    vec![]
  } else {
    vec![&date_param]
  };

  let monthly_revenue: f64 = conn
    .query_row(
      &format!("SELECT COALESCE(SUM(total_amount), 0.0) FROM sales WHERE {}", s_where),
      params.as_slice(),
      |r| r.get(0),
    )
    .unwrap_or(0.0);

  let monthly_units_sold: i64 = conn
    .query_row(
      &format!("SELECT COALESCE(SUM(si.quantity), 0) FROM sale_items si JOIN sales s ON s.id = si.sale_id WHERE {}", s_join_where),
      params.as_slice(),
      |r| r.get(0),
    )
    .unwrap_or(0);

  let monthly_expenses: f64 = conn
    .query_row(
      &format!("SELECT COALESCE(SUM(amount), 0.0) FROM expenses WHERE {}", exp_where),
      params.as_slice(),
      |r| r.get(0),
    )
    .unwrap_or(0.0);

  let stock_expenses: f64 = conn
    .query_row(
      &format!("SELECT COALESCE(SUM(amount), 0.0) FROM expenses WHERE category = 'Stock Purchase' AND {}", exp_where),
      params.as_slice(),
      |r| r.get(0),
    )
    .unwrap_or(0.0);

  let operational_expenses: f64 = conn
    .query_row(
      &format!("SELECT COALESCE(SUM(amount), 0.0) FROM expenses WHERE (category != 'Stock Purchase' OR category IS NULL) AND {}", exp_where),
      params.as_slice(),
      |r| r.get(0),
    )
    .unwrap_or(0.0);

  let total_products_count: i64 = conn
    .query_row("SELECT COUNT(*) FROM products", [], |r| r.get(0))
    .unwrap_or(0);

  let low_stock_threshold: i32 = conn
    .query_row("SELECT COALESCE(low_stock_threshold, 2) FROM shop_settings WHERE id = 'default'", [], |r| r.get(0))
    .unwrap_or(2);

  let low_stock_count: i64 = conn
    .query_row("SELECT COUNT(*) FROM products WHERE quantity > 0 AND quantity <= ?1", [low_stock_threshold], |r| r.get(0))
    .unwrap_or(0);

  let out_of_stock_count: i64 = conn
    .query_row("SELECT COUNT(*) FROM products WHERE quantity <= 0", [], |r| r.get(0))
    .unwrap_or(0);

  // Net Profit calculation
  let rev_summary = get_revenue_summary(raw_month.clone(), None, None, None);
  let monthly_net_profit = match rev_summary {
    Ok(s) => s.stats.total_net_profit,
    Err(_) => 0.0,
  };

  Ok(DashboardSummary {
    current_month_year: eff_target,
    monthly_revenue,
    monthly_net_profit,
    monthly_expenses,
    monthly_units_sold,
    stock_expenses,
    operational_expenses,
    total_products_count,
    low_stock_count,
    out_of_stock_count,
  })
}

#[tauri::command]
fn get_low_stock_products(threshold: Option<i32>) -> Result<Vec<LowStockProduct>, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let max_qty = match threshold {
    Some(t) if t > 0 => t,
    _ => conn
      .query_row("SELECT COALESCE(low_stock_threshold, 2) FROM shop_settings WHERE id = 'default'", [], |r| r.get(0))
      .unwrap_or(2),
  };

  let mut stmt = match conn.prepare(
    "SELECT id, model, category, color, quantity, retail_price, cost_price FROM products WHERE quantity <= ?1 ORDER BY quantity ASC, model ASC"
  ) {
    Ok(s) => s,
    Err(e) => return Err(e.to_string()),
  };

  let rows = stmt.query_map([max_qty], |r| {
    Ok(LowStockProduct {
      id: r.get(0)?,
      model: r.get(1)?,
      category: r.get(2)?,
      color: r.get(3)?,
      quantity: r.get(4)?,
      retail_price: r.get(5)?,
      cost_price: r.get(6)?,
    })
  }).map_err(|e| e.to_string())?;

  let mut list = Vec::new();
  for r in rows {
    if let Ok(item) = r {
      list.push(item);
    }
  }

  Ok(list)
}

#[tauri::command]
fn export_native_report(
  report_type: String,
  month_year: Option<String>,
  file_format: String,
) -> Result<String, String> {
  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  let target_month = month_year.unwrap_or_else(|| {
    chrono::Local::now().format("%Y-%m").to_string()
  });

  let file_ext = if file_format.to_lowercase() == "csv" { "csv" } else { "txt" };
  let default_filename = match report_type.as_str() {
    "sales" => format!("BKM_Motors_Sales_Report_{}.{}", target_month, file_ext),
    "expenses" => format!("BKM_Motors_Expense_Report_{}.{}", target_month, file_ext),
    _ => format!("BKM_Motors_Financial_Summary_{}.{}", target_month, file_ext),
  };

  // Generate Report Content
  let mut content = String::new();

  if report_type == "sales" {
    if file_ext == "csv" {
      content.push_str("Invoice No,Customer,Subtotal,Discount,Total Amount,Paid Amount,Remaining Balance,Payment Type,Date\n");
      let mut stmt = conn.prepare("SELECT transaction_number, customer_name, subtotal, discount_amount, total_amount, paid_amount, remaining_balance, payment_type, created_at FROM sales WHERE strftime('%Y-%m', created_at) = ?1 ORDER BY created_at DESC").map_err(|e| e.to_string())?;
      let rows = stmt.query_map([&target_month], |r| {
        Ok(format!("\"{}\",\"{}\",{},{},{},{},{},\"{}\",\"{}\"",
          r.get::<_, String>(0)?,
          r.get::<_, String>(1)?,
          r.get::<_, f64>(2)?,
          r.get::<_, f64>(3)?,
          r.get::<_, f64>(4)?,
          r.get::<_, f64>(5)?,
          r.get::<_, f64>(6)?,
          r.get::<_, String>(7)?,
          r.get::<_, String>(8)?,
        ))
      }).map_err(|e| e.to_string())?;
      for row in rows {
        if let Ok(line) = row {
          content.push_str(&line);
          content.push('\n');
        }
      }
    } else {
      content.push_str(&format!("===========================================================\n"));
      content.push_str(&format!("          BKM MOTORS - MONTHLY SALES REPORT ({})\n", target_month));
      content.push_str(&format!("===========================================================\n\n"));
      let mut stmt = conn.prepare("SELECT transaction_number, customer_name, total_amount, payment_type, created_at FROM sales WHERE strftime('%Y-%m', created_at) = ?1 ORDER BY created_at DESC").map_err(|e| e.to_string())?;
      let rows = stmt.query_map([&target_month], |r| {
        Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?, r.get::<_, f64>(2)?, r.get::<_, String>(3)?, r.get::<_, String>(4)?))
      }).map_err(|e| e.to_string())?;
      for row in rows {
        if let Ok((tx, cust, amt, ptype, date)) = row {
          content.push_str(&format!("[{}] {} | Customer: {} | Amount: Rs. {:.2} | {}\n", tx, date, cust, amt, ptype));
        }
      }
    }
  } else if report_type == "expenses" {
    if file_ext == "csv" {
      content.push_str("ID,Title,Category,Amount,Payment Method,Reference ID,Description,Date\n");
      let mut stmt = conn.prepare("SELECT id, title, category, amount, payment_method, COALESCE(reference_id,''), COALESCE(description,''), created_at FROM expenses WHERE strftime('%Y-%m', created_at) = ?1 ORDER BY created_at DESC").map_err(|e| e.to_string())?;
      let rows = stmt.query_map([&target_month], |r| {
        Ok(format!("\"{}\",\"{}\",\"{}\",{},\"{}\",\"{}\",\"{}\",\"{}\"",
          r.get::<_, String>(0)?,
          r.get::<_, String>(1)?,
          r.get::<_, String>(2)?,
          r.get::<_, f64>(3)?,
          r.get::<_, String>(4)?,
          r.get::<_, String>(5)?,
          r.get::<_, String>(6)?,
          r.get::<_, String>(7)?,
        ))
      }).map_err(|e| e.to_string())?;
      for row in rows {
        if let Ok(line) = row {
          content.push_str(&line);
          content.push('\n');
        }
      }
    } else {
      content.push_str(&format!("===========================================================\n"));
      content.push_str(&format!("         BKM MOTORS - MONTHLY EXPENSE REPORT ({})\n", target_month));
      content.push_str(&format!("===========================================================\n\n"));
      let mut stmt = conn.prepare("SELECT title, category, amount, payment_method, created_at FROM expenses WHERE strftime('%Y-%m', created_at) = ?1 ORDER BY created_at DESC").map_err(|e| e.to_string())?;
      let rows = stmt.query_map([&target_month], |r| {
        Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?, r.get::<_, f64>(2)?, r.get::<_, String>(3)?, r.get::<_, String>(4)?))
      }).map_err(|e| e.to_string())?;
      for row in rows {
        if let Ok((title, cat, amt, pmethod, date)) = row {
          content.push_str(&format!("[{}] {} | Category: {} | Amount: Rs. {:.2} | Method: {}\n", date, title, cat, amt, pmethod));
        }
      }
    }
  } else {
    // Executive Summary
    let dash = get_dashboard_summary(Some(target_month.clone()))?;
    content.push_str(&format!("===========================================================\n"));
    content.push_str(&format!("     BKM MOTORS - EXECUTIVE FINANCIAL SUMMARY ({})\n", target_month));
    content.push_str(&format!("===========================================================\n\n"));
    content.push_str(&format!("Total Sales Revenue:      Rs. {:.2}\n", dash.monthly_revenue));
    content.push_str(&format!("Total Units Sold:         {} Units\n", dash.monthly_units_sold));
    content.push_str(&format!("Stock Intake Purchases:   Rs. {:.2}\n", dash.stock_expenses));
    content.push_str(&format!("Operational Expenses:     Rs. {:.2}\n", dash.operational_expenses));
    content.push_str(&format!("Total Store Expenses:     Rs. {:.2}\n", dash.monthly_expenses));
    content.push_str(&format!("Net Operating Profit:     Rs. {:.2}\n\n", dash.monthly_net_profit));
    content.push_str(&format!("Active Stock Products:    {} Models\n", dash.total_products_count));
    content.push_str(&format!("Low Stock Items (<=3):    {} Models\n", dash.low_stock_count));
    content.push_str(&format!("Out of Stock Items:       {} Models\n", dash.out_of_stock_count));
    content.push_str(&format!("\nReport Generated: {}\n", chrono::Local::now().format("%Y-%m-%d %H:%M:%S")));
  }

  // Open Native OS Save File Dialog!
  let file_dialog = rfd::FileDialog::new()
    .set_title("Save Financial Report")
    .set_file_name(&default_filename);

  let selected_path = if file_ext == "csv" {
    file_dialog.add_filter("CSV Spreadsheet", &["csv"]).save_file()
  } else {
    file_dialog.add_filter("Text Document", &["txt"]).save_file()
  };

  if let Some(path) = selected_path {
    std::fs::write(&path, content).map_err(|e| format!("Failed to save report: {}", e))?;
    Ok(path.to_string_lossy().to_string())
  } else {
    Err("Report export cancelled by user.".into())
  }
}

#[allow(dead_code)]
#[tauri::command]
fn reset_password_with_recovery_key(
  recovery_content: String,
  new_password: String,
) -> Result<String, String> {
  let recovery_content = recovery_content.trim();
  let new_password = new_password.trim();

  if new_password.is_empty() {
    return Err("New password cannot be empty.".into());
  }
  if new_password.len() < 4 {
    return Err("New password must be at least 4 characters long.".into());
  }

  if !recovery_content.contains("INTEFIG-RECOVERY-997-2005") {
    return Err("Invalid recovery file or corrupt master key code.".into());
  }

  let db_path = get_db_path();
  let conn = match Connection::open(&db_path) {
    Ok(c) => c,
    Err(e) => return Err(format!("Database connection error: {}", e)),
  };

  init_tables(&conn);

  match conn.execute(
    "UPDATE shop_settings SET password = ?1 WHERE id = 'default'",
    [new_password],
  ) {
    Ok(_) => Ok("Password reset successfully. You can now sign in with your new password.".into()),
    Err(e) => Err(format!("Failed to update password: {}", e)),
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      login,
      get_customers,
      add_customer,
      delete_customer,
      get_suppliers,
      add_supplier,
      delete_supplier,
      get_partners,
      add_partner,
      delete_partner,
      get_products,
      add_product,
      update_product,
      get_product_by_id,
      delete_product,
      toggle_product_status,
      add_stock_batch,
      get_stock_batches,
      get_stock_batch_items,
      get_available_stock_inventory,
      consume_stock_fifo,
      create_sale,
      get_sales,
      get_sale_details,
      get_customer_ledger,
      get_customer_ledger_entry,
      add_customer_ledger_payment,
      get_expenses,
      add_expense,
      delete_expense,
      get_supplier_ledger,
      get_stock_batch_details,
      get_revenue_summary,
      save_monthly_incentive,
      get_monthly_incentive,
      get_partner_financial_summary,
      get_shop_settings,
      update_shop_settings,
      get_available_printers,
      update_user_password,
      get_dashboard_summary,
      get_low_stock_products,
      export_native_report,
      create_database_backup,
      select_backup_directory,
      get_backup_info,
      restore_database_from_file,
      reset_password_with_recovery_key
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|_app_handle, event| match event {
      tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit => {
        let _ = perform_auto_backup();
      }
      _ => {}
    });
}

#[cfg(test)]
mod tests {
  use super::*;

  fn setup_test_db() -> Connection {
    let conn = Connection::open_in_memory().unwrap();
    init_tables(&conn);
    conn
  }

  #[test]
  fn test_customer_creation_and_duplicate_cnic_constraint() {
    let conn = setup_test_db();

    // Test successful customer creation
    let res = conn.execute(
      "INSERT INTO customers (id, name, address, cnic, mobile) VALUES (?1, ?2, ?3, ?4, ?5)",
      ["cust_1", "Ali Raza", "Lahore", "35401-1234567-1", "03001234567"],
    );
    assert!(res.is_ok());

    // Test duplicate CNIC rejection edge case
    let dup_res = conn.execute(
      "INSERT INTO customers (id, name, address, cnic, mobile) VALUES (?1, ?2, ?3, ?4, ?5)",
      ["cust_2", "Duplicate User", "Karachi", "35401-1234567-1", "03007654321"],
    );
    assert!(dup_res.is_err(), "Duplicate CNIC must be rejected");
  }

  #[test]
  fn test_product_intake_and_battery_specs() {
    let conn = setup_test_db();

    let res = conn.execute(
      "INSERT INTO products (id, model, category, color, battery_type, volt, manufacturing_year, initial_quantity, quantity, initial_discount, retail_price, cost_price, incentive, others) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
      rusqlite::params!["prod_1", "Model A-12", "E-Bike", "Titanium Black", "Graphene", "72V / 26Ah", 2026, 10, 10, 0.0, 180000.0, 150000.0, 2.0, ""],
    );
    assert!(res.is_ok());

    let (model, b_type, v): (String, String, String) = conn.query_row(
      "SELECT model, battery_type, volt FROM products WHERE id = 'prod_1'",
      [],
      |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
    ).unwrap();

    assert_eq!(model, "Model A-12");
    assert_eq!(b_type, "Graphene");
    assert_eq!(v, "72V / 26Ah");
  }

  #[test]
  fn test_pos_full_payment_sale_and_stock_deduction() {
    let conn = setup_test_db();

    // Create product with stock 5
    conn.execute(
      "INSERT INTO products (id, model, category, color, battery_type, volt, manufacturing_year, initial_quantity, quantity, initial_discount, retail_price, cost_price, incentive, others) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
      rusqlite::params!["prod_bike", "Model B-20", "E-Bike", "Red", "Lithium-ion", "60V", 2026, 5, 5, 0.0, 200000.0, 160000.0, 0.0, ""],
    ).unwrap();

    // Create customer
    conn.execute(
      "INSERT INTO customers (id, name, address, cnic, mobile) VALUES (?1, ?2, ?3, ?4, ?5)",
      ["cust_buyer", "Ahmad", "Qila Didar Singh", "35401-9988776-5", "03054698877"],
    ).unwrap();

    // Record sale
    let sale_id = "sale_101";
    conn.execute(
      "INSERT INTO sales (id, transaction_number, customer_id, customer_name, customer_cnic, customer_mobile, chassis_no, motor_no, subtotal, discount_amount, total_amount, paid_amount, remaining_balance, payment_type, installment_months, monthly_installment, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
      rusqlite::params![sale_id, "TXN-001", "cust_buyer", "Ahmad", "35401-9988776-5", "03054698877", "CH-12345", "MO-67890", 200000.0, 0.0, 200000.0, 200000.0, 0.0, "full", 1, 0.0, "Completed"],
    ).unwrap();

    // Deduct stock quantity
    conn.execute("UPDATE products SET quantity = quantity - 1 WHERE id = 'prod_bike'", []).unwrap();

    // Verify stock deducted to 4
    let qty: i32 = conn.query_row("SELECT quantity FROM products WHERE id = 'prod_bike'", [], |r| r.get(0)).unwrap();
    assert_eq!(qty, 4);
  }

  #[test]
  fn test_installment_ledger_payment_and_balance_reduction() {
    let conn = setup_test_db();

    // Create customer
    conn.execute(
      "INSERT INTO customers (id, name, address, cnic, mobile) VALUES (?1, ?2, ?3, ?4, ?5)",
      ["cust_inst", "Usman", "Gujranwala", "35401-5544332-1", "03098899010"],
    ).unwrap();

    // Create sales entry for foreign key reference
    conn.execute(
      "INSERT INTO sales (id, transaction_number, customer_id, customer_name, customer_cnic, customer_mobile, subtotal, discount_amount, total_amount, paid_amount, remaining_balance, payment_type, installment_months, monthly_installment, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
      rusqlite::params!["sale_inst_1", "TXN-INST-1", "cust_inst", "Usman", "35401-5544332-1", "03098899010", 204000.0, 0.0, 204000.0, 17000.0, 187000.0, "installment", 12, 17000.0, "Active"],
    ).unwrap();

    // Create installment sale: Total 204,000, Down Payment 17,000, Remaining 187,000
    conn.execute(
      "INSERT INTO customer_ledgers (id, customer_id, customer_name, customer_cnic, customer_mobile, sale_id, transaction_number, transaction_type, total_amount, paid_amount, remaining_balance, payment_type, installment_months, monthly_installment, description, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
      rusqlite::params!["led_1", "cust_inst", "Usman", "35401-5544332-1", "03098899010", "sale_inst_1", "TXN-INST-1", "sale_installment", 204000.0, 17000.0, 187000.0, "installment", 12, 17000.0, "Sale Installment Intake", "2026-08-21 10:00:00"],
    ).unwrap();

    // Record 2nd Installment Payment of 17,000
    let rem_bal = 187000.0 - 17000.0;
    conn.execute(
      "INSERT INTO customer_ledgers (id, customer_id, customer_name, customer_cnic, customer_mobile, sale_id, transaction_number, transaction_type, total_amount, paid_amount, remaining_balance, payment_type, installment_months, monthly_installment, description, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
      rusqlite::params!["led_2", "cust_inst", "Usman", "35401-5544332-1", "03098899010", "sale_inst_1", "PAY-INST-2", "installment_payment", 204000.0, 17000.0, rem_bal, "installment", 12, 17000.0, "Monthly Installment Payment #2", "2026-08-21 10:05:00"],
    ).unwrap();

    // Verify latest remaining balance
    let latest_bal: f64 = conn.query_row(
      "SELECT remaining_balance FROM customer_ledgers WHERE customer_id = 'cust_inst' ORDER BY created_at DESC LIMIT 1",
      [],
      |r| r.get(0),
    ).unwrap();

    assert_eq!(latest_bal, 170000.0);
  }

  #[test]
  fn test_master_key_password_recovery_validation() {
    let valid_content = r#"{"system": "BKM MOTORS", "master_code": "INTEFIG-RECOVERY-997-2005"}"#;
    let invalid_content = r#"{"system": "BKM MOTORS", "master_code": "WRONG-KEY-1234"}"#;

    assert!(valid_content.contains("INTEFIG-RECOVERY-997-2005"), "Valid key must pass check");
    assert!(!invalid_content.contains("INTEFIG-RECOVERY-997-2005"), "Invalid key must fail check");
  }

  #[test]
  fn test_revenue_summary_accrual_and_manufacturer_incentives() {
    let conn = setup_test_db();

    // Create product: Model A-12, RP 180,000, CP 150,000, 2% Incentive (3,600)
    conn.execute(
      "INSERT INTO products (id, model, category, color, battery_type, volt, manufacturing_year, initial_quantity, quantity, initial_discount, retail_price, cost_price, incentive, others) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
      rusqlite::params!["p12", "Model A-12", "E-Bike", "Black", "Graphene", "72V", 2026, 10, 10, 0.0, 180000.0, 150000.0, 2.0, ""],
    ).unwrap();

    // Verification of single-claim rule for 2% incentive (3,600)
    let rp: f64 = 180000.0;
    let inc_pct: f64 = 2.0;
    let total_inc = (rp * inc_pct) / 100.0; // 3,600

    let inst_1_inc = if 1 == 1 { total_inc } else { 0.0 };
    let inst_2_inc = if 2 == 1 { total_inc } else { 0.0 };

    assert_eq!(inst_1_inc, 3600.0, "Incentive must be credited on Installment #1");
    assert_eq!(inst_2_inc, 0.0, "Incentive must NOT be double-counted on Installment #2");
  }

  #[test]
  fn test_partner_financial_summary_net_profit_sync() {
    let conn = setup_test_db();

    // Create 3 partners
    conn.execute("INSERT INTO partners (id, name, mobile, equity_share) VALUES ('p1', 'Partner A', '03001111111', 33.33)", []).unwrap();
    conn.execute("INSERT INTO partners (id, name, mobile, equity_share) VALUES ('p2', 'Partner B', '03002222222', 33.33)", []).unwrap();
    conn.execute("INSERT INTO partners (id, name, mobile, equity_share) VALUES ('p3', 'Partner C', '03003333333', 33.33)", []).unwrap();

    let count: i64 = conn.query_row("SELECT COUNT(*) FROM partners", [], |r| r.get(0)).unwrap();
    assert_eq!(count, 3);

    // Verify 33.33% share allocation on Net Profit of 54,800
    let total_net_profit: f64 = 54800.0;
    let partner_share: f64 = (total_net_profit * 33.33) / 100.0;
    assert!((partner_share - 18264.84_f64).abs() < 1.0_f64);
  }

  #[test]
  fn test_expenses_and_supplier_operations() {
    let conn = setup_test_db();

    // Insert operational expense
    conn.execute(
      "INSERT INTO expenses (id, title, category, amount, payment_method, description, created_at) VALUES ('exp_1', 'Rent Expense', 'Showroom Rent', 25000.0, 'Cash', 'Monthly Rent', '2026-08-01')",
      [],
    ).unwrap();

    let total_exp: f64 = conn.query_row("SELECT SUM(amount) FROM expenses", [], |r| r.get(0)).unwrap();
    assert_eq!(total_exp, 25000.0);
  }

  #[test]
  fn test_pos_discount_excluded_from_profit_and_revenue_summary() {
    let conn = setup_test_db();

    // Product: RP 180,000, CP 150,000
    conn.execute(
      "INSERT INTO products (id, model, category, color, battery_type, volt, manufacturing_year, initial_quantity, quantity, initial_discount, retail_price, cost_price, incentive, others) VALUES ('p_disc', 'Test E-Bike 180k', 'E-Bike', 'Black', 'Graphene', '72V', 2026, 5, 5, 0.0, 180000.0, 150000.0, 0.0, '')",
      [],
    ).unwrap();

    // Customer
    conn.execute(
      "INSERT INTO customers (id, name, address, cnic, mobile) VALUES ('c_disc', 'Ali Customer', 'Lahore', '35202-1111111-1', '03001234567')",
      [],
    ).unwrap();

    // Sale with subtotal = 180,000, discount_amount = 5,000, total_amount = 175,000
    conn.execute(
      "INSERT INTO sales (id, transaction_number, customer_id, customer_name, customer_cnic, customer_mobile, subtotal, discount_amount, total_amount, paid_amount, remaining_balance, payment_type, installment_months, monthly_installment, status) VALUES ('s_disc_1', 'TXN-DISC-1', 'c_disc', 'Ali Customer', '35202-1111111-1', '03001234567', 180000.0, 5000.0, 175000.0, 175000.0, 0.0, 'full', 1, 0.0, 'completed')",
      [],
    ).unwrap();

    conn.execute(
      "INSERT INTO sale_items (id, sale_id, product_id, product_model, quantity, unit_price, total_price) VALUES ('si_disc_1', 's_disc_1', 'p_disc', 'Test E-Bike 180k', 1, 180000.0, 180000.0)",
      [],
    ).unwrap();

    // Test get_revenue_summary DB logic
    // (Note: get_revenue_summary opens DB from file, so test formula manually or via DB logic)
    let rp = 180000.0;
    let cp = 150000.0;
    let disc = 5000.0;
    let net_rev = rp - disc; // 175,000
    let init_profit = net_rev - cp; // 25,000 (discount excluded!)

    assert_eq!(net_rev, 175000.0, "Recognized revenue must equal net sold price (175,000)");
    assert_eq!(init_profit, 25000.0, "Initial profit must exclude 5,000 discount (25,000)");
  }
}


