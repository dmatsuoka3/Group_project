const router = require("express").Router();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
// BLUEPRINTS
const newUserModel = require("../models/newUserModel");


const passport = require("passport");
const LocalStrategy = require("passport-local");

const storage = multer.diskStorage({
    // destination for image files
    destination: function (req, file, callback) {
    callback(null, './usersProfileImages');
    },

    // add back the extension
    filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
    },
});

let upload = multer({
    storage: storage,  
}).single("image")



router.use(
  require("express-session")({
    secret: "Blah blah blah", 
    resave: false, 
    saveUninitialized: false, 
  })
);
router.use(passport.initialize());
router.use(passport.session());
passport.use(new LocalStrategy(newUserModel.authenticate()));
passport.serializeUser(newUserModel.serializeUser());
passport.deserializeUser(newUserModel.deserializeUser());

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
  res.render("login.ejs");
});


router.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

router.post("/signup", (req, res) => {

  const newUser = new newUserModel({ 
    username: req.body.username, 
    email: req.body.email,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    bio: req.body.bio,
    gender: req.body.gender,
    website: req.body.website,
    profile: {
        profileimg: ''
      }
  
  });
  newUserModel.register(newUser, req.body.password, function (err) {
    if (err) {
      console.log(err);
      return res.render("signup.ejs");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.render("users_page.ejs");
      });
    }
  })
});

router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.post("/login",passport.authenticate("local", {
      successRedirect: "/users_page",
      failureRedirect: "/login",
  }),
  function (req, res) { }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

//Get all the users
router.get("/users_page",isLoggedIn, (req, res) => {
    newUserModel.find({}, (error, Allusers) => {
        if(error) {
            res.send("Cannot find user in the database")
        } else {
            res.render("users_page.ejs", {users: Allusers, loggedInUser: req.user})
        }
    })
});

// Read
router.get('/editprofile', isLoggedIn,  (req, res) => {
      res.render('editprofile', {data: req, loggedInUser: req.user})
});


router.post('/editprofile', isLoggedIn, upload, async (req, res) => {
  newUserModel.findByIdAndUpdate({_id: req.user._id},
      {name: req.body.name,
          bio: req.body.bio,
          website: req.body.website,
          gender: req.body.gender,
          phone: req.body.phone,
          profile: {
            profileimg: req.file.filename
        }
      }, 
      (error, result)=> {
          if(error) {
              console.log(req.user.id)
          } else {
              console.log('completed')
          }
      }
  );
  res.redirect("/editprofile");
});

// Delete
router.get('/deleteprofile', (req, res)=> {
  newUserModel.deleteOne({_id: req.user._id}, (error, result)=> {
      if(error) {
          console.log("Something went wrong delete from database");
      } else {
          console.log("This image has been deleted", result);
          res.redirect("/login");
      }
  });
});
 

module.exports = router;