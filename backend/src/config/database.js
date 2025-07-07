const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { encrypt, decrypt, encryptObject, decryptObject } = require('../utils/encryption');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

// Extend the database with encryption capabilities
function extendDatabase(db) {
  // Wrap the original run method to handle encryption
  const originalRun = db.run.bind(db);
  db.run = function(sql, params, callback) {
    if (Array.isArray(params)) {
      // Encrypt sensitive parameters
      const encryptedParams = params.map((param) => {
        if (typeof param === 'object' && param !== null) {
          return JSON.stringify(encryptObject(param));
        }
        return param;
      });
      return originalRun(sql, encryptedParams, callback);
    }
    return originalRun(sql, params, callback);
  };

  // Wrap the original get method to handle decryption
  const originalGet = db.get.bind(db);
  db.get = function(sql, params, callback) {
    return originalGet(sql, params, function(err, row) {
      if (err || !row) {
        return callback(err, row);
      }
      // Decrypt sensitive data
      const decryptedRow = decryptObject(row);
      callback(null, decryptedRow);
    });
  };

  // Wrap the original all method to handle decryption
  const originalAll = db.all.bind(db);
  db.all = function(sql, params, callback) {
    return originalAll(sql, params, function(err, rows) {
      if (err || !rows) {
        return callback(err, rows);
      }
      // Decrypt sensitive data in all rows
      const decryptedRows = rows.map(row => decryptObject(row));
      callback(null, decryptedRows);
    });
  };

  return db;
}

const db = extendDatabase(new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Create users table with avatar and avatarColor columns
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      phoneNumber TEXT,
      address TEXT,
      password TEXT NOT NULL,
      logoUrl TEXT,
      avatar TEXT,
      avatarColor TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      fields JSON NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(userId, name)
    )
  `);

  // Create invoices table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      invoiceNumber TEXT NOT NULL,
      date TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      clientName TEXT NOT NULL,
      clientCompany TEXT,
      clientEmail TEXT NOT NULL,
      items JSON NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      bankName TEXT,
      accountNumber TEXT,
      swift TEXT,
      mobilePayment TEXT,
      notes TEXT,
      status TEXT DEFAULT 'draft',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(userId, invoiceNumber)
    )
  `);

  // Create receipts table
  db.run(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      receiptNumber TEXT NOT NULL,
      date TEXT NOT NULL,
      invoiceId INTEGER NOT NULL,
      invoiceNumber TEXT NOT NULL,
      clientName TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      amountPaid REAL NOT NULL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
      UNIQUE(userId, receiptNumber)
    )
  `);

  // Create default categories for new users
  db.run(`
    CREATE TRIGGER IF NOT EXISTS create_default_categories
    AFTER INSERT ON users
    BEGIN
      -- Sales Invoice Category
      INSERT INTO categories (userId, name, description, fields)
      VALUES (NEW.id, 'Sales', 'For sales and revenue invoices', 
        json_array(
          json_object('name', 'customerName', 'type', 'text', 'required', 1, 'label', 'Customer Name'),
          json_object('name', 'itemDescription', 'type', 'text', 'required', 1, 'label', 'Item Description'),
          json_object('name', 'quantity', 'type', 'number', 'required', 1, 'label', 'Quantity'),
          json_object('name', 'unitPrice', 'type', 'number', 'required', 1, 'label', 'Unit Price'),
          json_object('name', 'tax', 'type', 'number', 'required', 1, 'label', 'Tax Rate (%)')
        )
      );
      
      -- Services Invoice Category
      INSERT INTO categories (userId, name, description, fields)
      VALUES (NEW.id, 'Services', 'For service-based invoices',
        json_array(
          json_object('name', 'clientName', 'type', 'text', 'required', 1, 'label', 'Client Name'),
          json_object('name', 'serviceDescription', 'type', 'text', 'required', 1, 'label', 'Service Description'),
          json_object('name', 'hours', 'type', 'number', 'required', 1, 'label', 'Hours'),
          json_object('name', 'hourlyRate', 'type', 'number', 'required', 1, 'label', 'Hourly Rate'),
          json_object('name', 'tax', 'type', 'number', 'required', 1, 'label', 'Tax Rate (%)')
        )
      );
    END;
  `);
}));

module.exports = db; 