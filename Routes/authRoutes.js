const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../app/Models/Admin");

const router = express.Router();

// Admin Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    admin = new Admin({
      email,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      "your_jwt_secret_key", // Use env variable in production
      { expiresIn: "1d" }
    );

    res.json({
      user: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
