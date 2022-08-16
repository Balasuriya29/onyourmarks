const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send("Access Denied! Token Required");

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        if(decoded.role != 'Admin') return res.status(403).send("This is Forbidden Call for You");

        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send("Invalid Token"); 
    }
}   