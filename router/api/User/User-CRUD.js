const {
  catchAsync,
  successRes,
} = require("../Error&ResSec/controllerResponse");
const UserModel = require("./UserModel");
const ErrorClass = require("../Error&ResSec/ErrorClass");
const bcrypt = require("bcryptjs");
const { jwtTokenGenerator } = require("../jwtSec/jwtMethods");
const Instagram = require("instagram-web-api");
const client = new Instagram({
  username: process.env.INSTAGRAM_USERNAME,
  password: process.env.INSTAGRAM_PASSWORD,
});
const { _UTCtoNormalTime } = require("../Methods/_UTCtoNormalTime");
const { returnUserData } = require("../Methods/Methods");
/**
 * ==================================================================================
 * @ROUTE /api/v1/users/register
 * @DES Sign-up
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.register = catchAsync(async (req, res, next) => {
  const {
    username,
    email,
    password,
    minPricePerHour,
    maxPricePerHour,
  } = req.body;
  if (minPricePerHour > maxPricePerHour) {
    return next(new ErrorClass("Please enter a valid price range", 400));
  }
  let instagram;
  try {
    instagram = await client.getUserByUsername({
      username,
    });
  } catch (error) {
    return next(new ErrorClass("Please enter a valid instagram username", 400));
  }
  const newUser = await UserModel.create({
    username,
    email,
    password,
    createdAt: Date.now(),
    minPricePerHour,
    maxPricePerHour,
  });
  const jwtToken = jwtTokenGenerator(newUser["_id"]);
  res
    .status(201)
    .json(
      successRes(
        "User Registered",
        returnUserData(newUser, instagram),
        jwtToken
      )
    );
}, 400);
/**
 * ==================================================================================
 * @ROUTE /api/v1/users/login
 * @DES Login
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) Check if the email and password exists
  if (!email || !password) {
    return next(
      new ErrorClass("We need both email and password, please try again!", 400)
    );
  }
  //2)Check if user exists
  if (!(await UserModel.findOne({ email }))) {
    return next(new ErrorClass("This user doesn't exists", 404));
  }
  const user = await UserModel.findOne({ email }).select("+password");
  //2.5) Check if email and password are correct
  const matchPassword = await bcrypt.compare(password, user.password); //.compare compare the unhashed password vs hashed password
  //3)send token to client;
  if (matchPassword === false || user === null) {
    return next(
      new ErrorClass("Email or Password wasn't correct, please try again!", 400)
    );
  } else {
    //Get Data
    let instagram;
    try {
      instagram = await client.getUserByUsername({
        username: user.username,
      });
    } catch (error) {
      return next(
        new ErrorClass(
          "Your instagram is not valid, please contact our support team to change your instagram name",
          400
        )
      );
    }
    const jwtToken = jwtTokenGenerator(user["_id"]);
    res
      .status(200)
      .json(
        successRes(
          "Login Successful",
          returnUserData(user, instagram),
          jwtToken
        )
      );
  }
}, 400);
/**
 * ==================================================================================
 * @ROUTE /api/v1/users
 * @DES Delete User & Profile
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { username } = user;
  await user.remove();
  res.status(200).json(successRes(`${username} is deleted`));
}, 400);
/**
 * ==================================================================================
 * @ROUTE /api/v1/user/account
 * @DES GET USER
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.getUser = catchAsync(async (req, res) => {
  const { user } = req;
  const instagram = await client.getUserByUsername({ username: user.username });
  res
    .status(200)
    .json(successRes("User is found", returnUserData(user, instagram)));
}, 400);
/**
 * ==================================================================================
 * @ROUTE /api/v1/users/:userId
 * @DES GET USER
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = await UserModel.findById(userId);
  if (!user) {
    return next(new ErrorClass("The user doesn't exist", 404));
  }
  const instagram = await client.getUserByUsername({ username: user.username });
  res
    .status(200)
    .json(successRes("User is found", returnUserData(user, instagram)));
}, 400);
/**
 * ==================================================================================
 * @ROUTE /api/v1/users
 * @DES Update USER
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.updateUser = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { _id } = user;
  const updateData = {};
  if (!body) {
    return next(new ErrorClass("Fail to update", 400));
  }
  if (body.username) {
    updateData.username = body.username;
  }
  if (body.email) {
    updateData.email = body.email;
  }

  await UserModel.findByIdAndUpdate(_id, updateData, {
    new: true,
    runValidators: true,
  });
  const currentUser = await UserModel.findById(_id);
  const instagram = await client.getUserByUsername({
    username: currentUser.username,
  });
  res
    .status(200)
    .json(
      successRes("User is updated", returnUserData(currentUser, instagram))
    );
}, 400);
/**
 * ==================================================================================
 * @ROUTE /api/v1/users
 * @DES Get USERs
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.getUsers = catchAsync(async (req, res) => {
  const { paginatedResults } = res;
  let results = [];
  /////////////////////////
  for (var i = 0; i < paginatedResults.results.length; i++) {
    const instagram = await client.getUserByUsername({
      username: paginatedResults.results[i].username,
    });
    results.push(returnUserData(paginatedResults.results[i], instagram));
  }

  Promise.all(results)
    .then((results) => {
      paginatedResults.results = results;
      res.status(200).json(paginatedResults);
    })
    .catch((err) => console.log(err)); // First rejected promise
  ///////////////////////
}, 400);
