const express = require('express');
const router = express.Router();
const studentModel = require('../models/studentmodel');
const teacherModel = require('../models/teachermodel');
const examModel = require('../models/exammodel');

//DB POST - API CALL 1
router.post("/Student/add",async (req, res)=>{
    const {error} = studentModel.validateStudent(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const student = new studentModel.Student(req.body);

    await student.save()
        .then((v) => {
            res.status(200).send(v);
        });
});

//DB POST - API CALL 2
router.post("/Teacher/add",async (req, res)=>{
    const {error} = teacherModel.validateTeacher(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const teacher = new teacherModel.Teacher(req.body);

    await teacher.save()
        .then((v) => {
            res.status(200).send(v);
        });
});

//DB GET - API CALL 3
router.get("/getAll", async (req,res) => {

});

//DB POST - API CALL 4
router.post("/Exam/add", async (req,res) => {
    const {error} = examModel.validateExam(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const exam = new examModel.Exam(req.body);

    await exam.save()
        .then((v) => {
            res.status(200).send(v);
        });   
})

module.exports = router;