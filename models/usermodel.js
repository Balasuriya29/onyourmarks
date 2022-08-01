//Required Packages
const mongoose = require('mongoose');
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require('config');

//Schema Section
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    user_id: String,
    isAdmin: {type: Boolean, default: false},
    isRegistered : {type:Boolean, default:false}
});

//Method for Token Generation
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id : this.user_id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
    return token;
}

//Model Section
const user = mongoose.model('newUser',userSchema,'users');

//Validation 
function validateUser(user) {
    const tempschema = Joi.object({
        username: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(255).required(),
    });

    return tempschema.validate(user);
}


module.exports.users = user;
module.exports.userSchema = userSchema;
module.exports.validateUser = validateUser;