//Required Package
const mongoose = require('mongoose');

//Starting Connection
function connectDB(dbString, db){
    mongoose.connect(dbString)
    .then((result) => console.log(`Connected to MongoDB:${db}`))
    .catch(err => console.error(`Could not connect to MongoDB: ${err}`));
}

module.exports.connectDB = connectDB;