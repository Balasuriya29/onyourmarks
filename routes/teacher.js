//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const studentModel = require('../models/studentmodel');
const marksModel = require('../models/marksmodel');
const studentTeacherRelation = require('../models/student-teacher-relation');
const auth = require('../middleware/auth');
const chatmodel = require('../models/chatmodel');
const messagemodel = require('../models/messagemodel');
const { examStandardModel } = require('../models/exam-std-relation');
const { attendance_model } = require('../models/attendancemodel');
const { homeworkmodel } = require('../models/homeworkmodel');
const { learningComingStudentModel } = require('../models/learningOCmodel');
const { coCurricularActivity } = require('../models/cocurricularactivity');

//Functions
function hasAuthority(role) {
    return role === 'Teacher';
}

//POST APIs 
router.post('/marks/:id', auth,async (req, res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    const {error} = marksModel.validateMark({
        student_id : req.params.id,
        exam_id : req.body.exam_id,
        subject_id:req.body.subject_id,
        obtained: req.body.obtained
    });

    if(error) return res.send(error.details[0].message);

    await marksModel.markmodel.updateOne({
        student_id : req.params.id,
        exam_id : req.body.exam_id,
        subject_id:req.body.subject_id,
    },
    {
        obtained : req.body.obtained
    },
    {
        upsert:true,
    }).then((v)=>{
        res.send(v)
    })
    .catch((err)=>{
        res.send(err.message);
    })
});

router.post('/add-student-attendance/:id',auth, async (req, res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");

    await attendance_model.updateOne({
        student_id : req.params.id
    },
    {
        $push : {
            Dates : req.body.Dates
        }
    },
    {
        upsert : true
    }).then((v) => {
        res.send(v);
    })
    .catch((err) => {
        res.status(400).send(err.message);
    });
});

router.post('/remove-student-attendance/:id',auth, async (req, res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");

    await attendance_model.updateOne({
        student_id : req.params.id
    },
    {
        $pull : {
            Dates : req.body.Dates
        }
    },
    {
        upsert : true
    }).then((v) => {
        res.send(v);
    })
    .catch((err) => {
        res.status(400).send(err.message);
    });
});

router.post('/homework', auth, async (req,res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");

    await homeworkmodel.updateOne({
        subject : req.body.subject,
        std_id : req.body.std_id
    },
    {
        title : req.body.title,
        description : req.body.description,
        teacher_id : req.user._id,
        date : Date.now()
    },
    {
        upsert : true
    }).then((v) => {
        res.send(v);
    })
    .catch((err) => {
        res.status(400).send(err.message);
    });
});

router.post('/lcOfStudent', auth, async (req, res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");

    await learningComingStudentModel(req.body)
    .then((v) => {
        res.send(v);    
    }).catch((err) => {
        res.send(err.message);
    });
})

//GET APIs
router.get('/all-homeworks', auth, async (req, res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    
    const teacherstdrelation = await studentTeacherRelation.studentTeacherRelationModel
    .find({
        teacher_id:req.user._id
    })
    .select("std_id");
    
    const stds = []
    teacherstdrelation.forEach(std => {
        stds.push(std["std_id"]);
    });

    await homeworkmodel
    .find({
        std_id : {
            $in : stds
        }
    })
    .populate('teacher_id','name')
    .populate('std_id','std_name')
    .then((v)=>{
        res.send(v);
    })
    .catch((err) => {
        res.send(err.message);
    })
});

router.get('/student-attendance/:id',auth, async (req, res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");

    await attendance_model.find({
        std_id : req.params.id
    })
    .populate('student_id', 'first_name last_name')
    .populate('std_id', 'std_name')
    .then((v) => {
        res.send(v);
    })
    .catch((err) => {
        res.status(400).send(err.message);
    });
});

router.get('/mystudents/:std_id',auth, async (req,res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");

    const standard = [];
    const teacher = (req.params.std_id == "All")
    ?await studentTeacherRelation.studentTeacherRelationModel.find({
        teacher_id:req.user._id,
    })
    :await studentTeacherRelation.studentTeacherRelationModel.find({
        teacher_id:req.user._id,
        std_id: req.params.std_id
    });
    for (var i in teacher){
        const students = await studentModel.Student.find({
            std_id : teacher[i].std_id
        },
        'first_name last_name roll_no'
        )
        .populate('std_id',['std_name'])

        .catch((err)=>{
            res.send(err.message);
        })
        standard.push(students);
    }
    
    res.send(standard);
});

router.get('/studentsmarks/:exam_id/:subject_id', auth , async(req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    const students = await marksModel.markmodel.find({
        exam_id: req.params.exam_id,
        subject_id: req.params.subject_id
    },
    'obtained student_id'
    );

    res.send(students);
})

router.get('/getexams', auth, async(req, res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    const exams = []
    const teacher = await studentTeacherRelation.studentTeacherRelationModel.find({
        teacher_id:req.user._id,
    });
    for (var i in teacher){
        // console.log(teacher[i].std_id)
        var exam = await examStandardModel.find({
            std : teacher[i].std_id
        })
        .populate({
            path : 'exam_id',
            populate : {
                path: 'subjects'
            }
        })
        .populate('std')
        .catch((err)=>{
            res.send(err.message);
        })

        console.log(exam);
        if(exam) exams.push(exam);
    }
    res.send(exams);
});

router.get("/mychat",auth,async (req,res)=>{
    await chatmodel.Chat.find({
        teacher_id : req.user._id
    }).populate('student_id',["first_name","last_name"]).then((v)=>{
        res.send(v);
    });    
});

router.get('/students-without-chat',auth,async(req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    const allStudents =  await chatmodel.Chat.find({
        teacher_id : req.user._id
    });
    const studentIDs=[];
    allStudents.forEach((ele)=>{
        studentIDs.push(ele.student_id);
    });
    await studentModel.Student.find({
        _id : {
            $nin : studentIDs
        }
    }).then((v)=>{
        res.send(v)
    }).catch((err)=>{
        res.send(err.message);
    })
});

router.get('/student-dashboard/:id', auth, async(req,res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    var studentDashboardDetails = [];
    const student = await studentModel.Student
                    .findById(req.params.id)
                    .populate({
                                path : 'std_id',
                                populate : {
                                    path : 'subject_id',
                                }
                            });
    const studentMarks = await marksModel.markmodel.find({
                            student_id : req.params.id
                         })
                         .populate('exam_id',['exam_name', 'dates'])
                         .populate('subject_id',['sub_name','total_marks']);
    const studentActivities = await coCurricularActivity.find ({
        student_id : req.params.id,
    });

    studentDashboardDetails.push(student);
    studentDashboardDetails.push(studentMarks); 
    studentDashboardDetails.push(studentActivities);

    res.status(200).send(studentDashboardDetails);
}); 

module.exports = router;