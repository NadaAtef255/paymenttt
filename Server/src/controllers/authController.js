const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendeEmail = require('../services/sendEmail');
const createToken = require('../utils/createToken');
const resetTemplate = require('../utils/resetTemplate');
const sendVerifyEmail = require('../services/sendVerifyEmail');
const { catchAsync } = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
    //1-) CHECK IF USER REGISTERED BEFORE
    const { password } = req.body;

    const foundedUser = await User.findOne({ email: req.body.email });

    if (foundedUser)
        return res.status(400).json({
            status: 'fail',
            message: 'User already registered',
        });

    //2-) HASHING PASSWORD, THEN SAVE IT IN DB
    const salt = Number(process.env.BCRYPT_SALT);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ ...req.body, password: hashedPassword });

    sendVerifyEmail(newUser);

    res.status(201).json({
        status: 'success',
        message: 'verification link has been sent to your email',
    });
});

exports.verify = catchAsync(async (req, res, next) => {
    const { token } = req.params;

    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const foundedUser = await User.findById(id);

    if (!foundedUser) return res.status(404).json({ status: 'fail', message: 'User not found!, verification failed' });

    foundedUser.isVerfied = true;

    await foundedUser.save();

    res.status(200).send('<h1> Email has been verified successfully! 😍</h1> <h3>Please open login page </h3>');
});

exports.login = catchAsync(async (req, res) => {
    // 1-) check if user has been registered
    const { email, password } = req.body;

    const registeredUser = await User.findOne({ email }).select('+password');

    if (!registeredUser)
        return res.status(404).json({
            status: 'fail',
            message: 'User with given email not exist! Please signup first',
        });

    // 2-) check if user has verified email
    if (!registeredUser.isVerfied)
        return res.status(401).json({ status: 'fail', message: 'You should verify your account before logging!' });

    // 3-) check if user account is deactivated
    if (registeredUser.isDeleted)
        return res.status(404).json({ status: 'fail', message: 'Your account is Deleted!,please contact admin' });

    // 4-) check if provided password is correct
    const passwordMatch = bcrypt.compareSync(password, registeredUser.password);

    if (!passwordMatch)
        return res.status(401).json({
            status: 'fail',
            message: 'You entered wrong password!',
        });

    // 5-) send token to user if logged successfully and set status online
    const token = createToken(registeredUser._id, process.env.JWT_EXPIRES_IN);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
    };
    registeredUser.status = 'online';
    await registeredUser.save();

    // FOR PRODUCTION
    res.cookie('token', token, cookieOptions);
    return res.status(200).json({
        status: 'success',
        token,
        registeredUser,
        message: 'Logged in successfully!',
    });
});

exports.getDashboard = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const registeredUser = await User.findOne({ email }).select('+password');

    if (!registeredUser)
        return res.status(404).json({
            status: 'fail',
            message: 'User with given email not exist',
        });

    // 2-) check if user has verified email
    if (!registeredUser.isVerfied)
        return res.status(401).json({ status: 'fail', message: 'You should verify your account before logging!' });

    // 3-) check if user account is deactivated
    if (registeredUser.isDeleted) return res.status(404).json({ status: 'fail', message: 'Your account is Deleted!' });

    // 4-) check if provided password is correct
    const passwordMatch = bcrypt.compareSync(password, registeredUser.password);
    if (!passwordMatch)
        return res.status(401).json({
            status: 'fail',
            message: 'You entered wrong password!',
        });

    if (registeredUser.role !== 'admin') return res.status(403).json({ message: 'You are not authorized!' });

    const token = createToken(registeredUser._id, process.env.JWT_EXPIRES_IN);

    return res.status(200).json({
        status: 'success',
        token,
        message: 'Logged in successfully!',
    });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
    // 1- GET USER BY POSTED EMAIL
    const oldUser = await User.findOne({ email: req.body.email });

    if (!oldUser) {
        return res.status(404).json({
            status: 'fail',
            message: 'User with given email not exist',
        });
    }

    // 2-GENERATE RESET RANDOM STRING
    const resetLink = oldUser.creatResetRandomString();
    await oldUser.save();

    // 3-SEND RESET STRING THROUGH EMAIL
    const { email, userName } = oldUser;
    const resetURL = `http://localhost:3000/reset-password/${resetLink}`;

    sendeEmail(resetTemplate, email, resetURL, userName);

    res.status(201).json({
        status: 'success',
        message: 'Check your email to reset your password!',
        data: {
            oldUser,
        },
    });
});

exports.resetPassword = catchAsync(async (req, res) => {
    const { newPassword } = req.body;

    const { user } = req;

    if (!newPassword) return res.staus(400).json({ status: 'fail', message: 'Please provide a new password' });

    const hashedPassword = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT));

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ status: 'success', message: 'New Password added successfully!' });
});

exports.getDeactivated = catchAsync(async (req, res, next) => {
    const deactivatedAccounts = await User.find({ isDeleted: true });

    res.status(200).json({ status: 'success', deactivatedAccounts });
});

exports.postDeactivated = catchAsync(async (req, res, next) => {
    const { userId } = req.body;

    const foundedUser = await User.findById(userId);

    foundedUser.isDeleted = false;

    await foundedUser.save();

    res.status(200).json({ status: 'success', message: 'Done!' });
});
