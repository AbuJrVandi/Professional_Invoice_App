const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientCompany: {
    type: String
  },
  clientEmail: {
    type: String,
    required: true
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  bankName: String,
  accountNumber: String,
  swift: String,
  mobilePayment: String,
  notes: String,
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema); 