//Required Packages
const mongoose = require('mongoose');
const Joi = require('joi');

const subStudentSchema = new mongoose.Schema({
    subject_id:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:'newSubject'
    },
    obtained : Number,
    total_marks : Number
});

//Defining Model
const subSchemaModel = mongoose.model('newSubSchema',subStudentSchema);

//Defining a studentSchema
const studentSchema = new mongoose.Schema({
    name: String,
    roll_no: String,
    std: String,
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
    marks: [{
        type:subStudentSchema,
        ref:'newSubSchema'
    }]
});


//Creating a Model
const Student = mongoose.model('newStudent', studentSchema, 'student');

//Validation 
function validateStudent(student) {
    const tempschema = Joi.object({
        name: Joi.string().required(),
        roll_no:Joi.required(),
        std: Joi.string().required(),
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
        marks: Joi.required(),
    });
    return tempschema.validate(student);
}

module.exports.Student = Student;
module.exports.validateStudent = validateStudent;