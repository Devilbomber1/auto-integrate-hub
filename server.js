const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.join(__dirname, 'data', 'auto-integrate.db');
const db = new sqlite3.Database(dbPath);

const init = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS connectors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      last_sync TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      connector_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(connector_id) REFERENCES connectors(id)
    )`);

    db.get('SELECT COUNT(*) as count FROM connectors', (err, row) => {
      if (err) return;
      if (row.count === 0) {
        const stmt = db.prepare('INSERT INTO connectors (name, status, last_sync) VALUES (?,?,?)');
        const now = new Date().toISOString();
        stmt.run('Salesforce', 'connected', now);
        stmt.run('Stripe', 'connected', now);
        stmt.run('Zendesk', 'needs_attention', now);
        stmt.finalize();
      }
    });
  });
};

init();

app.get('/api/connectors', (req, res) => {
  db.all('SELECT * FROM connectors ORDER BY id', (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows);
  });
});

app.post('/api/connectors', (req, res) => {
  const { name, status } = req.body;
  if (!name || !status) return res.status(400).json({ error: 'invalid_payload' });
  const last_sync = new Date().toISOString();
  db.run('INSERT INTO connectors (name, status, last_sync) VALUES (?,?,?)', [name, status, last_sync], function (err) {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.status(201).json({ id: this.lastID, name, status, last_sync });
  });
});

app.get('/api/runs', (req, res) => {
  db.all(`SELECT runs.*, connectors.name as connector_name
          FROM runs JOIN connectors ON connectors.id = runs.connector_id
          ORDER BY runs.id DESC LIMIT 50`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows);
  });
});

app.post('/api/runs', (req, res) => {
  const { connector_id, status, duration_ms } = req.body;
  if (!connector_id || !status || typeof duration_ms !== 'number') {
    return res.status(400).json({ error: 'invalid_payload' });
  }
  const created_at = new Date().toISOString();
  db.run('INSERT INTO runs (connector_id, status, duration_ms, created_at) VALUES (?,?,?,?)',
    [connector_id, status, duration_ms, created_at],
    function (err) {
      if (err) return res.status(500).json({ error: 'db_error' });
      res.status(201).json({ id: this.lastID, connector_id, status, duration_ms, created_at });
    }
  );
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'auto-integrate-hub' });
});

app.listen(PORT, () => {
  console.log(`Auto-Integrate Hub running on http://localhost:${PORT}`);
});
