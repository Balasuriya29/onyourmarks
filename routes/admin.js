//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const studentModel = require('../models/studentmodel');
const teacherModel = require('../models/teachermodel');
const examModel = require('../models/exammodel');
const subjectModel = require('../models/subjectmodel');
const cocurricularactivity = require('../models/cocurricularactivity');

//Functions
async function isNotValidId(Model,id) {
    try {
        var doc = await Model.findOne({
            _id: id
        });
    } catch (error) {
        console.log("Catch")
        return true;
    }
    return doc === null;
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

    await exam.save(async (err, doc) => {
        if(err) res.send(err.message);
        await studentModel.Student.updateMany(
            {
                std: req.body.std
            },
            {
                $push:{
                    marks:{
                        exam_id:doc._id,
                        mark: []
                    }
                }
            }
        )

        res.send(doc);
    })
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
    var isValid = (await isNotValidId(teacherModel.Teacher,req.params.id)).valueOf();
    if(isValid) return res.send("Teacher ID is Invalid");

    const teacherToBeUpdated = await teacherModel.Teacher.findOneAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
        }
    );

    res.status(200).send(teacherToBeUpdated);
});

router.put('/update-teacher-std/:id', async (req,res) => {
    var isValid = (await isNotValidId(teacherModel.Teacher,req.params.id)).valueOf();
    if(isValid) return res.send("Teacher ID is Invalid");

    const teacherToBeUpdated = await teacherModel.Teacher.findById(req.params.id);

    var arrays = teacherToBeUpdated.std.get(req.body.std);

    if(arrays === undefined){
        arrays = new Array(0);
    }

    if(!arrays.includes(req.body.section)){
        arrays.push(req.body.section);
        teacherToBeUpdated.std.set(req.body.std, arrays);
    }

    teacherToBeUpdated.save().then((v) => {
        res.status(200).send(v);
    })
});

router.put('/update-student', async (req,res) => {
    var isValid = (await isNotValidId(teacherModel.Teacher,req.params.id)).valueOf();
    if(isValid) return res.send("Student ID is Invalid");

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
    var isValid = (await isNotValidId(teacherModel.Teacher,req.params.id)).valueOf();
    if(isValid) return res.send("Subject ID is Invalid");

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

//GET APIs
router.get('/get-teacher/:id',async (req,res)=>{
    try{
        const teacher = await teacherModel.Teacher.findById(req.params.id);
        if(!teacher) return res.status(404).send("Teacher not found");
        res.send(teacher);
    }
    catch(err){
        res.status(400).send("Invalid id");
    }
});

router.get('/get-student/:roll_no',async (req,res)=>{
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
    var condition = false;
    if(req.params.condition === "true"){
        condition = true;
    }
    const cca = await cocurricularactivity.coCurricularActivity
            .find({isVerified:condition})
            .populate('student_id',['roll_no','name']);
    res.send(cca);
})

//DELETE APIs
router.delete("/delete-student",async (req,res)=>{
    await studentModel.Student.deleteOne({
        roll_no : req.body.roll_no
    }).then((v)=>res.send("Successfully deleted"))
    .catch((err)=>res.send(err.message));
});

router.delete("/delete-subject",async (req,res)=>{
    await subjectModel.Subject.deleteOne({
        _id: req.body.id
    }).then((v)=>res.send("Successfully deleted"))
        .catch((err)=>res.send(err));
})

router.delete("/delete-teacher",async (req,res)=>{
    await teacherModel.Teacher.deleteOne({
        _id: req.body.id
    }).then((v)=>res.send("Successfully deleted"))
        .catch((err)=>res.send(err));
})

router.delete("/delete-exam",async (req,res)=>{
    await examModel.Exam.deleteOne({
        _id: req.body.id
    }).then((v)=>res.send("Successfully deleted"))
        .catch((err)=>res.send(err));
})

module.exports = router;