const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPaths = [
  path.resolve(process.cwd(), "sqlite.db"),
  path.resolve(process.cwd(), "src-tauri", "sqlite.db"),
];

console.log("🧹 Starting database cleanup script...");

for (const dbPath of dbPaths) {
  if (!fs.existsSync(dbPath)) {
    console.log(`[Skip] Database file not found at: ${dbPath}`);
    continue;
  }

  console.log(`\n📂 Cleaning database at: ${dbPath}`);
  const sqlite = new Database(dbPath);

  try {
    sqlite.exec("PRAGMA foreign_keys = OFF;");

    // Get list of all table names except 'users' and system tables ('sqlite_sequence')
    const tables = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('users', 'sqlite_sequence')"
      )
      .all();

    if (tables.length === 0) {
      console.log("   No non-user tables found to clear.");
    } else {
      for (const { name } of tables) {
        sqlite.exec(`DROP TABLE IF EXISTS "${name}";`);
        console.log(`   ✓ Dropped table: "${name}"`);
      }
    }

    sqlite.exec("PRAGMA foreign_keys = ON;");

    // Ensure 'admin' user remains in users table
    const adminUser = sqlite
      .prepare("SELECT * FROM users WHERE username = 'admin'")
      .get();

    if (!adminUser) {
      sqlite
        .prepare(
          "INSERT INTO users (id, username, password, role) VALUES ('usr_admin_default', 'admin', 'admin123', 'admin')"
        )
        .run();
      console.log("   ✓ Re-seeded default admin user ('admin' / 'admin123').");
    } else {
      console.log("   ✓ Retained existing 'admin' credentials in users table.");
    }

    sqlite.exec("VACUUM;");
    console.log(`   ✨ Successfully cleaned: ${dbPath}`);
  } catch (err) {
    console.error(`   ❌ Failed to clean database at ${dbPath}:`, err?.message || err);
  } finally {
    sqlite.close();
  }
}

console.log("\n✅ Database cleanup finished! All tables except 'users' have been wiped.");
