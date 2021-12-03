const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const alert = require("alert");
const qr = require("qrcode");
const app = express();
const cuid = require("cuid");
var passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  User = require("./models/user");

app.set("view engine", "ejs");
app.use(
  require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    useUnifiedTopology: true,
  })
);

app.use(express.static(__dirname + "/public"));
mongoose.connect(
  "mongodb+srv://admin-yash:Tanishq562000@cluster0.7ouhp.mongodb.net/bankdb?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

const bankSchema = {
  firstname: String,
  lastname: String,
  age: Number,
  email: String,
  accountnumber: String,
  ifsccode: String,
  amount: Number,
};
const transactionschema = {
  from: String,
  to: String,
  amount: Number,
  remarks: String,
};

const Transaction = mongoose.model("Transaction", transactionschema);
const Bank = mongoose.model("Bank", bankSchema);

app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.post("/signup", function (req, res) {
  var username = req.body.uid;
  var password = req.body.pass;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var phonenumber = req.body.phno;
  var email = req.body.email;
  User.register(
    new User({
      username: username,
      password: password,
      first_name: fname,
      last_name: lname,
      phonenumber: phonenumber,
      email: email,
    }),
    password,
    function (err, user) {
      if (err) {
        console.log(err);
        return res.render("signin");
      }
      passport.authenticate("local")(req, res, function () {
        res.render("transactions");
      });
    }
  );
});
//login routes
var usern = "a";
pass = "b";
name = "c";
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/signin");
}

app.get("/signin", function (req, res) {
  res.render("signin");
});
app.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/signup",
  }),
  function (req, res) {
    console.log("Successfully logged in");

    usern = req.user.username;
    res.render("index");
  }
);
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/transactions", isLoggedIn, function (req, res) {
  const usern = req.session.passport.user;
  Transaction.find(
    {
      $or: [{ from: usern }, { to: usern }],
    },
    function (err, foundtrans) {
      res.render("transactions", {
        Transaction: foundtrans,
      });
    }
  );
});
// app.get("/connecttophone", isLoggedIn, function (req, res) {
//   var username = req.params.username;
//   var password = req.params.password;
//   var url = username + "password:" + password;
//   qr.toDataURL(url, (err, src) => {
//     if (err) res.send("Error occured");

//     // Let us return the QR code image as our response and set it to be the source used in the webpage
//     res.render("connecttophone", { src });

//     // res.render("connecttophone");
//   });
// });

app.get("/", function (req, res) {
  res.render("index");
});
app.get("/customers", function (req, res) {
  // Bank.find({}, function(err, foundcust) {
  //   res.render("customers", {
  //     Bank: foundcust
  //   });
  // })
  res.send(a, b, c);
});
app.get("/home", isLoggedIn, function (req, res) {
  res.render("home");
});

//qr code generator
//
//
//
//
//
//
//
//
//
//

app.get("/connecttophone", isLoggedIn, async (req, res) => {
  var user = await User.findOne({ username: req.session.passport.user });
  if (!user.paymentInProgress) return res.send("No Active Payment");
  // If the input is null return "Empty Data" error
  // Let us convert the input stored in the url and return it as a representation of the QR Code image contained in the Data URI(Uniform Resource Identifier)
  // It shall be returned as a png image format
  // In case of an error, it will save the error inside the "err" variable and display it

  qr.toDataURL(user.codeForPayment, (err, src) => {
    if (err) res.send("Error occured");
    // Let us return the QR code image as our response and set it to be the source used in the webpage
    res.render("connecttophone", { src });
  });
});

// app.get("/addnewcustomer", function (req, res) {
//   res.render("addnewcustomer");
// });
// app.post("/addnewcustomer", function (req, res) {
//   const fname = _.toUpper(req.body.fname);
//   const lname = _.toUpper(req.body.lname);
//   const age = req.body.age;
//   const ifsc = _.toUpper(req.body.ifsc);
//   const balance = req.body.balance;
//   const email = req.body.email;
//   const account = req.body.account;

//   const customer = new Bank({
//     firstname: fname,
//     lastname: lname,
//     age: age,
//     email: email,
//     accountnumber: account,
//     ifsccode: ifsc,
//     amount: balance,
//   });
//   Bank.findOne(
//     {
//       accountnumber: account,
//     },
//     function (err, foundcust) {
//       if (!foundcust) {
//         customer.save();
//         res.redirect("/");
//       } else {
//         console.log(err);
//       }
//       //res.redirect("/");
//     }
//   );
// });

// app.get("/transactions", function(req, res) {

//   Transaction.find({}, function(err, foundtrans) {
//     res.render("transactions", {
//       Transaction: foundtrans,

//     });
//   });

// });

app.get("/sendmoney", isLoggedIn, function (req, res) {
  const user = req.session.passport.user;
  User.find({}, function (err, foundcust) {
    res.render("sendmoney", {
      Bank: foundcust.map((cust) => cust.username).filter((cust) => cust !== user),
      currentUser: user,
    });
  });
});

app.post("/sendmoney", isLoggedIn, async function (req, res) {
  const fromacc = req.session.passport.user;
  const toacc = req.body.to;
  const remarksacc = _.toUpper(req.body.remarks);
  const amountacc = req.body.amount;
  const fromUser = await User.findOne({
    username: fromacc,
  });
  if (fromUser.amount < amountacc) {
    return res.send("Insufficient Balance");
  } else if (!req.body.to) return res.send("Select A Recipient");
  fromUser.amountInProgress = amountacc;
  fromUser.usernameInProgress = toacc;
  fromUser.paymentInProgress = true;
  fromUser.codeForPayment = cuid.slug();
  fromUser.remarkInProgress = remarksacc;
  fromUser.save();
  res.redirect("/connecttophone");
});

app.get("/mobile_login", (req, res) => {
  const { username, password } = req.query;
  User.findOne(
    {
      username: username,
    },
    function (err, foundcust) {
      if (foundcust) {
        if (foundcust.password === password) {
          return res.status(200).send();
        } else {
          return res.status(401).send("login failed");
        }
      } else return res.status(401).send("login failed");
    }
  );
});
app.get("/confirm_mobile_payment", async (req, res) => {
  const { username, password, code } = req.query;
  const user = await User.findOne({ username });
  if (user) {
    if (user.password === password && user.codeForPayment === code) {
      user.balance = user.balance - user.amountInProgress;
      user.paymentInProgress = false;
      const reciever = await User.findOne({ username: user.usernameInProgress });
      reciever.balance = reciever.balance + user.amountInProgress;
      const transaction = new Transaction({
        from: username,
        to: user.usernameInProgress,
        amount: user.amountInProgress,
        remarks: user.remarkInProgress,
      });
      await transaction.save();
      user.amountInProgress = 0;
      user.usernameInProgress = "";
      reciever.save();
      user.save();
      return res.status(200).send("payment successful");
    } else {
      console.log("failed");
      return res.status(401).send("payment failed");
    }
  } else return res.status(401).send("Transaction Failed");
});

app.get("/cancel_mobile_payment", async (req, res) => {
  const { username, password } = req.query;
  console.log(username, password);
  const user = await User.findOne({ username });
  if (user) {
    if (user.password === password) {
      user.amountInProgress = 0;
      user.paymentInProgress = false;
      user.usernameInProgress = "";
      await user.save();

      return res.status(200).send("payment cancelled Successfully");
    } else {
      console.log("failed");
      return res.status(401).send("Cannot cancel payment");
    }
  } else return res.status(401).send("Cannot cancel payment");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server is on port 3000");
});
