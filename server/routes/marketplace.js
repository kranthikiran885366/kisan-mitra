const express = require("express")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all products
router.get("/products", auth, async (req, res) => {
  try {
    const products = [
      { id: 1, cropName: "Rice", price: 2500, farmer: "John Doe", location: "Guntur" },
      { id: 2, cropName: "Wheat", price: 2200, farmer: "Jane Smith", location: "Punjab" }
    ]
    res.json({ success: true, data: products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Sell crop endpoint
router.post("/sell", auth, async (req, res) => {
  try {
    const listing = {
      id: Date.now().toString(),
      farmerId: req.userId,
      ...req.body,
      status: "active",
      createdAt: new Date()
    }
    res.json({ success: true, message: "Crop listing created successfully", data: listing })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Price negotiation
router.post("/negotiate", auth, async (req, res) => {
  try {
    const negotiation = {
      id: Date.now().toString(),
      buyerId: req.userId,
      ...req.body,
      status: "pending",
      createdAt: new Date()
    }
    res.json({ success: true, data: negotiation })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Cart operations
router.get("/cart", auth, async (req, res) => {
  try {
    const cart = { items: [], total: 0 }
    res.json({ success: true, data: cart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Orders
router.get("/orders", auth, async (req, res) => {
  try {
    const orders = []
    res.json({ success: true, data: orders })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get product by ID
router.get("/products/:id", auth, async (req, res) => {
  try {
    const product = { id: req.params.id, cropName: "Rice", price: 2500 }
    res.json({ success: true, data: product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router