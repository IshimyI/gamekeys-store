const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.sqlite');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    sku TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    price INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'RUB',
    image TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'issued')),
    issued_to_order_id TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL REFERENCES products(sku),
    promo_code TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'RUB',
    status TEXT NOT NULL DEFAULT 'created' CHECK (
      status IN ('created', 'paid', 'delivering', 'delivered', 'payment_failed', 'out_of_stock', 'delivery_failed')
    ),
    delivered_code TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS webhook_events (
    event_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    received_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS supplier_attempts (
    request_id TEXT PRIMARY KEY,
    supplier TEXT NOT NULL,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'ok', 'error')),
    code TEXT,
    reason TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS promo_codes (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('percent', 'amount')),
    value INTEGER NOT NULL,
    currency TEXT,
    max_uses INTEGER NOT NULL,
    used_count INTEGER NOT NULL DEFAULT 0
  );
`);

module.exports = db;
