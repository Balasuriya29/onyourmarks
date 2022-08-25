const mongoose = require('mongoose');
const Joi = require('joi');

const schoolSchema = mongoose.Schema({
    "school_name":String,
    "address":String,
    "state":String,
    "city":String,
    "noOfStudents":{
        type : Number,
        default : 0
    },
    "noOfTeachers":{
        type : Number,
        default : 0
    },
})

const School = mongoose.model('newSchool', schoolSchema, 'school');

function validateSchool( school){
    const tempschema = Joi.object({
        school_name : Joi.string().required(),
        address: Joi.string().required(),
        state: Joi.string().required(),
        city:Joi.string().required(),
        noOfStudents:Joi.number(),
        noOfTeachers:Joi.number()
    });
    return tempschema.validate(school);
}


module.exports = {School,validateSchool};
