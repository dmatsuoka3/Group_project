const router = require("express").Router();
const express = require("express");
const multer = require("multer");
const ImageModel = require("../models/editprofile");


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

function getProfilePic (userid, callback) {
    ImageModel.find({userid: userid}, (err, results)=> {
        if(err) {
            console.log(err);
        } else {
            console.log(results)
            return callback(results)
            
        }
    }).sort({ timeCreated: 'desc' });
}



// upload parameters for multer
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 3
    }
});


// Read
router.get('/editprofile', (req, res) => {
    getProfilePic('', function(results) {
        res.render('editprofile', {data: results})
    })
    
});

// Create
router.post('/updateprofilepic', upload.single('image'), async (req, res) => {
    console.log(req.file);

    const theImage = new ImageModel({
        img: req.file.filename,
        userid: ''
    });

    theImage.save(function() {
        theImage.delete(function() {
            theImage.restore(function() {
            });
        });
    });

    res.redirect("/editprofile");
});


// Update
router.get('/update/:id', (req, res)=> {

    ImageModel.findById(req.params.id, (error, result)=> {
        if(error) {
            console.log(error);
        } else {
            res.render("editprofile", {data: result});
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
                res.redirect("/editprofile");
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
            console.log("This image has been deleted", result);
            res.redirect("/editprofile");
        }
    });
});

module.exports = router;

//DO NOT DELETE
/* db.imagesposts.aggregate([{
$lookup: {from: "profileimages", localField: "userid", foreignField: "userid", as: "profile"}
}]) */