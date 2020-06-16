const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: [validator.isEmail, "Please add a valid Email"],
    required: [true, "Please enter a email"],
    lowercase: true,
    unique: [true, "This email address is already in use."],
  },
  username: {
    type: String,
    required: [true, "Please enter a username"],
    unique: [true, "This username already in use."],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: 6,
    select: false,
  },
  createdAt: {
    type: Date,
  },
  minPricePerHour: {
    type: Number,
    required: [true, "Please enter a min price that you are willing to charge"],
  },
  maxPricePerHour: {
    type: Number,
    required: [true, "Please enter a max price that you are willing to charge"],
  },
});

//Encrypt the Password using Bcrypt
UserSchema.pre("save", async function (next) {
  //1) Check if the password has modified
  if (this.isModified("password")) {
    //2) HASH the password
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

UserSchema.pre("remove", async function (next) {
  // await this.model("Profile").deleteOne({ user: this["_id"] });
  // await this.model("Post").deleteMany({ author: this["_id"] });
  next();
});
module.exports = mongoose.model("User", UserSchema);
