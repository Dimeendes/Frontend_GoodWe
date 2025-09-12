import Database from 'better-sqlite3';
import path from 'path';

let db;
export function getDb() {
  if (!db) {
    const file = path.join(process.cwd(), 'data.sqlite');
    db = new Database(file);
    db.pragma('journal_mode = WAL');
    db.exec(`CREATE TABLE IF NOT EXISTS agenda (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      date TEXT
    );`);
    db.exec(`CREATE TABLE IF NOT EXISTS outage_reason (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      count INTEGER NOT NULL DEFAULT 0
    );`);
    db.exec(`CREATE TABLE IF NOT EXISTS outage_event (
      id TEXT PRIMARY KEY,
      at TEXT NOT NULL
    );`);
  }
  return db;
}

export function listAgenda() {
  const stmt = getDb().prepare('SELECT id, text, date FROM agenda ORDER BY date ASC');
  return stmt.all();
}

export function addAgenda(item) {
  const stmt = getDb().prepare('INSERT INTO agenda (id, text, date) VALUES (@id, @text, @date)');
  stmt.run(item);
  return item;
}

export function removeAgenda(id) {
  const stmt = getDb().prepare('DELETE FROM agenda WHERE id = ?');
  stmt.run(id);
}

export function listReasons() {
  // Keep static order based on insertion (rowid asc)
  return getDb().prepare('SELECT id, name, count FROM outage_reason ORDER BY rowid ASC').all();
}

export function upsertReason(name) {
  return updateReason(name, 1);
}

export function updateReason(name, delta) {
  const existing = getDb().prepare('SELECT id, count FROM outage_reason WHERE name = ?').get(name);
  if (existing) {
    const next = Math.max(0, (existing.count || 0) + Number(delta || 0));
    getDb().prepare('UPDATE outage_reason SET count = ? WHERE id = ?').run(next, existing.id);
    return { id: existing.id, name, count: next };
  } else {
    const initial = Math.max(0, Number(delta || 0));
    const item = { id: crypto.randomUUID(), name, count: initial };
    getDb().prepare('INSERT INTO outage_reason (id, name, count) VALUES (@id, @name, @count)').run(item);
    return item;
  }
}

export function addReason(name) {
  const item = { id: crypto.randomUUID(), name, count: 0 };
  getDb().prepare('INSERT OR IGNORE INTO outage_reason (id, name, count) VALUES (@id, @name, @count)').run(item);
  return getDb().prepare('SELECT id, name, count FROM outage_reason WHERE name = ?').get(name);
}

export function addOutageEvent(atISO) {
  const item = { id: crypto.randomUUID(), at: atISO };
  getDb().prepare('INSERT INTO outage_event (id, at) VALUES (@id, @at)').run(item);
  return item;
}

export function listOutageEvents() {
  return getDb().prepare('SELECT id, at FROM outage_event ORDER BY at DESC').all();
}

export function removeReason(id) {
  getDb().prepare('DELETE FROM outage_reason WHERE id = ?').run(id);
}


