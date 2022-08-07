//Required Packages
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const helmet = require('helmet');
const mongoose_morgan = require('mongoose-morgan');
const config = require('config');
const cors = require('cors');
const expressListRoutes = require('express-list-routes');
const {spawn} = require('child_process');

//Importing Files
const connection = require('./connection');
const admin = require('./routes/admin');
const teacher = require('./routes/teacher')
const student = require('./routes/student');
const chat = require('./routes/chat');
const user = require('./routes/user');
const verification = require('./routes/verification');

//Check for jwtPrivateKey
if(!config.get('jwtPrivateKey')){
  console.log(config.get('jwtPrivateKey'))
  console.error('FATAL ERROR: jwtPrivateKey is not defined');
  process.exit(1);
}




//Connection to MongoDB
const connectionString = `mongodb+srv://${config.get('DBUserName')}:${config.get('DBPassword')}@cluster0.dfr13.mongodb.net/OnYourMarks?retryWrites=true&w=majority`;
connection.connectDB(connectionString,"OnYourMarks");

//Setting certain packages
const app = express();
app.use(express.json());
app.use(helmet());
var corsOption = {
  origin: "*",
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization,x-auth-token',
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

if(app.get('env') === "development"){
  app.use(mongoose_morgan({
    collection: 'logs',
    connectionString: connectionString,
   },{},
   'common'
  ));
}


app.get('/python', (req, res) => {
  console.log("In Python");
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn('python', ['main.py','node.js','python']);
  // collect data from script
  python.stdout.on('data', function (data) {
   console.log('Pipe data from python script ...');
   dataToSend = data.toString();
  });
  // in close event we are sure that stream from child process is closed
  python.on('close', (code) => {
  console.log(`child process close all stdio with code ${code}`);
  // send data to browser
  res.send(dataToSend)
  });
  
 })

app.use('/api/admin', admin);
app.use('/api/teacher', teacher);
app.use('/api/student',student);
app.use('/api/chat',chat);
app.use('/api/user',user);
app.use('/api/verification',verification);

//Default Route
app.options('/', cors()) 
app.get("/",(req,res) => {
    expressListRoutes(app, { prefix: '/api/admin' });
    res.status(200).send("Everything is Working Perfectly!!!")
});



//Starting Listening
const PORT = process.env.PORT || 80;
app.listen(PORT,() => console.log(`Listening at ${PORT}`))