//Required Packages
const mongoose = require('mongoose');
const Joi = require('joi');

//Defining a Schema
const homeworkschema = mongoose.Schema({
    title : String,
    description : String,
    subject : String,
    teacher_id : {
        type : mongoose.Types.ObjectId,
        ref : "newTeacher"
    },
    std_id : {
        type : mongoose.Types.ObjectId,
        ref : "newStandard"
    },
    date : Date
});

//Defining a Model
const homeworkmodel = mongoose.model('newHomeWork',homeworkschema,'homeworks');

//Validating 
function validateHomeWork(homework) {
    const tempschema = Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        subject : Joi.string().required(),
        teacher_id : Joi.string().required(),
        std_id : Joi.string().required(),
    });

    return tempschema.validate(homework);
}

module.exports = {homeworkmodel, validateHomeWork};
