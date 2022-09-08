const router = require("express").Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");

const multer = require("multer");
const UserModel = require("../models/User");
const ImageModel = require("../models/Post");

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
    website: req.body.website
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
router.get("/user/:id?", async (req, res) => {
  const userId = (req.params.id);
  // query database for username, return results to show their profile bio and their images
  let isLoggedIn = 0;

  if (req.isAuthenticated()) {
    isLoggedIn = 1;
  }
  let userinfo = await UserModel.find({username: userId}).exec();

  if (userinfo.length > 0) {
    let userphoto = await  ImageModel.find({deleted: {$nin: true}, user: userinfo[0]._id}).exec();


  /*   
    (err, results)=> {

    if(err) {
        console.log(err);
    } else {
      if(results.length > 0) {
          // If we get some results from the database that matches the requested user

      } else {
        // Else, nothing returned from the database
        results[0] = {
        name:'User does not exist', 
        user:'not here', 
        bio:'buhbai',
        profilePicture: ''
      }
    }
      //res.render("profile.ejs", {data: results, user: {isLoggedIn: isLoggedIn}});
    }
    
  };

  ImageModel.find({deleted: {$nin: true}, userId: userId}, (err, results)=> {
    if(err) {
        console.log(err);
    } else {
        userPhotos = results
    }
  }).sort({ timeCreated: 'desc' });

  if(userPhotos.length < 1) {
    console.log('no photos by user')
    userPhotos = [{img:''}]
  }
  console.log(userData);
   */

    res.render("profile.ejs", {data: userinfo, photos: userphoto, user: {isLoggedIn: isLoggedIn}});
  } else {
    // insert error page for user does not exists
    res.redirect("/feeds")
  }
});

router.get('/editprofile', isLoggedIn, (req, res) => {
  console.log(req.user.username)
  res.render('editProfile.ejs', { user: req.user })
});

// Create
router.post('/editprofile', isLoggedIn, upload, async (req, res) => {
  //console.log('wtf', upload)
  let profilepic = ''
  if(!req.file) {
    profilepic = req.user.profilePicture
  }
  UserModel.findByIdAndUpdate({ _id: req.user._id },
    {
      phone: req.body.phone,
      bio: req.body.bio,
      gender: req.body.gender,
      website: req.body.website, 
      profilePicture: (profilepic.length > 0 ? profilepic : req.file.filename),
    },
    (error, result) => {
      if (error) {
        console.log(req.user.id)
      } else {
        console.log('completed')
      }
    }
  );
  res.redirect("/editprofile");
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