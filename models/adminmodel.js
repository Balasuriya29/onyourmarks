const mongoose = require('mongoose');
const Joi = require('joi');

const adminSchema = mongoose.Schema({
    schoolName : String,
    district_id : {
        type : mongoose.Types.ObjectId,
        ref : "newDistrict"
    },
    username : String,
    password : String
});

const district = mongoose.model('newDistrict',adminSchema,'Districts');

function validateDistrict(district){
    const tempSchema = Joi.object({
        districtName : Joi.string().required(),
        school_id : Joi.string().required(),
        state : Joi.string().required(),
    });
    return tempSchema.validate(district);
}

module.exports = {district, validateDistrict};