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


//POST APIs
router.post('/add-cca', async (req,res)=>{
    const {error} = coCurricularActivity.validateSchema(req.body);
    if(error) return res.send(error.message);

    const ccaModel = coCurricularActivity.coCurricularActivity(req.body);
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



module.exports = router;