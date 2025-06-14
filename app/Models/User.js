const mongoose = require("mongoose");
mongoose.pluralize(null);

var UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
