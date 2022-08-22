const router = require("express").Router();
const express = require("express");
const { default: mongoose, Schema } = require("mongoose");

const multer = require("multer");


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
const ImageModel = require("../models/Post");
const UserModel = require("../models/User");


// router.get('/', (req, res)=> {
//     res.redirect('/home');
// });

// Read
router.get('/userpage', (req, res) => {

    ImageModel.find({deleted: {$nin: true}}, (err, results)=> {
        if(err) {
            console.log(err);
        } else {
            // res.render('home.ejs');
            res.render('userspage.ejs', {data: results});
        }
    }).sort({ timeCreated: 'desc' });
    
});

// Create
router.post('/posts', upload.single('image'), async (req, res) => {
    
    // const userId = req.user.id; //change this to logged -in user id

    // const user = new UserModel({
    //     _id: new mongoose.Types.ObjectId()
    // });

    const userId = req.user.id;

    console.log("\nHome page\nUsername: " + req.user.username
              + "\nUser Id: " + userId + "\n");
    const theImage = new ImageModel({
        // user: new mongoose.Types.ObjectId(),
        caption: req.body.caption,
        img: req.file.filename,
    });
    
    // theImage.save(function() {
        
        // const theImage = new ImageModel({
        //     caption: req.body.caption,
        //     img: req.file.filename,
        // });

        theImage.save(function() {
            theImage.delete(function() {
                // mongodb: {deleted: true,}
                theImage.restore(function() {
                    // mongodb: {deleted: false,}
                });
            });
        })
        //  UserModel.findOne({_id: user._id}).populate('theImage')
        //  .then(element => {
        //     res.json(element);
        //  });

        // ImageModel.findOne({ user: user._id }).
        // populate('user').
        // exec(function (err, story) {
        //     if (err) return handleError(err);
        //     // console.log('The author is %s', story.author.name);
        //      // prints "The author is Ian Fleming"
        //  });

         // UserModel.findById(userId).populate("posts");
        //  ImageModel.findOne({caption: req.body.caption})
        //  .populate('user')
        //  .exec(function(err, result){
        //      if(err) {
        //          console.log(err)
        //      } else {
        //          console.log("The user is " + result);
        //      }
        //  });
    // });
    
    // UserModel.findOne({})
    // .populate({path: 'posts', model: UserModel})
    // .exec(function(err, result){
    //     if(err) {
    //         console.log(err)
    //     } else {

    //         console.log("The result is " + result);
    //     }
    // });

    // try {
    //     const result = UserModel.findById(userId).populate({path: 'posts', select: 'caption username'});
    //     console.log("\nResult: " + result + "\n");
    // } catch(error) {
    //     console.log(error);
    // }

    // const theImage = new ImageModel({
    //     caption: req.body.caption,
    //     img: req.file.filename,
    // });
    
    // theImage.save(function() {
    //     theImage.delete(function() {
    //         // mongodb: {deleted: true,}
    //         theImage.restore(function() {
    //             // mongodb: {deleted: false,}
    //         });
    //     });
    // });

    res.redirect("/userpage");
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
                res.redirect("/userpage");
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
            res.redirect("/userpage");
        }
    });
});

module.exports = router;