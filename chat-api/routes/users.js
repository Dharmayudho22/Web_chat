const express = require('express')
const User    = require('../models/User')
const protect = require('../middleware/protect')
const router  = express.Router()

router.use(protect)

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

// GET /users/me — profil sendiri
router.get('/me', (req, res) => res.json(req.user))

// PATCH /users/me — edit nama & email
router.patch('/me', async (req, res) => {
  try {
    const { nama, email } = req.body
    const user = await User.findById(req.user._id)
    if (nama) user.nama = nama
    if (email) user.email = email
    await user.save()
    res.json({ id: user._id, nama: user.nama, email: user.email })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /users/me/password — ganti password
router.patch('/me/password', async (req, res) => {
  try {
    const { passwordLama, passwordBaru } = req.body
    const user = await User.findById(req.user._id).select('+password')
    const cocok = await user.cocokkanPassword(passwordLama)
    if (!cocok)
      return res.status(400).json({ error: 'Password lama salah' })
    user.password = passwordBaru
    await user.save() // pre-save hook otomatis hash password baru
    res.json({ message: 'Password berhasil diganti' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /users/me — hapus akun sendiri
router.delete('/me', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id)
    res.json({ message: 'Akun berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router