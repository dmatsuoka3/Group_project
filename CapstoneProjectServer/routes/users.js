const express = require("express");
const router = express.Router();
//connecting the model folder/schema
const User = require("../models/UserModel")
//uploading photo by requiring multer
const multer = require("multer");
const fs = require("fs");


//image upload function
let storage = multer.diskStorage({
    //takes thre arguements
    destination: function(req,res, callback){
        //takes two arguements
        callback(null, "./uploads"); //where the photos will be upload  to the uploa folder beside the database
    },
    filename: function(req, file, callback) {
        callback(null, file.filename + "_" + Date.now() + "_" + file.originalname);
    }
});

let upload = multer({
    storage: storage,  
}).single("image") //"image" is associate with the "name" and "for" on the image input fields 

//Insert an user into the database route 
router.post("/createAccount", upload, (req, res) => {
    const user = new User({ //this "User" is referring to the schema/model file above variable
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        bio: req.body.bio,
        gender: req.body.gender,
        website: req.body.website,
        password: req.body.password,
        
    });
    user.save((error) => {
        if(error) {
            res.json({message: error.message, type: "danger"})
        } else {
            req.session.message = {
                type: "success",
                message: "User added successfully"
            };
            res.redirect("/login");
        }
    });
});

//GET ALL USERS ROUTE


router.get("/", (req, res) => {
    User.find().exec((error, users) => {
     if(error) {
         res.json({message: error.message});
     } else {
         res.render("login.ejs", {
             tittle: "Home Page",
             users: users,
         })
     }
    })
 }); 
 
 router.get("/createAccount", (req, res) => {
     res.render("createAccount.ejs", {title: "Add User"})
 });
 
 //Edit users route
 
 router.get("/edit/:id", (req, res) => {
     let id = req.params.id;
     User.findById(id, (error, user) => {
         if(error) {
             res.redirect("/");
         } else {
             if(user == null) {
                 res.redirect("/");
             } else {
                 res.render("edit_users.ejs", {
                     title: "Edit User",
                     user: user,
                 });
             }
         }
     });
 });
 
 //Update user route
 
 router.post("/update/:id", upload, (req, res) =>{
     let id = req.params.id;
     let new_image = "";
 
     if(req.file) {
         new_image = req.file.filename;
         try {
             fs.unlinkSync("./uploads/" + req.body.old_image); //using name ="old_image" on line 34 of edit_users.ejs
         } catch(error) {
             console.log(error);
         }
     } else { //in case user didn't want to change image then use the old image
         new_image = req.body.old_image;
     }
     User.findByIdAndUpdate(id, {
         name: req.body.name,
         email: req.body.email,
         phone: req.body.phone,
         image: new_image //was storage in the variable on line 101/above
     }, (error, result) => {
         if(error) {
             res.json({message: error.message, type: "danger"})
         } else {
             req.session.message = {
                 type: "success",
                 message: "User updated successfully!"
             };
             res.redirect("/")
         }
     })
 });
 
 //delet user route
 
 router.get("/delete/:id", (req, res) => {
     let id = req.params.id;
     User.findByIdAndRemove(id, (error, result) =>{
         if(result.image != "") {
             try{
                 fs.unlinkSync("./uploads/" + result.image);
             } catch(error) {
                 console.log(error);
             }
         }
         if(error) {
             res.json({message: error.message})
         } else {
             req.session.message = {
                 type: "info",
                 message: "User deleted successfully!"
             };
             res.redirect("/");
         }
     });
 });
 
 
 
 module.exports = router;
 
 
 
 




module.exports = router;