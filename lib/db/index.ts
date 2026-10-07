import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const sqliteDatabasePath = process.env.DATABASE_URL || "sqlite.db";

const sqlite = new Database(sqliteDatabasePath);
export const db = drizzle(sqlite, { schema });

// Auto-initialize tables and ensure schema migrations
try {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      cnic TEXT NOT NULL UNIQUE,
      mobile TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      mobile TEXT NOT NULL,
      address TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      equity_share REAL NOT NULL,
      color_key TEXT NOT NULL DEFAULT 'violet',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS products (
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
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS stock_inventory (
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
    );

    CREATE TABLE IF NOT EXISTS stock_batches (
      id TEXT PRIMARY KEY,
      batch_no TEXT NOT NULL,
      supplier_company TEXT NOT NULL,
      total_items INTEGER NOT NULL,
      total_quantity INTEGER NOT NULL,
      total_value REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS stock_batch_items (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES stock_batches(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_model TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      retail_price REAL NOT NULL,
      cost_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
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
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_model TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customer_ledgers (
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
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Cash',
      reference_id TEXT,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS monthly_incentives (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      month_year TEXT NOT NULL,
      incentive_percentage REAL NOT NULL,
      incentive_amount REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      UNIQUE(product_id, month_year)
    );

    CREATE TABLE IF NOT EXISTS overall_monthly_incentives (
      month_year TEXT PRIMARY KEY,
      incentive_amount REAL NOT NULL DEFAULT 0.0,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
  `);


  try { sqlite.exec(`ALTER TABLE sales ADD COLUMN customer_id TEXT;`); } catch (_) {}
  try { sqlite.exec(`ALTER TABLE sales ADD COLUMN customer_cnic TEXT;`); } catch (_) {}
  try { sqlite.exec(`ALTER TABLE sales ADD COLUMN customer_mobile TEXT;`); } catch (_) {}
  try { sqlite.exec(`ALTER TABLE sales ADD COLUMN chassis_no TEXT;`); } catch (_) {}
  try { sqlite.exec(`ALTER TABLE sales ADD COLUMN motor_no TEXT;`); } catch (_) {}

  const existingAdmin = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, "admin"))
    .get();

  if (!existingAdmin) {
    db.insert(schema.users)
      .values({
        id: "usr_admin_default",
        username: "admin",
        password: "admin123",
        role: "admin",
      })
      .run();
    console.log("[DB] Predefined user created: username='admin', password='admin123'");
  }
} catch (err) {
  console.error("[DB Init Error]", err);
}

export type DB = typeof db;
export * from "./schema";
