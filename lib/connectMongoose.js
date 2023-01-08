'use strict';
/* global process */

const mongoose = require('mongoose');

mongoose.connection.on('error', err => {
  console.log('Error connecting to mongoDB:', err);

  process.exit(1);
});

mongoose.connection.once('open', () => {
  console.log(`Connected to mongoDB on ${mongoose.connection.name}. Mongoose version: ${mongoose.version}`);
});

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/nodepop');
  } catch (error) {
    console.log('Connection error: ', error.reason);
    process.exit(1);
  }
};

connectDB();

module.exports = mongoose.connection;