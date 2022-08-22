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

// router.get('/', (req, res)=> {
//     res.redirect('/home');
// });

// Read
router.get('/postHome', isLoggedIn, (req, res) => {

    ImageModel.find({deleted: {$nin: true}}, (err, results)=> {
        if(err) {
            console.log(err);
        } else {
            // res.render('home.ejs');
                /* getProfilePic('', function(results) {
                    profilePic = results
                }) */
                
            res.render('userspage.ejs', {data: results, user: req.user});
        }
    }).sort({ timeCreated: 'desc' });
    
});

// Create
router.post('/posts', upload.single('image'), async (req, res) => {
    console.log(req.file);

    const theImage = new ImageModel({
        caption: req.body.caption,
        img: req.file.filename,
    });

    theImage.save(function() {
        theImage.delete(function() {
            // mongodb: {deleted: true,}
            theImage.restore(function() {
                // mongodb: {deleted: false,}
            });
        });
    });

    res.redirect("/postHome");
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
                res.redirect("/postHome");
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
            res.redirect("/postHome");
        }
    });
});

module.exports = router;