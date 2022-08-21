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
  res.render("login.ejs");
});

router.get("/userspage", isLoggedIn, (req, res) => {
  // res.render("userspage.ejs");
  
  res.redirect("/postHome");
});

router.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

router.post("/signup", (req, res) => {
  const newUser = new UserModel({ 
    username: req.body.username, 
    email: req.body.email,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    bio: req.body.bio,
    gender: req.body.gender,
    website: req.body.website
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

router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.post("/login",passport.authenticate("local", {
      successRedirect: "/userspage",
      failureRedirect: "/login",
  }),

  
  function (req, res) {
    // We don't need anything in our callback function
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// exports.login = (req, res, next) => {
//   UserModel.findOne({username: req.body.username}).then(
//     (user)=> {
//       if(!user) {
//         return res.status(401).json({
//           error: new Error('User not found!')
//         });
//       }
//       bcrypt.compare(req.body.password, user.password).then(
//         (valid)=> {
//           if(!valid) {
//             return res.status(401).json({
//               error: new Error('Incorrect password')
//             });
//           }
//           const token = jwt.sign({userId: user._id}, 'RANDOM_TOKEN_SECRET', {expiresIn: '24h'});
//           res.status(200).json({
//             userId: user._id,
//             token: 'token'
//           });
//         }
//       ).catch(
//         (error)=> {
//           res.status(500).json({
//             error: error
//           });
//         }
//       );
//     }
//   ).catch(
//     (error) => {
//       res.status(500).json({
//         error: error
//       });
//     }
//   );
// }

module.exports = router;