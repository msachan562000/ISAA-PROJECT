var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  firstname: String,
  lastname: String,
  phonenumber: String,
  paymentInProgress: {
    type: Boolean,
    default: false,
  },
  amountInProgress: Number,
  usernameInProgress: String,
  codeForPayment: String,
  balance: Number,
});
UserSchema.plugin(passportlocalmongoose);
module.exports = mongoose.model("User", UserSchema);
