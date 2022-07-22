//Required Packages
const mongoose = require('mongoose');
const Joi = require('joi');

//Defining Schema
const student_teacher_relation_schema = new mongoose.Schema({
    teacher_id : {
        type: mongoose.Types.ObjectId,
        ref:newTeacher,
    },
    subject_id : {
        type: mongoose.Types.ObjectId,
        ref:newSuject,
    },
    std_id: {
        type: mongoose.Types.ObjectId,
        ref:newStandard,
    }
});

//Defining Model
const studentTeacherRelationModel = mongoose.model('newRelationST', student_teacher_relation_schema, 'student-teacher-relation')

//Validation
function validateRelation(relation){
    const tempSchema = Joi.object({
        teacher_id:Joi.required(),
        subject_id:Joi.required(),
        std_id:Joi.required()
    });

    return tempSchema.validate(relation);
}

module.exports.studentTeacherRelationModel = studentTeacherRelationModel;
module.exports.validateRelation = validateRelation;