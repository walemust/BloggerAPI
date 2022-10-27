const { Schema, model } = require("mongoose");
const { hash, compare } = require("bcrypt");

const userModel = new Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    user_type: {
      type: String,
      required: true,
      enum: ["admin", "user"],
    },
  },
  { timestamps: true }
);

userModel.pre("save", async function (next) {
  const hashedPassword = await hash(this.password, 10);
  this.password = hashedPassword;
  next();
});

userModel.methods.verifyPassword = async function (password) {
  const comparePassword = compare(password, this.password);
  return comparePassword;
};

const User = model("User", userModel);

module.exports = User;
