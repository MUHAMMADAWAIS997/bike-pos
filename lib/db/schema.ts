import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users table for System Authentication
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("admin").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Customers table
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  cnic: text("cnic").notNull().unique(),
  mobile: text("mobile").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Suppliers Table (Company, Mobile, Address optional)
export const suppliers = sqliteTable("suppliers", {
  id: text("id").primaryKey(),
  company: text("company").notNull(),
  mobile: text("mobile").notNull(),
  address: text("address"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Products Master Catalog Table
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  model: text("model").notNull().unique(),
  category: text("category").notNull().default("E-Bike"),
  color: text("color").notNull(),
  batteryType: text("battery_type").notNull(),
  volt: text("volt").notNull(),
  manufacturingYear: integer("manufacturing_year").notNull(),
  initialQuantity: integer("initial_quantity").notNull().default(0),
  quantity: integer("quantity").notNull().default(0),
  initialDiscount: real("initial_discount").notNull().default(0),
  retailPrice: real("retail_price").notNull(),
  costPrice: real("cost_price").notNull().default(0),
  incentive: real("incentive"),
  others: text("others"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Stock Inventory Table (Each stock entry represents a specific rate/discount batch for a product)
export const stockInventory = sqliteTable("stock_inventory", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  supplierCompany: text("supplier_company").notNull(),
  batchNo: text("batch_no").notNull(),
  initialQuantity: integer("initial_quantity").notNull(),
  quantity: integer("quantity").notNull(), // remaining available quantity
  retailPrice: real("retail_price").notNull(),
  discount: real("discount").notNull().default(0),
  costPrice: real("cost_price").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Stock Intake Batches Header
export const stockBatches = sqliteTable("stock_batches", {
  id: text("id").primaryKey(),
  batchNo: text("batch_no").notNull(),
  supplierCompany: text("supplier_company").notNull(),
  totalItems: integer("total_items").notNull(),
  totalQuantity: integer("total_quantity").notNull(),
  totalValue: real("total_value").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Stock Intake Batch Line Items
export const stockBatchItems = sqliteTable("stock_batch_items", {
  id: text("id").primaryKey(),
  batchId: text("batch_id")
    .notNull()
    .references(() => stockBatches.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  productModel: text("product_model").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull(),
  discount: real("discount").notNull().default(0),
  retailPrice: real("retail_price").notNull(),
  costPrice: real("cost_price").notNull(),
});

// Partners table (Equity & Partner ledger tracking)
export const partners = sqliteTable("partners", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull(),
  equityShare: real("equity_share").notNull(), // e.g. 35.50 for 35.5%
  colorKey: text("color_key").notNull().default("violet"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// E-Bikes inventory table
export const bikes = sqliteTable("bikes", {
  id: text("id").primaryKey(),
  modelName: text("model_name").notNull(),
  sku: text("sku").notNull().unique(),
  partnerId: text("partner_id").references(() => partners.id),
  costPrice: real("cost_price").notNull(),
  sellingPrice: real("selling_price").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  status: text("status", { enum: ["in_stock", "low_stock", "out_of_stock"] })
    .notNull()
    .default("in_stock"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Sales Transactions table
export const sales = sqliteTable("sales", {
  id: text("id").primaryKey(),
  transactionNumber: text("transaction_number").notNull().unique(),
  customerId: text("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerCnic: text("customer_cnic"),
  customerMobile: text("customer_mobile"),
  chassisNo: text("chassis_no"),
  motorNo: text("motor_no"),
  subtotal: real("subtotal").notNull(),
  discountAmount: real("discount_amount").notNull().default(0),
  totalAmount: real("total_amount").notNull(),
  paidAmount: real("paid_amount").notNull().default(0),
  remainingBalance: real("remaining_balance").notNull().default(0),
  paymentType: text("payment_type").notNull().default("full"), // 'full' or 'installment'
  installmentMonths: integer("installment_months").default(1),
  monthlyInstallment: real("monthly_installment").default(0),
  status: text("status", { enum: ["completed", "processing", "cancelled"] })
    .notNull()
    .default("completed"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Sale Line Items table
export const saleItems = sqliteTable("sale_items", {
  id: text("id").primaryKey(),
  saleId: text("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  productModel: text("product_model").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
});

// Customer Ledgers Table
export const customerLedgers = sqliteTable("customer_ledgers", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  customerCnic: text("customer_cnic").notNull(),
  customerMobile: text("customer_mobile").notNull(),
  saleId: text("sale_id").references(() => sales.id),
  transactionNumber: text("transaction_number").notNull(),
  transactionType: text("transaction_type").notNull(), // 'sale_full', 'sale_installment', 'installment_payment'
  totalAmount: real("total_amount").notNull(),
  paidAmount: real("paid_amount").notNull(),
  remainingBalance: real("remaining_balance").notNull(),
  paymentType: text("payment_type").notNull().default("full"),
  installmentMonths: integer("installment_months").default(1),
  monthlyInstallment: real("monthly_installment").default(0),
  description: text("description"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Expenses Table (General expenses and stock purchases)
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method").notNull().default("Cash"),
  referenceId: text("reference_id"),
  description: text("description"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Monthly Incentives Table (Legacy per-product)
export const monthlyIncentives = sqliteTable("monthly_incentives", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  monthYear: text("month_year").notNull(),
  incentivePercentage: real("incentive_percentage").notNull(),
  incentiveAmount: real("incentive_amount").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Overall Monthly Incentives Table
export const overallMonthlyIncentives = sqliteTable("overall_monthly_incentives", {
  monthYear: text("month_year").primaryKey(),
  incentiveAmount: real("incentive_amount").notNull(),
  description: text("description"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type StockInventory = typeof stockInventory.$inferSelect;
export type NewStockInventory = typeof stockInventory.$inferInsert;
export type StockBatch = typeof stockBatches.$inferSelect;
export type NewStockBatch = typeof stockBatches.$inferInsert;
export type StockBatchItem = typeof stockBatchItems.$inferSelect;
export type NewStockBatchItem = typeof stockBatchItems.$inferInsert;
export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
export type Bike = typeof bikes.$inferSelect;
export type NewBike = typeof bikes.$inferInsert;
export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
export type SaleItem = typeof saleItems.$inferSelect;
export type NewSaleItem = typeof saleItems.$inferInsert;
export type CustomerLedger = typeof customerLedgers.$inferSelect;
export type NewCustomerLedger = typeof customerLedgers.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type MonthlyIncentive = typeof monthlyIncentives.$inferSelect;
export type NewMonthlyIncentive = typeof monthlyIncentives.$inferInsert;

