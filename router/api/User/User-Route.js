const express = require("express");
const router = express.Router();
const {
  register,
  login,
  deleteUser,
  getUser,
  updateUser,
  getUserById,
  getUsers,
} = require("./User-CRUD");
const {
  protectRoute,
  fitlerUser,
  paginatedResults,
} = require("../Middlewares/middlewares");

const UserModel = require("./UserModel");
router.route("/register").post(register);
router.route("/login").post(login);
router.use(protectRoute);
router.route("/:userId").get(getUserById);
router.route("/").get(paginatedResults(UserModel), getUsers);
router.use(fitlerUser);
router.route("/").delete(deleteUser);
router.route("/account").get(getUser);
router.route("/").put(updateUser);
module.exports = router;
