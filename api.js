require('dotenv').config();
const tokenTools = require('./tokenUtils');
const express = require('express');
const Database = require('./databaseConnection');
const app = express();
const port = 5000;
const cors = require('cors');
let database = new Database();
database.connectToDatabase();
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.json());
app.use(cors())
// app.use(function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
// 	return next();
// });
//async middleware layer for requests.
const asyncWrapper = fn => 
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
        .catch(next);   
};
function ensureLoggedIn(req,response,next){
    if(req.query.authKey = 123454321){
        next();
    }else{
        response.json({status:false,message:"Invalid Credentials. Please Log In"});
        let err = "Invalid Credentials";
        Console.log("error");
        //next(err);
    }

}

app.get('/createUser',ensureLoggedIn, asyncWrapper( async (req,res)=>{
   if (req.query.user == null) {
        res.json({status:"false",message:"Missing User Arguement"});
        return;
    }
    let userData;
    try {
        userData = JSON.parse(req.query.user);

    } catch{
        res.json({status:"false",message:"Unable to parse JSON"});
        return;
    }
    const dbResponse = await database.createUser(userData.username, userData.password, userData.email, userData.birthday);
    console.log(dbResponse);
    res.json(dbResponse);
}));
app.get('/authenticate',asyncWrapper(async (req,res)=>{
    if(req.query.auth == null){
        res.json({status:"false",message:"Missing Auth Arguments"});
        return;
    }
    let authentication;
    try{
        authentication = JSON.parse(req.query.auth);
    }catch{
        res.json({status:"false",message:"Unable to parse json"});
        return;
    }
    const authResponse = await database.validatePassword(authentication.username,authentication.password);
    if(authResponse){
        let token =  tokenTools.generateToken(authentication.username);
        res.json({authentication:authResponse,authKey:token}); //super secure key for testing.
    }else{
        res.json({authentication:false,authKey:-1});
    }
}));
//createEvent (accept json packet representing an event)
app.post("/createEvent",asyncWrapper(async (req, res) => {
   // console.log(req);
    const response = await database.createEvent(req.body.name, req.body.date,req.body.comments,req.body.giving,req.body.recieving);
    if(response.status === true){
    res.json({status:"true",message:"Event was created",id:response.id});
    }else{
        res.json({status:"false"});
    }
}));
app.get("/getEvents",asyncWrapper(async (req,res)=>{
    console.log("test");
    const response = await database.getAllEvents();
    
    res.json({events:response});
}));
//get eventBy Id
app.get("/getEvent",asyncWrapper(async (req,res)=>{
    if(req.query.id == null){
        res.json({status:"Failure, missing ID arguement!"});
        return;
    }
    const response = await database.getEventById(req.query.id);
    res.json(response);
}));
//likely want to rename this.
app.get("/isGiver",asyncWrapper(async (req,res)=>{
    let info;
    try{
        info = JSON.parse(req.query.data);
    }catch{
        res.json({status:"false",message:"Unable to parse json"});
        return;
    }
    const results = await database.GiverInEvent(info.UserID,info.EventID);
    res.json({status:results})
    
}));
app.get("/isReciever",asyncWrapper(async (req,res)=>{
    let info;
    try{
        info = JSON.parse(req.query.data);
    }catch{
        res.json({status:"false",message:"Unable to parse json"});
        return;
    }
    const results = await database.RecieverInEvent(info.UserID,info.EventID);
    res.json({status:results})
    
}));
app.get("/getUsers",asyncWrapper(async (req,res)=>{
    const response = await database.getUsers();
    res.json(response);
}));
//createList (create a list on a json packet, or update existing list)
//Example Packet: ID in the parent, and the items will be null if the list is new
// {
//     "name":"Test",
//      "event":1,
//"userid":1,
//     "items":[
//         {
//             "name":"Apples",
//             "url":"http://google.com",
//             "price":"1.00",
//             "isClaimed":false,
//             "lists_idLists":null,
//             "quantity":100,
//             "comments":""
//         },
//  {
//             "name":"Banana's",
//             "url":"http://google.com",
//             "price":"10.00",
//             "isClaimed":false,
//             "lists_idLists":null,
//             "quantity":100,
//             "comments":""
//         },
//  {
//             "name":"Catas",
//             "url":"http://google.com",
//             "price":"100.00",
//             "isClaimed":false,
//             "lists_idLists":null,
//             "quantity":100,
//             "comments":"I NEEED MORE"
//         }
//     ]
// }
app.post("/createList",asyncWrapper(async(req,res)=>{
    let response = await database.createList(req.body.event,req.body.name,req.body.userID);
    res.json(response);
}) );
app.post("/addListItem",asyncWrapper(async(req,res)=>{
    let listID = req.body.listID;
    let itemObj = req.body.listItem;
    let response = await database.addListItem(listID,itemObj);
    res.json(response);
}));
app.get("/getList",asyncWrapper(async(req,res)=>{
    if(req.query.id == null){
        res.json({status:"Failure",message:"No ID Specified"});
        return;
    }
    let response = await database.getList(req.query.id);
    res.json(response);
}));
//editUser (change username and password, or address)
//editList


app.get('/', (req, res) => res.send('Hello World!'))

app.get('/claimItem', (request, response) => {

});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
