const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, default: 'simulated' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
