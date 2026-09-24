const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    amount: { type: Number, required: true },
    email: { type: String, required: true },
    reference: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    paymentMethod: { type: String, default: 'paystack' },
    paystackTransactionId: { type: String },
    date: { type: Date, default: Date.now },
    method: { type: String, default: 'simulated' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
