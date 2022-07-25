//Required Packages
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Importing modules
const coCurricularActivity = require('../models/cocurricularactivity');
const student_teacher_relation =  require('../models/student-teacher-relation');
const exam_std_relation = require('../models/exam-std-relation');


//GET APIs
router.get('/mycca/:id/:condition', async(req,res)=>{
    await coCurricularActivity.coCurricularActivity.find ({
        student_id : mongoose.Types.ObjectId(req.params.id),
        isVerified : req.params.condition
    }).then((v)=>{
        res.send(v);
    });
});

router.get('/myteachers/:std_id', async(req,res)=>{
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

router.get('/myexams/:std_id', async(req,res) => {
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

//POST APIs
router.post('/cca', async (req,res)=>{
    const {error} = coCurricularActivity.validateCoCurricularActivity(req.body);
    if(error) return res.send(error.message);

    const ccaModel = coCurricularActivity.coCurricularActivity(req.body);
    await ccaModel.save().then((v)=>{
        res.status(200).send(v);
    });
    
});

//DELETE APIs
router.delete('/cca/:id', async (req,res)=>{
    await coCurricularActivity.coCurricularActivity.findByIdAndDelete(req.params.id)
        .then((v)=>{
            res.send(v);
        })
        .catch((err)=>{
            res.send(err.message);
        })
});

module.exports = router;