const express = require("express");
const router = express.Router();
const Product = require("../app/Models/Product");
const mongoose = require("mongoose");

// Get all products
router.get("/getproduct", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product by ID
router.get("/getproducts/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new product
router.post("/addproduct", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a product by ID
router.put("/updateproduct/:id", async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a product by ID
router.delete("/deleteproduct/:id", async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update sold count for multiple products by incrementing sold by quantity
router.post("/update-product-quantity", async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);
    const updates = req.body; // Expecting [{ id, quantity }, ...]
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "Request body must be an array of {id, quantity}" });
    }
    // Convert id to ObjectId
    const bulkOps = updates.map(item => {
      let objectId;
      try {
        objectId = new mongoose.Types.ObjectId(item.id._id);
      } catch (e) {
        console.error(`Invalid ObjectId for id: ${item.id}`);
        return null;
      }
      return {
        updateOne: {
          filter: { _id: objectId },
          update: { $inc: { sold: item.quantity } }
        }
      };
    }).filter(Boolean);
    console.log("Generated bulkOps:", JSON.stringify(bulkOps, null, 2));
    if (bulkOps.length === 0) {
      return res.status(404).json({ message: "No valid product IDs provided" });
    }
    const result = await Product.bulkWrite(bulkOps);
    console.log("bulkWrite result:", result);
    res.json({ message: "Products' sold incremented successfully", result });
  } catch (err) {
    console.error("Error in /update-product-quantity:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
