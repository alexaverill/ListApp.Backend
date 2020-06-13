const {Events,sequelize,Users,List,give,ListItems} = require('./databaseConnection');
async function createEvent(name, date,_comments, giving, recieving, _image) {
    let response;
    let EventID;
    let event  = await Events.create({ eventName: name, eventDate: date, comments:_comments,image:_image }).then(data=>{
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
    await Events.findAll(
        {
            attributes: ['id', 'eventName', 'eventDate','image']
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
            
        },
        {
            model:List,
            include:[{
                model:Users,
                attributes:['username']
            },
            {
                model:ListItems,
                attributes:['id']
            }]
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
