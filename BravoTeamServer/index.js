require("dotenv").config();
const express =require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const multer = require("multer");
const app = express();
const logger = require("morgan");
const e = require("express");
    app.use(methodOverride("_method"));
    app.use(logger("dev"));
    app.use(express.static("public"));
    app.use(express.static("assets"));
    app.set("view engine", "ejs");
    app.use(express.json());
    app.use(express.urlencoded({extended:false}));

var mongoose_delete = require('mongoose-delete');

//CONNECTION Mongoose
const { DB, URI } = process.env;

const url = `${URI}/${DB}`;

let connectionObject = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
    user: "acc",
    pass: "acc_rocks_2020",
};

mongoose
 .connect(url, connectionObject)
 //PROMISES TO GET CONFIRMATION THAT IT WORKS
 .then(() => {console.log(`Connected to the ${DB} database`);})
 .catch((error) => console.log(`Issues connecting to the ${DB} database: ${error}`));

// define storage for the images
const storage = multer.diskStorage({
    // destination for files
    destination: function (request, file, callback) {
      callback(null, './public/uploads/images');
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

// app.get("/", (req, res) => {
//     res.render("home.ejs");
// });

app.get("/createAccount", (req, res) => {
    res.render("createAccount.ejs")
})


//BLUEPRINT
    //SCHEMA
    let imageSchema = new mongoose.Schema({
        caption: {
            type: String,
        },
        timeCreated: {
            type: Date,
            default: () => Date.now(),
        },
        snippet: {
            type: String,
        },
        img: {
            type: String,
            default: 'placeholder.jpg',
        }
    });

    imageSchema.plugin(mongoose_delete);

    //MODEL
    let ImageModel = new mongoose.model("imagesPost", imageSchema);

app.get('/', (req, res)=> {
    res.redirect('/home');
});

// Read
app.get('/home', (req, res) => {

    ImageModel.find({deleted: {$nin: true}}, (err, results)=> {
        if(err) {
            console.log(err);
        } else {
            // res.render('home.ejs');
            res.render('home', {data: results});
        }
    }).sort({ timeCreated: 'desc' });
    
    // ImageModel.find({}, (err, results)=> {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //        // res.render('home.ejs');
    //         res.render('home', {data: results});
    //     }
    // }).sort({ timeCreated: 'desc' });
});

// Create
app.post('/posts', upload.single('image'), async (req, res) => {
    console.log(req.file);

    const theImage = new ImageModel({
        caption: req.body.caption,
        img: req.file.filename,
    });

    theImage.save(function() {
        theImage.delete(function() {
            theImage.restore(function() {
                // mongodb: {deleted: false,}
            });
        });
    });

    res.redirect("/");
    // ImageModel.create({
    //     caption: req.body.caption,
    //     img: req.file.filename,   
    // }, 
    //     (error, result)=> {
        
    //     // delete(function() {
    //     //     restore(function() {

    //     //     })
    //     // });

    //     if(error) {
    //         res.send(error.message);
    //     } else {
    //         res.redirect("/");
    //     }
    //     }

    // );
});

app.get('/new', (req, res)=> {
    res.render("newPost");
});

// Update
app.get('/update/:id', (req, res)=> {

    ImageModel.findById(req.params.id, (error, result)=> {
        if(error) {
            console.log(error);
        } else {
            // console.log("Result: " + result);
            res.render("updatePost", {data: result});
        }
    });
});

app.put('/update/:id', (req, res)=> {

    // let updateId = req.params.id;
    // let updateCaption = req.body.caption;
    
    ImageModel.findByIdAndUpdate({_id: req.params.id},
         {caption: req.body.caption},
        (error, result)=> {
            if(error) {
                res.send(error.message);
            } else {
                // res.redirect(`/update/${result._id}`);
                res.redirect("/");
            }
        }
    );
});

// Delete
// app.get('/home/:id', (req, res)=> {
//     ImageModel.findByIdAndDelete(req.params.id, (error, result)=> {
//         if(error) {
//             console.log("Something went wrong delete from database");
//         } else {
//             console.log("This post has been deleted", result);
//             res.redirect("/");
//         }
//     });
// });

app.get('/home/:id', (req, res)=> {
    ImageModel.deleteById(req.params.id, (error, result)=> {
        if(error) {
            console.log("Something went wrong delete from database");
        } else {
            console.log("This post has been deleted", result);
            res.redirect("/");
        }
    });
});


const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Bravo Team app is listening on ${port}`));