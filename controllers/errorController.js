const AppError = require('../utils/apiError');
// Handling invalid mongodb Id error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.paht}: ${err.value}.`;
  return new AppError(message, 400);
};
// Handling duplicate fields name error
const handleDuplicateFieldsDB = (err) => {
  // const value = err.errorResponse.errmsg.match(/(["'])((?:\\\1|.)*?)\1/)[0];
  // console.log('value:', value);
  // const startIndex = err.message.indexOf('{');
  // const endIndex = err.message.lastIndexOf('}') + 1;
  // const objectString = err.message.substring(startIndex, endIndex);
  const message = `Duplicate field value: ${err.keyValue.name}. please use another value.`;
  return new AppError(message, 400);
};
// Handle mongoose validation error
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Incalid token. please login again!', 401);

const handleJWTexpiredError = () =>
  new AppError('Your token has expired. Please login again!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Operational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR!', err);
    // 2) Send generic message
    res.status(500).json({
      status: 'Error',
      message: 'Somehting went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTexpiredError();
    sendErrorProd(error, res);
  }
};
