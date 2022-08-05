//Required Modules
const mongoose = require('mongoose');
const Joi = require('joi');

//Defining a Schema 
const interestSchema = mongoose.Schema({
    student_id : {
        type: mongoose.Types.ObjectId,
        ref:'newStudent'
    },
    interests : [String],
    counts : [Number]
});

//Defining a Model
const interestModel = mongoose.model('newInterests', interestSchema, 'studentInterests');

//Validating 
function validateInterests(interest) {
    const tempschema = Joi.object({
        interests : Joi.array().required(),
        counts : Joi.array().required()
    });

    return tempschema.validate(interest);
}

module.exports = {interestModel, validateInterests};