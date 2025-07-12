const express = require('express');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/instructor', studentRoutes);
app.use('/student-auth', studentAuthRoutes);
app.use('/lessons', lessonRoutes);
const port = process.env.PORT || 3000;

app.listen(port, () =>{
  console.log(`Server is running on port ${port}`);
})

