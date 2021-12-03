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
  amountInProgress: { type: Number, default: 0 },
  usernameInProgress: { type: String, default: "" },
  codeForPayment: {
    type: String,
    default: "",
  },
  remarkInProgress: {
    type: String,
    default: "ISAA-PROJECT",
  },
  // paymentProgrssTimeout
  balance: {
    type: Number,
    default: 0,
  },
});
UserSchema.plugin(passportlocalmongoose);
module.exports = mongoose.model("User", UserSchema);
