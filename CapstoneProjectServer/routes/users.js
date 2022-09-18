const router = require("express").Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");

const multer = require("multer");
const UserModel = require("../models/User");
const ImageModel = require("../models/Post");
const followModel = require("../models/Following");

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

router.post("/login", passport.authenticate("local", {
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
router.get("/error", (req, res) => {
  res.render("error.ejs");
});

router.get("/user/:id?", async (req, res) => {
  const userId = (req.params.id);
  // query database for username, return results to show their profile bio and their images
  let isLoggedIn = 0;
  const myusername = (req.isAuthenticated() ? req.user.username : '');

  //Check if user is logged in
  if (req.isAuthenticated() & userId == myusername) {
    isLoggedIn = 1;
  }
  //Search DB by user name 
  let userinfo = await UserModel.find({username: userId}).exec();
  let userinfoId = await UserModel.findOne({username: req.params.id}).exec();

  let userinfoObject = await UserModel.findOne({username: userId}).exec();

  let mainUserInfo = await UserModel.findById(req.user.id).exec();

  //If users exists, then proceed to query the DB for their posts
  if (userinfo.length > 0) {
    let userphoto = await  ImageModel.find({deleted: {$nin: true}, user: userinfo[0]._id}).sort({ timeCreated: 'desc' }).exec();

    var mainUserFollowings = mainUserInfo.followings;

    var followingCount = await followModel.countDocuments({userId: userinfo[0]._id}).exec();
    var followerCount = await followModel.countDocuments({following: userinfo[0]._id}).exec();
  
  
    // if user with 'username' is following to main user or if user's id is the same as main user's id
    if(mainUserFollowings.includes(req.params.id)  || userinfoObject.id == req.user.id) {
      res.render("profile.ejs", {
        data: userinfo, 
        photos: userphoto, 
        user: {isLoggedIn: isLoggedIn}, 
        count: {
          photos: userphoto.length, 
          followers: followerCount, 
          followings: followingCount
        }
      });
    } else {
      res.render("unkownProfile.ejs", {
        data: userinfo, 
        user: {isLoggedIn: isLoggedIn}, 
        count: {
          photos: userphoto.length,
          followers: followerCount, 
          followings: followingCount
        }});
    } 
  
  } else {
    // insert error page for user that does not exist
    res.redirect("/error")
  }
});

// search user by using username
router.get('/searchUser', async (req, res)=> {

  let searchingUserinfo = await UserModel.findOne({username: req.query.username}).exec();
 
  // if search bar is empty or random 'username' that is not in the database
  if(!req.query.username || !searchingUserinfo) {
    res.redirect("/feeds");   // then it'll refresh to 'feeds' page
  } else {
    // get the user info by searching username or name from database
    let userinfo = await UserModel.findOne({username: req.query.username}).exec();

    // get the info for user login from database
    let mainUserInfo = await UserModel.findById(req.user.id).exec();

    let userphoto = await  ImageModel.find({deleted: {$nin: true}, user: userinfo._id}).exec();

    // get followings from main user (login user)
    var mainUserFollowings = mainUserInfo.followings;
  
    // if user with 'username' is following to main user or if user's id is the same as main user's id
    if(mainUserFollowings.includes(userinfo.id) || req.user.id == userinfo.id) {
      res.render("profileSearchUser.ejs", {
        data: userinfo, 
        photos: userphoto,
        count: {photos: userphoto.length}
      });
    } else {
      res.render("unkownProfile.ejs", {data: userinfo, count: {photos: userphoto.length}});
    }  

  }
});

router.get('/editprofile', isLoggedIn, (req, res) => {
  //console.log(req.user.username)
  res.render('editProfile.ejs', { user: req.user })
});

// Create
router.post('/editprofile', isLoggedIn, upload, async (req, res) => {
  let profilepic = ''
  if(!req.file) {
    profilepic = req.user.profilePicture
  }
  UserModel.findByIdAndUpdate({ _id: req.user._id },
    {
      name: req.body.name,
      username: req.body.username,
      phone: req.body.phone,
      bio: req.body.bio,
      gender: req.body.gender,
      website: req.body.website, 
      
      //If no file is uploaded, re-use their current profile pic
      profilePicture: (profilepic.length > 0 ? profilepic : req.file.filename),
    },
    (error, result) => {
      if (error) {
        //console.log(req.user.id)
      } else {
        //console.log('completed')
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

// Delete
/* router.get('/deleteprofile', (req, res) => {
  UserModel.deleteOne({ _id: req.user._id }, (error, result) => {
    if (error) {
      //console.log("Something went wrong delete from database");
    } else {
      //console.log("This image has been deleted", result);
      res.redirect("/login");
    }
  });
}); */

// follow user
router.put("/follow/:id", async (req, res) => {

  // if main user is not equal to other user
  if (req.user.id !== req.params.id) {

    try {

      // get other user's object as 'otherUser'
      UserModel.findById(req.params.id, (error, otherUser)=> {
        if(error) {
          console.log(error);
        } else {

          // get followers from other user
          const otherUserFollowers = otherUser.followers;

          // get main user's object as 'mainUser'
          UserModel.findById(req.user.id, (error, mainUser)=> {
            if(error) {
              console.log(error);
            } else {

              // if other user's followers is not includes main user's id
              if(!otherUserFollowers.includes(req.user.id)) {

                // then push main user's id to other user's followers
                otherUser.followers.push(req.user.id);
                otherUser.save();

                // and push other user's id to main user's followers
                mainUser.followings.push(req.params.id);
                mainUser.save();

                const following = new followModel({
                  userId: req.user.id, 
                  following: req.params.id
                });
            
                following.save(function() {
                  console.log("following")
                });

                res.redirect("/feeds");
              } 
            }

          });

        }

      });

    } catch (error) {
      res.status(500).json(error);
    }


  } else {
    res.status(403).json("you CANNOT follow yourself");
  }
});


//unfollow a user
router.put("/unfollow/:id", (req, res) => {

  // if main user is not equal to other user
  if (req.user.id !== req.params.id) {

    try {

      // get other user's object as 'otherUser'
      UserModel.findById(req.params.id, (error, otherUser)=> {
        if(error) {
          console.log(error);
        } else {

          // get followers from other user
          const otherUserFollowers = otherUser.followers;

          // get main user's object as 'mainUser'
          UserModel.findById(req.user.id, (error, mainUser)=> {
            if(error) {
              console.log(error);
            } else {

              // if other user's followers includes main user's id
              if(otherUserFollowers.includes(req.user.id))  {

                // pull main user's id from other user's followers
                otherUser.followers.pull(req.user.id);
                otherUser.save();

                // pull other user's id from main user's followings
                mainUser.followings.pull(req.params.id);
                mainUser.save();

                followModel.deleteOne({userId: req.user.id, following: req.params.id}, (error, result)=> {
                  console.log('unfollowed', result)
                });

                res.redirect("/feeds");
              }

            }

          });

        }

      });

    } catch (error) {
      res.status(500).json(error);
    }

  
  } else {
    res.status(403).json("you CANNOT follow yourself");
  }
});



module.exports = router;