require("dotenv").config();
const express =require("express");
const router = express.Router();
const mongoose = require("mongoose");
const session = require("express-session")
const connectEnsureLogin = require('connect-ensure-login'); // authorization
var methodOverride = require('method-override');
const app = express();
const port = process.env.PORT || 3000;
const logger = require("morgan");
    app.use(logger("dev"));
    app.use(express.static("public"));
    app.use(express.static("assets"));
    app.use(methodOverride("_method"));

    //template engine
    app.set("view engine", "ejs");
    app.use(express.static("uploads"));

    //body parser
    app.use(express.json());
    app.use(express.urlencoded({extended:false}));
    



//CONNECTION TO DATABASE
const connectDB = require("./database/connection");
connectDB();

// require("./models/Post");
// require("./models/User");

//IMPORT ALL THE ROUTE HERE
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");

//ROUTE HANDLER
app.use("", userRoute);
app.use("", postRoute);


app.listen(port, () => console.log(`Bravo Team app is listening on http://localhost:${port}`))