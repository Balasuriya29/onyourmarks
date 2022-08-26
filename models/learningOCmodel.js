//Required Modules
const mongoose = require('mongoose');
const Joi = require('joi');

//Defining a Schema 
const learningComingStudentSchema = mongoose.Schema({
    subject_id : {
        type: mongoose.Types.ObjectId,
        ref:'newSubject'
    },
    LearningOutComes : String,
    student_id : {
        type: mongoose.Types.ObjectId,
        ref:'newStudent'
    }
});

//Defining a Model
const learningComingStudentModel = mongoose.model('newLearningComesOfStudent', learningComingStudentSchema, 'learningOutComesStudent');

//Validating 
function validateLCS(learningOutCome) {
    const tempschema = Joi.object({
        subject_id : Joi.string().required(),
        LearningOutComes : Joi.string().required(),

    });

    return tempschema.validate(learningOutCome);
}

module.exports = {learningComingStudentModel, validateLCS};
