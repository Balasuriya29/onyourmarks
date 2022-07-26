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
const auth = require('../middleware/auth');
const adminauth = require('../middleware/adminauth');

//Functions
async function isNotValidId(Model,id) {
    try {
        var doc = await Model.findOne({
            _id: id
        });
    } catch (error) {
        return true;
    }
    return doc === null;
}
async function getTeacher(id) {
    try {
        const teacherDetails = await teacherModel.Teacher
                        .findById(id);

        const teacherRelation = await student_teacher_relation.studentTeacherRelationModel
                                .find({
                                    teacher_id:id
                                });
        const teacher = [];
        teacher.push(teacherDetails);
        teacher.push(teacherRelation);
        return teacher;
    } catch (error) {
        return null;
    }
}
async function getStudent(id) {
    try {
        const student = await studentModel.Student
                        .findById(id)
                        .populate({
                                    path : 'std_id',
                                    populate : {
                                        path : 'subject_id',
                                    }
                                });
        return student;
    } catch (error) {
        return null;
    }
}

//me API
router.get("/me", auth, async (req, res) => {
    var role = req.user.role;
    const user = (role == 'Teacher')
                    ?(await getTeacher(req.user._id)).valueOf()
                    :(role == 'Student')
                        ?(await getStudent(req.user._id)).valueOf()
                        :null;

    if(user == null) return res.status(400).send("Invalid Token");

    res.status(200).send(user);
});

//POST APIs✅
router.post("/student", adminauth, async (req, res)=>{
    const {error} = studentModel.validateStudent(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const student = new studentModel.Student(req.body);
    const studentToken = student.generateAuthToken();
    await student.save()
        .then((v) => {
            res.header('x-auth-token', studentToken).status(200).send(v);
        });
});

router.post("/teacher", adminauth, async (req, res)=>{
    const {error} = teacherModel.validateTeacher(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const teacher = new teacherModel.Teacher(req.body);
    const teacherToken = teacher.generateAuthToken();
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

            res.header('x-auth-token',teacherToken).send(doc1);
        })       
    })
});

router.post("/standard", adminauth,async (req, res)=>{
    const {error} = standardModel.validateStandardSchema(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const standard = new standardModel.standardModel(req.body);

    await standard.save(async (err,doc)=>{
        if(err) return res.send(err.message);
        res.send(doc);
    })
});

router.post("/exam", adminauth,async (req,res) => {
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

router.post("/subject",adminauth,async (req,res)=>{
    const {error} = subjectModel.validateSubject(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const subject = new subjectModel.Subject(req.body);

    await subject.save()
        .then((v)=>{
            res.status(200).send(v);
        });
});

router.post('/addStandardToTeacher/:id',adminauth, async (req,res)=>{
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
router.put('/teacher-details/:id', adminauth,async (req,res) => {
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

router.put('/teacher-standard-change/:id',adminauth,async (req,res)=>{
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

router.put('/student/:id', adminauth,async (req,res) => {
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

router.put('/subject/:id', adminauth,async (req,res) => {
    var isValid = (await isNotValidId(subjectModel.Subject,req.params.id)).valueOf();
    if(isValid) return res.send("Subject ID is Invalid");

    const subjectToBeUpdated = await subjectModel.Subject.findById(req.params.id)
    subjectToBeUpdated.teacher = req.body.teacher;

    req.body.std_id.forEach( async element => {
        const studentTeacher = await student_teacher_relation.studentTeacherRelationModel({
            teacher_id:req.body.teacher,
            subject_id:req.params.id,
            std_id:element
        });
        studentTeacher
        .save()
        .catch((err) => {
            res.send(err.message).status(404);
        });
    });

    subjectToBeUpdated
    .save()
    .catch((err) => {
        res.send(err.message).status(404);
    })
    
    res.status(200).send(subjectToBeUpdated);
});

router.put('/activity/:id',adminauth,async (req,res)=>{
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

router.put('/standard/:id', adminauth,async (req,res)=>{
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
router.get('/allteachers',async (req,res) => {
    try {
        const teachers = await teacherModel.Teacher.find();
        if(!teachers) return res.status(404).send("There is no teacher found");
        res.send(teachers);

    } catch (err) {
        res.status(404).send("Unexpected Error");
    }
})

router.get('/allstudents',async (req,res) => {
    try {
        const students = await studentModel.Student
                        .find()
                        .populate({
                            path : 'std_id',
                            populate : {
                                path : 'subject_id',
                            }
                        });
        if(!students) return res.status(404).send("There is no student found");
        res.send(students);

    } catch (err) {
        res.status(404).send("Unexpected Error");
    }
})

router.get('/allsubjects',async (req,res) => {
    try {
        const subjects = await subjectModel.Subject
                        .find()
                        .populate('teacher');
        if(!subjects) return res.status(404).send("There is no subject found");
        res.send(subjects);

    } catch (err) {
        res.status(404).send("Unexpected Error");
    }
})

router.get('/allexams',async (req,res) => {
    try {
        const exams = await examModel.Exam
                        .find()
                        .populate('subjects');
        if(!exams) return res.status(404).send("There is no exam found");
        res.send(exams);

    } catch (err) {
        res.status(400).send("Unexpected Error");
    }
})

router.get('/teacher/:id',adminauth,async (req,res)=>{
    try{
        const teacher = await teacherModel.Teacher.findById(id);
        if(!teacher) return res.status(404).send("Teacher not found");
        
    }
    catch(err){
        res.status(404).send("Invalid id");
    }
});
router.get('/student/:id',adminauth,async (req,res)=>{
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

router.get('/cca/:condition', adminauth,async(req,res)=>{
    var condition = "pending";
    if(req.params.condition === "accepted"){
        condition = "accepted";
    }
    else if(req.params.condition === "rejected"){
        condition = "rejected";
    }
    const cca = await cocurricularactivity.coCurricularActivity
            .find({isVerified:condition})
            .populate('student_id',['roll_no','first_name','last_name']);
    res.send(cca);
});

router.get('/subjects/unassigned',adminauth, async(req,res)=>{
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
router.delete("/student/:id",adminauth,async (req,res)=>{
    await studentModel.Student.findByIdAndDelete(req.params.id)
    .then((v)=>res.send("Successfully deleted"))
    .catch((err)=>res.send(err.message).status(404));
});

router.delete("/subject/:id",adminauth,async (req,res)=>{
    await subjectModel.Subject.deleteOne({
        _id: req.params.id
    }).then((v)=>res.send("Successfully deleted"))
        .catch((err)=>res.send(err).status(404));
})

router.delete("/teacher/:id",adminauth,async (req,res)=>{
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

router.delete("/exam/:id",adminauth,async (req,res)=>{
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