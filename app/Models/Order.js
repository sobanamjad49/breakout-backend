const mongoose = require("mongoose");
mongoose.pluralize(null);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        selectedSize: { type: String },

        // ✅ Added for checkout view
        name: { type: String },
        image: { type: String },
        price: { type: Number },
        description: { type: String },
        category: { type: String },
      },
    ],

    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },

    city: { type: String, required: true },
    postalCode: { type: String, required: true },

    paymentMethod: { type: String, enum: ["COD", "card"], required: true },
    paymentStatus: { type: String, default: "Pending" },

    creditCardInfo: {
      cardNumber: { type: String },
      cvv: { type: String },
      cardHolderName: { type: String },
      expiryDate: { type: String }, // MM/YY
    },

    orderStatus: { type: String, default: "Processing" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
