module.exports = (sequelize, type)=>{
    return sequelize.define('lists', {
        listName: {
            type: type.STRING,
            allowNull: false
        },
        active:{
            type:type.BOOLEAN
        }
    });
}