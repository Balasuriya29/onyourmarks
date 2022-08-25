const mongoose = require('mongoose');
const Joi = require('joi');

const districtSchema = mongoose.Schema({
    districtName : String,
    school_id : {
        type : mongoose.Types.ObjectId,
        ref : "newSchool"
    },
    state : String,

});

const district = mongoose.model('newDistrict',districtSchema,'Districts');

function validateDistrict(district){
    const tempSchema = Joi.object({
        districtName : Joi.string().required(),
        school_id : Joi.string().required(),
        state : Joi.string().required(),
    });
    return tempSchema.validate(district);
}

module.exports = {district, validateDistrict};