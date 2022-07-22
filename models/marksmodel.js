//Required Packages
const mongoose = require('mongoose');
const Joi = require('joi');

//Defining Schema
const markSchema = new mongoose.Schema({
    student_id:{
        type: mongoose.Types.ObjectId,
        ref: newStudent
    },
    exam_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"newExam"
    },
    obtained : Number,
    subject_id:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:'newSubject'
    },
});

const markmodel = mongoose.model('newMarks',markSchema,'marks');

function validateMark(mark){
    const tempSchema = Joi.object({
        student_id : Joi.required(),
        exam_id : Joi.required(),
        subject_id : Joi.required(),
        obtained : Joi.number(),
    });

    return tempSchema.validate(mark);
}

module.exports.markSchema = markSchema;
module.exports.validateMark = validateMark;