require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const connectDB  = require('./db');
const Message    = require('./models/Message');

const app    = express();
const server = http.createServer(app); // ← Socket.io butuh http server
const io     = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

connectDB();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/auth',  require('./routes/auth'));
app.use('/rooms', require('./routes/rooms'));
app.use('/users', require('./routes/users'));

// Socket.io events
io.on('connection', (socket) => {
  console.log('User konek:', socket.id);

  // User masuk room — join socket room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} join room ${roomId}`);
  });

  // User kirim pesan
  socket.on('send_message', async (data) => {
    try {
      const { roomId, isi, pengirimId } = data;

      // Simpan ke database
      const message = await Message.create({
        isi,
        pengirim: pengirimId,
        room: roomId,
      });

      // Populate nama pengirim
      await message.populate('pengirim', 'nama');

      // Broadcast ke semua user di room ini
      io.to(roomId).emit('receive_message', message);
    } catch (err) {
      console.error('Error kirim pesan:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnect:', socket.id);
  });
});

server.listen(3000, () =>
  console.log('Server + Socket.io jalan di port 3000')
);