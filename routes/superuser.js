//Required Packages
const express = require('express');
const router = express.Router();

//Required Modules
const { validateSchool, School } = require('../models/schoolmodel');
const { validateAdmin, admin } = require('../models/adminmodel');
const { validateDistrict, district } = require('../models/districtmodel');
const { Student } = require('../models/studentmodel');

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

router.get('/alldistrict', async (req,res)=>{
    const allDistricts = await district.find().populate('school_id');
    res.send(allDistricts);
});

router.get('/allschool', async (req,res)=>{
    const allSchools = await School.find();
    res.send(allSchools);
});

router.get('/allschool/:district', async (req,res) => {
    const schools = await district.find({
        districtName : req.params.district
    }).populate('school_id')
    res.send(schools);
});

// router.get('/school', async (req,res)=>{
//     const all = await district.find();
//     res.send(allDistricts);
// });

router.get('/student/:school_id', async(req,res)=>{
    await Student.find({
        school_id : req.params.school_id
    }).then((v)=>{
        res.send(v);
    }).catch((err)=>{
        res.send(err.message);
    })
});


router.get('/school',async (req,res)=>{
    await School.find().then((v)=>{
        res.send(v);
    }).catch((err)=>{
        res.send(err.message);
    })
});

module.exports = router;