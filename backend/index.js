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

// ✅ Define allowed origins (add your actual frontend URL)
const allowedOrigins = [
  'https://ai-code-generatorfront.vercel.app',
  'http://localhost:3000',
];

// 🛡️ Enable CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// 👇 Handle preflight requests globally
app.options('*', cors());

// 📦 Middleware
app.use(express.json());

// 🔐 API routes
app.use('/api/auth', authRoutes);

// ⚡ Setup Socket.IO with JWT auth
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Connected: ${socket.user.username}`);

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

// 🚀 Start Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error('❌ MongoDB error:', err));
