const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const chatmodel = require('../models/chatmodel');
const messagemodel = require('../models/messagemodel');
const auth = require('../middleware/auth');


router.post("/",auth,async (req,res)=>{
       const {error} = chatmodel.validateSchema(req.body);
    if(error) return res.send(error.details[0].message);
    const chat = await chatmodel.Chat(req.body);
    chat
    .save()
    .then((v)=>{
        res.send(v);
    })
    .catch((err)=>{
        res.send(err.message);
    });
});


router.post("/message",auth,async(req,res)=>{
    const {error} = messagemodel.validateSchema(req.body);
    if(error) return res.send(err.details[0].message);
    const message = await messagemodel.Message(req.body)
    message.save()
    .then((v)=>{
        res.send(v);
    })
    .catch((err)=>{
        res.send(err.message);
    })
});


router.get("/:id",auth,async(req,res)=>{
    await messagemodel.Message.find({
        "chat_id" : req.params.id
    }).then((v)=>{
        res.send(v);
    }).catch((err)=>{
        res.send(err.message);
    })
})



module.exports = router;