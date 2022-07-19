const mongoose = require('mongoose');
const Joi = require('joi');


const schema = mongoose.Schema({
    activity_name:String,
    activity_type:String, 
    status:String,
    startDate:Date,
    endDate:Date,
    isVerified:Boolean,
    student_id:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'newStudent'
    } 
});

const coCurricularActivity = mongoose.model('newCCA',schema,'StudentCCA');

function validateSchema(cca){
    const tempSchema = Joi.object({
        activity_name : Joi.required(),
        activity_type : Joi.required(),
        status : Joi.required(),
        startDate : Joi.date().required(),
        endDate : Joi.date().required(),
        isVerified : Joi.boolean().required(),
        student_id : Joi.required()
    });
    return tempSchema.validate(cca);
}

module.exports.coCurricularActivity = coCurricularActivity;
module.exports.validateSchema = validateSchema;