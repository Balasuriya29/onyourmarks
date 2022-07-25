//Required Packages
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require("joi");

//Defining a teacherSchema
const teacherSchema = new mongoose.Schema({
    name: String,
    degree: String,
    dob: Date,
    gender: String,
    email: String,
    phoneNo: Number,
    currentAddress: String,
    permanentAddress: String,
    motherTongue: String,
    bloodGroup: String,
    salary: Number,
    status: String
});

//Method for Token Generation
teacherSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id : this._id, role: "Teacher"}, config.get('jwtPrivateKey'));
    return token;
}

//Creating a Model
const Teacher = mongoose.model('newTeacher', teacherSchema, 'teacher');

//Validation 
function validateTeacher(teacher) {
    const tempschema = Joi.object({
        name: Joi.string().required(),
        degree:Joi.required(),
        dob: Joi.date().required(),
        gender: Joi.string().required(),
        email: Joi.string().required(),
        phoneNo: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
        currentAddress: Joi.string().required(),
        permanentAddress: Joi.string().required(),
        motherTongue: Joi.string().required(),
        bloodGroup: Joi.string().required(),
        salary: Joi.required(),
        status: Joi.required(),
        subject_id:Joi.required(),
        std_id:Joi.required()
    });

    return tempschema.validate(teacher);
}

module.exports.Teacher = Teacher;
module.exports.validateTeacher = validateTeacher;