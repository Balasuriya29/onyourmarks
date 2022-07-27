const mongoose = require('mongoose');
const Joi = require('joi');

const chatSchema = mongoose.Schema({
    teacher_id :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "newTeacher"
    },
    student_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "newStudent"
    }
});

const Chat = mongoose.model("newChat",chatSchema,"chat");

function validateSchema (chat){
    const tempschema = Joi.object({
       teacher_id : Joi.required(),
       student_id : Joi.required(), 
    });
    return tempschema.validate(chat);
}

module.exports.Chat  = Chat;
module.exports.validateSchema = validateSchema;
