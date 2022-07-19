const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


const coCurricularActivity = require('../models/cocurricularactivity');


router.post('/add-cca', async (req,res)=>{
    const {error} = coCurricularActivity.validateSchema(req.body);
    if(error) return res.send(error.message);

    const ccaModel = coCurricularActivity.coCurricularActivity(req.body);
    await ccaModel.save().then((v)=>{
        res.status(200).send(v);
    });
    
});


module.exports = router;