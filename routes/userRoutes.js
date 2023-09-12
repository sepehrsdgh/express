const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const {
  getAllUsers,
  createUser,
  getUser,
  patchUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = userController;

const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = authController;

router.post('/signup', signUp);

router.post('/login', login);

router.post('/forgotPassword', forgotPassword);

router.patch('/resetPassword/:token', resetPassword);

router.patch('/updatePassword', protect, updatePassword);

router.use(protect);

router.get('/me', getMe, getUser);

router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.route(`/`).get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(patchUser).delete(deleteUser);

module.exports = router;
