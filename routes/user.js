//Required Packages
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

//Required Modules
const userModel = require('../models/usermodel');
const crypt = require('../middleware/crypt');

//Functions
function validateUser(req) {
    const tempschema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required() 
    });

    return tempschema.validate(req);
}

//Check API
router.post("/check", async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await userModel.users.findOne({username: req.body.username});
    if (!user) return res.status(400).send("Invalid UserName");

    const dbpassword = await crypt.decode(user.password);
    if(!(req.body.password == dbpassword)) return res.status(400).send("Invalid Password");
    
    const token = jwt.sign({_id : user.user_id, isAdmin : user.isAdmin, role : user.role}, config.get('jwtPrivateKey'));
    res.header("x-auth-token", token).status(200).send(user)
});

//PUT APIs
router.put("/password/:uname", async (req, res) => {
    let user = await userModel.users.findOne({username: req.params.uname});
    if (!user) return res.status(400).send("Invalid UserName");

    const hashed = await crypt.encode(req.body.newPassword);
    
    user.password = hashed;
    user.isRegistered = true;
    user
    .save()
    .then((v) => {
        res.send(v);
    })
    .catch((err) => {
        res.send(err.message);
    });
});

module.exports = router;
