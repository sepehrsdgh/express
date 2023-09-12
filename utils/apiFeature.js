class ApiFeatures {
  constructor(query, urlQuery) {
    this.query = query;
    this.urlQuery = urlQuery;
  }

  urlQueryChange() {
    const queryObj = { ...this.urlQuery }; //correct!

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    const queryStr = JSON.stringify(queryObj);

    const finalStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(finalStr));
    return this;
  }

  sort() {
    if (this.urlQuery.sort) {
      const sortBy = this.urlQuery.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  filed() {
    if (this.urlQuery.fields) {
      const fields = this.urlQuery.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = +this.urlQuery.page || 1;
    const limit = +this.urlQuery.limit || 100;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // if (this.urlQuery.page) {
    //   try {
    //     const numTours = await Tour.countDocuments();
    //     if (skip >= numTours) throw new Error('this page doesnt exist!');
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }
    return this;
  }
}

module.exports = ApiFeatures;
