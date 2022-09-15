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

    var ObjectId = require('mongodb').ObjectId;

    // find all users except one user (main user)
    UserModel.find({_id: {$ne: ObjectId(req.user.id)}}, (error, users)=> {
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

    ImageModel.find()

    res.render('feeds.ejs', {
        data: postfeed, 
        user: req.singleUser, 
        allUsers: req.allUsers
    })
    
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
    
  if(!req.file) {
    // res.send("File was not found.");
    console.log("File was not found.");
    
    res.redirect('/new');
  }

    UserModel.findById(req.user.id, (error, result)=> {
        if(error) {
            console.log(error);
        } else {
            const profPic = result.profilePicture;
            const postByUser = result.posts;

            const theImage = new ImageModel({
                caption: req.body.caption,
                img: req.file.filename,
                user: userId,   
                postedBy: userName,
                profileImg: profPic,
                likedByIds: req.body.likedByIds,
                likedByNames: req.body.likedByNames
            });

            theImage.save(function() {
                
                theImage.delete(function() {
                    // mongodb: {deleted: true,}
                    theImage.restore(function() {
                    // mongodb: {deleted: false,}
                    });
                });
            });

            postByUser.push(theImage._id);
            postByUser.save();
        }
    });

    res.redirect("/feeds");
});

router.get('/new', (req, res)=> {
    res.render("newPost");
});

// Update
router.get('/update/:id', (req, res)=> {

    const userId = req.user.id;
    const imageId = req.params.id;

    console.log("\n\nUser's id: " + userId);
    console.log("\n\nPost's id: " + imageId);

    // get the image post info
    ImageModel.findById(imageId, (error, resultPost)=> {
        if(error) {
            console.log(error);
        } else {

            // get the user id from image post
            const theImageUser = resultPost.user;
            
            console.log("\n\ntheImageUser: " + theImageUser);

            // get the info from user
            UserModel.findById(userId, (error, userResult)=> {
                if(error) {
                    console.log(error);
                } else {
                    console.log("\n\nUserModel's result: " + userResult);
                    
                    // get user's id
                    const theUserId = userResult._id;

                    // if image post's user is equal to user's id
                    if(theUserId.equals(theImageUser)) {

                        res.render("updatePost", {data: resultPost});

                    } else {
                        console.log("\n\nYou don't have permission to update this user's post.\n\n");
                        res.redirect("/feeds");
                    }
                }
            });
        
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
                                res.redirect("/feeds");
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
});

// like
router.put('/like/:id', (req, res)=> {

    // First post's object for User's id
    ImageModel.findById(req.params.id, (error, postObject)=> {
        if(error) {
            console.log(error);
        } else {
            const postLikedBy = postObject.likedByIds;

            // Second post's object for User's name
            ImageModel.findById(req.params.id, (error, postObjectTwo)=> {
                if(error) {
                    console.log(error);
                } else {
                    const postLikedByName = postObjectTwo.likedByNames;

                    // Getting main user's object for userLikes
                    UserModel.findById(req.user.id, (error, userObject)=> {
                        if(error) {
                            console.log(error);
                        } else {
                            const userLikes = userObject.likes;
                            
                            if(!postLikedBy.includes(req.user.id)) {
                                
                                postLikedBy.push(req.user.id);
                                postObject.save();
        
                                postLikedByName.push(req.user.name);
                                postObjectTwo.save();
        
                                userLikes.push(req.params.id);
                                userObject.save();
        
                                res.redirect("/feeds");
                            } else {
        
                                postLikedBy.pull(req.user.id);
                                postObject.save();
        
                                postLikedByName.pull(req.user.name);
                                postObjectTwo.save();
        
                                userLikes.pull(req.params.id);
                                userObject.save();
        
                                res.redirect("/feeds");
                            }
                        }
                    });

                }
            });    
           
        }
    });
});



module.exports = router;