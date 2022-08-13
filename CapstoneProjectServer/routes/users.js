const router = require("express").Router();
const express = require("express");
const app = express();
const passport = require("passport");
const LocalStrategy = require("passport-local");

    //body parser
    app.use(express.json());
    app.use(express.urlencoded({extended:false}));


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
passport.use(new LocalStrategy(UserModel.authenticate({usernameField: "email"},)));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated( )) {
    return next();
  }
  res.redirect("/login");
};


//route to the hompage same as the login page
router.get("/", (req, res) => {
  res.render("home.ejs");
});

//route to the login page
router.get("/login", (req, res) => {
  res.render("login.ejs")
})

router.post("/login", passport.authenticate("local",
{
  successRedirect: "/userspage",
  failureRedirect: "/login",
})
); 

//route to the user's page
router.get("/userspage", isLoggedIn, (req, res) => {
  res.render("userspage.ejs");
});


router.get("/signup", (req, res) => {
  res.render("signup.ejs");
}); 

router.post("/signup", (req, res) => {
    const newUser = new UserModel({ 
      username: req.body.username, 
     /*  email: req.body.email,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      bio: req.body.bio,
      gender: req.body.gender,
      website: req.body.website */
    });
    UserModel.register(newUser, req.body.password, function (err, user) {
      if (err) {
        console.log(err);
        return res.render("signup.ejs");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/userspage");
        });
      }
    })
  });





router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});


module.exports = router;