const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!   shutting down...');
  console.log(err);
  process.exit(1);
});

const mongoose = require('mongoose');
const app = require('./index');
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
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLE REJECTION!   shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
