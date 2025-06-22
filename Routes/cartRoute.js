const express = require("express");
const router = express.Router();
const Cart = require("../app/Models/Cart");
const Product = require("../app/Models/Product");

router.get("/all", async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("userId", "firstName lastName email") // ✅ correct fields
      .populate("items.productId");

    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get a specific user's cart with product details
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      "items.productId"
    );

    if (!cart) {
      return res.status(200).json({ items: [], totalAmount: 0 });
    }

    const formattedItems = cart.items.map((item) => {
      const product = item.productId;
      return {
        _id: item._id,
        cartId: cart._id,
        name: product.name,
        image: product.images[0],
        category: product.category,
        price: product.price,
        quantity: item.quantity,
        productId: product,
        size: item.selectedSize,
      };
    });

    res.status(200).json({
      items: formattedItems,
      totalAmount: cart.totalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity, selectedSize } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity, selectedSize }],
        totalAmount: product.price * quantity,
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.selectedSize === selectedSize
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, selectedSize });
      }

      const productMap = {};
      const allProducts = await Product.find({
        _id: { $in: cart.items.map((i) => i.productId) },
      });
      allProducts.forEach((p) => {
        productMap[p._id] = p;
      });

      cart.totalAmount = cart.items.reduce(
        (total, item) =>
          total + (productMap[item.productId]?.price || 0) * item.quantity,
        0
      );
    }

    await cart.save();
    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update cart item quantity
router.put("/update", async (req, res) => {
  try {
    const { userId, productId, quantity, selectedSize, itemId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId.toString()
    );

    if (itemIndex === -1)
      return res.status(404).json({ message: "Item not found in cart" });

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    const productMap = {};
    const allProducts = await Product.find({
      _id: { $in: cart.items.map((i) => i.productId) },
    });
    allProducts.forEach((p) => {
      productMap[p._id] = p;
    });

    cart.totalAmount = cart.items.reduce(
      (total, item) =>
        total + (productMap[item.productId]?.price || 0) * item.quantity,
      0
    );
    console.log("quanccaa", cart);

    await cart.save();
    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.log("oooode-=?>", error);
    res.status(500).json({ message: error.message });
  }
});


// ✅ Remove a single item from cart
router.delete("/removeItem/:userId/:itemId", async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    // Recalculate total amount
    const allProducts = await Product.find({ _id: { $in: cart.items.map(i => i.productId) } });
    const productMap = {};
    allProducts.forEach(p => (productMap[p._id] = p));

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + (productMap[item.productId]?.price || 0) * item.quantity,
      0
    );

    await cart.save();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Clear user's cart
router.delete("/clear/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
