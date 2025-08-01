const express = require('express');
require('dotenv').config();
const http = require('http');
const path = require('path');
const initializeSocket = require('./socket');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const chatRoutes = require('./routes/chatRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRoutes);
app.use('/instructor', studentRoutes);
app.use('/student-auth', studentAuthRoutes);
app.use('/lessons', lessonRoutes);
app.use('/chat', chatRoutes);
app.use('/assignments', assignmentRoutes);
const port = process.env.PORT || 8080;

const server = http.createServer(app);
const io = initializeSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

