//Required Packages
const mongoose = require('mongoose');
const joi = require("joi");

//Creating Schema
const feedback = mongoose.Schema({
    student_id : {
        type:mongoose.Types.ObjectId,
        ref:'newStudent'
    },
    teacher_ref : {
        type:mongoose.Types.ObjectId,
        ref:'newRelationST'
    },
    feedback : {
        type : Map,
        of : String
    }

});

//Creating Model
const feedback_model = mongoose.model("newFeedback",attendance,'feedback');

module.exports = {feedback, feedback_model};