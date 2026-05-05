const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        //ambil token dari header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'Silahkan login terlebih dahulu' });

        const token = authHeader.split(' ')[1];

        //verify dan decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //cek user masih ada di DB
        const user = await User.findById(decoded.id);
        if (!user)
            return res.status(401).json({ error: 'User tidak ditemukan' });

        //simpan user ke req supaya bisa diakses di route
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token tidak valid atau sudah ekspired' });
    }
};

module.exports = protect;