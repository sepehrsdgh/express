const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require(`../controllers/authController`);
const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

const { protect, restrictTo } = authController;
const router = express.Router();

const {
  getAllTours,
  postTour,
  getTour,
  patchTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = tourController;

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route(`/tourStats`).get(getTourStats);

router
  .route(`/monthly-plan/:year`)
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route(`/`)
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), postTour);

router
  .route(`/:id`)
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), patchTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
