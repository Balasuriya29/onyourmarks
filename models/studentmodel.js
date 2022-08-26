//Required Packages
const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

//Defining a studentSchema
const studentSchema = new mongoose.Schema({
    first_name: String,
    last_name : String,
    roll_no: String,
    std_id: {
        type: mongoose.Types.ObjectId,
        ref: 'newStandard'
    },
    dob: Date,
    gender: String,
    parent1name: String,
    parent2name: String,
    occupation: String,
    income: Number, 
    email: String,
    phoneNo: Number,
    currentAddress: String,
    permanentAddress: String,
    motherTongue: String,
    bloodGroup: String,
    school_id:{
        type: mongoose.Types.ObjectId,
        ref : 'newSchool'
    }
});

//Method for Token Generation
studentSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id : this._id, role: "Student"}, config.get('jwtPrivateKey'));
    return token;
}

//Creating a Model
const Student = mongoose.model('newStudent', studentSchema, 'student');

//Validation 
function validateStudent(student) {
    const tempschema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        roll_no:Joi.required(),
        std_id: Joi.required(),
        dob: Joi.date().required(),
        gender: Joi.string().required(),
        parent1name: Joi.string().required(),
        parent2name: Joi.string().required(),
        occupation: Joi.string().required(),
        income: Joi.number().required(), 
        email: Joi.string().required(),
        phoneNo: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
        currentAddress: Joi.string().required(),
        permanentAddress: Joi.string().required(),
        motherTongue: Joi.string().required(),
        bloodGroup: Joi.string().required(),
    });
    return tempschema.validate(student);
}

module.exports.Student = Student;
module.exports.validateStudent = validateStudent;