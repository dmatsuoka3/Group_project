const router = require("express").Router();
const express = require("express");
const { default: mongoose, Schema, isObjectIdOrHexString } = require("mongoose");

const multer = require("multer");

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
    return next();
    }
    res.redirect("/login");
};

// var profilePic = {}

// define storage for the images
const storage = multer.diskStorage({
    // destination for files
    destination: function (request, file, callback) {
    callback(null, './assets/uploads');

    // Ben's code
    //callback(null, './assets/uploads_profile_images');
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
var ProfileModel = require("../models/editprofile");

// Read
router.get('/feeds', (req, res, next)=> {
    UserModel.findById(req.user.id, (err, results)=> {
        if(err) {
            res.send(err);
        } else {
            console.log("\n\neditprofile result: " + results + "\n");
            req.doggy = results;
            next();
        }
    })
});

router.get('/feeds', (req, res, next)=> {
    UserModel.findById(req.user.id, (err, results)=> {
        if(err) {
            res.send(err);
        } else {
            req.doggytwo = results;
            next();
        }
    })
});

router.get('/feeds', isLoggedIn, async (req, res) => {

        ImageModel.find({deleted: {$nin: true}}, (err, results)=> {
        if(err) {
            console.log(err);
        } else {

            res.render('feeds.ejs', {
                // profileInfoData: req.doggytwo, 
                profileData: req.doggy, 
                data: results
            });
        }
    }).sort({ timeCreated: 'desc' });
    
});

// Create
router.post('/posts', isLoggedIn, upload.single('image'), async (req, res) => {

    const userId = req.user.id;
    const userName = req.user.username;

    console.log("\nHome page\nUsername: " + userName
              + "\nUser Id: " + userId
              + "\nEmail: " + req.user.email + "\n\n"
              + "object: " + req.user + "\n"
              // + "\n\nUserModel: " + user + "\n"
    );
    
//   if(!req.files) {
//     // res.status(err.statusCode || 500);
//     res.send("File was not found.");
//     return;
//   }

    const theImage = new ImageModel({
        caption: req.body.caption,
        img: req.file.filename,
        user: req.user.id,   
        postedBy: userName,
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
    
    const userId = req.user.id;
    const imageId = req.params.id;

    console.log("\n\nUser's id: " + userId);
    console.log("\n\nPost's id: " + imageId);

    ImageModel.findById(imageId, (error, resultPost)=> {
        if(error) {
            console.log(error);
        } else {
            console.log("\n\nDelete's ImageModel result: " + resultPost + "\n");

            const theImageUser = resultPost.user;
            
            console.log("\n\ntheImageUser: " + theImageUser);

            UserModel.findById(userId, (error, userResult)=> {
                if(error) {
                    console.log(error);
                } else {
                    console.log("\n\nUserModel's result: " + userResult);
                    
                    const theUserId = userResult._id;

                    if(theUserId.equals(theImageUser)) {

                        ImageModel.deleteById(req.params.id, (error, result)=> {
                            if(error) {
                                console.log("Something went wrong delete from database");
                            } else {
                                console.log("\n\nThis post has been deleted by " + req.user.name + ".\n" + 
                                                result);
                                res.redirect("/homePost");
                            }
                        });

                    } else {
                        console.log("\n\nYou don't have permission to delete this user's post.\n\n");
                        res.redirect("/feeds");
                    }
                }
            });
        
        }
    });

    // const theImageUser = theImage.user;

    // ImageModel.deleteById(req.params.id, (error, result)=> {
    //     if(error) {
    //         console.log("Something went wrong delete from database");
    //     } else {
    //         console.log("This post has been deleted", result);
    //         res.redirect("/homePost");
    //     }
    // });
});

module.exports = router;