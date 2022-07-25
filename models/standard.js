const mongoose = require('mongoose');
const Joi = require('joi');

const standardSchema = new mongoose.Schema({
    subject_id : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'newSubject'
    }],
    std_name : String
});

const standardModel = mongoose.model('newStandard',standardSchema,'standard');

function validateStandardSchema(standard){
    const tempSchema = Joi.object({
        subject_id : Joi.required(),
        std_name : Joi.required(),
    });

    return tempSchema.validate(standard);
}

module.exports.standardModel = standardModel;
module.exports.validateStandardSchema = validateStandardSchema;