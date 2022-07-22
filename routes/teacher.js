//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const studentModel = require('../models/studentmodel');
const teacherModel = require('../models/teachermodel');

//UPDATE APIs - Needs Modification
// router.put('/update-teacher-std/:id', async (req,res) => {
//     if(isValidId(teacherModel.Teacher,req.params.id)) return res.send("Teacher ID is Invalid");
    

//     const teacherToBeUpdated = await teacherModel.Teacher.findOneAndUpdate(
//         req.params.id,
//         {
//             $push:{
//                 marks: {
//                     $push:{
//                         mark: req.body.mark
//                     }
//                 }
//             }
//         },
//         {
//             new: true,
//         }
//     );

//     res.status(200).send(teacherToBeUpdated);
// });

router.put('/update-marks/:id', async (req, res) => {
    const marksToBeUpdated = await studentModel.Student.findOneAndUpdate(
        req.params.id,
        {
            $push:{
                marks : req.body.marks,
            }
        },
        {
            new: true
        }
    );

    res.send(marksToBeUpdated).status(200);
});

//GET APIs
router.get('/show-my-students/:id', async (req,res) => {
    const teacher = await teacherModel.Teacher.findById(req.params.id);
    const myClassNumber = teacher['std'];
    await studentModel.Student.find(
        {
            std: {
                $in: myClassNumber
            }
        }
    ).then((v) => {
        res.status(200).send(v);
    })
    .catch((err) => {
        res.status(400).send("Error:" +err.message);
    })
});

module.exports = router;