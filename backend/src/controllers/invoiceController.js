const db = require('../config/database');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a new invoice
exports.createInvoice = async (req, res) => {
  const {
    invoiceNumber,
    date,
    dueDate,
    clientName,
    clientCompany,
    clientEmail,
    items,
    subtotal,
    tax,
    total,
    bankName,
    accountNumber,
    swift,
    mobilePayment,
    notes,
    status = 'draft'
  } = req.body;

  // Validate required fields
  if (!invoiceNumber || !date || !dueDate || !clientName || !clientEmail || !items || !subtotal || !tax || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO invoices (
      userId, invoiceNumber, date, dueDate, clientName, clientCompany,
      clientEmail, items, subtotal, tax, total, bankName, accountNumber,
      swift, mobilePayment, notes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    db.run(sql, [
      req.user.id,
      invoiceNumber,
      date,
      dueDate,
      clientName,
      clientCompany || null,
      clientEmail,
      JSON.stringify(items),
      subtotal,
      tax,
      total,
      bankName || null,
      accountNumber || null,
      swift || null,
      mobilePayment || null,
      notes || null,
      status
    ], function(err) {
      if (err) {
        console.error('Error creating invoice:', err);
        return res.status(400).json({ error: err.message });
      }

      // Get the created invoice
      db.get('SELECT * FROM invoices WHERE id = ?', [this.lastID], (err, invoice) => {
        if (err) {
          console.error('Error fetching created invoice:', err);
          return res.status(500).json({ error: 'Error fetching created invoice' });
        }
        
        // Parse the items JSON string back to an array
        invoice.items = JSON.parse(invoice.items);
        res.status(201).json(invoice);
      });
    });
  } catch (error) {
    console.error('Error in createInvoice:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all invoices for the logged-in user
exports.getInvoices = (req, res) => {
  const sql = 'SELECT * FROM invoices WHERE userId = ? ORDER BY createdAt DESC';
  
  db.all(sql, [req.user.id], (err, invoices) => {
    if (err) {
      console.error('Error fetching invoices:', err);
      return res.status(500).json({ error: err.message });
    }

    // Parse the items JSON string for each invoice
    invoices = invoices.map(invoice => ({
      ...invoice,
      items: JSON.parse(invoice.items)
    }));

    res.json(invoices);
  });
};

// Get a specific invoice
exports.getInvoice = (req, res) => {
  const sql = 'SELECT * FROM invoices WHERE id = ? AND userId = ?';
  
  db.get(sql, [req.params.id, req.user.id], (err, invoice) => {
    if (err) {
      console.error('Error fetching invoice:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Parse the items JSON string
    invoice.items = JSON.parse(invoice.items);
    res.json(invoice);
  });
};

// Update an invoice
exports.updateInvoice = (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'invoiceNumber', 'date', 'dueDate', 'clientName', 'clientCompany',
    'clientEmail', 'items', 'subtotal', 'tax', 'total', 'bankName',
    'accountNumber', 'swift', 'mobilePayment', 'notes', 'status'
  ];

  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  // Build the SQL update statement
  const updateFields = updates.map(field => `${field} = ?`).join(', ');
  const sql = `UPDATE invoices SET ${updateFields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?`;

  // Prepare values for the SQL statement
  const values = [
    ...updates.map(field => {
      if (field === 'items') {
        return JSON.stringify(req.body[field]);
      }
      return req.body[field];
    }),
    req.params.id,
    req.user.id
  ];

  db.run(sql, values, function(err) {
    if (err) {
      console.error('Error updating invoice:', err);
      return res.status(400).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get the updated invoice
    db.get('SELECT * FROM invoices WHERE id = ?', [req.params.id], (err, invoice) => {
      if (err) {
        console.error('Error fetching updated invoice:', err);
        return res.status(500).json({ error: 'Error fetching updated invoice' });
      }

      // Parse the items JSON string
      invoice.items = JSON.parse(invoice.items);
      res.json(invoice);
    });
  });
};

// Delete an invoice
exports.deleteInvoice = (req, res) => {
  const sql = 'DELETE FROM invoices WHERE id = ? AND userId = ?';
  
  db.run(sql, [req.params.id, req.user.id], function(err) {
    if (err) {
      console.error('Error deleting invoice:', err);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  });
};

// Generate PDF for an invoice
exports.generatePDF = (req, res) => {
  const sql = 'SELECT i.*, u.fullName as userFullName, u.email as userEmail, u.address as userAddress FROM invoices i JOIN users u ON i.userId = u.id WHERE i.id = ? AND i.userId = ?';
  
  db.get(sql, [req.params.id, req.user.id], (err, invoice) => {
    if (err) {
      console.error('Error fetching invoice for PDF:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    try {
      console.log('Invoice data:', invoice); // Debug log

      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

      // Pipe the PDF directly to the response
      doc.pipe(res);

      // Add logo and company info
      const logoPath = path.join(__dirname, '../../../frontend/assets/Invoice_logo.jpg');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 50, { width: 100 });
      }
      doc.moveDown();

      // Company header - centered
      doc.font('Helvetica-Bold').fontSize(20).text('Invoice App', { align: 'center' });
      doc.font('Helvetica').fontSize(10)
        .text('Hill Station', { align: 'center' })
        .text('Phone: 073914398', { align: 'center' })
        .text('Email: abujuniorv@gmail.com', { align: 'center' })
        .text('Website: abujuniorv.page.dev', { align: 'center' });

      // Add horizontal line
      doc.moveDown();
      doc.lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Invoice details
      doc.font('Helvetica-Bold').fontSize(12)
        .text(`INVOICE #: ${invoice.invoiceNumber}`, { continued: false })
        .font('Helvetica').fontSize(10)
        .text(`Date: ${new Date(invoice.date).toLocaleDateString()}`)
        .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);

      doc.moveDown();

      // Bill To section
      doc.font('Helvetica-Bold').fontSize(12).text('Bill To:');
      doc.font('Helvetica').fontSize(10)
        .text(invoice.clientName)
        .text(invoice.clientCompany || '')
        .text(invoice.clientEmail);

      doc.moveDown();

      // Items table header
      const tableTop = doc.y + 20;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Description', 50, tableTop);
      doc.text('Quantity', 250, tableTop);
      doc.text('Rate', 350, tableTop);
      doc.text('Total', 450, tableTop);

      // Add a line under the header
      doc.lineWidth(1).moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

      // Items
      let y = tableTop + 30;
      let items;
      try {
        items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
      } catch (e) {
        console.error('Error parsing items:', e);
        items = [];
      }

      items.forEach(item => {
        doc.font('Helvetica').fontSize(10);
        doc.text(String(item.description || ''), 50, y);
        doc.text(String(item.quantity || ''), 250, y);
        doc.text(`NLe ${Number(item.rate || 0).toLocaleString()}`, 350, y);
        doc.text(`NLe ${Number(item.total || 0).toLocaleString()}`, 450, y);
        y += 20;
      });

      // Add horizontal line
      y += 10;
      doc.lineWidth(1).moveTo(50, y).lineTo(545, y).stroke();

      // Totals
      y += 20;
      doc.font('Helvetica').fontSize(10);
      doc.text('Subtotal:', 350, y);
      doc.text(`NLe ${Number(invoice.subtotal || 0).toLocaleString()}`, 450, y);
      
      y += 20;
      doc.text('Tax (5%):', 350, y);
      doc.text(`NLe ${Number(invoice.tax || 0).toLocaleString()}`, 450, y);
      
      y += 20;
      doc.font('Helvetica-Bold');
      doc.text('Total Due:', 350, y);
      doc.text(`NLe ${Number(invoice.total || 0).toLocaleString()}`, 450, y);

      // Add horizontal line
      y += 40;
      doc.lineWidth(1).moveTo(50, y).lineTo(545, y).stroke();

      // Payment Instructions
      y += 20;
      doc.font('Helvetica-Bold').fontSize(12).text('Payment Instructions:', 50, y);
      y += 20;
      doc.font('Helvetica').fontSize(10);
      if (invoice.bankName) doc.text(`Bank Name: ${invoice.bankName}`, 50, y);
      y += 20;
      if (invoice.accountNumber) doc.text(`Account Number: ${invoice.accountNumber}`, 50, y);
      y += 20;
      if (invoice.swift) doc.text(`SWIFT: ${invoice.swift}`, 50, y);
      y += 20;
      if (invoice.mobilePayment) doc.text(`Mobile Payment: ${invoice.mobilePayment}`, 50, y);

      // Notes
      if (invoice.notes) {
        y += 40;
        doc.font('Helvetica-Bold').fontSize(12).text('Notes:', 50, y);
        y += 20;
        doc.font('Helvetica').fontSize(10).text(invoice.notes, 50, y);
      }

      // Footer with page number
      doc.fontSize(10)
         .text(
           'Page 1 of 1',
           50,
           doc.page.height - 50,
           { align: 'center' }
         );

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Error generating PDF: ' + error.message });
    }
  });
};

// List all invoices for a user
exports.listInvoices = (req, res) => {
  const sql = `
    SELECT 
      id,
      invoiceNumber,
      date,
      dueDate,
      clientName,
      clientCompany,
      clientEmail,
      items,
      subtotal,
      tax,
      total,
      status,
      createdAt,
      updatedAt
    FROM invoices 
    WHERE userId = ?
    ORDER BY createdAt DESC
  `;

  db.all(sql, [req.user.id], (err, invoices) => {
    if (err) {
      console.error('Error fetching invoices:', err);
      return res.status(500).json({ error: err.message });
    }

    // Parse items JSON for each invoice
    const formattedInvoices = invoices.map(invoice => ({
      ...invoice,
      items: JSON.parse(invoice.items),
      date: new Date(invoice.date).toISOString(),
      dueDate: new Date(invoice.dueDate).toISOString(),
      createdAt: new Date(invoice.createdAt).toISOString(),
      updatedAt: new Date(invoice.updatedAt).toISOString()
    }));

    res.json(formattedInvoices);
  });
}; 