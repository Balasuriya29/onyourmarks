//Required Packages
const mongoose = require('mongoose');
const joi = require("joi");

//Creating Schema
const attendance = mongoose.Schema({
    student_id : {
        type:mongoose.Types.ObjectId,
        ref:'newStudent'
    },
    Dates : [Date]
});

//Creating Model
const attendance_model = mongoose.model("newAttendance",attendance,'attendanceDB');

module.exports = {attendance, attendance_model};