const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        isi: {
            type: String,
            required: [true, 'Isi pesan tidak boleh kosong'],
            trim: true,
            maxlength: [2000, 'Pesan makasimal 2000 karakter'],
        },
        pengirim: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
    },
    { timestamps: true }
);

messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);