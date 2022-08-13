const mongoose = require('mongoose')

const connectDB = async() => {

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
}

 module.exports = connectDB;