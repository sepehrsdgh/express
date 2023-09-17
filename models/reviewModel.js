const mongosee = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongosee.Schema(
  {
    review: {
      type: String,
      required: [true, 'review can not be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongosee.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour!'],
    },
    user: {
      type: mongosee.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: {
          $sum: 1,
        },

        avgRating: { $avg: `$rating` },
      },
    },
  ]);
  const { avgRating, nRating } = stats[0];
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: avgRating,
    ratingsQuantity: nRating,
  });
};

reviewSchema.pre('save', function (next) {
  this.constructor.calcAverageRatings(this.tour);
  next();
});

const Review = mongosee.model('Review', reviewSchema);

module.exports = Review;

//GET Reviews?tourId=afrfedd&reviewId=frfhhh
