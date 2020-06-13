require('dotenv').config();
const tokenTools = require('./tokenUtils');
const express = require('express');
const Database = require('./databaseConnection');
const app = express();
const port = 5000;
const cors = require('cors');

const Users = require('./UserFunctions');
const Events = require('./EventFunctions');
const Lists = require('./ListFunction');
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.json());
app.use(cors())
// app.use(function(req,res,next){
// 	res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
// 	return next();
// });
app.use(function(req,res,next){
    //return next();
    console.log(req.originalUrl);
    if(req.originalUrl === '/authenticate' || req.originalUrl ==='/verify'){
        console.log(req.originalUrl);
        return next();
    }
    let token = req.headers['authorization'];
    if(token === undefined || token.length <0){
        console.log("Token Error!");
        return res.json({error:true,message:"Not Logged in!"});
    }
    token = token.replace('Bearer','');
    console.log(token.length);
    if(token.length <=0){
        return res.json({error:true,message:"Not Logged in!"});
    }
    if(tokenTools.validateToken(token)){
        return next();
    }else{
        return res.json({error:true,message:"Not Logged in!"});
    }
});
//async middleware layer for requests.
const asyncWrapper = fn => 
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
        .catch(next);   
};


app.get('/createUser', asyncWrapper( async (req,res)=>{
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
    const dbResponse = await Users.createUser(userData.username, userData.password, userData.email, userData.birthday);
    console.log(dbResponse);
    res.json(dbResponse);
}));

app.post('/authenticate',asyncWrapper(async (req,res)=>{

    const authResponse = await Users.validatePassword(req.body.username,req.body.password);
    if(authResponse.valid){
        let token =  tokenTools.generateToken(req.body.username);
        res.json({id:authResponse.id,authentication:authResponse,authKey:token});
    }else{
        res.json({authentication:false,authKey:-1});
    }
}));
app.post('/verify',asyncWrapper(async (req,res)=>{
    let _status = tokenTools.validateToken(req.body.token);
    return res.json({status:_status});
}));
//createEvent (accept json packet representing an event)
app.post("/createEvent",asyncWrapper(async (req, res) => {
    const response = await Events.createEvent(req.body.name, req.body.date,req.body.comments,req.body.giving,req.body.recieving,req.body.image);
    console.log(JSON.stringify(response));
    if(response.status === true){
    res.json({status:"true",message:"Event was created",id:response.event.id});
    }else{
        res.json({status:"false"});
    }
}));
app.get("/getEvents",asyncWrapper(async (req,res)=>{
    console.log("test");
    const response = await Events.getAllEvents();
    
    res.json({events:response});
}));
//get eventBy Id
app.get("/getEvent",asyncWrapper(async (req,res)=>{
    if(req.query.id == null){
        res.json({status:"Failure, missing ID arguement!"});
        return;
    }
    const response = await Events.getEventById(req.query.id);
    res.json(response);
}));

app.get("/getUsers",asyncWrapper(async (req,res)=>{
    const response = await Users.getUsers();
    res.json(response);
}));

app.post("/createList",asyncWrapper(async(req,res)=>{
    let response = await Lists.createList(req.body.event,req.body.name,req.body.userID);
    res.json(response);
}) );
app.post("/addListItem",asyncWrapper(async(req,res)=>{
    let listID = req.body.listID;
    let itemObj = req.body.listItem;
    let response = await Lists.handleListItem(itemObj,listID);
    res.json(response);
}));
app.get("/getList",asyncWrapper(async(req,res)=>{
    if(req.query.id == null){
        res.json({status:"Failure",message:"No ID Specified"});
        return;
    }
    let response = await Lists.getList(req.query.id);
    res.json(response);
}));

app.post('/claimItem', asyncWrapper(async(req,res)=>{
    let response = await Lists.claimListItem(req.body.itemID,req.body.userID);
    res.json(response);
}));

app.post('/unclaimItem', asyncWrapper(async(req,res)=>{
    let response = await Lists.unClaimListItem(req.body.itemID,req.body.userID);
    res.json(response);
}));
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
