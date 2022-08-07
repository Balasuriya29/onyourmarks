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
const {Teacher} = require('../models/teachermodel');
const marksmodel = require('../models/marksmodel');
const {interestModel, validateInterests} = require('../models/interestmodel');

//Functions
function hasAuthority(role) {
    return role === 'Student';
}

//GET APIs
router.get('/mycca/:condition', auth, async(req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    (req.params.condition == 'All')
    ?await coCurricularActivity.coCurricularActivity.find ({
        student_id : req.user._id,
    }).then((v)=>{
        res.send(v);
    })
    :await coCurricularActivity.coCurricularActivity.find ({
        student_id : req.user._id,
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
        std : req.params.std_id
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
});


router.get('/mymarks',auth,async(req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    const student_id = req.user._id;
    await marksmodel.markmodel.find({
        student_id : student_id
    })
    .populate('exam_id',['exam_name'])
    .populate('subject_id',['sub_name','total_marks'])
    .then((v)=>{
        res.send(v);
    })
    .catch((err)=>{
        res.send(err.message)
    });

});

router.get('/myinterests',auth,async (req,res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");

    await interestModel.find({
        student_id : req.user._id
    })
    .then((v) => {
        res.send(v);
    })
    .catch((err) => {
        res.status(400).send(err.message);
    });
});


//POST APIs
router.post('/cca', auth, async (req,res)=>{
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    const {error1} = coCurricularActivity.validateCoCurricularActivity(req.body);
    if(error1) return res.status(404).send(error1.details[0].message);

    const ccaModel = coCurricularActivity.coCurricularActivity(req.body);
    await ccaModel.save().then((v)=>{
        res.status(200).send(v);
    });
    
});

router.put('/interests', auth, async (req, res) => {
    if(!(hasAuthority(req.user.role).valueOf())) return res.status(403).send("This is Forbidden Call for You");
    
    const {error1} = validateInterests(req.body);
    if(error1) return res.status(404).send(error1.details[0].message);

    await interestModel.updateOne({
        student_id:req.user._id
    },
        req.body,
        {
            upsert : true
        }
    )    
    .then((v) => {
        res.send(v);
    })
    .catch((err) => {
        res.status(400).send(err.message)
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