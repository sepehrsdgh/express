const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeature');

const deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndRemove(id);
    if (!doc) {
      return next(new AppError(404, 'no document found with that ID'));
    }
    res.status(204).json({
      status: 'success',
    });
  });
};

const updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const newData = req.body;
    const doc = await Model.findByIdAndUpdate(id, newData, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError(404, 'no document found with that ID'));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

const createOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

//popOpt=popOptions

const getOne = (model, popOpt) => {
  return catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const query = model.findById(id);
    if (popOpt) {
      query.populate(popOpt);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError(404, 'no document found with that ID'));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

const getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    //for tour nested routes
    const filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;
    //for tour nested routes

    const { query } = new ApiFeatures(model.find(), req.query)
      .urlQueryChange()
      .sort()
      .filed()
      .pagination();
    // const docs = await query.explain();
    const docs = await query;
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
};

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };
