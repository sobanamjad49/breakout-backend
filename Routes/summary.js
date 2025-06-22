const express = require("express");
const router = express.Router();

const Product = require("../app/Models/Product");
const Order = require("../app/Models/Order");

router.get("/dashboardsummary", async (req, res) => {
  try {
    const products = await Product.find();
    const orders = await Order.find()
      .populate("userId")
      .populate("items.productId");

    const totalSold = orders.reduce(
      (total, order) =>
        total + order.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    );

    const totalCost = orders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (s, item) => s + (item.productId?.costPrice || 0) * item.quantity,
          0
        ),
      0
    );

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalProfit = totalSales - totalCost;

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
      return acc;
    }, {});

    const remainingStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalStock = products.reduce(
      (sum, p) => sum + ((p.stock || 0) + (p.sold || 0)),
      0
    );

    const lowStockAlerts = products
      .filter((p) => (p.stock || 0) <= 3)
      .map((p) => ({ name: p.name, stock: p.stock || 0 }));

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrdersRaw = orders.filter(
      (order) =>
        new Date(order.createdAt) >= todayStart &&
        new Date(order.createdAt) <= todayEnd
    );

    const weekOrdersRaw = orders.filter(
      (order) =>
        new Date(order.createdAt) >= weekAgo &&
        new Date(order.createdAt) <= todayEnd
    );

    const monthOrdersRaw = orders.filter(
      (order) => new Date(order.createdAt) >= monthStart
    );

    const todaySales = todayOrdersRaw.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );
    const monthSales = monthOrdersRaw.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );

    const formatOrders = (orderArray) =>
      orderArray.map((o) => ({
        id: o._id,
        time: new Date(o.createdAt).toLocaleString(),
        amount: o.totalAmount,
        status: o.orderStatus,
        user: {
          name: o.userId?.name || o.fullName || "Unknown",
          email: o.userId?.email || o.email || "N/A",
          phone: o.userId?.phone || o.phoneNumber || "N/A",
        },
        products: o.items.map((p) => ({
          name: p.name || p.productId?.name || "N/A",
          quantity: p.quantity,
          size: p.selectedSize || "-",
          price: p.price,
        })),
      }));

    const salesTrend = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split("T")[0];

      const daySales = orders
        .filter(
          (o) =>
            new Date(o.createdAt).toISOString().split("T")[0] === dateStr
        )
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return { date: dateStr, amount: daySales };
    });

    const productStockStats = products.map((p) => ({
      productId: p._id, // ✅ Included product ID here
      name: p.name,
      category: p.category,
      totalStock: p.stock || 0,
      totalSold: p.sold || 0,
      remainingStock: p.stock - p.sold || 0,
    }));

    res.json({
      totalProfit,
      totalCost,
      totalSales,
      totalSold,
      totalStock,
      remainingStock,
      statusCounts,
      lowStockAlerts,
      todaySales,
      monthSales,
      productStockStats,
      todayOrders: formatOrders(todayOrdersRaw),
      weekOrders: formatOrders(weekOrdersRaw),
      monthOrders: formatOrders(monthOrdersRaw),
      orders: formatOrders(orders),
      salesTrend,
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
