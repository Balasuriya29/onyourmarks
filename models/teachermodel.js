//Required Packages
const mongoose = require('mongoose');
const Joi = require("joi");

//Defining a adminSchema
const teacherSchema = new mongoose.Schema({
    name: String,
    std: String,
    dob: Date,
    gender: String,
    email: String,
    phoneNo: Number,
    currentAddress: String,
    permanentAddress: String,
    motherTongue: String,
    bloodGroup: String,
    salary: Number,
});

//Creating a Model
const Teacher = mongoose.model('newTeacher', teacherSchema, 'teacher');

//Validation 
function validateTeacher(teacher) {
    const tempschema = Joi.object({
        name: Joi.string().required(),
        std: Joi.string().required(),
        dob: Joi.date().required(),
        gender: Joi.string().required(),
        email: Joi.string().required(),
        phoneNo: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
        currentAddress: Joi.string().required(),
        permanentAddress: Joi.string().required(),
        motherTongue: Joi.string().required(),
        bloodGroup: Joi.string().required(),
        salary: Joi.required(),
    });

    return tempschema.validate(teacher);
}

module.exports.Teacher = Teacher;
module.exports.validateTeacher = validateTeacher;