//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const { validateSchool, School } = require('../models/schoolmodel');
const { validateAdmin, admin } = require('../models/adminmodel');
const { validateDistrict, district } = require('../models/districtmodel');

router.post('/school', async (req,res) => {
    const {error} = validateSchool(req.body);
    if(error){
        res.send(error.details[0].message);
        return;
    }
    const school = await School(req.body);
    await school.save()
    .then((v)=>{
        res.send(v);
    })
    .catch((err)=>{
        res.send(err.message);
    })
});

router.post('/admin', async (req,res) => {
    const {error} = validateAdmin(req.body);
    if(error){
        res.send(error.details[0].message);
        return;
    }
    const adminUser = await admin(req.body);
    await adminUser.save()
    .then((v)=>{
        res.send(v);
    })
    .catch((err)=>{
        res.send(err.message);
    })
});

router.post('/district', async (req,res) => {
    const {error} = validateDistrict(req.body);
    if(error){
        res.send(error.details[0].message);
        return;
    }
    const newDistrict = await district(req.body);
    await newDistrict.save()
    .then((v)=>{
        res.send(v);
    })
    .catch((err)=>{
        res.send(err.message);
    })
});

router.get('/district', async (req,res)=>{
    const allDistricts = await district.find();
    res.send(allDistricts);
});

// router.get('/school', async (req,res)=>{
//     const all = await district.find();
//     res.send(allDistricts);
// });

module.exports = router;