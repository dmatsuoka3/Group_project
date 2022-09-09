const router = require("express").Router();
const { request } = require("express");
const express = require("express");
const session = require('express-session')
const multer = require("multer");

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
    return next();
    }
    res.redirect("/login");
};

/* var profilePic = {} */


// define storage for the images
const storage = multer.diskStorage({
    // destination for files
    destination: function (request, file, callback) {
    callback(null, './assets/userPostImages');
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
const ImageModel = require("../models/Post");
const UserModel = require("../models/User");

// Read
router.get('/feeds', (req, res, next)=> {

    UserModel.findById(req.user.id, (error, result)=> {
        if(error) {
            console.log(error);
        } else {
            req.singleUser = result;
            next();
        }
    });
});

router.get('/feeds', (req, res, next)=> {

    UserModel.find({}, (error, users)=> {
        if(error) {
            console.log(error);
        } else {
            req.allUsers = users;
            next();
        }
    });
});

//Made the route asyncrounous, so the results from the DB query can be used outside of its CB
router.get('/feeds', isLoggedIn, async (req, res) => {
    //Create a DB query, to get the results into a variable
    var postfeed = await ImageModel.find({deleted: {$nin: true}}).sort({ timeCreated: 'desc' }).exec();

    //Loop through the posts variable(this is all the posts)
    for(var posts in postfeed) {
        //Query DB search for the user info based on the posts user ID
        var postuser = await UserModel.findById(postfeed[posts].user).exec();
        //postfeed[posts] = {userdata : postuser}
        //Merge the postuser data into the postdata object (per post)
        postfeed[posts] = {post: postfeed[posts], user: postuser}
    }

    //console.lo.g(postfeed)
    res.render('feeds.ejs', {data: postfeed, user: req.singleUser, allUsers: req.allUsers})
    
});

// Create
router.post('/posts', upload.single('image'), async (req, res) => {
    console.log(req.file);

    const userId = req.user.id;
    const userName = req.user.username;

    UserModel.findById(req.user.id, (error, result)=> {
        if(error) {
            console.log(error);
        } else {
            const profPic = result.profilePicture;

            const theImage = new ImageModel({
                caption: req.body.caption,
                img: req.file.filename,
                user: userId,   
                postedBy: userName,
                profileImg: profPic
            });
            
            theImage.save(function() {
                
                theImage.delete(function() {
                    // mongodb: {deleted: true,}
                    theImage.restore(function() {
                    // mongodb: {deleted: false,}
                    });
                });
        
            });
        }
    });

    res.redirect("/feeds");
});

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
                res.redirect("/feeds");
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
            res.redirect("/feeds");
        }
    });
});

module.exports = router;