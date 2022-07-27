const mongoose = require('mongoose');
const Joi = require('joi');

const messageSchema = mongoose.Schema({
   message : String,
   chat_id : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "newChat"
   },
   person : String
});

const Message = mongoose.model("newMessage",messageSchema,"message");

function validateSchema (message){
    const tempschema = Joi.object({
       message : Joi.required(),
       chat_id : Joi.required(), 
       person  : Joi.string(),
    });
    return tempschema.validate(message);
}

module.exports.Message  = Message;
module.exports.validateSchema = validateSchema;