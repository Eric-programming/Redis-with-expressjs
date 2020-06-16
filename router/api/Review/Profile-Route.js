const express = require("express");
const router = express.Router();
const { protectRoute, filterProfile } = require("../Middlewares/middlewares");
const {
  getUserProfiles,
  createUserProfile,
  updateProfile,
  getProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  updateEducation,
  updateExperience
} = require("./Profile-CRUD");

router.route("/").get(getUserProfiles); //Get all User Profiles
router.route("/me").post(protectRoute, createUserProfile); // Create Profile

router.route("/viaProfile/:profileId").get(filterProfile, getProfile); //Get One profile by profile id
router.route("/user/:userId").get(filterProfile, getProfile); // Get Profile user id

router.use(protectRoute);
router.use(filterProfile);
router.route("/me/my-profile").get(getProfile);
router.route("/me").put(updateProfile);
router.route("/me/addExp").post(addExperience);
router.route("/me/deleteExp/:expId").delete(deleteExperience);
router.route("/me/update_Education/:education_id").put(updateEducation);
router.route("/me/add_education").post(addEducation);
router.route("/me/delete_Education/:education_id").delete(deleteEducation);
router.route("/me/updateExp/:expId").put(updateExperience);

module.exports = router;
