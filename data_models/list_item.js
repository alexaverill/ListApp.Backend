module.exports = (sequelize, type)=>{
    return sequelize.define('list_item', {
    name: {
        type: type.STRING,
        allowNull: false
    },
    url: {
        type: type.STRING,

    },
    price: {
        type: type.DECIMAL,

    },
    isClaimed: {
        type: type.TINYINT,

    },
    claimedBy:{
        type:type.INTEGER,
    },
    quantity: {
        type: type.INTEGER,
    },
    comments: {
        type: type.STRING,
    },
});
}