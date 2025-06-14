const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoute = require("./Routes/userRoute");
const productRoute = require("./Routes/productsRoute");
const orderRoute = require("./Routes/orderRoute");
const cartRoute = require("./Routes/cartRoute");
const authRoutes = require("./Routes/authRoutes"); // Admin/User login route

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Required to parse JSON requests

// ✅ API Routes
app.use("/auth", authRoutes); // 🔐 Login for admin/user
app.use("/users", userRoute); // 👤 User-related routes
app.use("/products", productRoute); // 🛍️ Product management
app.use("/orders", orderRoute); // 📦 Orders
app.use("/cart", cartRoute); // 🛒 Cart

// ✅ MongoDB Connection
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ Start Express Server
const PORT = process.env.PORT || 7474;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
