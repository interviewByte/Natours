const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const Tour = require('../../models/tourModel');
const remoteDBURL = process.env.DATABASE_URL.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
const localDBURL = process.env.DATABASE_LOCAL;
mongoose
  .connect(localDBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const data = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

// IMPOERT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(data);
    console.log('Data Successfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
// DELETE DATA FROM THE DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfuly');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
