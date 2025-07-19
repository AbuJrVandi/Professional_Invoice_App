const db = require('../config/database');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a new receipt
exports.createReceipt = (req, res) => {
  const {
    receiptNumber,
    date,
    invoiceId,
    invoiceNumber,
    clientName,
    paymentMethod,
    amountPaid,
    notes
  } = req.body;

  // Validate required fields
  if (!receiptNumber || !date || !invoiceId || !invoiceNumber || !clientName || !paymentMethod || !amountPaid) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO receipts (
      userId,
      receiptNumber,
      date,
      invoiceId,
      invoiceNumber,
      clientName,
      paymentMethod,
      amountPaid,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    req.user.id,
    receiptNumber,
    date,
    invoiceId,
    invoiceNumber,
    clientName,
    paymentMethod,
    amountPaid,
    notes
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error creating receipt:', err);
      return res.status(500).json({ error: err.message });
    }

    // Update invoice payment status if needed
    updateInvoicePaymentStatus(invoiceId, amountPaid);

    res.status(201).json({
      id: this.lastID,
      ...req.body
    });
  });
};

// List all receipts for a user
exports.listReceipts = (req, res) => {
  const sql = `
    SELECT *
    FROM receipts 
    WHERE userId = ?
    ORDER BY date DESC
  `;

  db.all(sql, [req.user.id], (err, receipts) => {
    if (err) {
      console.error('Error fetching receipts:', err);
      return res.status(500).json({ error: err.message });
    }

    res.json(receipts);
  });
};

// Get a specific receipt
exports.getReceipt = (req, res) => {
  const sql = `
    SELECT *
    FROM receipts
    WHERE id = ? AND userId = ?
  `;

  db.get(sql, [req.params.id, req.user.id], (err, receipt) => {
    if (err) {
      console.error('Error fetching receipt:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    res.json(receipt);
  });
};

// Generate PDF for a receipt
exports.generatePDF = (req, res) => {
  const sql = `
    SELECT r.*, u.fullName as userFullName, u.email as userEmail
    FROM receipts r
    JOIN users u ON r.userId = u.id
    WHERE r.id = ? AND r.userId = ?
  `;

  db.get(sql, [req.params.id, req.user.id], (err, receipt) => {
    if (err) {
      console.error('Error fetching receipt for PDF:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipt-${receipt.receiptNumber}.pdf`);

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

      // Add receipt content
      doc.fontSize(24).text('RECEIPT', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Receipt No: ${receipt.receiptNumber}`);
      doc.text(`Date: ${new Date(receipt.date).toLocaleDateString()}`);
      doc.moveDown();

      doc.text(`Received From: ${receipt.clientName}`);
      doc.text(`Invoice No: ${receipt.invoiceNumber}`);
      doc.text(`Payment Method: ${receipt.paymentMethod}`);
      doc.moveDown();

      doc.fontSize(14).text(`Amount Paid: NLe ${parseFloat(receipt.amountPaid).toLocaleString()}`);
      doc.moveDown();

      if (receipt.notes) {
        doc.fontSize(12).text(receipt.notes);
        doc.moveDown();
      }

      // Add signature line
      doc.moveDown(4);
      doc.lineCap('butt')
        .moveTo(50, doc.y)
        .lineTo(200, doc.y)
        .stroke();
      doc.text('Signature', 50, doc.y + 5);

      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Error generating PDF' });
    }
  });
};

// Helper function to update invoice payment status
function updateInvoicePaymentStatus(invoiceId, amountPaid) {
  const sql = `
    SELECT total, status
    FROM invoices
    WHERE id = ?
  `;

  db.get(sql, [invoiceId], (err, invoice) => {
    if (err || !invoice) {
      console.error('Error fetching invoice:', err);
      return;
    }

    const totalPaid = parseFloat(amountPaid);
    const newStatus = totalPaid >= invoice.total ? 'paid' : 'partial';

    db.run(
      'UPDATE invoices SET status = ? WHERE id = ?',
      [newStatus, invoiceId],
      (err) => {
        if (err) {
          console.error('Error updating invoice status:', err);
        }
      }
    );
  });
} 