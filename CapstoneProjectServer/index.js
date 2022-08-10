require("dotenv").config();
const express =require("express");
const mongoose = require("mongoose");
const app = express();
const logger = require("morgan");
    app.use(logger("dev"));
    app.use(express.static("public"));
    app.use(express.static("assets"));
    app.set("view engine", "ejs");
    app.use(express.json());
    app.use(express.urlencoded({extended:false}));

//CONNECTION Mongoose
const { DB, URI, DB_AUTHSOURCE, DB_PASSWORD, DB_USERNAME} = process.env;
const url = `${URI}/${DB}`;

let connectionObject = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: DB_AUTHSOURCE,
    user: DB_USERNAME,
    pass: DB_PASSWORD
};

mongoose
 .connect(url, connectionObject)
 .then(() => {console.log(`Connected to the ${DB} database`);})
 .catch((error) => console.log(`Issues connecting to the ${DB} database: ${error}`));


app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/createAccount", (req, res) => {
    res.render("createAccount.ejs")
})

app.get("/login", (req, res) => {
    res.render("login.ejs")
})




const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Bravo Team app is listening on http://localhost:${port}`))