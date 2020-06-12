module.exports = (sequelize, type) => {
    return sequelize.define('events', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        eventName: {
            type: type.STRING,
            allowNull: false
        },
        eventDate: {
            type: type.DATE,
            allowNull: false
        },
        image:{
            type:type.STRING
        },
        comments: {
            type: type.STRING
        }

    });
}