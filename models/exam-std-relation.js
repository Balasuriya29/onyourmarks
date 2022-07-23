const mongoose = require('mongoose');
const Joi = require('joi');

const examStandardSchema = new mongoose.Schema({
    exam_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'newExam'
    },
    std :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'newStandard'
    },
});

const examStandardModel = mongoose.model('newExamStandard',examStandardSchema,'examstandard');

function validateSchema(examStandard){
    const tempSchema = Joi.object({
        exam_id : Joi.required(),
        std : Joi.required()
    });

    return tempSchema.validate(examStandard);
}

module.exports.examStandardModel = examStandardModel;
module.exports.validateSchema = validateSchema;