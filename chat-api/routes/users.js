const express = require('express');
const User    = require('../models/User');
const protect = require('../middleware/protect');
const router  = express.Router();

router.use(protect);

// GET /users/me — profil sendiri
router.get('/me', (req, res) => {
  res.json(req.user)
})

// GET /users — semua user kecuali diri sendiri
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('nama email')
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /users/:id — profil user lain
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v -password')
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router;