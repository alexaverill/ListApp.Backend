require('dotenv').config();
var jwt = require('jsonwebtoken');
function generateToken(user){
    var u = {
        username:user
    }
    return jwt.sign(u,process.env.JWT_SECRET,{
        expiresIn:60*60*24
    });
}
module.exports = {
    generateToken
}