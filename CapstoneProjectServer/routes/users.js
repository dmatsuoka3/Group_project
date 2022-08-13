const router = require("express").Router();
const express = require("express");
const app = express();



const passport = require("passport");
const LocalStrategy = require("passport-local");


// BLUEPRINTS
const UserModel = require("../models/User");

router.use(
  require("express-session")({
    secret: "Blah blah blah", 
    resave: false, 
    saveUninitialized: false, 
  })
);
router.use(passport.initialize());
router.use(passport.session());
passport.use(new LocalStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

router.get("/", (req, res) => {
  res.redirect("/home");
});

router.get("/home", (req, res) => {
  res.render("home.ejs");
});

router.get("/userspage", isLoggedIn, (req, res) => {
  res.render("userspage.ejs");
});

router.get("/signup", (req, res) => {
  res.render("signup.ejs");
});