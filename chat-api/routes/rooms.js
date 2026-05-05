const express    = require('express');
const Room       = require('../models/Room');
const RoomMember = require('../models/RoomMember');
const Message    = require('../models/Message');
const protect    = require('../middleware/protect');
const router     = express.Router();

router.use(protect);

// GET /rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { isPrivate: false, isDM: false },
        { allowedUsers: req.user._id },
      ]
    })
      .populate('creator', 'nama')
      .populate('allowedUsers', 'nama')
      .sort({ createdAt: -1 })
    res.json(rooms)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /rooms/dm/:userId — HARUS sebelum /:id
router.post('/dm/:userId', async (req, res) => {
  try {
    const myId    = req.user._id
    const otherId = req.params.userId
    const existing = await Room.findOne({
      isDM: true,
      allowedUsers: { $all: [myId, otherId], $size: 2 },
    })
    if (existing) return res.json(existing)
    const room = await Room.create({
      isDM: true,
      isPrivate: true,
      creator: myId,
      allowedUsers: [myId, otherId],
    })
    await RoomMember.create([
      { user: myId,    room: room._id },
      { user: otherId, room: room._id },
    ])
    res.status(201).json(room)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /rooms
router.post('/', async (req, res) => {
  try {
    const { nama, deskripsi, isPrivate } = req.body
    const room = await Room.create({
      nama,
      deskripsi,
      creator: req.user._id,
      isPrivate: isPrivate || false,
      allowedUsers: [req.user._id],
    })
    await RoomMember.create({ user: req.user._id, room: room._id })
    res.status(201).json(room)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator', 'nama')
      .populate('allowedUsers', 'nama')
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' })
    res.json(room)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /rooms/:id/join
router.post('/:id/join', async (req, res) => {
  try {
    await RoomMember.create({ user: req.user._id, room: req.params.id })
    res.json({ message: 'Berhasil join room' })
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ error: 'Kamu sudah join room ini' })
    res.status(500).json({ error: err.message })
  }
})

// POST /rooms/:id/invite
router.post('/:id/invite', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' })
    if (room.creator._id.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Hanya creator yang bisa undang' })
    const { userId } = req.body
    if (!room.allowedUsers.map(u => u.toString()).includes(userId)) {
      room.allowedUsers.push(userId)
      await room.save()
      await RoomMember.create({ user: userId, room: room._id }).catch(() => {})
    }
    res.json({ message: 'User berhasil diundang', room })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /rooms/:id/messages
router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.id })
      .populate('pengirim', 'nama avatarUrl')
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(messages.reverse())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /rooms/:id/messages
router.post('/:id/messages', async (req, res) => {
  try {
    const { isi } = req.body
    if (!isi || !isi.trim())
      return res.status(400).json({ error: 'Pesan tidak boleh kosong' })
    const message = await Message.create({
      isi: isi.trim(),
      pengirim: req.user._id,
      room: req.params.id,
    })
    await message.populate('pengirim', 'nama')
    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router;