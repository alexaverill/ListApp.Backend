const {Users,Events,List,ListItems,sequelize} = require('./databaseConnection');

async function claimListItem(listItemId,userID,claimedStatus){
    console.log("User: "+userID);
    return await ListItems.update(
        {
            isClaimed:true,
            claimedBy:userID
        },
        {
            where:{
                id:listItemId
            }
        }).then(updated=>{
            console.log(updated); 
            return {status:true};
        }).catch(err=>{
            return {status:false};
        });
}
async function unClaimListItem(listItemId,userID,claimedStatus){
    return await ListItems.update(
        {
            isClaimed:false,
            claimedBy:null
        },
        {
            where:{
                id:listItemId
            }
        }).then(updated=>{
            console.log(updated); 
            return {status:true};
        }).catch(err=>{
            return {status:false};
        });
}
async function updateListItem(jsonListItem) {
    await ListItems.update({
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
    let newItem = await ListItems.create({
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
            return result;
    })
    .catch(err => response = { success: "false " + err });
    newItem.setList(listID);
    return response;
}
async function handleListItem(jsonListItem, listID) {
    console.log(jsonListItem);
    if (jsonListItem.id != null) {
        return await updateListItem(jsonListItem);
    } else {
        return await createListItem(jsonListItem, listID);
    }
}
async function createList(_eventID, _listName,_userID){
    let response;
    let existing;
     existing= await List.findAll({
        where:{
            listName: _listName,
            eventID:_eventID,
            userID:_userID
        },
        include:[ListItems]
    }).then(data=>{return data;}).catch(error=>{Console.log("error")});
    //return;
    console.log(JSON.stringify(existing));
    if(existing != undefined && existing[0] != undefined){
        if(existing[0].id != undefined && existing[0].id >0){
            response = {status:true,id:existing[0].id,list:existing};
            return response;
        }
    }
    console.log("Creating new List!");
    let newList = await List.create({
        listName:_listName,
        eventID: _eventID,
        userID:_userID
    }).then(newList=>{
        response={status:true,id:newList.id};
        return newList;
    })
    .catch(err=>{
        console.log(err);
        response={status:false,message:err};
    });
    newList.setUser(_userID);
    newList.setEvent(_eventID);
    return response;
}
async function getListInfo(listID) {
    let listInfo = new Object();
    await List.findAll({
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
    await List.findAll({
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
    return await List.findAll({
        where: {
            lists_idlists: searchID
        },
        attributes: ['id', 'name', 'url', 'price', 'isClaimed', 'quantity', 'comments']
    });
}
async function getList(searchID) {
    let existing = await List.findAll({
        where:{
            id:searchID
        },
        include:[
            {
                model:Users,
                attributes:['id','username']
                
            },
            {
                model:ListItems,
            },
            {
                model:Events
            }
            ]
    }).then(data=>{return data;}).catch(error=>{Console.log("error")});
    return existing;
}

module.exports={
    createList,
    handleListItem,
    claimListItem,
    getList,
    unClaimListItem
}