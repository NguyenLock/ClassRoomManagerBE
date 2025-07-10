const express = require('express');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () =>{
  console.log(`Server is running on port ${port}`);
})

