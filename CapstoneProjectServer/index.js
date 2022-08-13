require("dotenv").config();
const express =require("express");
const mongoose = require("mongoose");
const session = require("express-session")
const app = express();
const port = process.env.PORT || 3000;
const logger = require("morgan");
    app.use(logger("dev"));
    app.use(express.static("public"));
    app.use(express.static("assets"));

    //template engine
    app.set("view engine", "ejs");
    app.use(express.static("uploads"));

    //body parser
    app.use(express.json());
    app.use(express.urlencoded({extended:false}));
    



//CONNECTION TO DATABASE
const connectDB = require("./database/connection");
connectDB();

//IMPORT ALL THE ROUTE HERE
const userRoute = require("./routes/users")

//ROUTE HANDLER
app.use("", userRoute);


app.listen(port, () => console.log(`Bravo Team app is listening on http://localhost:${port}`))