//Required Packages
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoose_morgan = require('mongoose-morgan');
const config = require('config');

//Importing Files
const connection = require('./connection');
const admin = require('./routes/admin');
const student = require('./routes/student');

//Connection to MongoDB
const connectionString = `mongodb+srv://${config.get('DBUserName')}:${config.get('DBPassword')}@cluster0.dfr13.mongodb.net/OnYourMarks?retryWrites=true&w=majority`;
connection.connectDB(connectionString,"OnYourMarks");

//Setting certain packages
const app = express();
app.use(express.json());
app.use(helmet())
app.use(mongoose_morgan({
  collection: 'logs',
  connectionString: connectionString,
 },{},
 'common'
));
app.use(helmet());

// console.log(app.get('env'));

if(app.get('env') === "development"){
  app.use(mongoose_morgan({
    collection: 'logs',
    connectionString: connectionString,
   },{},
   'common'
  ));
}

app.use('/api/admin', admin);

// Student router
app.use('/api/student',student);

//Default Route
app.get("/", (req,res) => {
    res.status(200).send("Everything is Working Perfectly!!!");
});

//Starting Listening
const PORT = process.env.PORT || 80;
app.listen(PORT,() => console.log(`Listening at ${PORT}`))