const bcrypt = require('bcrypt');
const dataurl = require('dataurl');
const User = require('../models/userModel');
const { createandSendToken } = require('../utils/createandSendToken');
const { uploadToCloudinary } = require('../services/cloudinary');
const { catchAsync } = require('../utils/catchAsync');
const sendVerifyEmail = require('../services/sendVerifyEmail');
const AppError = require('../utils/AppError');

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { user } = req;

    const hashedPassword = await bcrypt.hash(req.body.newPassword, Number(process.env.BCRYPT_SALT));

    user.password = hashedPassword;

    await user.save();

    createandSendToken(user, user._id, process.env.JWT_EXPIRES_IN, 200, res);
});

exports.updateUserData = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (req.file) {
        const dataUrlString = dataurl.format({
            data: req.file.buffer,
            mimetype: req.file.mimetype,
        });
        const result = await uploadToCloudinary(dataUrlString, 'Portfolio');
        console.log(result);
        user.image.url = result.secure_url;
        user.image.public_id = result.public_id;
        await user.save();
    }
    // IF EMAIL CHANGED. SEND VERIFICATION EMAIL
    if (req.body.email) {
        sendVerifyEmail(user);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { ...req.body }, { runValidators: true, new: true });

    res.status(200).json({ status: 'success', message: 'data updated successfully', data: { updatedUser } });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { isDeleted: true });

    res.status(200).json({ status: 'success', message: 'User deleted successfully!' });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    if (!users) {
        return next(new AppError(404, 'no user Found!'));
    }

    res.status(200).json({
        status: 'success',
        data: { users },
    });
});

exports.deleteUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        return next(new AppError(404, 'no user Found!'));
    }

    res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
    });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+isDeleted');

    if (!user) return next(new AppError(404, 'no user Found!'));

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
