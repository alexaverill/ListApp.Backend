const {User} = require('./databaseConnection');

async validatePassword(usernameIn,passwordIn){
    console.log(passwordIn);
    let userData;
    //attempt to get user row.
    await this.User.findAll({
        where:{
            username:usernameIn
        },
        attributes:['id','username','password']
    }).then(user=> {userData = user;});
    if(userData == null){//need to see if I can avoid doing this with the promise system.
        return false;
    }
    let passwordHash = userData[0].password;
    if(passwordHash == null){
        return false;
    }
    //console.log(passwordHash);
    const result = await new Promise((resolve,reject)=>{
        bcrypt.compare(passwordIn, passwordHash, function(err, response) {
            if(err){
                reject(err);
            }
            resolve(response);
          }); 

    });
    let returnVal = {
        valid:true,
        id:userData[0].id
    }
    return returnVal;
   
}
async hashPassword(passwordIn){
    let saltRounds = 10;
    const hashed = await new Promise((resolve,reject)=>{
        bcrypt.hash(passwordIn,saltRounds,(err,hash)=>{
            if(err){
               reject(err);
            }else{
                resolve(hash);
            }
        });
    });
     return hashed;
}
async createUser(name, password, email, birthday) {
    //TODO limit to only one user per username
    let userCount;
    await this.User.findAll({
        where:{
            username:name,
            email:email
        },
        attributes:[[this.sequelize.fn('COUNT',this.sequelize.col('username')),'countUsername'],[this.sequelize.fn('COUNT',this.sequelize.col('email')),'countEmail']]
    }).then(result => userCount = result);
    let possibleErrors = [];
    if(userCount[0].dataValues.countUsername > 0){
        possibleErrors.push("Username already in use");
    }
    if(userCount[0].dataValues.countEmail>0){
        possibleErrors.push("Email already in use!");

    }

    if(possibleErrors.length > 0){
        return possibleErrors;
    }
    let response;
    let encryptedPass = await this.hashPassword(password);
    await this.User.create({ username: name, password: encryptedPass, email: email, birthday: birthday })
        .then(person => { console.log("Persons ID is :", person.id); response = { status: "Success" } })
        .catch(err => { console.error("There was a problem! ", err); response = { status: "Failure" } });
    return response;
}
async getUsers() {
    let response;
    await this.User.findAll({
        attributes: ['id', 'username']
    }).then(people => { response = people });
    return response;
}
module.exports = {
    getUsers,
    createUser,
    validatePassword
}