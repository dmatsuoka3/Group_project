const express = require('express');
const app = express();

const request = require('request');

const logger = require('morgan');
app.use(logger("dev"));

app.use(express.static('static'));
app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(express.static("views/img"));

require("dotenv").config();

app.get("/", (req, res)=> {
    res.render("home");
});


app.get("/home", (req, res) => {
    res.redirect("/home.ejs")
})

app.listen(3000, ()=> {
    console.log("Movie App is listening on port 3000");
});