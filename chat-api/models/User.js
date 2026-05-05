const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        nama: {
            type: String,
            required: [true, 'Nama wajib diisi'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email wajib diisi'],
            trim: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password wajib diisi'],
            minlength: [6, 'Password minimal 6 karakter'],
            select: false,
        },
        avatarUrl: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bycrypt.hash(this.password, 12);
    next();
});

userSchema.methods.cocokkanPassword = async function (input) {
    return await bycrypt.compare(input, this.password);
};

module.exports = mongoose.model('User', userSchema);
