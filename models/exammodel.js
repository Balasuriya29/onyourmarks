//Required Packages
const mongoose = require('mongoose');
const Joi = require('joi');

//Defining a examSchema
const examSchema = new mongoose.Schema({
    exam_name: String,
    subjects:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'subject'
    }],
});

//Creating a Model
const Exam = mongoose.model('newExam', examSchema, 'exam');

//Validation 
function validateExam(exam) {
    const tempschema = Joi.object({
        exam_name: Joi.string().required(),
        subjects: Joi.array().required(),
        marks:Joi.array().required(),
        std: Joi.required()
    });

    return tempschema.validate(exam);
}

module.exports.Exam = Exam;
module.exports.validateExam = validateExam;