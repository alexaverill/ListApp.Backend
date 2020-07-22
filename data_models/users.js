module.exports = (sequelize, type)=>{
    return sequelize.define('users', {
        username: {
            type: type.STRING,
            allowNull: false
        },
        password: {
            type: type.STRING,
            allowNull: false
        },
        passwordReset:{
            type:type.BOOLEAN
        },
        email: {
            type: type.STRING,
            allowNull: false
        },
        birthday: {
            type: type.DATE, 
            allowNull: false
        },
        isAdmin:{
            type:type.BOOLEAN
        }
    });
}