//Required Packages
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Importing modules
const coCurricularActivity = require('../models/cocurricularactivity');
const teacher = require('../models/teachermodel');
const student = require('../models/studentmodel');


//GET APIs
router.get('/get-my-cca/:id/:condition', async(req,res)=>{
    await coCurricularActivity.coCurricularActivity.find ({
        student_id : mongoose.Types.ObjectId(req.params.id),
        isVerified : req.params.condition
    }).then((v)=>{
        res.send(v);
    });
});

router.get('/get-my-teachers/:std', async(req,res)=>{
    await teacher.Teacher.find({
        std : {
            $in : req.params.std
        }
    }).then((v)=>{
        res.send(v);
    }).catch((err)=>{
        res.send(err.message);
    })
})

const studentModel = require('../models/studentmodel');
const examModel = require('../models/exammodel');

//POST APIs
router.post('/add-cca', async (req,res)=>{
    const {error} = coCurricularActivityModel.validateCoCurricularActivity(req.body);
    if(error) return res.send(error.message);

    const ccaModel = coCurricularActivityModel.coCurricularActivity(req.body);
    await ccaModel.save().then((v)=>{
        res.status(200).send(v);
    });
    
});

//DELETE APIs
router.delete('/delete-cca/:id', async (req,res)=>{
    await coCurricularActivity.coCurricularActivity.findByIdAndDelete(req.params.id)
        .then((v)=>{
            res.send(v);
        })
        .catch((err)=>{
            res.send(err.message);
        })
});


router.put('/temp/update', async(req,res)=>{
    await student.Student.updateMany({
        cca: {
            winner : 0 ,
            participated : 0
        }
    }).then((v)=>{
        res.send('success');
    })
})


//GET APIs
router.get('/get-my-exams/:roll_no', async(req,res) => {
    const student = await studentModel.Student.find({
        roll_no : req.params.roll_no
    });
    const myClassNumber = student[0]['std'];
    await examModel.Exam.find(
        {
            std:myClassNumber
        }
    ).then((v) => {
        res.status(200).send(v);
    })
    .catch((err) => {
        res.status(400).send(`Error: ${err.message}`);
    })

});


module.exports = router;