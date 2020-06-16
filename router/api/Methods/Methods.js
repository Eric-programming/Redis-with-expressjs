const ErrorClass = require("../Error&ResSec/ErrorClass");
const { _UTCtoNormalTime } = require("./_UTCtoNormalTime");
exports.filterUpdateOrDelete = (newArray, oldArray, next, method) => {
  if (newArray.length === oldArray.length) {
    return next(
      new ErrorClass(`The ${method} that you are looking for is not found`, 404)
    );
  }
};

exports.returnUserData = (user, instagram) => {
  return {
    username: user.username,
    createdAt: _UTCtoNormalTime(user.createdAt),
    _id: user["_id"],
    email: user.email,
    minPricePerHour: user.minPricePerHour,
    maxPricePerHour: user.maxPricePerHour,
    followers: instagram.edge_followed_by.count,
    followings: instagram.edge_follow.count,
    image: instagram.profile_pic_url_hd,
    posts: instagram.edge_owner_to_timeline_media.count,
    verified: instagram.is_verified,
  };
};
