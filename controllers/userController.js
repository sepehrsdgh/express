const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const handlerFactory = require('./../controllers/handlerFactory');
const { deleteOne, updateOne, getOne, getAll } = handlerFactory;

const filterObj = (obj, ...allowedFields) => {
  const copObj = { ...obj };
  for (let key in copObj) {
    if (!allowedFields.includes(key)) {
      delete copObj[key];
    }
  }
  return copObj;
};

exports.getAllUsers = getAll(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    stauts: 'error',
    message: 'this route is not yet defined',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { password, passwordConfirm } = req.body;
  if (password || passwordConfirm) {
    const error = new AppError(
      400,
      'This route is not for password updates.please use /updatePassword'
    );
    return next(error);
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  await User.findByIdAndUpdate(id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = getOne(User);

exports.patchUser = updateOne(User);

exports.deleteUser = deleteOne(User);
