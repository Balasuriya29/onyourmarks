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
    const markToBeUpdated = await marksModel.markmodel({
        student_id : req.params.id,
        exam_id : req.body.exam_id,
        subject_id:req.body.subject_id,
        obtained: req.body.obtained
    })
    markToBeUpdated.save()
    .then((v)=>{
        res.send(v).status(200);
    })
    .catch((err)=>{
        res.send(err.message);
    })
});

//GET APIs
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
})

module.exports = router;