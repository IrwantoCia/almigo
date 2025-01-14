const dbM = require('./db');

const db = dbM.connect()
const TABLE_NAME = 'orders'

/**
 * @typedef {Object} OrderRecord
 * @property {number} id - The unique identifier of the record
 * @property {string} product_name - The name of the product
 * @property {number} price - The price of the product
 * @property {string} order_date - The date when the order was placed
 * @property {string} status - The status of the order
 */

const dbWrapper = {
  /**
   * Initializes the database by creating the table if it does not exist.
   * @returns {Promise<void>} A promise that resolves with the database instance.
   */
  init: async () => {
    const sql = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT,
    price REAL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT
  )`;
    db.run(sql, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log(`Table ${TABLE_NAME} created or already exists.`);
      }
    });
  },

  /**
   * Create a new record in the specified table
   * @param {Object} data - The data to insert into the table
   * @returns {Promise<{success: boolean, id: number, data: OrderRecord}>}
   */
  create: async (data) => {
    return new Promise((resolve, reject) => {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      const sql = `INSERT INTO ${TABLE_NAME} (${columns}) VALUES (${placeholders})`;
      db.run(sql, values, function(err) {
        if (err) {
          console.error('Error creating record:', err.message);
          reject(new Error('Failed to create record'));
        } else {
          console.log(`Record created in ${TABLE_NAME} with ID: ${this.lastID}`);
          resolve({ success: true, id: this.lastID, data });
        }
      });
    });
  },

  /**
   * Read records from the specified table based on the query
   * @param {Object} query - The query conditions
   * @returns {Promise<{success: boolean, data: Array<OrderRecord>}>}
   */
  read: async (query = {}) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM ${TABLE_NAME}`;
      let values = [];
      if (Object.keys(query).length > 0) {
        const whereClause = Object.keys(query).map(key => `${key} = ?`).join(' AND ');
        values = Object.values(query);
        sql += ` WHERE ${whereClause}`;
      }
      db.all(sql, values, (err, rows) => {
        if (err) {
          console.error('Error reading records:', err.message);
          reject(new Error('Failed to read records'));
        } else {
          console.log(`Records read from ${TABLE_NAME}:`, rows);
          resolve({ success: true, data: rows });
        }
      });
    });
  },

  /**
   * Update records in the specified table based on the query
   * @param {Object} query - The query conditions
   * @param {Object} data - The data to update
   * @returns {Promise<{success: boolean, changes: number, data: OrderRecord}>}
   */
  update: async (query, data) => {
    return new Promise((resolve, reject) => {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const whereClause = Object.keys(query).map(key => `${key} = ?`).join(' AND ');
      const values = [...Object.values(data), ...Object.values(query)];
      const sql = `UPDATE ${TABLE_NAME} SET ${setClause} WHERE ${whereClause}`;
      db.run(sql, values, function(err) {
        if (err) {
          console.error('Error updating record:', err.message);
          reject(new Error('Failed to update record'));
        } else {
          console.log(`Record updated in ${TABLE_NAME}, changes: ${this.changes}`);
          resolve({ success: true, changes: this.changes, data });
        }
      });
    });
  },

  /**
   * Delete records from the specified table based on the query
   * @param {Object} query - The query conditions
   * @returns {Promise<{success: boolean, changes: number, data: OrderRecord}>}
   */
  delete: async (query) => {
    return new Promise((resolve, reject) => {
      const whereClause = Object.keys(query).map(key => `${key} = ?`).join(' AND ');
      const values = Object.values(query);
      const sql = `DELETE FROM ${TABLE_NAME} WHERE ${whereClause}`;
      db.run(sql, values, function(err) {
        if (err) {
          console.error('Error deleting record:', err.message);
          reject(new Error('Failed to delete record'));
        } else {
          console.log(`Record deleted from ${TABLE_NAME}, changes: ${this.changes}`);
          resolve({ success: true, changes: this.changes, data: query });
        }
      });
    });
  },

};

module.exports = dbWrapper;
