const AppError = require('../utils/appError');

const handelCastErrorDb = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(400, message);
};

const handelDuplicateFieldDb = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value:${value} please use another value!`;
  return new AppError(400, message);
};

const handelJwtError = (err) => {
  return new AppError(401, 'Invalid token.Please log in again!');
};

const handelExpireJwtError = (err) => {
  return new AppError(401, 'Yout Token Has Expired!Please log in again!');
};

const handelValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data.${errors.join('. ')}`;
  return new AppError(400, message);
};

const errorSendDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const errorSendProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('error', err);
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.node_env === 'development') {
    errorSendDev(err, res);
  } else if (process.env.node_env === 'production') {
    if (err.name == 'CastError') {
      const errCreated = handelCastErrorDb(err);
      errorSendProd(errCreated, res);
    }
    if (err.code == 11000) {
      const errCreated = handelDuplicateFieldDb(err);
      errorSendProd(errCreated, res);
    }
    if (err.name == 'validationError') {
      const errCreated = handelValidationErrorDb(err);
      errorSendProd(errCreated, res);
    }
    if (err.name == 'JsonWebTokenError') {
      const errCreated = handelJwtError(err);
      errorSendProd(errCreated, res);
    }
    if (err.name == 'TokenExpiredError') {
      const errCreated = handelExpireJwtError(err);
      errorSendProd(errCreated, res);
    }
  }
};
