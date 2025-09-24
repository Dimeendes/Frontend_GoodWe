import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';

let db;
export function getDb() {
  if (!db) {
    const file = path.join(process.cwd(), 'data.sqlite');
    db = new sqlite3.Database(file);
    
    // Initialize tables
    db.serialize(() => {
      db.run('PRAGMA journal_mode = WAL');
      db.run(`CREATE TABLE IF NOT EXISTS agenda (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      date TEXT
    );`);
      db.run(`CREATE TABLE IF NOT EXISTS outage_reason (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      count INTEGER NOT NULL DEFAULT 0
    );`);
      db.run(`CREATE TABLE IF NOT EXISTS outage_event (
      id TEXT PRIMARY KEY,
      at TEXT NOT NULL
    );`);
      db.run(`CREATE TABLE IF NOT EXISTS aparelhos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      energy_consumption REAL,
      priority INTEGER DEFAULT 1,
      is_on BOOLEAN DEFAULT 0,
      created_at TEXT NOT NULL
    );`);
    });
  }
  return db;
}

// Helper function to promisify database operations
const promisifyDb = (db) => {
  const run = promisify(db.run.bind(db));
  const get = promisify(db.get.bind(db));
  const all = promisify(db.all.bind(db));
  return { run, get, all };
};

export async function listAgenda() {
  const { all } = promisifyDb(getDb());
  return await all('SELECT id, text, date FROM agenda ORDER BY date ASC');
}

export async function addAgenda(item) {
  const { run } = promisifyDb(getDb());
  await run('INSERT INTO agenda (id, text, date) VALUES (?, ?, ?)', [item.id, item.text, item.date]);
  return item;
}

export async function removeAgenda(id) {
  const { run } = promisifyDb(getDb());
  await run('DELETE FROM agenda WHERE id = ?', [id]);
}

export async function listReasons() {
  const { all } = promisifyDb(getDb());
  return await all('SELECT id, name, count FROM outage_reason ORDER BY rowid ASC');
}

export async function upsertReason(name) {
  return await updateReason(name, 1);
}

export async function updateReason(name, delta) {
  const { get, run } = promisifyDb(getDb());
  const existing = await get('SELECT id, count FROM outage_reason WHERE name = ?', [name]);
  
  if (existing) {
    const next = Math.max(0, (existing.count || 0) + Number(delta || 0));
    await run('UPDATE outage_reason SET count = ? WHERE id = ?', [next, existing.id]);
    return { id: existing.id, name, count: next };
  } else {
    const initial = Math.max(0, Number(delta || 0));
    const item = { id: crypto.randomUUID(), name, count: initial };
    await run('INSERT INTO outage_reason (id, name, count) VALUES (?, ?, ?)', [item.id, item.name, item.count]);
    return item;
  }
}

export async function addReason(name) {
  const { run, get } = promisifyDb(getDb());
  const item = { id: crypto.randomUUID(), name, count: 0 };
  await run('INSERT OR IGNORE INTO outage_reason (id, name, count) VALUES (?, ?, ?)', [item.id, item.name, item.count]);
  return await get('SELECT id, name, count FROM outage_reason WHERE name = ?', [name]);
}

export async function addOutageEvent(atISO) {
  const { run } = promisifyDb(getDb());
  const item = { id: crypto.randomUUID(), at: atISO };
  await run('INSERT INTO outage_event (id, at) VALUES (?, ?)', [item.id, item.at]);
  return item;
}

export async function listOutageEvents() {
  const { all } = promisifyDb(getDb());
  return await all('SELECT id, at FROM outage_event ORDER BY at DESC');
}

export async function removeReason(id) {
  const { run } = promisifyDb(getDb());
  await run('DELETE FROM outage_reason WHERE id = ?', [id]);
}

// Funções para aparelhos
export async function listAparelhos() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all('SELECT * FROM aparelhos ORDER BY created_at DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function addAparelho(aparelho) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run(
      'INSERT INTO aparelhos (name, type, energy_consumption, priority, is_on, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [aparelho.name, aparelho.type, aparelho.energyConsumption || null, aparelho.priority || 1, false, new Date().toISOString()],
      function(err) {
        if (err) {
          reject(err);
        } else {
          // Get the inserted record
          database.get('SELECT * FROM aparelhos WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        }
      }
    );
  });
}

export async function removeAparelho(id) {
  const { run } = promisifyDb(getDb());
  await run('DELETE FROM aparelhos WHERE id = ?', [id]);
}

export async function updateAparelho(id, aparelho) {
  const { run, get } = promisifyDb(getDb());
  await run(
    'UPDATE aparelhos SET name = ?, type = ?, energy_consumption = ?, priority = ?, is_on = ? WHERE id = ?',
    [aparelho.name, aparelho.type, aparelho.energyConsumption, aparelho.priority, aparelho.isOn, id]
  );
  return await get('SELECT * FROM aparelhos WHERE id = ?', [id]);
}

// Export the database instance for API routes
export { getDb as db };
