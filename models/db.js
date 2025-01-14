const fs = require('fs');

const DB_NAME = 'database.sqlite';
let db;

function initializeDatabase() {
  if (!fs.existsSync(DB_NAME)) {
    fs.writeFileSync(DB_NAME, '');
    console.log('Database file created.');
  }
}
const sqlite3 = require('sqlite3').verbose();

function connect() {
  if (db) {
    console.log('Database already connected.');
    return db;
  }

  db = new sqlite3.Database(DB_NAME, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to the SQLite database.');
    }
  });
  return db;
}

function closeDatabaseConnection() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Closed the database connection.');
        db = null; // Reset the db variable to allow reconnection
      }
    });
  } else {
    console.log('No active database connection to close.');
  }
}

module.exports = {
  initializeDatabase,
  connect,
  closeDatabaseConnection
};
