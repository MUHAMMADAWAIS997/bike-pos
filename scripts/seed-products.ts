import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Resolve database file paths
const dbPaths = [
  path.resolve(process.cwd(), "sqlite.db"),
  path.resolve(process.cwd(), "src-tauri", "sqlite.db"),
];

console.log("🌱 Starting product database seeding script...");

const sampleProducts = [
  {
    id: "prod_seed_1",
    model: "VoltCity Pro V2",
    category: "E-Bike",
    color: "Matte Black",
    batteryType: "Lithium-Ion 48V",
    volt: "48V",
    manufacturingYear: 2026,
    initialQuantity: 15,
    quantity: 15,
    initialDiscount: 0,
    retailPrice: 2499.00,
    costPrice: 1900.00,
    incentive: 100.00,
    others: "Best seller city e-bike with dual suspension",
    supplierCompany: "VoltMotors Global",
    batchNo: "SEED-BATCH-001",
  },
  {
    id: "prod_seed_2",
    model: "VoltSummit Elite",
    category: "Mountain EMTB",
    color: "Alpine White",
    batteryType: "Lithium-Ion 60V",
    volt: "60V",
    manufacturingYear: 2026,
    initialQuantity: 8,
    quantity: 8,
    initialDiscount: 50.00,
    retailPrice: 4250.00,
    costPrice: 3400.00,
    incentive: 150.00,
    others: "Heavy duty off-road mountain e-bike",
    supplierCompany: "Apex Trail Supply",
    batchNo: "SEED-BATCH-002",
  },
  {
    id: "prod_seed_3",
    model: "VoltHauler Max",
    category: "Cargo Series",
    color: "Steel Grey",
    batteryType: "Lithium-Ion 48V",
    volt: "48V",
    manufacturingYear: 2026,
    initialQuantity: 10,
    quantity: 10,
    initialDiscount: 0,
    retailPrice: 3800.00,
    costPrice: 2950.00,
    incentive: 120.00,
    others: "Commercial grade cargo carrier with dual baskets",
    supplierCompany: "VoltMotors Global",
    batchNo: "SEED-BATCH-003",
  },
  {
    id: "prod_seed_4",
    model: "VoltCommuter Eco",
    category: "Urban Commuter",
    color: "Midnight Blue",
    batteryType: "Lithium-Ion 36V",
    volt: "36V",
    manufacturingYear: 2026,
    initialQuantity: 20,
    quantity: 20,
    initialDiscount: 20.00,
    retailPrice: 1899.00,
    costPrice: 1450.00,
    incentive: 80.00,
    others: "Lightweight foldable frame for daily city commute",
    supplierCompany: "EcoRide Tech",
    batchNo: "SEED-BATCH-004",
  },
  {
    id: "prod_seed_5",
    model: "VoltCruiser Deluxe",
    category: "Urban Commuter",
    color: "Satin Red",
    batteryType: "Lithium-Ion 48V",
    volt: "48V",
    manufacturingYear: 2026,
    initialQuantity: 12,
    quantity: 12,
    initialDiscount: 0,
    retailPrice: 2750.00,
    costPrice: 2100.00,
    incentive: 90.00,
    others: "Ergonomic comfort saddle with wide handlebars",
    supplierCompany: "VoltMotors Global",
    batchNo: "SEED-BATCH-005",
  },
  {
    id: "prod_seed_6",
    model: "VoltSpeed Racer X",
    category: "E-Bike",
    color: "Carbon Black",
    batteryType: "Lithium-Ion 72V",
    volt: "72V",
    manufacturingYear: 2026,
    initialQuantity: 5,
    quantity: 5,
    initialDiscount: 100.00,
    retailPrice: 5100.00,
    costPrice: 4000.00,
    incentive: 200.00,
    others: "High performance racing series 60km/h top speed",
    supplierCompany: "Velox Racing Co",
    batchNo: "SEED-BATCH-006",
  },
  {
    id: "prod_seed_7",
    model: "Premium E-Bike Helmet",
    category: "Accessories",
    color: "Matte Black / M",
    batteryType: "N/A",
    volt: "N/A",
    manufacturingYear: 2026,
    initialQuantity: 30,
    quantity: 30,
    initialDiscount: 0,
    retailPrice: 120.00,
    costPrice: 70.00,
    incentive: 10.00,
    others: "LED rear light integrated safety helmet",
    supplierCompany: "SafeGear International",
    batchNo: "SEED-BATCH-007",
  },
  {
    id: "prod_seed_8",
    model: "Heavy Duty Chain Lock",
    category: "Accessories",
    color: "Yellow / Black",
    batteryType: "N/A",
    volt: "N/A",
    manufacturingYear: 2026,
    initialQuantity: 40,
    quantity: 40,
    initialDiscount: 0,
    retailPrice: 65.00,
    costPrice: 35.00,
    incentive: 5.00,
    others: "10mm hardened steel anti-theft chain lock",
    supplierCompany: "SafeGear International",
    batchNo: "SEED-BATCH-008",
  },
];

for (const dbPath of dbPaths) {
  if (!fs.existsSync(dbPath)) {
    console.log(`[Skip] Database file not found at: ${dbPath}`);
    continue;
  }

  console.log(`\n📂 Seeding products into database at: ${dbPath}`);
  const sqlite = new Database(dbPath);

  try {
    // Ensure products table exists
    sqlite.exec(`
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
    `);

    const insertProdStmt = sqlite.prepare(`
      INSERT OR REPLACE INTO products (
        id, model, category, color, battery_type, volt, manufacturing_year,
        initial_quantity, quantity, initial_discount, retail_price, cost_price, incentive, others
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertStockStmt = sqlite.prepare(`
      INSERT OR REPLACE INTO stock_inventory (
        id, product_id, supplier_company, batch_no, initial_quantity, quantity, retail_price, discount, cost_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let count = 0;
    for (const p of sampleProducts) {
      insertProdStmt.run(
        p.id,
        p.model,
        p.category,
        p.color,
        p.batteryType,
        p.volt,
        p.manufacturingYear,
        p.initialQuantity,
        p.quantity,
        p.initialDiscount,
        p.retailPrice,
        p.costPrice,
        p.incentive,
        p.others
      );

      const stockId = `stk_${p.id}`;
      insertStockStmt.run(
        stockId,
        p.id,
        p.supplierCompany,
        p.batchNo,
        p.initialQuantity,
        p.quantity,
        p.retailPrice,
        p.initialDiscount,
        p.costPrice
      );

      count++;
      console.log(`   ✓ Seeded product: ${p.model} (${p.quantity} units @ $${p.retailPrice})`);
    }

    console.log(`🎉 Successfully seeded ${count} sample products into ${path.basename(dbPath)}!`);
  } catch (err) {
    console.error(`❌ Error seeding database at ${dbPath}:`, err);
  } finally {
    sqlite.close();
  }
}

console.log("\n✅ Product seeding process completed!");
