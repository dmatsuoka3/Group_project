require("dotenv").config();
const express =require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const app = express();
const logger = require("morgan");
    app.use(logger("dev"));
    app.use(express.static("public"));
    app.use(express.static("assets"));
    app.set("view engine", "ejs");
    app.use(express.json());
    app.use(express.urlencoded({extended:false}));

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

app.get("/", (req, res) => {
    res.render("home.ejs");
});

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

    //MODEL
    let ImageModel = new mongoose.model("imagesPost", imageSchema);

// Read
app.get('/', (req, res) => {

    ImageModel.find({}, (err, results)=> {
        if(err) {
            console.log(err);
        } else {
           // res.render('home.ejs');
            res.render('home.ejs', {dataImg: results});
        }
    });
});

// Create
app.post('/posts', upload.single('image'), async (req, res) => {
    console.log(req.file);

    ImageModel.create({
        caption: req.body.caption,
        img: req.file.filename,   
    }, (error, result)=> {
      if(error) {
          res.send(error.message);
      } else {
          res.redirect("/");
      }
    }
    );
});

app.get('/new', (req, res)=> {
    res.render("newPost");
});

const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Bravo Team app is listening on ${port}`));