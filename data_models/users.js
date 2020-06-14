module.exports = (sequelize, type)=>{
    return sequelize.define('users', {
        id: {
            type: type.INTEGER,
            field: 'ID',
            primaryKey: true
        },
        // attributes
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