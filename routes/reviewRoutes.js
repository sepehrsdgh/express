const authController = require(`../controllers/authController`);
const reviewController = require('../controllers/reviewController');
const express = require('express');
const { protect, restrictTo } = authController;
const {
  getAllReviews,
  postReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = reviewController;

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route(`/`)
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, postReview);

router
  .route(`/:id`)
  //get all reviews is wrong and must be changed!and need is put review
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview);

module.exports = router;
