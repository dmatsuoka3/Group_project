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
    callback(null, './assets/images');
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

// router.get('/', (req, res)=> {
//     res.redirect('/home');
// });

// Read
router.get('/feeds', (req, res)=> {

    UserModel.findById(req.user.id, (error, result)=> {
        if(error) {
            console.log(error);
        } else {
            req.doggy = result;
        }
    });
});

router.get('/feeds', isLoggedIn, (req, res) => {

    ImageModel.find({deleted: {$nin: true}}, (err, results)=> {
        if(err) {
            console.log(err);
        } else {
            // res.render('home.ejs');
                /* getProfilePic('', function(results) {
                    profilePic = results
                }) */
                
            res.render('feeds.ejs', {data: results, user: req.doggy});
        }
    }).sort({ timeCreated: 'desc' });
    
});

// Create
router.post('/posts', upload.single('image'), async (req, res) => {
    console.log(req.file);

    const userId = req.user.id;
    const userName = req.user.username;
    
  // if(!req.files) {
  //   res.send("File was not found.");
  //   return;
  // }

    const theImage = new ImageModel({
        caption: req.body.caption,
        img: req.file.filename,
        user: userId,   
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