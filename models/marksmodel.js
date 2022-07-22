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
})