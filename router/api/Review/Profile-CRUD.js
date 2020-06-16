const profileModel = require("./ProfileModel");
const ErrorClass = require("../Error&ResSec/ErrorClass");
const {
  catchAsync,
  successRes
} = require("../Error&ResSec/controllerResponse");
const { filterUpdateOrDelete } = require("../Methods/Methods");
//Imports==================
/**
 * ==================================================================================
 * @ROUTE /api/v1/profile/
 * @DES Get all User profiles
 * @Access Public
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.getUserProfiles = catchAsync(async (req, res) => {
  const profile = await profileModel.find().populate({
    path: "user",
    select: "name avatar"
  });
  res.status(200).json(successRes("All Profiles is found", profile));
}, 404);

/**
 * ==================================================================================
 * @ROUTE /api/v1/profile/:profileId
 * @DES Get single User profile
 * @Access Public
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.getProfile = catchAsync(async (req, res, next) => {
  const { profile } = req;
  res.status(200).json(successRes("User Profile is found", profile));
}, 404);

/**
 * ==================================================================================
 * @ROUTE /api/v1/profile/me
 * @DES POST Create User profile
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.createUserProfile = catchAsync(async (req, res, next) => {
  const { company, website, location, specialization, bio, social } = req.body;
  const { userId } = req.user;
  //Check to make sure there is no profile before creating one
  const checkNoProfile = await profileModel.findOne({ user: userId });
  if (checkNoProfile) {
    return next(new ErrorClass("Profile is already created", 403));
  }
  const newCreatedUserProfile = await profileModel.create({
    user: userId,
    company,
    website,
    location,
    specialization,
    bio,
    social
  });
  const fullProfile = await profileModel
    .findById(newCreatedUserProfile["_id"])
    .populate({
      path: "user",
      select: "name avatar"
    });
  res.status(201).json(successRes("Profile is created", fullProfile));
}, 404);

/**
 * ==================================================================================
 * @ROUTE /api/v1/profile/me
 * @DES PUT Update User profile
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { profile, body } = req;
  await profileModel.findByIdAndUpdate(profile["_id"], body, {
    new: true,
    runValidators: true
  });
  const updatedProfile = await profileModel.findById(profile["_id"]);
  res.status(200).json(successRes("Profile is updated", updatedProfile));
}, 404);
/**
 * ==================================================================================
 * @ROUTE /api/v1/profile/me/addExp
 * @DES PUT Update Profile Experience
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.addExperience = catchAsync(async (req, res, next) => {
  const { profile } = req;
  const { title, company, location, from, to, current, description } = req.body;
  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  };
  profile.experience.unshift(newExp);
  const newExperienceData = await profile.save();
  res
    .status(201)
    .json(successRes("Profile experience is added", newExperienceData));
}, 404);
/**
 * ==================================================================================
 * @ROUTE /api/v1/profile/me/updateExp/:expId
 * @DES PUT Update Profile Experience
 * @Access Private
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.updateExperience = catchAsync(async (req, res, next) => {
  const { profile, body, params } = req;
  const { expId } = params;
  const { current, title, company, location, from, description, to } = body;
  const experience = JSON.parse(JSON.stringify(profile.experience));
  let newArray = [];
  experience.forEach(e => {
    if (e["_id"].toString() === expId.toString()) {
      newArray.push({
        ...e,
        title,
        company,
        location,
        from,
        description,
        current,
        to: current ? undefined : to
      });
    } else {
      newArray.push(e);
    }
  });

  await profileModel.findByIdAndUpdate(
    profile["_id"],
    {
      experience: newArray
    },
    {
      new: true,
      runValidators: true
    }
  );
  const currentProfile = await profileModel.findById(profile["_id"]).populate({
    path: "user",
    select: "name avatar"
  });
  res.status(200).json(successRes("Experience is updated", currentProfile));
}, 404);
/**
 * ==================================================================================
 * @ROUTE /api/v1/profile/me/deleteExp/:expId
 * @DES PUT Update Profile Experience
 * @Access Private (need to be login to update profiles)
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.deleteExperience = catchAsync(async (req, res, next) => {
  const { profile, params } = req;
  const { expId } = params;
  const arrayOfExperienceHistory = profile.experience;
  const newExp = arrayOfExperienceHistory.filter(
    currentExp => currentExp["_id"].toString() !== expId.toString()
  );
  filterUpdateOrDelete(newExp, arrayOfExperienceHistory, next, "experience");
  await profileModel.findByIdAndUpdate(profile["_id"], {
    experience: newExp
  });
  res.status(200).json(await successRes("Experience is deleted"));
}, 404);
/**
 * ==================================================================================
 * @ROUTE /api/v1/profile/me/add_education
 * @DES POST ADD Profile Education
 * @Access Private (need to be login to update profiles)
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.addEducation = catchAsync(async (req, res, next) => {
  const { profile } = req;
  const {
    school,
    credential,
    field_of_study,
    from,
    to,
    current,
    description
  } = req.body;
  const newEd = {
    school,
    credential,
    field_of_study,
    from,
    to,
    current,
    description
  };
  profile.education.unshift(newEd);
  const newExperienceData = await profile.save();
  res
    .status(201)
    .json(successRes("Profile education is added", newExperienceData));
}, 404);

/**
 * ==================================================================================
 * @ROUTE /api/v1/profile/me/update_Education/:education_id
 * @DES POST Delete Profile Education
 * @Access Private (need to be login to update profiles)
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.updateEducation = catchAsync(async (req, res, next) => {
  const { params, profile, body } = req;
  const {
    current,
    school,
    credential,
    field_of_study,
    from,
    description,
    to
  } = body;
  const { education_id } = params;
  let arrayOfEducationHistory = JSON.parse(JSON.stringify(profile.education));
  const newEd = arrayOfEducationHistory.map(currentEd => {
    if (currentEd["_id"].toString() === education_id.toString()) {
      return {
        ...currentEd,
        current,
        school,
        credential,
        field_of_study,
        from,
        description,
        to: current ? undefined : to
      };
    }
  });
  await profileModel.findByIdAndUpdate(
    profile["_id"],
    {
      education: newEd
    },
    {
      new: true,
      runValidators: true
    }
  );
  const currentProfile = await profileModel.findById(profile["_id"]).populate({
    path: "user",
    select: "name avatar"
  });
  res.status(200).json(successRes("Education is updated", currentProfile));
}, 404);
/**
 * ==================================================================================
 * @ROUTE /api/v1/profile/me/delete_Education/:education_id
 * @DES POST Delete Profile Education
 * @Access Private (need to be login to update profiles)
 * @Test No
 * @Check No
 * @Error n/a
 * ==================================================================================
 */
exports.deleteEducation = catchAsync(async (req, res, next) => {
  const { params, profile } = req;
  const { education_id } = params;
  const arrayOfEducationHistory = profile.education;
  const newEd = arrayOfEducationHistory.filter(
    currentEd => currentEd["_id"].toString() !== education_id.toString()
  );
  filterUpdateOrDelete(newEd, arrayOfEducationHistory, next, "education");
  await profileModel.findByIdAndUpdate(profile["_id"], {
    education: newEd
  });
  res.status(200).json(successRes("Education is deleted"));
}, 404);
