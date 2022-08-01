const router = require("express").Router();
const {encode,decode} = require("../middleware/crypt")
const nodemailer = require('nodemailer');
const config = require('config');
const user = require("../models/usermodel");
const Joi = require('joi');
const adminauth = require('../middleware/adminauth');

// To add minutes to the current time
function AddMinutesToDate(date) {
  return date.setMinutes(date.getMinutes()+2);
}

//Request Validater
function validateUser(username) {
  const tempschema = Joi.object({
      username: Joi.string().required(),
      type: Joi.string().required(),
      email: Joi.required()
  });

  return tempschema.validate(username);
}

router.post('/email/creds', adminauth, async (req, res, next) => {
  try{
    const { error } = validateUser(req.body);
    if (error) return res.status(404).send(error.details[0].message);

    const userName = req.body.username;
    const type = req.body.type;

    let email_subject, email_message;
    if(!userName){
      const response={"Status":"Failure","Details":"Username not provided"}
      return res.status(400).send(response) 
    }
    if(!type){
      const response={"Status":"Failure","Details":"Type not provided"}
      return res.status(400).send(response) 
    }

    let User = await user.users.findOne({username: userName});
    if (!User) return res.status(404).send("User Not Found");

    const now = new Date();

    var details={
      "timestamp": now, 
      "check": userName,
      "success": true,
      "message":"Login credentials sent to user",
    }

    const password = await decode(User.password);
    
    var UserDetails = {
      "username":User.username,
      "password": password
    };

    const encoded= await encode(JSON.stringify(details));

    if(type){
      if(type=="REGISTRATION CONFIRMATION"){
        const {message, subject_mail} = require('../templates/registration_confirmation');
        email_message=message(UserDetails)
        email_subject=subject_mail
      }
      // else if(type=="FORGET"){
      //   const {message, subject_mail} = require('../temp_unused/email_forget');
      //   email_message=message(otp)
      //   email_subject=subject_mail
      // }
      // else if(type=="2FA"){
      //   const {message, subject_mail} = require('../temp_unused/email_2FA.js');
      //   email_message=message(otp)
      //   email_subject=subject_mail
      // }
      else{
        const response={"Status":"Failure","Details":"Incorrect Type Provided"}
        return res.status(400).send(response) 
      }
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: config.get('Official_Mail'),
        pass: config.get('Official_Password')
      },
    });

    const mailOptions = {
      from: `"Admin Team"<${config.get('Official_Mail')}>`,
      to: req.body.email,
      subject: email_subject,
      text: email_message ,
    };

    await transporter.verify();

    //Send Email
    await transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
          return res.status(400).send({"Status":"Failure","Details": err });
      } else {
        return res.send({"Status":"Success","Details":encoded});
      }
    });
  }
  catch(err){
    const response={"Status":"Failure","Details": err.message}
    return res.status(400).send(response)
  }
});

 
module.exports = router;
