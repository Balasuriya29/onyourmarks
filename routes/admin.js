//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const studentModel = require('../models/studentmodel');
const teacherModel = require('../models/teachermodel');
const examModel = require('../models/exammodel');
const subjectModel = require('../models/subjectmodel');
const cocurricularactivity = require('../models/cocurricularactivity');
const { ObjectID } = require('mongodb');

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

//POST APIs
router.post("/add-student",async (req, res)=>{
    const {error} = studentModel.validateStudent(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const student = new studentModel.Student(req.body);

    await student.save()
        .then((v) => {
            res.status(200).send(v);
        });
});

router.post("/add-teacher",async (req, res)=>{
    const {error} = teacherModel.validateTeacher(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const teacher = new teacherModel.Teacher(req.body);

    await teacher.save()
        .then((v) => {
            res.status(200).send(v);
        });
});

router.post("/add-exam", async (req,res) => {
    const {error} = examModel.validateExam(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const exam = new examModel.Exam(req.body);

    await exam.save()
        .then((v) => {
            res.status(200).send(v);
        });   
})

router.post("/add-subject",async (req,res)=>{
    const {error} = subjectModel.validateSubject(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const subject = new subjectModel.Subject(req.body);

    const result = await subject.save()
        .then((v)=>{
            res.status(200).send(v);
        });
});

//UPDATE APIs
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

router.put('/activity/:id',async (req,res)=>{
    const value = req.body.isVerified;
    const activity = await cocurricularactivity.coCurricularActivity.findById(req.params.id);
    console.log(activity);
    if(value === "accepted"){
        console.log('accepted');
        if(activity['status'] === 'participated'){
            console.log(activity['status']);
        await studentModel.Student.findByIdAndUpdate(activity['student_id'],{
                $inc : {
                    "cca.participated":1
                }
        })
        }
        else{
            await studentModel.Student.findByIdAndUpdate(activity['student_id'],{
                $inc : {
                    "cca.winner":1
                }
            })
        }
    }
    await cocurricularactivity.coCurricularActivity.findOneAndUpdate(
        {_id:req.params.id},
        {isVerified : req.body.isVerified}).then((v)=>{
            res.status(200).send("Activity updated");
        }
        ).catch((err)=>{
            res.send(err.message);
        })
})



//GET APIs
router.get('/Teacher/:id',async (req,res)=>{
    try{
        const teacher = await teacherModel.Teacher.findById(req.params.id);
        if(!teacher) return res.status(404).send("Teacher not found");
        res.send(teacher);
    }
    catch(err){
        res.status(400).send("Invalid id");
    }
});

router.get('/Student/:roll_no',async (req,res)=>{
    try{
        const student = await studentModel.Student.findOne({
            roll_no : req.params.roll_no
        }).populate('marks.subject_id',['sub_name']);
        console.log(student);
        if(!student) return res.status(404).send("Student not found");
        res.send(student);
    }
    catch(err){
        console.log(err);
        res.status(400).send(err);
    }
});

router.get('/get-cca/:condition', async(req,res)=>{
    var condition = "pending";
    if(req.params.condition === "accepted"){
        condition = "accepted";
    }
    else if(req.params.condition === "rejected"){
        condition = "rejected";
    }
    const cca = await cocurricularactivity.coCurricularActivity
            .find({isVerified:condition})
            .populate('student_id',['roll_no','name']);
    res.send(cca);
})

//DELETE APIs
router.delete("/Student/delete",async (req,res)=>{
    await studentModel.Student.deleteOne({
        roll_no : req.body.roll_no
    }).then((v)=>res.send("Successfully deleted"))
    .catch((err)=>res.send(err.message));
});

router.delete("/Subject/delete",async (req,res)=>{
    await subjectModel.Subject.deleteOne({
        _id: req.body.id
    }).then((v)=>res.send("Successfully deleted"))
        .catch((err)=>res.send(err));
})

router.delete("/Teacher/delete",async (req,res)=>{
    await teacherModel.Teacher.deleteOne({
        _id: req.body.id
    }).then((v)=>res.send("Successfully deleted"))
        .catch((err)=>res.send(err));
})

router.delete("/Exam/delete",async (req,res)=>{
    await examModel.Exam.deleteOne({
        _id: req.body.id
    }).then((v)=>res.send("Successfully deleted"))
        .catch((err)=>res.send(err));
})

module.exports = router;