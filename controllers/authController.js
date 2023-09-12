const User = require('../models/userModel');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const cookieSent = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({ name, email, password, passwordConfirm });
  newUser.password = undefined;
  const { _id: id } = newUser;
  const token = signToken(id);
  cookieSent(res, token);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new AppError(400, 'please provide email and password!');
    next(err);
    return;
  }

  const user = await User.findOne({ email }).select('+password');
  const passwordIsCorrect =
    user && (await user.correctPassword(password, user.password));

  if (!user || !passwordIsCorrect) {
    const err = new AppError(401, 'incorrect email or password');
    next(err);
    return;
  }

  const token = signToken(user._id);
  cookieSent(res, token);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(` `)[1];
  }
  if (!token) {
    const error = new AppError(
      '401',
      'You are not logged in!Please log in to get access'
    );
    return next(error);
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const { id, iat } = decoded;
  const currentUser = await User.findById(id);
  if (!currentUser) {
    const error = new AppError(
      401,
      'the user belonging to this token does no longer exist.'
    );
    next(error);
    return;
  }
  if (currentUser.changedPasswordAfter(iat)) {
    const error = new AppError(
      401,
      'User recently changed password!Please log in again!'
    );
    next(error);
    return;
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new AppError(
        403,
        'you do not have permission to perform this action'
      );
      next(error);
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    const error = new AppError(404, 'There is no user with email address');
    next(error);
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password?Submit a Patch request with your new password amd password confirm to:${resetURL}.\nIf
  you didn't forget your password,please ignore this email!`;
  try {
    await sendEmail({
      email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    const error = new AppError(
      500,
      'There was an error sending the email.try again later!'
    );
    return next(error);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token: urlToken } = req.params;
  const { password, passwordConfirm } = req.body;
  const hashedToken = crypto
    .createHash('sha256')
    .update(urlToken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    const error = new AppError(400, 'Token is invalid or has expired');
    next(error);
    return;
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const token = signToken(user._id);
  cookieSent(res, token);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { _id: id } = user;
  const { password, newPassword, newPasswordConfirm } = req.body;
  const { password: userPassword } = await User.findById(id).select(
    '+password'
  );
  if (!(await user.correctPassword(password, userPassword))) {
    const error = new AppError(401, 'Current password is not correct!');
    return next(error);
  }
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  const token = signToken(id);
  cookieSent(res, token);
  res.status(201).json({
    status: 'success',
    token,
  });
});
