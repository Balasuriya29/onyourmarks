const express = require('express');
const router = express.Router();
const studentModel = require('../models/studentmodel');
const teacherModel = require('../models/teachermodel');
<<<<<<< HEAD
const examModel = require('../models/exammodel');
=======
const subjectModel = require('../models/subjectmodel');
>>>>>>> 04d80cc032278e2361624303636614d66e85826d

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
<<<<<<< HEAD
router.post("/Exam/add", async (req,res) => {
    const {error} = examModel.validateExam(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const exam = new examModel.Exam(req.body);

    await exam.save()
        .then((v) => {
            res.status(200).send(v);
        });   
})
=======
router.post("/Subject/add",async (req,res)=>{
    const {error} = subjectModel.validateSubject(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const subject = new subjectModel.Subject(req.body);

    const result = await subject.save()
        .then((v)=>{
            res.status(200).send(v);
        });
});

>>>>>>> 04d80cc032278e2361624303636614d66e85826d

module.exports = router;