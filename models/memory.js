const dbM = require('./db');


const db = dbM.connect()
const TABLE_NAME = 'memory'

/**
 * @typedef {Object} MemoryRecord
 * @property {number} id - The unique identifier of the record
 * @property {string} resource_id - The resource identifier
 * @property {string} role - The role associated with the record
 * @property {string} content - The content of the record
 * @property {string} metadata - The metadata associated with the record
 * @property {string} timestamp - The timestamp of the record
 */

const dbWrapper = {
  /**
   * Initializes the database by creating the table if it does not exist.
   * @returns {Promise<void>} A promise that resolves with the database instance.
   */
  init: async () => {
    const sql = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id TEXT,
    role TEXT,
    content TEXT,
    metadata TEXT,
    timestamp DATETIME
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
   * @returns {Promise<{success: boolean, id: number, data: MemoryRecord}>}
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
   * @returns {Promise<{success: boolean, data: Array<MemoryRecord>}>}
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
   * @returns {Promise<{success: boolean, changes: number, data: MemoryRecord}>}
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
   * @returns {Promise<{success: boolean, changes: number, data: MemoryRecord}>}
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

  /**
   * Fetches all unique resource IDs from the specified table.
   * @async
   * @function resource_ids
   * @returns {Promise<{success: boolean, data: Array<string>}>} A promise that resolves with an object containing a success flag and an array of resource IDs.
   * @throws {Error} If an error occurs while fetching resource IDs.
   */
  resource_ids: async () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT DISTINCT resource_id FROM ${TABLE_NAME} ORDER BY id DESC`;
      db.all(sql, (err, rows) => {
        if (err) {
          console.error('Error fetching resource IDs:', err.message);
          reject(new Error('Failed to fetch resource IDs'));
        } else {
          const resourceIds = rows.map(row => row.resource_id);
          console.log('Resource IDs fetched:', resourceIds);
          resolve({ success: true, data: resourceIds });
        }
      });
    });
  },

  /**
   * Fetches the chat history for a specific resource ID.
   * @async
   * @function chat_history
   * @param {Object} query - The query parameters.
   * @param {string} query.resource_id - The resource identifier.
   * @param {number} [query.limit=10] - The maximum number of records to fetch.
   * @returns {Promise<{success: boolean, data: Array<MemoryRecord>}>} A promise that resolves with an object containing a success flag and an array of chat history records.
   * @throws {Error} If an error occurs while fetching the chat history.
   */
  chat_history: async (query) => {
    return new Promise((resolve, reject) => {
      const { resource_id, limit = 10 } = query;
      const sql = `SELECT * FROM ${TABLE_NAME} WHERE resource_id = ? LIMIT ?`;
      const values = [resource_id, limit];
      db.all(sql, values, (err, rows) => {
        if (err) {
          console.error('Error fetching chat history:', err.message);
          reject(new Error('Failed to fetch chat history'));
        } else {
          console.log(`Chat history fetched for resource_id: ${resource_id}`);
          resolve({ success: true, data: rows });
        }
      });
    });
  }
};

module.exports = dbWrapper;
