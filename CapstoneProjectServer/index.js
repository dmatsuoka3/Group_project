require("dotenv").config();
const express =require("express");
const mongoose = require("mongoose");
const session = require("express-session")
const app = express();
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

//session 
app.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session. message;
    next();
});

//imports all the routes here
const userRoute = require("./routes/users")


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






 //routes handler 
app.use("/", userRoute)
/* app.use("", require("./routes/routes")); */





const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Bravo Team app is listening on http://localhost:${port}`))