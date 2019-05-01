const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');

const { DB_URI } = require('./config');

require('dotenv').config();

const app = express();

// Connect to mongoDB with mongoose. Handle depreciation warnings.
mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true
});

// Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/users', require('./routes/users'));

// Start the server
app.listen(process.env.PORT);
console.log(`Server listening at ${process.env.PORT}`);