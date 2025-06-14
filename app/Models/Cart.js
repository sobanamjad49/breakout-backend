const mongoose = require("mongoose");
mongoose.pluralize(null);

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        selectedSize: {
          type: String,
          required: true,
        },
        name: { type: String },
        image: { type: String },
        price: { type: Number },
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
