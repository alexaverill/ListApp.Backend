'use strict';
const Sequelize = require('sequelize');
const { databaseInfo } = require('./ConnectionInfo');
const bcrypt = require('bcrypt');

class DatabaseConnection {

    constructor() {
        this.isConnected = false;
        this.ShouldRebuildDatabase = false;
        console.log("Starting database class!");
        this.sequelize = new Sequelize({
            dialect:'sqlite',
            storage:'./database.sqlite'
        })
        // this.sequelize = new Sequelize(databaseInfo.databaseName, databaseInfo.databaseUserName, databaseInfo.databasePassword, {
        //     host: '127.0.0.1',
        //     port: 6603,
        //     dialect: 'mysql',
        //     pool: {
        //         max: 5,
        //         min: 0,
        //         acquire: 30000,
        //         idle: 10000
        //     }
        // }
        // );
        //define model since I apparently can't use properties?
        //TODO: sort out properties.
        this.User = this.sequelize.define('user', {
            // attributes
            username: {
                type: Sequelize.STRING,
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            birthday: {
                type: Sequelize.DATE, 
                allowNull: false
            }
        }, {
            // options
        });
        this.Lists = this.sequelize.define('lists', {
            listName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            eventID: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            userID: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        }, {
            // options
        });
        this.ListItem = this.sequelize.define('listItem', {
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            url: {
                type: Sequelize.STRING,

            },
            price: {
                type: Sequelize.DECIMAL,

            },
            isClaimed: {
                type: Sequelize.TINYINT,

            },
            lists_idlists: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER,
            },
            comments: {
                type: Sequelize.STRING,
            },
        }, {
            // options
        });
        this.Events = this.sequelize.define('events', {
            eventName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            eventDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            comments:{
                type:Sequelize.STRING
            }
        }, {
            // options
        });
        this.EventsHasGiving = this.sequelize.define('events_has_giving', {
            // attributes
            Events_idEvents: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            User_idUsers: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        }, {
            // options
        });
        this.EventsHasRecieving = this.sequelize.define('events_has_hasRecieving', {
            // attributes
            Events_idEvents: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            User_idUsers: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        }, {
            // options
        });
        //mainly for development, should remove in prod.
        if (this.ShouldRebuildDatabase) {
            this.User.sync({ force: true }).then(() => console.log("CreatedUserTable")).catch(err => console.log(err));
            this.Lists.sync({ force: true }).then(() => console.log("Created List Table")).catch(err => console.log(err));
            this.ListItem.sync({ force: true }).then(() => console.log("Created ListItem Table")).catch(err => console.log(err));
            this.Events.sync({ force: true }).then(() => console.log("Craeted Event Table")).catch(err => console.log(err));
            this.EventsHasGiving.sync({ force: true }).then(() => console.log("Created EventHasGiving Lookup Table")).catch(err => console.log(err));
            this.EventsHasRecieving.sync({ force: true }).then(() => console.log("Created EventHasRecieving Lookup Table")).catch(err => console.log(err));
        }

    }
    async connectToDatabase() {
        await this.sequelize
            .authenticate()
            .then(() => {
                console.log("Connected to database!");
                this.isConnected = true;
            })
            .catch(err => { console.error("Unable to connect to database", err); });

    }
    async validatePassword(usernameIn,passwordIn){
        console.log(passwordIn);
        let userData;
        //attempt to get user row.
        await this.User.findAll({
            where:{
                username:usernameIn
            },
            attributes:['username','password']
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
        console.log(result);
        return result;
       
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
    async checkLogin(username, password) {

    }
    async createEvent(name, date,_comments, giving, recieving) {
        let response;
        let EventID;
        await this.Events.create({ eventName: name, eventDate: date, comments:_comments })
            .then(event => {  EventID = event.id; response = { status: true,id:event.id } })
            .catch(err => { response = { status: false, message:err} });
        //insert recieving and giving info
        giving.map(async (userID)=>{
            await this.EventsHasGiving.create({Events_idEvents:EventID,User_idUsers:userID}).then(event=>{console.log(event.id)})
            .catch(err=>{console.error(err);});
        });
        recieving.map(async (userID)=>{
            await this.EventsHasRecieving.create({Events_idEvents:EventID,User_idUsers:userID}).then(event=>{console.log(event.id)})
            .catch(err=>{console.error(err);});
        });
        return response;
    }
    async GiverInEvent(UserID,EventID){
        let isGiver = false;
        await this.EventsHasGiving.findAll({
            where:{
                Events_idEvents:EventID,
                User_idUsers:UserID
            },
            attributes:[[this.sequelize.fn('COUNT',this.sequelize.col('User_idUsers')),'inTable']]
        }).then(result =>{
            if(result[0].dataValues.inTable >0){
                isGiver = true;
            }
        });
        return isGiver;
    }
    async RecieverInEvent(UserID,EventID){
        let isReciever = false;
        await this.EventsHasRecieving.findAll({
            where:{
                Events_idEvents:EventID,
                User_idUsers:UserID
            },
            attributes:[[this.sequelize.fn('COUNT',this.sequelize.col('User_idUsers')),'inTable']]
        }).then(result =>{
            if(result[0].dataValues.inTable >0){
                isReciever = true;
            }
        });
        return isReciever;
    }
    async getAllEvents() {
        let response;
        await this.Events.findAll(
            {
                attributes: ['id', 'eventName', 'eventDate']
            }
        ).then(events => {
            response = events;// JSON.stringify(users, null, 4);
           // console.log("All users:", response);
        });
        return response;

    }
    
    async getEventById(searchId) {
        let response ={
            id:'',
            name:'',
            date:'',
            recievers:[],
            givers:[]
        };
        await this.Events.findAll({
            where: {
                id: searchId
            },
            attributes: ['id', 'eventName', 'eventDate']
        }).then(events => {
            response.name = events[0].eventName; 
            response.id=events[0].id; 
            response.date = events[0].eventDate; 
        });
        
        await this.EventsHasRecieving.findAll({
            where:{
                Events_idEvents:searchId
            },
            attributes:[['User_idUsers','id']]
        }).then(data=>{
            //console.log(data);
            response.recievers = data;
        });
        
        await this.EventsHasGiving.findAll({
            where:{
                Events_idEvents:searchId
            },
            attributes:[['User_idUsers','id']]
        }).then(data=>{
            response.givers = data;
        });
        //console.log(response);
        return response;
    }
    async claimListItem(listItemId,claimedStatus){
        await this.ListItem.update({isClaimed:claimedStatus},{where:{id:listItemId}}).then(updated=>{console.log(updated)});
    }
    async updateListItem(jsonListItem) {
        await this.ListItem.update({
            name: jsonListItem.name,
            url: jsonListItem.url,
            price: jsonListItem.price,
            isClaimed: jsonListItem.isClaimed,
            quantity: jsonListItem.quantity,
            comments: jsonListItem.comments
        }, {
            where: {
                id: jsonListItem.id
            }

        }).then((result)=>{
            response = { success: "true", id:result.id };
    })
    .catch(err => response = { success: "false " + err });
    console.log(response);
    return response;
    }
    async createListItem(jsonListItem, listID) {
        let response;
        console.log(listID);
        await this.ListItem.create({
            name: jsonListItem.name,
            url: jsonListItem.url,
            price: jsonListItem.price,
            isClaimed: jsonListItem.isClaimed,
            lists_idlists: listID,
            quantity: jsonListItem.quantity,
            comments: jsonListItem.comments
        })
            .then((result)=>{
                response = { success: "true", id:result.id };
        })
        .catch(err => response = { success: "false " + err });
        console.log(response);
        return response;
    }
    async handleListItem(jsonListItem, listID) {
        console.log(jsonListItem);
        if (jsonListItem.id != null) {
            return await this.updateListItem(jsonListItem);
        } else {
            return await this.createListItem(jsonListItem, listID);
        }
    }
    async createList(_eventID, _listName,_userID){
        let response;
        let existing = await this.Lists.findAll({
            where:{
                listName: _listName,
                eventID:_eventID,
                userID:_userID
            },
            attributes:['id']
        });
        console.log(existing[0].id);
        //return;
        if(existing[0].id != undefined && existing[0].id >0){
            response = {status:true,id:existing[0].id};
            return response;
        }
        await this.Lists.create({
            listName:_listName,
            eventID: _eventID,
            userID:_userID
        }).then(newList=>{
            response={status:true,id:newList.id};
        })
        .catch(err=>{
            response={status:false,message:err};
        });
        return response;
    }

    async addListItem(listId,itemObj){
        console.log(listId);
        return await this.handleListItem(itemObj,listId);
    }
    async getListInfo(listID) {
        let listInfo = new Object();
        await this.Lists.findAll({
            where:
            {
                id: listID

            },
            attributes: ['id', 'listName', 'eventID', 'userID']
        }).then(list => { listInfo = list[0] });//need to look into this in more depth.
        return listInfo;
    }
    //return a list of List IDs associated with userID 
    async getEventLists(eventId){

    }
    async getList(searchID) {
        let returnList = new Object();

        let listInfo = await this.getListInfo(searchID);
        returnList.listName = listInfo.listName;
        returnList.id = listInfo.id;
        returnList.eventID = listInfo.eventID;
        returnList.items = [];
        await this.ListItem.findAll({
            where: {
                lists_idlists: searchID
            },
            attributes: ['id', 'name', 'url', 'price', 'isClaimed', 'quantity', 'comments']
        }).then(item => {
            //console.log(item);
            returnList.items.push(item);
        });
        return returnList;
    }
}

module.exports = DatabaseConnection;
