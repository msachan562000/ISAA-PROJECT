const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const alert = require("alert");
const qr = require("qrcode");
const app = express();
var passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose =require("passport-local-mongoose"),
User = require("./models/user");
app.set('view engine', 'ejs');
app.use(require("express-session")({
  secret: "Rusty is a dog",
  resave: false,
  saveUninitialized: false
}));
app.use(bodyParser.urlencoded({
  extended: true,
  useUnifiedTopology: true
}));
app.use(express.static(__dirname + "/public"));

mongoose.connect("mongodb+srv://admin-yash:Tanishq562000@cluster0.7ouhp.mongodb.net/bankdb?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const bankSchema = {
  firstname: String,
  lastname: String,
  age: Number,
  email: String,
  accountnumber: String,
  ifsccode: String,
  amount: Number

};
const transactionschema = {
  from: String,
  to: String,
  amount: Number,
  remarks: String
};

const Transaction = mongoose.model("Transaction", transactionschema)
const Bank = mongoose.model("Bank", bankSchema);

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
})
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/signup", function(req, res) {
  res.render("signup");
});

app.post("/signup", function(req, res) {
  var username = req.body.username
  var password = req.body.password
  User.register(new User({ username: username }),
          password, function (err, user) {
      if (err) {
          console.log(err);
          return res.render("signin");
      }

      passport.authenticate("local")(
          req, res, function () {
          res.render("transactions");
      });
  });});
//login routes

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/signin");
}



app.get("/signin", function(req, res) {
  res.render("signin");
});
app.post("/signin", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/signup"
}), function (req, res) {
});
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/transactions", isLoggedIn, function (req, res) {
  
  Transaction.find({}, function(err, foundtrans) {
    res.render("transactions", {
      Transaction: foundtrans,

    });
  });
});
app.get("/connecttophone",isLoggedIn ,function(req,res){
var username=req.params.username;
var password=req.params.password;
var url=username+"password:"+password;
qr.toDataURL(url, (err, src) => {
  if (err) res.send("Error occured");

  // Let us return the QR code image as our response and set it to be the source used in the webpage
  res.render("connecttophone", { src });

  // res.render("connecttophone");
});
});

app.get("/", function(req, res) {
  res.render("index");
});
app.get("/customers", function(req, res) {
  Bank.find({}, function(err, foundcust) {
    res.render("customers", {
      Bank: foundcust
    });
  })
});
app.get("/home",isLoggedIn,function(req, res) {
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

app.post("/connecttophone", (req, res) => {
  const url = req.body.url;

  // If the input is null return "Empty Data" error
  if (url.length === 0) res.send("Empty Data!");
  
  // Let us convert the input stored in the url and return it as a representation of the QR Code image contained in the Data URI(Uniform Resource Identifier)
  // It shall be returned as a png image format
  // In case of an error, it will save the error inside the "err" variable and display it
  
  qr.toDataURL(url, (err, src) => {
      if (err) res.send("Error occured");
    
      // Let us return the QR code image as our response and set it to be the source used in the webpage
      res.render("connecttophone", { src });
  });
});


app.get("/addnewcustomer", function(req, res) {
  res.render("addnewcustomer");
});
app.post("/addnewcustomer", function(req, res) {

  const fname = _.toUpper(req.body.fname);
  const lname = _.toUpper(req.body.lname);
  const age = req.body.age;
  const ifsc = _.toUpper(req.body.ifsc);
  const balance = (req.body.balance);
  const email = (req.body.email);
  const account = (req.body.account);

  const customer = new Bank({
    firstname: fname,
    lastname: lname,
    age: age,
    email: email,
    accountnumber: account,
    ifsccode: ifsc,
    amount: balance
  });
  Bank.findOne({
    accountnumber: account
  }, function(err, foundcust) {
    if (!foundcust) {

      customer.save()
      res.redirect("/");



    } else {
      console.log(err);
    }
    //res.redirect("/");
  })
});

// app.get("/transactions", function(req, res) {

//   Transaction.find({}, function(err, foundtrans) {
//     res.render("transactions", {
//       Transaction: foundtrans,

//     });
//   });

// });




app.get("/sendmoney", function(req, res) {
  Bank.find({}, function(err, foundcust) {
    res.render("sendmoney", {
      Bank: foundcust
    });
  })
});

app.post("/sendmoney", function(req, res) {


  const fromacc = (req.body.from);
  const toacc = (req.body.to);

  const remarksacc = _.toUpper(req.body.remarks);
  const amountacc = (req.body.amount);
  // console.log(fromacc);
  const transaction = new Transaction({
    from: fromacc,
    to: toacc,
    amount: amountacc,
    remarks: remarksacc
  });


  Bank.findOne({
    accountnumber: fromacc
  }).then((foundcustomer) => {
    const x = foundcustomer.amount;

    if (fromacc === toacc) {
      alert("From and To accounts cannot be same");
      res.redirect("/sendmoney");
    } else if (amountacc > x || x <= 0) {
      alert("Available Balance in your account is less than the amount being tranferred.Kindy fill your account with sufficient funds.");
      res.redirect("/");
    } else {

      transaction.save();
    }
    foundcustomer.amount = x - amountacc;
    foundcustomer.save();
  }).catch((e) => {
    res.redirect("/");
  });
  Bank.findOne({
    accountnumber: toacc
  }).then((foundcustomerto) => {
    const y = foundcustomerto.amount;


    foundcustomerto.amount = parseInt(y) + parseInt(amountacc)
    foundcustomerto.save();

  }).catch((e) => {
    res.redirect("/");
  });





  res.redirect("/transactions");

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port || 3000, function() {
  console.log("server is on port 3000");
});

