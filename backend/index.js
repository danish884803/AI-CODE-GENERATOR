const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/authRoutes');
const { generateCode } = require('./services/gemini');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(' MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log(` Connected: ${socket.user.username}`);

  socket.on('prompt', async (prompt) => {
    socket.emit('status', '⏳ Generating...');
    try {
      const code = await generateCode(prompt);
      socket.emit('result', code);
    } catch (err) {
      socket.emit('result', `Error: ${err.message}`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
