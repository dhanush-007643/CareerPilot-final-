require('dotenv').config();
require('express-async-errors');

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');

// ── Optional security packages ────────────────────────────────────────────────
let helmet, rateLimit;
try { helmet    = require('helmet');            } catch (e) { /* install separately */ }
try { rateLimit = require('express-rate-limit'); } catch (e) { /* install separately */ }

// ── App & HTTP server ─────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Join personal + role rooms
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`  → User ${userId} joined their room`);
  });

  // Chat messaging
  socket.on('join_room', (roomId) => socket.join(roomId));
  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });
  socket.on('typing', (data) => {
    socket.to(data.room).emit('typing', { userId: data.userId });
  });

  socket.on('disconnect', () => console.log(`❌ Socket disconnected: ${socket.id}`));
});

// Make io available in controllers
app.set('io', io);

// ── Connect MongoDB ───────────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
if (helmet) app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
if (rateLimit) {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many attempts, please wait 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth/login',    authLimiter);
  app.use('/api/auth/register', authLimiter);
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/jobs',          require('./routes/jobs'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/quizzes',       require('./routes/quizzes'));
app.use('/api/assessments',   require('./routes/quizzes')); // alias
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/resume',        require('./routes/resume'));
app.use('/api/profile',       require('./routes/profile'));
app.use('/api/companies',     require('./routes/companies'));

// ── File Upload Endpoint ──────────────────────────────────────────────────
const { protect } = require('./middleware/auth');
const { uploadResume, uploadAvatar, processCloudinaryUpload } = require('./middleware/upload');
const User = require('./models/User');
const fs = require('fs');

// Ensure upload dir exists (for local fallback)
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.post('/api/upload/resume', protect, uploadResume, processCloudinaryUpload('resumes'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const url = req.cloudinaryUrl || `/uploads/${req.file.filename}`;
  await User.findByIdAndUpdate(req.user._id, { resumeUrl: url });
  res.json({ success: true, url });
});

app.post('/api/upload/avatar', protect, uploadAvatar, processCloudinaryUpload('avatars'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const url = req.cloudinaryUrl || `/uploads/${req.file.filename}`;
  await User.findByIdAndUpdate(req.user._id, { avatarUrl: url });
  res.json({ success: true, url });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'CareerPilot API is running ✅', timestamp: new Date() })
);

// ── DB Seeder ─────────────────────────────────────────────────────────────────
app.get('/api/seed', async (req, res) => {
  try {
    const User = require('./models/User');
    const Job  = require('./models/Job');
    const Quiz = require('./models/Quiz');

    await User.deleteMany({});
    await Job.deleteMany({});
    await Quiz.deleteMany({});

    // Seed demo users
    const [fresher, startup] = await User.create([
      {
        name: 'Alex Mercer', email: 'alex@demo.com', password: 'password123',
        role: 'fresher', college: 'IIT Delhi', skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        bio: 'Passionate full-stack developer looking for exciting startup opportunities.',
        cgpa: 8.9, graduationYear: 2024, assessmentScore: 88,
      },
      {
        name: 'Sarah Chen', email: 'sarah@demo.com', password: 'password123',
        role: 'startup', companyName: 'TechNova Labs',
        bio: 'CTO at TechNova Labs — building the future of AI.',
      },
    ]);

    // Seed demo jobs
    await Job.create([
      {
        title: 'Frontend Developer', company: 'TechNova Labs', companyId: startup._id,
        description: 'Build beautiful, fast UIs using React and TypeScript.',
        type: 'Full-time', domain: 'Frontend', location: 'Bangalore (Remote)',
        salary: '₹6-10 LPA', experience: 'Fresher',
        requiredSkills: ['React', 'TypeScript', 'CSS', 'Git'],
        perks: ['Remote Work', 'Stock Options', 'Health Insurance'],
      },
      {
        title: 'Backend Engineer', company: 'TechNova Labs', companyId: startup._id,
        description: 'Build scalable REST APIs and microservices with Node.js.',
        type: 'Full-time', domain: 'Backend', location: 'Mumbai',
        salary: '₹8-12 LPA', experience: 'Fresher',
        requiredSkills: ['Node.js', 'MongoDB', 'Express', 'Docker'],
        perks: ['Equity', 'Flexible Hours'],
      },
    ]);

    // Seed demo quiz
    await Quiz.create({
      title: 'JavaScript Fundamentals',
      category: 'Frontend',
      duration: 15,
      passMark: 70,
      questions: [
        { questionText: 'What does "typeof null" return in JavaScript?', options: ['null', 'object', 'undefined', 'string'], correctAnswer: 'object' },
        { questionText: 'Which method adds an item to the end of an array?', options: ['push', 'pop', 'shift', 'splice'], correctAnswer: 'push' },
        { questionText: 'What is a closure in JavaScript?', options: ['A loop construct', 'A function with access to its outer scope', 'An error handler', 'A class method'], correctAnswer: 'A function with access to its outer scope' },
      ],
    });

    res.json({
      success: true,
      message: 'Database seeded! Login: alex@demo.com / sarah@demo.com — password: password123',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 CareerPilot API running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io  ready on http://localhost:${PORT}`);
  console.log(`🌱 Seed data  → GET http://localhost:${PORT}/api/seed\n`);
});

module.exports = { app, server };
