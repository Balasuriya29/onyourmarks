//Required Modules
const mongoose = require('mongoose');
const Joi = require('joi');

//Defining a Schema 
const learningComingSchema = mongoose.Schema({
    subject_id : {
        type: mongoose.Types.ObjectId,
        ref:'newSuject'
    },
    LearningOutComes : [String]
});

//Defining a Model
const learningComingModel = mongoose.model('newLearningComes', learningComingSchema, 'learningOutComes');

//Validating 
function validateLC(learningOutCome) {
    const tempschema = Joi.object({
        subject_id : Joi.string().required(),
        LearningOutComes : Joi.array().required()
    });

    return tempschema.validate(learningOutCome);
}

module.exports = {learningComingModel, validateLC};
