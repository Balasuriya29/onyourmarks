//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const studentModel = require('../models/studentmodel');
const teacherModel = require('../models/teachermodel');
const examModel = require('../models/exammodel');
const subjectModel = require('../models/subjectmodel');
const cocurricularactivity = require('../models/cocurricularactivity');
const exam_std_relation = require('../models/exam-std-relation');
const student_teacher_relation = require('../models/student-teacher-relation');
const standardModel = require('../models/standard');

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

//POST APIs✅
router.post("/student",async (req, res)=>{
    const {error} = studentModel.validateStudent(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const student = new studentModel.Student(req.body);

    await student.save()
        .then((v) => {
            res.status(200).send(v);
        });
});

router.post("/teacher",async (req, res)=>{
    const {error} = teacherModel.validateTeacher(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const teacher = new teacherModel.Teacher(req.body);

    await teacher.save(async (err,doc1)=>{
        if(err) return res.send(err.message);
        req.body.std_id.forEach(async element => {
            const studentTeacher = await student_teacher_relation.studentTeacherRelationModel({
                teacher_id : doc1._id,
                subject_id : req.body.subject_id,
                std_id : element,
            });
            studentTeacher.save(async (err,doc2)=>{
                if(err) return res.send(err.message);
            })
        })

        await subjectModel.Subject.findByIdAndUpdate(
            {
                _id : req.body.subject_id,
            },
            {
                    teacher : doc1._id,
            }
        ).then((v) => {
            res.send(doc1);
        })       
    })
});

router.post("/standard",async (req, res)=>{
    const {error} = standardModel.validateStandardSchema(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const standard = new standardModel.standardModel(req.body);

    await standard.save(async (err,doc)=>{
        if(err) return res.send(err.message);
        res.send(doc);
    })
});

router.post("/exam", async (req,res) => {
    const {error} = examModel.validateExam(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const exam = new examModel.Exam(req.body);

    await exam.save(async (err, doc1) => {
        if(err) res.send(err.message);
        const examstandard = exam_std_relation.examStandardModel({
            exam_id : doc1._id,
            std : req.body.std_id
        });
        await examstandard.save((err,doc2)=>{
            if(err) return res.send(err.message);
            res.send(doc1+"\n"+doc2);
        });
    })
});

router.post("/subject",async (req,res)=>{
    const {error} = subjectModel.validateSubject(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const subject = new subjectModel.Subject(req.body);

    await subject.save()
        .then((v)=>{
            res.status(200).send(v);
        });
});

router.post('/addStandardToTeacher/:id', async (req,res)=>{
    var isValid = (await isNotValidId(teacherModel.Teacher,req.params.id)).valueOf();
    if(isValid) return res.send("Teacher ID is Invalid");

    const newTeacherStandard = await student_teacher_relation.studentTeacherRelationModel({
        teacher_id : req.params.id,
        subject_id : req.body.subject_id,
        std_id : req.body.std_id
    });
    
    newTeacherStandard.save();
    res.send(newTeacherStandard);
});

//UPDATE APIs✅
router.put('/teacher-details/:id', async (req,res) => {
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

router.put('/teacher-standard-change/:id',async (req,res)=>{
    var isValid = (await isNotValidId(teacherModel.Teacher,req.params.id)).valueOf();
    if(isValid) return res.send("Teacher ID is Invalid");
    await student_teacher_relation.studentTeacherRelationModel.deleteOne({
        subject_id : req.body.old_subject_id,
        std_id : req.body.old_std_id,
    });
    const updatedTeacher = await student_teacher_relation.studentTeacherRelationModel({
        teacher_id : req.params.id,
        subject_id : req.body.subject_id,
        std_id : req.body.std_id
    });
    await updatedTeacher
    .save()
    .then((v)=>{
        res.send(v).status(200);
    })
    .catch((err)=>{
        res.send(err.message);
    });
})

router.put('/student/:id', async (req,res) => {
    var isValid = (await isNotValidId(studentModel.Student,req.params.id)).valueOf();
    if(isValid) return res.send("Student ID is Invalid");

    const studentToBeUpdated = await studentModel.Student.findOneAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
        }
    );
    
    res.status(200).send(studentToBeUpdated);
});

router.put('/subject/:id', async (req,res) => {
    var isValid = (await isNotValidId(subjectModel.Subject,req.params.id)).valueOf();
    if(isValid) return res.send("Subject ID is Invalid");

    const subjectToBeUpdated = await subjectModel.Subject.findById(req.params.id)
    const studentTeacher = await student_teacher_relation.studentTeacherRelationModel.findById(req.body.subject_id);
    
    subjectToBeUpdated.teacher = studentTeacher.teacher = req.body.teacher;

    studentTeacher
    .save()
    .catch((err) => {
        res.send(err.message).status(404);
    });
    subjectToBeUpdated
    .save()
    .catch((err) => {
        res.send(err.message).status(404);
    })
    
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
});

router.put('/standard/:id', async (req,res)=>{
    const standard = await standardModel.standardModel.findById(req.params.id);
    standard.std_name = req.body.std_name;
    standard.subject_id.push(...req.body.subject_id);
    standard
    .save()
    .then((v)=>{
        res.send(v).status(200);
    })
    .catch((err)=>{
        res.send(err.message);
    });
});

//GET APIs
router.get('/teacher/:id',async (req,res)=>{
    try{
        const teacher = await teacherModel.Teacher.findById(req.params.id);
        if(!teacher) return res.status(404).send("Teacher not found");
        res.send(teacher);
    }
    catch(err){
        res.status(404).send("Invalid id");
    }
});

router.get('/student/:id',async (req,res)=>{
    try{
        const student = await studentModel.Student.findById(req.params.id).populate({
            path : 'std_id',
            populate : {
                path : 'subject_id',
            }
        });
        if(!student) return res.status(404).send("Student not found");
        res.send(student);
    }
    catch(err){
        console.log(err);
        res.status(404).send(err);
    }
});

router.get('/cca/:condition', async(req,res)=>{
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
});

router.get('/subjects/unassigned', async(req,res)=>{
    await subjectModel.Subject.find({
        teacher : null
    })
    .then((v)=>{
        res.send(v).status(200);
    })
    .catch((err)=>{
        res.send(err.message).status(404);
    })
})

//DELETE APIs
router.delete("/student/:id",async (req,res)=>{
    await studentModel.Student.findByIdAndDelete(req.params.id)
    .then((v)=>res.send("Successfully deleted"))
    .catch((err)=>res.send(err.message).status(404));
});

router.delete("/subject/:id",async (req,res)=>{
    await subjectModel.Subject.deleteOne({
        _id: req.params.id
    }).then((v)=>res.send("Successfully deleted"))
        .catch((err)=>res.send(err).status(404));
})

router.delete("/teacher/:id",async (req,res)=>{
    await teacherModel.Teacher.findByIdAndUpdate(
        req.params.id,
        {
            status:"discontinued"
        },
        {
            new: true
        })
        .then(async (v) => {
            await subjectModel.Subject.updateOne(
                {
                    teacher: req.params.id
                },
                {
                    $unset:{
                        teacher:""
                    }
                }
            )
            await student_teacher_relation.studentTeacherRelationModel.deleteMany({
                teacher_id : req.params.id
            });

            res.send(v).status(200);
        })
        .catch((err)=>res.send(err).status(404));
});

router.delete("/exam/:id",async (req,res)=>{
    await examModel.Exam.deleteOne({
        _id: req.params.id
    }).then(async (v)=>{
        await exam_std_relation.examStandardModel.deleteOne({
            exam_id : req.params.id
        }).then((v)=>{
            res.send("Exam deleted successfully");
        })
    })
    .catch((err)=>res.send(err).status(404));
})

module.exports = router;