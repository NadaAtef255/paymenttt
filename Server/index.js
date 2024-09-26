const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { rateLimit } = require('express-rate-limit');
const contactRouter = require('./src/routes/contactUsRouter.js');
const app = express();
const categoryRouter = require('./src/routes/category.routes');
const bookRouter = require('./src/routes/bookRoutes.js');
const cartRouter = require('./src/routes/cart.routes.js');
const reviewRouter = require('./src/routes/reviewRoutes.js');
const couponRouter = require('./src/routes/copoun.routes.js');
const wishlistRouter = require('./src/routes/wishlist.routes.js');
const authRouter = require('./src/routes/authRoutes.js');
const stripeRouter = require('./src/routes/stripeRoutes.js');
const userRouter = require('./src/routes/userRoutes.js');
const cartcpyRouter = require('./src/routes/cartcpyRoutes.js');
const purchasedRouter = require('./src/routes/purchasedRoutes.js');
const subscribtionRouter = require('./src/routes/subscribtionRoutes.js');
const AppError = require('./src/utils/AppError.js');
const { globaleErrorHandler } = require('./src/controllers/errorController.js');

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    limit: 100, // Limit each IP to 100 requests per `window` .
    message: 'Too many requests! try again in one hour',
});

// MIDDLEWARES

// to allow requests from different origin browsers
app.use(cors());

// 1-)FOR SECURE HTTP HEADERS
app.use(helmet());

// 2-)PREVENT TOO MANY REQUESTS FROM THE SAME IP
app.use(limiter);

// 3-)BODY PARSER
app.use(express.json());

// 4-)DATA SANITAZTION AGAINST NoSql injection
app.use(mongoSanitize());

// 5-)PREVENT AGAINST HTTP PARAMTER POLLUTION
app.use(hpp());

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/book', bookRouter);
app.use('/category', categoryRouter);
app.use('/cart', cartRouter);
app.use('/cartcpy', cartcpyRouter);
app.use('/copoun', couponRouter);
app.use('/wishlist', wishlistRouter);
app.use('/stripe', stripeRouter);
app.use('/contact', contactRouter);
app.use('/purchased', purchasedRouter);
app.use('/subscribtion', subscribtionRouter);
app.use('/:id/review', reviewRouter);

app.all('*', (req, res, next) => {
    next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globaleErrorHandler);

module.exports = app;
