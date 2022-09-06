const router = require("express").Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");

const UserModel = require("../models/User");
// const ImageModel = require("../models/Post");
const { default: mongoose } = require("mongoose");

const multer = require("multer");

// define storage for the images
// const storage = multer.diskStorage({
//     // destination for files
//     destination: function (request, file, callback) {
//     callback(null, './assets/uploads');
//     },

//     // add back the extension
//     filename: function (request, file, callback) {
//     callback(null, Date.now() + file.originalname);
//     },
// });



const storage = multer.diskStorage({
  // destination for image files
  destination: function (request, file, callback) {
  callback(null, './assets/profilePicture');
},

  // add back the extension
  filename: function (request, file, callback) {
  callback(null, Date.now() + file.originalname);
  },
});

let upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3
  }
}).single("image");


router.use(require("express-session")({
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

// router.get("/userspage", (req, res) => {
//   // res.render("userspage.ejs");
//   console.log("\nUsername: " + req.user.username +
//               "\nSession ID: " + req.sessionID + "\n");
//   // res.redirect("/userpage");
//   res.redirect("/feeds");
// });


router.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

router.post("/signup", upload, (req, res) => {
  console.log(req)
  const newUser = new UserModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    followers: req.body.followers,
    followings: req.body.followings,
    likes: req.body.likes,
    phone: req.body.phone,
    bio: req.body.bio,
    gender: req.body.gender,
    website: req.body.website,

    profile: {
      profileimg: ''
    },

    userPost: { 
      caption: "",
      img: "",
      timeCreated: ""
    }
    
  });
  
  UserModel.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      return res.render("signup.ejs");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/feeds");
      });
    }
  })
});

router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.post("/login",passport.authenticate("local", {
      successRedirect: "/feeds",
      failureRedirect: "/login",
  }),

  
  function (req, res) {
    console.log(req)
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

// Read
router.get('/editprofile', isLoggedIn, (req, res) => {
  console.log(req.user.username)
  res.render('editProfile.ejs', { user: req.user })
});

// Create
router.post('/editprofile', isLoggedIn, upload, async (req, res) => {
  UserModel.findByIdAndUpdate({ _id: req.user._id },
    {
      phone: req.body.phone,
      bio: req.body.bio,
      gender: req.body.gender,
      website: req.body.website, 
      profilePicture: req.file.filename,
    },
    (error, result) => {
      if (error) {
        console.log(req.user.id)
      } else {
        console.log('completed')
      }
    }
  );
  res.redirect("/feeds");
});


// Delete
router.get('/deleteprofile', (req, res) => {
  UserModel.deleteOne({ _id: req.user._id }, (error, result) => {
    if (error) {
      console.log("Something went wrong delete from database");
    } else {
      console.log("This image has been deleted", result);
      res.redirect("/login");
    }
  });
});




module.exports = router;