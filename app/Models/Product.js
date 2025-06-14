const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    price: Number,
    oldPrice: Number,
    discount: Number,
    description: String,
    images: [String],
    sizes: [String],
    category: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
