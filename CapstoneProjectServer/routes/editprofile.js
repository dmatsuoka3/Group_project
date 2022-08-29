const router = require("express").Router();
const express = require("express");
const multer = require("multer");
const ImageModel = require("../models/editprofile");
const UserModel = require("../models/User");



// define storage for the images
const storage = multer.diskStorage({
    // destination for image files
    destination: function (request, file, callback) {
    callback(null, './assets/uploads');
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

router.get('/returnHome', (req, res)=> {
    res.redirect("/homePost");
});

// Read
router.get('/editprofile', (req, res) => {
    // getProfilePic('', function(results) {
    //     res.render('editprofile', {data: results})
    // })

    ImageModel.findOne({user: req.user.id}, (err, results)=> {
        if(err) {
            console.log(err);
        } else {
            console.log("\n\nfindOne results: " + results + "\n\n")
            res.render('editprofile', {profileImgData: results});
        }
    });

    // UserModel.findById(req.user.id, (error, result)=> {
    //     if(error) {
    //         console.log(error);
    //     } else {
    //         console.log("\n\neditprofile READ result: " + result + "\n\n");
    //         res.render('editprofile', {data: result});
    //     }
    // });
});

// Create
router.post('/updateprofilepic', upload.single('image'), async (req, res) => {
    // console.log(req.file);

    // function user() {
        const userId = req.user.id;
    //    return userId;
    // }

    console.log("\n\neditprofile page's userId: " + userId);

    const theImage = new ImageModel({
        img: req.file.filename,
        // userid: '',
        user: userId
    });

    theImage.save();

    // ImageModel.create({
    //     img: req.file.filename,   
    //     user: userId,
    //     userid: ''
    // }, (error, result)=> {

    //     if(error) {
    //         res.send(error.message);
    //     } else {
    //         res.redirect("/editprofile");
    //     }
    // });

    // UserModel.create({
    //     img: req.file.filename,   
    //     // user: userId,
    // }, (error, result)=> {

    //     if(error) {
    //         res.send(error.message);
    //     } else {
    //         res.redirect("/editprofile");
    //     }
    // });


    // UserModel.findByIdAndUpdate({_id: req.user.id},
    //     // {profile: {
    //     //     profileimg: req.file.filename
    //     // }},
    //     {
 
    //     },
    //     (error, result)=> {
    //         if(error) {
    //             console.log(req.user.id)
    //         } else {
    //             console.log('completed');
    //             res.redirect("/editprofile");
    //         }
    //     }
    // )
    res.redirect("/editprofile");
});


// Update
router.get('/editprofile/:id', (req, res)=> {

    UserModel.findById(req.params.id, (error, result)=> {
        if(error) {
            console.log(error);
        } else {
            res.render("editprofile", {data: result});
            // res.render("header", {data: result});
        }
    });
});

router.put('/updateprofilepic/:id', (req, res)=> {
    
    UserModel.findByIdAndUpdate({_id: req.params.id},
        {$set: {
            img: req.file.filename
        }},
        (error, result)=> {
            if(error) {
                res.send(error.message);
            } else {
                res.redirect("/editprofile");
            }
        }
    );
    
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