'use strict';
const Sequelize = require('sequelize');
const { databaseInfo } = require('./ConnectionInfo');

const UserModel = require('./data_models/users');

const ListModel = require('./data_models/lists');
const EventsModel = require('./data_models/events');
const ListItemModel = require('./data_models/list_item');
const sequelize = new Sequelize({
    dialect:'sqlite',
    storage:'./database.sqlite'
})
// const sequelize = new Sequelize(databaseInfo.databaseName, databaseInfo.databaseUserName, databaseInfo.databasePassword, {
//     host: '127.0.0.1',
//     port: 6603,
//     dialect: 'mysql',
//     dialectOptions: {
//         socketPath: "/var/run/mysqld/mysqld.sock"
//     },
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// }
// );
const Users = UserModel(sequelize,Sequelize);
const List = ListModel(sequelize,Sequelize);
const Events = EventsModel(sequelize,Sequelize);
const ListItems = ListItemModel(sequelize,Sequelize);
const give = sequelize.define('give',{});
const recieve = sequelize.define('recieve',{});
const claims = sequelize.define('claims',{quantity: {
    type: Sequelize.INTEGER,
    allowNull: false
},
comments:{
    type:Sequelize.STRING
}
})
Users.belongsToMany(Events,{as:"Gives",through:give, unique:false });
Users.belongsToMany(Events,{as:"Recieves",through:recieve,unique:false});
Events.belongsToMany(Users,{as:"Givers",through:give,unique:false});
Events.belongsToMany(Users,{as:"Receivers",through:recieve,unique:false});
Users.belongsToMany(ListItems,{as:'Claimed',through:claims,unique:false});
ListItems.belongsTo(List);
List.hasMany(ListItems);
List.belongsTo(Events);
List.belongsTo(Users);
Events.hasMany(List);
Users.hasMany(List);
sequelize.sync({force:false}).then(() =>{
    console.log("Created Tables");
});

 module.exports = {
     sequelize,
     Users,
     List,
     Events,
     ListItems,
     give,
     recieve
 }
