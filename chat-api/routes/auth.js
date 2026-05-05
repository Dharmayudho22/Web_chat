const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

//Helper untuk buat web token
const buatToken = (id) => 
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });

//Post /auth/register
router.post('/register', async (req, res) => {
    try {
        const { nama, email, password } = req.body;
        if (!nama || !email || !password) {
            return res.status(400).json({ error: 'Semua field wajib diisi' });
        }

        //Cek email sudah terdaftar belum
        const sudahAda = await User.findOne({email});
        if (sudahAda) 
            return res.status(400).json({ error: 'Email sudah terdaftar' });

        //Buat user - password otomatis di-hash oleh pre-save hook 
        const user = await User.create({ nama, email, password });

        res.status(201).json({
            token: buatToken(user._id),
            user: {
                id: user._id,
                nama: user.nama,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Post /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) 
            return res.status(400).json({ error: 'Email dan password wajib diisi' });

        //+password karena select: false di schema User
        const user = await User.findOne({ email }).select('+password');
        if (!user)
            return res.status(400).json({ error: 'Email atau password salah' });

        const cocok = await user.cocokkanPassword(password);
        if (!cocok)
            return res.status(400).json({ error: 'Email atau password salah' });

        res.json({
            token: buatToken(user._id),
            user: {
                id: user._id,
                nama: user.nama,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;