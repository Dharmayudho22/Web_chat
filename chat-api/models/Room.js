const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      trim: true,
    },
    deskripsi: {
      type: String,
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // === FIELD BARU ===
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isDM: {
      type: Boolean,
      default: false,
    },
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);