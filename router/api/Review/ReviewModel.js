const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema({
  reviewee: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Please enter the reviewee"],
  },
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Please enter the reviewer"],
  },
  rating: {
    required: [true, "Please enter a rating score out of 5"],
    type: Number,
    default: 0,
    max: [5, "Maximum Rating is 5"],
    min: [0, "Minimum Rating is 0"],
  },
  description: {
    type: String,
    max: 60,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reviews", ReviewSchema);
