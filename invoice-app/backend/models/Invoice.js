const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  itemName: { type: String, required: true },
  variant: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  basePrice: { type: Number, required: true },
  gstPercent: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percent', 'absolute'], default: 'percent' },
  discountValue: { type: Number, default: 0 },
  rowTotal: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  customer: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true }
  },
  lineItems: [lineItemSchema],
  subtotal: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
