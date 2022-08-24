const router = require("express").Router();
const express = require("express");
const { default: mongoose, Schema } = require("mongoose");

const multer = require("multer");

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
    return next();
    }
    res.redirect("/login");
};

// define storage for the images
const storage = multer.diskStorage({
    // destination for files
    destination: function (request, file, callback) {
      callback(null, './assets/uploads');
    },
  
    // add back the extension
    filename: function (request, file, callback) {
      callback(null, Date.now() + file.originalname);
    },
});

// upload parameters for multer
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 3
    }
});

// BLUEPRINTS
var UserModel = require("../models/User");
var ImageModel = require("../models/Post");
// const User = require("../models/User");
// const UserModel = require("../models/User");

// const User = require("../models/User");
// const UserModel = require("../models/User");


// router.get('/', (req, res)=> {
//     res.redirect('/home');
// });

// Read
router.get('/homePost', isLoggedIn, (req, res) => {

    ImageModel.find({deleted: {$nin: true}}, (err, results)=> {
        if(err) {
            console.log(err);
        } else {
            // res.render('home.ejs');
            res.render('userspage.ejs', {data: results});
        }
    }).sort({ timeCreated: 'desc' });
    
});

// Create
router.post('/posts', isLoggedIn, upload.single('image'), async (req, res, next) => {

    // const user = new UserModel({
    //    posts: [theImage]
    // });

    const userId = req.user.id;
    const userName = req.user.username;

    console.log("\nHome page\nUsername: " + userName
              + "\nUser Id: " + userId
              + "\nEmail: " + req.user.email + "\n\n"
              + "object: " + req.user + "\n"
              // + "\n\nUserModel: " + user + "\n"
    );

    // const theUser = new UserModel({
    //     posts: [{
    //         caption: req.body.caption,
    //         img: req.file.filename,
    //     }]
    // });

    // theUser.save();
   
    const theImage = new ImageModel({
        caption: req.body.caption,
        img: req.file.filename,
        user: req.user.id
        // profile: {
        //     profileimg: req.file.filename
        // },
    });
    
    theImage.save(function() {
        
        theImage.delete(function() {
            // mongodb: {deleted: true,}
            theImage.restore(function() {
            // mongodb: {deleted: false,}
            });
        });
    });
 

    console.log("\n\ntheImage result: " + theImage);

    // Here's the code I'm working on to populate the posts from UserModel
    // But I'm still getting undefined on console log
    function getUserWithPosts(username) {
        return UserModel.findOne({username: username})
            .populate('posts').exec((err, posts) => {
                console.log("\n\nPopulated User " + posts + "\n");
            })
    }

    getUserWithPosts(userName);

    // this is another code I was working on to populate by using virtual
    // but I'm getting error for not having image schema register to the Image model
    // try {
    //     const result = await UserModel.findById(userId).populate("posts");
    //     console.log("\n\nPopulate result: " + result + "\n\n");
    // } catch (err) {
    //     console.log(err);
    //     res.status(500).send("Something went wrong, check logs");
    // }

// *********************************************************************************
//             Ignore all the comments below

    // UserModel.findOne({_id: userId})
    //          .populate({path: 'posts', model: 'ImageModel'})
    //     .then(p=>console.log("\nResult: " + p + "\n\n"))
    //     .catch(error=>console.log(error))

    // const theUser = new UserModel({
    //     // name: req.body.name,
    //     // username: req.u.username,
    //     // email: req.body.email,
    //     posts: [theImage]
    //  });

    //  theUser.save(function(error, result) {
    //     if(error) {
    //         console.log(error);
    //     } else if(result) {
    //         console.log("\n\nResult: " + result + "\n");
    //     }
    //  });
    
    // theImage.save().then(result => {
    //     UserModel.findOne({_id: userId})
    //     .populate("posts")
    //     .then(p=>console.log("\nResult: " + p + "\n\n"))
    //     .catch(error=>console.log(error))
    // });
  
    // UserModel.findOne({}).populate({ path: 'created_by', model: 'User' }) 

        // ImageModel.findOne({ user: user._id }).
        // populate('user').
        // exec(function (err, story) {
        //     if (err) return handleError(err);
        //     // console.log('The author is %s', story.author.name);
        //      // prints "The author is Ian Fleming"
        //  });

         // UserModel.findById(userId).populate("posts");
        //  ImageModel.findOne({caption: req.body.caption})
        //  .populate('user')
        //  .exec(function(err, result){
        //      if(err) {
        //          console.log(err)
        //      } else {
        //          console.log("The user is " + result);
        //      }
        //  });
    // });
    
    // UserModel
    // .findOne({_id: userId})
    // .populate("posts")
    // .then(user => {
    //     res.json(user);
    //     console.log("Result: " + user);
    // })

    // UserModel
    // .findOne({_id: userId})
    // .populate('posts')
    // .then(user => {
    //     res.json(user);
    // });
    
    // console.log("\nresult: " + user);
    // UserModel
    // .findOne({_id: userId})
    // .populate({path: 'posts', model: ImageModel})
    // .exec((err, result)=> {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         console.log("\nThe user's posts is " + result.posts + "\n");
    //     }
    // });


    // UserModel.find()
    // .select("posts _id")
    // .populate('posts', 'caption')
    // .exec(function(err, result){
    //     if(err) {
    //         console.log(err)
    //     } else {

    //         console.log("The result is " + result);
    //     }
    // });

    // try {
    //     const result = UserModel.findById(userId).populate({path: 'posts', select: 'caption username'});
    //     console.log("\nResult: " + result + "\n");
    // } catch(error) {
    //     console.log(error);
    // }

    // theImage.save(function() {
    //     theImage.delete(function() {
    //         // mongodb: {deleted: true,}
    //         theImage.restore(function() {
    //             // mongodb: {deleted: false,}
    //         });
    //     });
    // });

    // UserModel
    //     .findOne({_id: userId})
    //     .populate('posts')
    //     .then(user => {
    //         res.json(user);
    //         console.log("\n\nresullt: " + user +"\n\n");
    //     });

    res.redirect("/homePost");
});

// router.get('/homePost', (req, res)=> {
//     UserModel
//     .findOne({_id: userId})
//     .populate('posts')
//     .then(user => {
//         res.json(user);
//         console.log("\n\nresullt: " + user +"\n\n");
//     });
// });

router.get('/new', (req, res)=> {
    res.render("newPost");
});

// Update
router.get('/update/:id', (req, res)=> {

    ImageModel.findById(req.params.id, (error, result)=> {
        if(error) {
            console.log(error);
        } else {
            // console.log("Result: " + result);
            res.render("updatePost", {data: result});
        }
    });
});

router.put('/update/:id', (req, res)=> {

    // let updateId = req.params.id;
    // let updateCaption = req.body.caption;
    
    ImageModel.findByIdAndUpdate({_id: req.params.id},
         {caption: req.body.caption},
        (error, result)=> {
            if(error) {
                res.send(error.message);
            } else {
                // res.redirect(`/update/${result._id}`);
                res.redirect("/homePost");
            }
        }
    );
});

// Delete
router.get('/home/:id', (req, res)=> {
    ImageModel.deleteById(req.params.id, (error, result)=> {
        if(error) {
            console.log("Something went wrong delete from database");
        } else {
            console.log("This post has been deleted", result);
            res.redirect("/homePost");
        }
    });
});

module.exports = router;