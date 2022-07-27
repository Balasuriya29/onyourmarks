//Required Packages
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Importing modules
const coCurricularActivity = require('../models/cocurricularactivity');
const student_teacher_relation =  require('../models/student-teacher-relation');
const exam_std_relation = require('../models/exam-std-relation');
const auth = require('../middleware/auth');
const chatmodel = require('../models/chatmodel');
const messagemodel = require('../models/messagemodel');
const {Teacher} = require('../models/teachermodel');

//Functions
function hasAuthority(role) {
    return role === 'Student';
}

//GET APIs
router.get('/mycca/:id/:condition', auth, async(req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    await coCurricularActivity.coCurricularActivity.find ({
        student_id : mongoose.Types.ObjectId(req.params.id),
        isVerified : req.params.condition
    }).then((v)=>{
        res.send(v);
    });
});

router.get('/myteachers/:std_id', auth, async(req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    await student_teacher_relation.studentTeacherRelationModel
    .find({
        std_id : req.params.std_id
    })
    .populate('teacher_id',['name'])
    .populate('subject_id',['sub_name', 'total_marks'])
    .then((v)=>{
        res.send(v);
    }).catch((err)=>{
        res.send(err.message);
    });
})

router.get('/myexams/:std_id', auth, async(req,res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    await exam_std_relation.examStandardModel.find({
        std_id : req.params.std_id
    })
    .populate({
        path : 'exam_id',
        populate : {
            path : 'subjects',
        }
    })
    .then((v) => {
        res.status(200).send(v);
    })
    .catch((err) => {
        res.status(400).send(`Error: ${err.message}`);
    })

});

router.get("/mychat",auth,async (req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    await chatmodel.Chat.find({
        student_id : req.user._id
    }).populate('teacher_id',["name"]).then((v)=>{
        res.send(v);
    });    
});

router.get('/teachers-without-chat',auth,async(req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    const allTeachers =  await chatmodel.Chat.find({
        student_id : req.user._id
    });
    const teacherIDs=[];
    allTeachers.forEach((ele)=>{
        teacherIDs.push(ele.teacher_id);
    });
    await Teacher.find({
        _id : {
            $nin : teacherIDs
        }
    }).then((v)=>{
        res.send(v)
    }).catch((err)=>{
        res.send(err.message);
    })
})


//POST APIs
router.post('/cca', auth, async (req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    const {error} = coCurricularActivity.validateCoCurricularActivity(req.body);
    if(error) return res.send(error.message);

    const ccaModel = coCurricularActivity.coCurricularActivity(req.body);
    await ccaModel.save().then((v)=>{
        res.status(200).send(v);
    });
    
});

//DELETE APIs
router.delete('/cca/:id', auth, async (req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    await coCurricularActivity.coCurricularActivity.findByIdAndDelete(req.params.id)
        .then((v)=>{
            res.send(v);
        })
        .catch((err)=>{
            res.send(err.message);
        })
});


module.exports = router;