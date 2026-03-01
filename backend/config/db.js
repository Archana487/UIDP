const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../city_data.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

module.exports = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(text, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows });
      });
    });
  },
  run: (text, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(text, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get: (text, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(text, params, (err, row) => {
        if (err) reject(err);
        else resolve({ row });
      });
    });
  },
  exec: (text) => {
    return new Promise((resolve, reject) => {
      db.exec(text, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};
