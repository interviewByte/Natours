const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/apiError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

// 1 ) GLOBAL MIDDLEWARES

// Set security http header
app.use(helmet());

// Developmemnt logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  // limit: 3, // Limit each IP to 100 requests per window (here, per 15 minutes).
  // standardHeaders: 'draft-8', // draft-6: RateLimit-* headers; draft-7 & draft-8: combined RateLimit header
  // legacyHeaders: false, // Disable the X-RateLimit-* headers.
  // store: ... , // Redis, Memcached, etc. See below.
  message: 'To many request from this IP, please try again in an hour',
});
app.use('/api', limiter);
// Body-parser reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
// Data senetization agaist NoSQL query injection
app.use(mongoSanitize());
// Data senetization agaist XSS
app.use(xss());
// Data senetization agaist the XSS
// Serving static file
app.use(express.static(`${__dirname}/public`));
// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});
// 3) BASE ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
