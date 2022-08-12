require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose")

const passport = require("passport");
const LocalStrategy = require("passport-local");

// body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//CONNECTION Mongoose
const { DB, URI, DB_AUTHSOURCE, DB_PASSWORD, DB_USERNAME} = process.env;
const url = `${URI}/${DB}`;

let connectionObject = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: DB_AUTHSOURCE,
    user: DB_USERNAME,
    pass: DB_PASSWORD
};

mongoose
 .connect(url, connectionObject)
 .then(() => {console.log(`Connected to the ${DB} database`);})
 .catch((error) => console.log(`Issues connecting to the ${DB} database: ${error}`));

// BLUEPRINTS
const UserModel = require("./models/User");

app.use(
  require("express-session")({
    secret: "Blah blah blah", // used to encrypt the user info before saving to db
    resave: false, // save the session obj even if not changed
    saveUninitialized: false, // save the session obj even if not initialized
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  res.render("home.ejs");
});

app.get("/newsfeed", isLoggedIn, (req, res) => {
  res.render("newsfeed.ejs");
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", (req, res) => {
  var newUser = new UserModel({ username: req.body.username });
  UserModel.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      return res.render("signup.ejs");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/newsfeed");
      });
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/newsfeed",
    failureRedirect: "/login",
  }),
  function (req, res) {
    // We don't need anything in our callback function
  }
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Passport app listening on port ${port}`));

// MONGODB_USERNAME="acc"
// MONGODB_PASSWORD="acc_rocks_2020"
// MONGODB_AUTHSOURCE="acc"
