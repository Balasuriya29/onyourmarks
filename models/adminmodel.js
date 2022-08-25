const mongoose = require('mongoose');
const Joi = require('joi');

const adminSchema = mongoose.Schema({
    school_id : {
        type : mongoose.Types.ObjectId,
        ref : "newSchool"
    },
    username : String,
    password : String
});

const admin = mongoose.model('newAdmin',adminSchema,'Admins');

function validateAdmin(admin){
    const tempSchema = Joi.object({
        school_id :Joi.string().required(),
        username : Joi.string().required(),
        password : Joi.string().required()
    });
    return tempSchema.validate(admin);
}

module.exports = {admin, validateAdmin};