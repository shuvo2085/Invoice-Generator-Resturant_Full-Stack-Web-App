const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  variants: [variantSchema],
  basePrice: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
