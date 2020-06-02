const {Events,sequelize,Users,give} = require('./databaseConnection');
async function createEvent(name, date,_comments, giving, recieving) {
    let response;
    let EventID;
    console.log(giving);
    //find all givers
    // let givers = await giving.map(giver => {
    //     console.log(giver);
    //     Users.findAll({
    //         where:{
    //             id:giver
    //         }
    //     })
    // });
    // console.log("Givers: "+givers);
    // let recievers = await recieving.map(rec=>{
    //     Users.findAll({
    //         where:{
    //             id:rec
    //         }
    //     })
    // });
    //console.log("Recievers: "+recievers);
    let event  = await Events.create({ eventName: name, eventDate: date, comments:_comments }).then(data=>{
        return data;
    })
        .catch(err => { console.log(err); response = { status: false, message:err} });
        console.log(JSON.stringify(event));
    let give = await event.setGivers(giving);
    let recievers = await event.setReceivers(recieving);
    let getGive = event.getGivers();
    let returnEvent = await Events.findOne({
        where:{
            id:event.id
        },
        include:[{
            model:Users,
            as:'Givers',
            attributes:['id','username']
            
        },
        {
            model:Users,
            as:'Receivers',
            attributes:['id','username']
            
        }]

    }).then(data=>{
        return data;
    })
    return {status:true,event:returnEvent};
}
async function GiverInEvent(UserID,EventID){
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
async function RecieverInEvent(UserID,EventID){
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
async  function getAllEvents() {
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

async function getEventById(searchId) {
    let returnEvent = await Events.findOne({
        where:{
            id:searchId
        },
        include:[{
            model:Users,
            as:'Givers',
            attributes:['id','username']
            
        },
        {
            model:Users,
            as:'Receivers',
            attributes:['id','username']
            
        }]

    }).then(data=>{
        return data;
    })
    return {status:true,event:returnEvent};
}

module.exports = {
    createEvent,
    getAllEvents,
    getEventById
}
