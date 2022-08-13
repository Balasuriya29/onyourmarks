//Required Packages
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const app = express();

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
const userModel = require('../models/usermodel');
const _ = require('underscore');
const crypt = require('../middleware/crypt');

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
                                })
                                .populate('subject_id')
                                .populate('std_id','std_name');
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

router.get("/role", auth, async (req, res) => {
    res.send(req.user.role);
});


//POST APIs✅
router.post("/student", adminauth, async (req, res)=>{
    const {error1} = studentModel.validateStudent(req.body);
    if(error1) return res.status(404).send(error1.details[0].message);

    const password = Math.random().toString(36).substring(2,7);
    if(app.get('env') === "development"){
        console.log(password);
    }
    const hashed = await crypt.encode(password);

    const student = new studentModel.Student(req.body);

    await student.save()
        .then(async (v1) => {
            const user = new userModel.users({
                username:v1.roll_no,
                password:hashed,
                user_id : v1._id, 
                role: "Student"
            });
            await user.save()
            .then((v2) => {
                var response = [];
                response.push(v1);
                response.push(v2);
                res.send(response);
            })
            .catch((err) => {
                res.send(err.message);
            });
        })
        .catch((err) => {
            res.send(err.message);
        });
});

router.post("/teacher", adminauth, async (req, res)=>{
    const {error1} = teacherModel.validateTeacher(req.body);
    if(error1) return res.status(404).send(error1.details[0].message);

    const password = Math.random().toString(36).substring(2,7);
    const hashed = await crypt.encode(password);

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
        });
        const user = new userModel.users({
            username:doc1.email,
            password:hashed,
            user_id: doc1._id, 
            role: "Teacher"
        });
        user.save().catch((err) => {res.send(err.message)})
        res.send(teacher);
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
        {
        _id : req.params.id
        },
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
        teacher_id : req.params.id,
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
        {
            _id: req.params.id
        },
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
    res.status(200).send("Updated All Subjects");
});

router.put('/subject-details/:id', adminauth, async (req,res) => {
    var isValid = (await isNotValidId(subjectModel.Subject,req.params.id)).valueOf();
    if(isValid) return res.send("Subject ID is Invalid");

    await subjectModel.Subject.updateOne({
        _id : req.params.id
    },
        req.body,
    {
        new:true
    })
    .then((v) => res.send(v))
    .catch((err) => res.send(err));
});

router.put('/activity/:id',adminauth,async (req,res)=>{
    const activity = await cocurricularactivity.coCurricularActivity.findById(req.params.id);
    activity.isVerified = req.body.isVerified;
    activity.save().then((v)=>{
        res.send(v);
    });
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
        if(!subjects) return res.status(404).send("There is no subject found");
        res.send(subjects);

    } catch (err) {
        res.status(404).send("Unexpected Error");
    }
})

router.get('/allexams',async (req,res) => {
    try {
        const exams = await exam_std_relation.examStandardModel
                        .find()
                        .populate({
                            path : 'exam_id',
                            populate : {
                                path : 'subjects',
                            }
                        })
                        .populate('std' , 'std_name');
        if(!exams) return res.status(404).send("There is no exam found");
        res.send(exams);

    } catch (err) {
        res.status(400).send("Unexpected Error");
    }
})

router.get('/allcca',async(req,res)=>{
    await cocurricularactivity.coCurricularActivity
    .find()
    .populate({
        path : "student_id",
        select : "roll_no first_name last_name",
        populate : {
            path : "std_id",
            select : "std_name",
        },
    })
    .then((v) => res.send(v))
    .catch((err)=>res.send(err.message));
});

router.get('/allstandards',async (req,res) => {
    try {
        const standards = await standardModel.standardModel
                        .find()
                        .populate('subject_id');
        if(!standards) return res.status(404).send("There is no standard found");
        res.send(standards);

    } catch (err) {
        res.status(400).send("Unexpected Error");
    }
})

router.get('/teacher/:id',adminauth,async (req,res)=>{
    try{
        const teacher = await teacherModel.Teacher.findById(req.params.id);
        if(!teacher) return res.status(404).send("Teacher not found");
        
        res.send(teacher);
    }
    catch(err){
        res.status(404).send("Invalid id");
    }
});

router.get('/teacher',adminauth,async(req,res)=>{
    await teacherModel.Teacher.find().then((v)=>{
        res.send(v);
    })
    .catch((err)=>{
        res.send(err.message);
    })
});


router.get('/teacher-std-sub/:id',adminauth,async (req,res)=>{
    var isValid = (await isNotValidId(teacherModel.Teacher,req.params.id)).valueOf();
    if(isValid) return res.send("Teacher ID is Invalid");
    const teacher_std_details = await student_teacher_relation.studentTeacherRelationModel.find({
        teacher_id : req.params.id
    }).populate('subject_id').populate('std_id',['std_name']);
    res.send(teacher_std_details);
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
    const subjects = await student_teacher_relation.studentTeacherRelationModel.find().select('subject_id');
    const subjectIds = [];
    subjects.forEach(async element => {
        subjectIds.push(element.subject_id);
    });

    const unassignedSubjects = await subjectModel.Subject.find(
        {
            _id : {
                $nin: subjectIds
            }
        }
    )

    res.send(unassignedSubjects);
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