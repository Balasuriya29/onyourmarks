//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const studentModel = require('../models/studentmodel');
const teacherModel = require('../models/teachermodel');
const examModel = require('../models/exammodel');
const subjectModel = require('../models/subjectmodel');

//Functions
async function isValidId(Model,id) {
    try {
        var doc = await Model.findOne({
            _id: id
        });
    } catch (error) {
        return false;
    }
    return true;
}

//DB POST - API CALL 
router.post("/add-student",async (req, res)=>{
    const {error} = studentModel.validateStudent(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const student = new studentModel.Student(req.body);

    await student.save()
        .then((v) => {
            res.status(200).send(v);
        });
});

//DB POST - API CALL 
router.post("/add-teacher",async (req, res)=>{
    const {error} = teacherModel.validateTeacher(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const teacher = new teacherModel.Teacher(req.body);

    await teacher.save()
        .then((v) => {
            res.status(200).send(v);
        });
});

//DB POST - API CALL 
router.post("/add-exam", async (req,res) => {
    const {error} = examModel.validateExam(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const exam = new examModel.Exam(req.body);

    await exam.save()
        .then((v) => {
            res.status(200).send(v);
        });   
})

//DB POST - API CALL 
router.post("/add-subject",async (req,res)=>{
    const {error} = subjectModel.validateSubject(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const subject = new subjectModel.Subject(req.body);

    const result = await subject.save()
        .then((v)=>{
            res.status(200).send(v);
        });
});

//DB UPDATE - API CALL 
router.put('/update-teacher/:id', async (req,res) => {
    if(isValidId(teacherModel.Teacher,req.params.id)) return res.send("Teacher ID is Invalid");

    const teacherToBeUpdated = await teacherModel.Teacher.findOneAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
        }
    );

    res.status(200).send(teacherToBeUpdated);
});

//DB UPDATE - API CALL 
router.put('/update-student', async (req,res) => {
    if(isValidId(studentModel.Student,req.params.id)) return res.send("Student ID is Invalid");

    const studentToBeUpdated = await studentModel.Student.findOneAndUpdate(
        req.body.roll_no,
        req.body,
        {
            new: true,
        }
    );
    
    res.status(200).send(studentToBeUpdated);
});

//DB UPDATE - API CALL
router.put('/update-subject/:id', async (req,res) => {
    if(isValidId(subjectModel.Subject,req.params.id)) return res.send("Subject ID is Invalid");

    const subjectToBeUpdated = await subjectModel.Subject.findOneAndUpdate(
        req.params.id,
        {
            $push:{
                students: req.body.students,
                teachers: req.body.teachers
            }
        },
        {
            new: true,
        }
    );
    
    res.status(200).send(subjectToBeUpdated);
});

module.exports = router;