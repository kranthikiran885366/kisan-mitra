const express = require("express")
const auth = require("../middleware/auth")

const router = express.Router()

router.get("/", auth, async (req, res) => {
  try {
    const ratings = [
      { id: 1, userId: req.userId, rating: 5, comment: "Great service", createdAt: new Date() }
    ]
    res.json({ success: true, data: ratings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post("/", auth, async (req, res) => {
  try {
    const { rating, comment, targetId } = req.body
    const newRating = {
      id: Date.now(),
      userId: req.userId,
      targetId,
      rating,
      comment,
      createdAt: new Date()
    }
    res.json({ success: true, data: newRating })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router