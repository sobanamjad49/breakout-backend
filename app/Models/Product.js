
// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     id: Number,
//     name: String,
//     price: Number,
//     oldPrice: Number,
//     discount: Number,
//     description: String,
//     images: [String],
//     sizes: [String],
//     category: String,
//     stock: { type: Number, default: 0 }, // ✅ Add this
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", productSchema);
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
    stock: { type: Number, default: 0 }, // available stock
    sold: { type: Number, default: 0 },  // ✅ number of items sold
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
