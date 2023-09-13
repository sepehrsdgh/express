const express = require('express');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const globalErrorHandler = require(`./controllers/ErrorController`);

const AppError = require('./utils/appError');

const app = express();

app.use(helmet());

const corsOptions = {
  origin: 'https://web.postman.co', // Your Next.js frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true, // Enable cookies, if applicable
};

app.use(cors(corsOptions));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this dD IP,please try again in an hour!',
});

app.use('/api', limiter);

//middlewares
app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(hpp({ whitelist: ['duration'] }));

app.use(express.static(`${__dirname}/public`));

const ourFirstMiddleWare = (req, res, next) => {
  req.requestedTime = new Date().toISOString();
  console.log(req.headers);
  next();
};

//middlewares

// app.use(ourFirstMiddleWare);

//

// app.get(`/api/v1/tours`, getAllTours);

// app.get(`/api/v1/tours/:id`, getTour);

// app.post(`/api/v1/tours`, postTour);

// app.patch(`/api/v1/tours/:id`, patchTour);

app.use(ourFirstMiddleWare);

app.use('/api/v1/tours', tourRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/reviews`, reviewRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(`can't find ${req.originalUrl}`, 404);
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
