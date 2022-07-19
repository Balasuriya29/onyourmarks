//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const studentModel = require('../models/studentmodel');

//DB UPDATE - API CALL 
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

module.exports = router;