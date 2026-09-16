const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    term: { type: String, required: true },
    lineItems: [LineItemSchema],
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', InvoiceSchema);
