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
function validateToken(token){
    if(token == undefined){
        return false
    }
    token = token.trim();
    let val;
    try{
     val = jwt.verify(token,process.env.JWT_SECRET);
    }catch(e){
        return false;
    }
    return true;
}
module.exports = {
    generateToken,
    validateToken
}