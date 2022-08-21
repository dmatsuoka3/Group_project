const router = require("express").Router();
const express = require("express");
const session = require('express-session')
const app = express()
const multer = require("multer");
const userModel = require("../models/User");

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
    return next();
    }
    res.redirect("/login");
};


// define storage for the images
const storage = multer.diskStorage({
    // destination for image files
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


// Read
router.get('/editprofile', isLoggedIn,  (req, res) => {
    /* console.log(req.user.username) */
        res.render('editprofile', {data: req})
});

// Create
router.post('/updateprofilepic', isLoggedIn, upload.single('image'), async (req, res) => {
    userModel.findByIdAndUpdate({_id: req.user._id},
        {profile: {
            profileimg: req.file.filename
        }},
        (error, result)=> {
            if(error) {
                console.log(req.user.id)
            } else {
                console.log('completed')
            }
        }
    );
    res.redirect("/editprofile");
});


/* // Update
router.get('/update/:id', (req, res)=> {

    ImageModel.findById(req.params.id, (error, result)=> {
        if(error) {
            console.log(error);
        } else {
            res.render("editprofile", {data: result});
        }
    });
}); */

/* router.put('/update/:id', (req, res)=> {

    
    ImageModel.findByIdAndUpdate({_id: req.params.id},
        {caption: req.body.caption},
        (error, result)=> {
            if(error) {
                res.send(error.message);
            } else {
                res.redirect("/editprofile");
            }
        }
    );
}); */

// Delete
/* router.get('/home/:id', (req, res)=> {
    ImageModel.deleteById(req.params.id, (error, result)=> {
        if(error) {
            console.log("Something went wrong delete from database");
        } else {
            console.log("This image has been deleted", result);
            res.redirect("/editprofile");
        }
    });
}); */

module.exports = router;

//DO NOT DELETE
/* db.imagesposts.aggregate([{
$lookup: {from: "profileimages", localField: "userid", foreignField: "userid", as: "profile"}
}]) */

