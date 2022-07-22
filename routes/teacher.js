//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const studentModel = require('../models/studentmodel');
const marksModel = require('../models/marksmodel');

//POST APIs 
router.post('/marks/:id', async (req, res) => {
    const {error} = marksModel.validateMark(req.body);
    if(error) return res.send(error.details[0].message);
    await marksModel.markmodel(req.body)
    .then((v)=>{
        res.send(v).status(200);
    })
    .catch((err)=>{
        res.send(err.message);
    })
});

//GET APIs
router.get('/mystudents/:std_id', async (req,res) => {
    await studentModel.Student.find({
        std_id : req.params.std_id
    })
    .populate('std_id',['std_name'])
    .then((v)=>{
        res.send(v);
    })
    .catch((err)=>{
        res.send(err.message);
    })

});

module.exports = router;