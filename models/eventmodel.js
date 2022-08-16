const mongoose = require('mongoose');
const Joi = require('joi');

const eventSchema = new mongoose.Schema({
    event_name : String,
    event_description : String,
    banner_img_url : Uint8Array,
    start_date : Date,
    end_date : Date,
});

const Event = mongoose.model('newEvent',eventSchema,"event");

function validateEvent(event) {
    const tempschema = Joi.object({
        event_name: Joi.string().required(),
        event_description: Joi.string().required(),
        banner_img_url:Joi.required(),
        start_date:Joi.date().required(),
        end_date:Joi.date().required(),
    });

    return tempschema.validate(event);
}

module.exports.Event = Event;
module.exports.validateEvent = validateEvent;