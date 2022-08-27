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
const Post = require("../models/Post");
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
            // console.log(user);
            res.render('userspage.ejs', {data: results});
        }
    }).sort({ timeCreated: 'desc' });
    
});

// Create
router.post('/posts', isLoggedIn, upload.single('image'), async (req, res) => {
    // const user = new UserModel({
    //    posts: [theImage]
    // });

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
   
 

    const theImage = new ImageModel({
        caption: req.body.caption,
        img: req.file.filename,
        // user: req.user.id
        // profile: {
        //     profileimg: req.file.filename
        // },
        postedBy: userName
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
    //     .exec((err, postedBy) => {
    //         console.log(`\n\nPopulated result: ${postedBy}\n`);
    //     })
    // this is another code I was working on to populate by using virtual
    // but I'm getting error for not having image schema register to the Image model
    // try {
    //     const result = await UserModel.findById(userId).populate("posts");
    //     console.log("\n\nPopulate result: " + result + "\n\n");
    // } catch (err) {
    //     console.log(err);
    //     res.status(500).send("Something went wrong, check logs");
    // }

    console.log("\n\nimage id: " + theImage._id + "\n");
    try {
        const result = await ImageModel.findById(theImage._id).populate("postedBy").exec();
        console.log("\n\nPopulate result: " + result + "\n\n");

        // UserModel.updateOne({
        //     _id: userId
        // }, {$set: {
        //     result
        // }}, function(error) {
        //     if(error) {
        //         console.log(error);
        //     } else {
        //         console.log("\n\nInsert successful");
        //     }
        // });
    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong, check logs");
    }

    // console.log("\nPosted by: username: " + theImage.postedBy.username + "\n\n");

    res.redirect("/homePost");
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