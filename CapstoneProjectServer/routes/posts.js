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

// const User = require("../models/User");
// const UserModel = require("../models/User");


// router.get('/', (req, res)=> {
//     res.redirect('/home');
// });

// Read
router.get('/homePost', (req, res, next)=> {
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

router.get('/homePost', (req, res, next)=> {
    UserModel.findById(req.user.id, (err, results)=> {
        if(err) {
            res.send(err);
        } else {
            req.doggytwo = results;
            next();
        }
    })
});

router.get('/homePost', isLoggedIn, async (req, res) => {

        ImageModel.find({deleted: {$nin: true}}, (err, results)=> {
        if(err) {
            console.log(err);
        } else {

            // res.render('home.ejs');
                /* getProfilePic('', function(results) {
                    profilePic = results
                }) */
                 
            res.render('userspage.ejs', {
                profileInfoData: req.doggytwo, 
                profileData: req.doggy, 
                data: results
            });
        }
    }).sort({ timeCreated: 'desc' });
    
});

// router.get('/homePost', (req, res)=> {
//     UserModel.findById({_id: req.user.id}, (err, results)=> {
//         if(err) {
//             console.log(err);
//         } else {

//             // res.render('home.ejs');
//                 /* getProfilePic('', function(results) {
//                     profilePic = results
//                 }) */
                 
//             res.render('partials/header.ejs', {data: results});
//         }
//     })
// });

// Create
router.post('/posts', isLoggedIn, upload.single('image'), async (req, res) => {
    // const user = new UserModel({
    //    posts: [theImage]
    // });

    function user() {
        const userId = req.user.id;
        return userId;
    }

    const userId = req.user.id;

    const userName = req.user.username;

    console.log("\nHome page\nUsername: "
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
   
    // function profilePic() {
        // ProfileModel.findOne({user: req.user.id}, 
        //     function(error, result) {
        //         if(error) {
        //             console.log(error);
        //         } else {
        //             console.log("\n\neditProfile object: " + result);
        //             console.log("\nresult.img : " + result.img);
                    
        //         }
        // });
    // }

    // console.log("\n\nResult k: " + k);

    // ProfileModel.findOneAndUpdate(
    //     {user: req.user.id},    
    //     {}, 
    //     { overwrite: true }, function(error, result) {
    //     if(error) {
    //         console.log(error);
    //     } else {
    //         console.log("\n\nInsert successful: " + result);
    //     }
    // });
    
    const theImage = new ImageModel({
        caption: req.body.caption,
        img: req.file.filename,
        user: req.user.id,   // populate virtual
        // profile: {
        //     profileimg: req.file.filename
        // },
        postedBy: userName,
        profileImg: ''
    });
    
    theImage.save(function() {
        
        theImage.delete(function() {
            // mongodb: {deleted: true,}
            theImage.restore(function() {
            // mongodb: {deleted: false,}
            });
        });

        // theImage.restore(function() {
        //     // mongodb: {deleted: true,}
        //     theImage.delete(function() {
        //     // mongodb: {deleted: false,}
        //     });
        // });
    });

    ProfileModel.findOne({user: userId}, 
        function(error, result) {
            if(error) {
                console.log(error);
            } else {
                console.log("\n\neditProfile object: " + result);
                console.log("\nresult.img : " + result.img);
                
                ImageModel.findByIdAndUpdate(
                    theImage._id,    
                {$set: {
                    profileImg: result.img
                }}, 
                { overwrite: true }, 
                function(error, result) {
                    if(error) {
                        console.log(error);
                    } else {
                        console.log("\n\nInsert successful: " + result);
                    }
                });
            }
    });
    // ImageModel.findByIdAndUpdate(
    //     theImage._id,    
    // {$set: {
    //     postedBy: userName
    // }}, { overwrite: true }, function(error, result) {
    //     if(error) {
    //         console.log(error);
    //     } else {
    //         console.log("\n\nInsert successful: " + result);
    //     }
    // });
 
    // UserModel.updateOne({
    //     _id: userId
    // }, {$set: {
    //     post: theImage._id
    // }}, function(error) {
    //     if(error) {
    //         console.log(error);
    //     } else {
    //         console.log("\n\nInsert successful");
    //     }
    // });


    console.log("\n\ntheImage result: " + theImage);

    // ImageModel.findOne({_id: theImage._id})
    // .populate("postedBy")
    // .exec((err, posts) => {
    //  console.log("\n\nPopulated User " + posts + "\n")
    // });
    // UserModel.aggregate([
    //     {$lookup: {
    //         from: 'imagesPosts', 
    //         localField: '_id',
    //         foreignField: 'user',
    //         as: 'posts'
    //     }}
    // ]).exec((err, result)=> {
    //     if(err) {
    //         console.log("error", err);
    //     } else {
    //         //res.json(result);
    //         console.log("\n\nResult: " + result + "\n\n");
    //     }
    // })

    // ImageModel.updateOne({
    //     _id: theImage._id
    // }, {$set: {
    //     postedBy: userName
    // }}, function(error) {
    //     if(error) {
    //         console.log(error);
    //     } else {
    //         console.log("\n\nInsert successful");
    //     }
    // });
    // Here's the code I'm working on to populate the posts from UserModel
    // But I'm still getting undefined on console log
    // function getUserWithPosts(username) {
    //     return UserModel.findOne({username: username})
    //         .populate('posts').exec((err, posts) => {
    //             console.log("\n\nPopulated User " + posts + "\n");
    //         })
    // }

    // getUserWithPosts(userName);

    // ImageModel.findById(theImage._id).populate('postedBy')
    //     .exec(function (err, postedBy) {
    //         console.log(`\n\nPopulated result: ${postedBy}\n`);
    //     })
    // this is another code I was working on to populate by using virtual
    // but I'm getting error for not having image schema register to the Image model
    // try {
    //     const result = await UserModel.findById(userId).populate('posts').exec();
    //     console.log("\n\nPopulate result: " + result + "\n\n");

    //     const userObjectId = mongoose.Types.ObjectId(userId);

    //     UserModel.update({_id: userObjectId},
    //         result
    //     );

    // } catch (err) {
    //     console.log(err);
    //     res.status(500).send("Something went wrong, check logs");
    // }

    // console.log("\n\nimage id: " + theImage._id + "\n");


    // try {
    //     const result = await ImageModel.findById(theImage._id).populate("postedBy")
    //     .exec();
    //     console.log("\n\nPopulate result: " + result + "\n\n");

    //     // var ObjectId = require('mongodb').ObjectID;

    //     // ImageModel.replaceOne({_id: ObjectId(theImage._id)},
    //     //     result
    //     // );
    // } catch (err) {
    //     console.log(err);
    //     res.status(500).send("Something went wrong, check logs");
    // }

    // console.log("\nPosted by: username: " + theImage.postedBy.username + "\n\n");

    res.redirect("/homePost");
});

// router.get('/homePost', (res, req)=> {
   
//     const userId = req.user.id;

//     try {
//         // const result = await UserModel.findById(userId).populate('posts').exec();
//         // console.log("\n\nPopulate result: " + result + "\n\n");

//         // const userObjectId = mongoose.Types.ObjectId(userId);

//         // UserModel.update({_id: userObjectId},
//         //     result
//         // );

//         UserModel.findById(userId).populate('posts')
//             .exec(function(error, result) {
//                 if(error) {
//                     console.log(error)
//                 } else {
//                     console.log("\n\nPopulated result: " + result + "\n\n")
//                     res.json(result);
//                 }
//         });


//     } catch (err) {
//         console.log(err);
//         res.status(500).send("Something went wrong, check logs");
//     }
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