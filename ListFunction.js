const {Users,Events,List,ListItems,sequelize} = require('./databaseConnection');

async function claimListItem(listItemId,claimedStatus){
    await this.ListItem.update({isClaimed:claimedStatus},{where:{id:listItemId}}).then(updated=>{console.log(updated)});
}
async function updateListItem(jsonListItem) {
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
async function createListItem(jsonListItem, listID) {
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
async function handleListItem(jsonListItem, listID) {
    console.log(jsonListItem);
    if (jsonListItem.id != null) {
        return await this.updateListItem(jsonListItem);
    } else {
        return await this.createListItem(jsonListItem, listID);
    }
}
async function createList(_eventID, _listName,_userID){
    let response;
    let existing;
     existing= await this.Lists.findAll({
        where:{
            listName: _listName,
            eventID:_eventID,
            userID:_userID
        },
        attributes:['id']
    }).catch(error=>{Console.log("error")});
    //return;
    if(existing != undefined && existing[0] != undefined){
        if(existing[0].id != undefined && existing[0].id >0){
            let listItems = await this.getListItems(existing[0].id);
            response = {status:true,id:existing[0].id, items:listItems};
            return response;
        }
    }
    console.log("Creating new List!");
    await this.Lists.create({
        listName:_listName,
        eventID: _eventID,
        userID:_userID
    }).then(newList=>{
        response={status:true,id:newList.id};
    })
    .catch(err=>{
        console.log(err);
        response={status:false,message:err};
    });
    return response;
}

async function addListItem(listId,itemObj){
    console.log(listId);
    return await this.handleListItem(itemObj,listId);
}
async function getListInfo(listID) {
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
async function getListsForEvent(event){
    let lists;
    await this.Lists.findAll({
        where:{
            eventID:event
        },
        include:[{model:this.ListItem, as: 'Items'}]
    }).then(data=>{
        console.log(JSON.stringify(data));
    });
    return [];
}
//return a list of List IDs associated with userID 
async function getListItems(searchID){
    return await this.ListItem.findAll({
        where: {
            lists_idlists: searchID
        },
        attributes: ['id', 'name', 'url', 'price', 'isClaimed', 'quantity', 'comments']
    });
}
async function getList(searchID) {
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

module.exports={
    createList
}