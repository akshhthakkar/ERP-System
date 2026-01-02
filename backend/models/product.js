const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  price: { type: Number, required: true },
  inventory: { type: Number, required: true },
  // New: Reference to Category model
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  // Legacy: Keep for backward compatibility during migration
  category: { type: String, default: null },
  // Threshold and forecasting fields
  minThreshold: { type: Number, default: 10 },
  dailySalesAvg: { type: Number, default: 0 },
  lastSoldAt: { type: Date, default: null },
  // Supplier info
  preferredSupplierName: { type: String, default: null },
  lastPurchaseCost: { type: Number, default: null },
});

// Use mongoose.models cache
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
