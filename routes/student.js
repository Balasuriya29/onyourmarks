//Required Packages
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Required Modules
const coCurricularActivityModel = require('../models/cocurricularactivity');
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