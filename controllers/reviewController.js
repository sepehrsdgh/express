const Review = require(`./../models/reviewModel`);
const handlerFactory = require('./../controllers/handlerFactory');
const { deleteOne, createOne, updateOne, getOne, getAll } = handlerFactory;

// const catchAsync = require(`./../utils/catchAsync`);

exports.getAllReviews = getAll(Review);

exports.getReview = getOne(Review);

exports.postReview = createOne(Review);

exports.deleteReview = deleteOne(Review);

exports.updateReview = updateOne(Review);

//middleware
exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  //Allow nested routes
  next();
};
//middleware
