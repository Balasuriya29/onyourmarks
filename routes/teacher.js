//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const studentModel = require('../models/studentmodel');
const marksModel = require('../models/marksmodel');
const studentTeacherRelation = require('../models/student-teacher-relation');

//POST APIs 
router.post('/marks/:id', async (req, res) => {
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
router.get('/mystudents/:id', async (req,res) => {
    const standard = [];
    const teacher = await studentTeacherRelation.studentTeacherRelationModel.find({
                        teacher_id:req.params.id,
                    });
    for (var i in teacher){
        const students = await studentModel.Student.find({
            std_id : teacher[i].std_id
        })
        .populate('std_id',['std_name'])
        .catch((err)=>{
            res.send(err.message);
        })
        standard.push(students);
    }
    res.send(standard);
    // .then((v)=>{
    //     res.send(v);
    // })

});

module.exports = router;