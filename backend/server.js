const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', taskRoutes);

mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(process.env.PORT, () => console.log('Server running on port', process.env.PORT)))
  .catch(err => console.log(err));