const { catchAsync } = require("../Error&ResSec/controllerResponse");
const ErrorClass = require("../Error&ResSec/ErrorClass");
const UserModel = require("../User/UserModel");
const jwt = require("jsonwebtoken");
exports.protectRoute = catchAsync(async (req, res, next) => {
  let token = req.headers.authorization.replace("Bearer ", "");
  //2)validate the token
  if (!token) {
    return next(new ErrorClass("You must log in first", 401));
  }
  //3)Check if the user exists or not
  const data = jwt.verify(token, process.env.JWT_SECRET_PASS);
  if (!data) {
    return next(new ErrorClass("Wrong web token"), 401);
  }
  //4)continue
  req.user = data;
  next();
}, 404);

exports.fitlerUser = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) {
    return next(new ErrorClass("User doesn't exists", 404));
  }
  req.user = currentUser;
  next();
}, 404);

exports.paginatedResults = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page ? req.query.page : "1");
    const limit = parseInt(req.query.limit ? req.query.limit : "5");
    const { search, minPrice, maxPrice } = req.query;
    const searchParams = {};
    if (search) {
      searchParams.username = { $regex: search, $options: "i" };
    }
    if (minPrice) {
      searchParams.minPricePerHour = { $gte: parseInt(minPrice) };
    }
    if (maxPrice) {
      searchParams.maxPricePerHour = { $lte: parseInt(maxPrice) };
    }
    ``;
    const results = {};
    const startIndex = (page - 1) * limit;
    const totalItems = await model.countDocuments().exec();
    try {
      results.results = await model
        .find(searchParams)
        .limit(limit)
        .skip(startIndex)
        .exec();
      results.currentPage = page;
      results.totalItems = totalItems;
      results.totalPages = Math.floor(totalItems / limit) + 1;
      results.totalItemsPerPage = limit;
      res.paginatedResults = results;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
};
