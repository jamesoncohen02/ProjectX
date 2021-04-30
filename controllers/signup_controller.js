let express = require('express'),
    router = express.Router();
let Signup = require('../models/signup_model');

router.get('/addSignup', async function(req, res){
  let rooms = await require('../models/room_model').getAllRooms();
  let users = await require('../models/user_model').getAllUsers();
  res.status(200);
  res.setHeader('Content-Type', 'text/html');
  res.render('signup/new_signup.ejs', {rooms: rooms, users: users});
});

router.post('/signup', async function(req, res){
  let allSignups = await Signup.getAllSignups();
  let allSignupsArray = [];
  for (let signup of Object.values(allSignups)){
    allSignupsArray.push(signup);
  }
  let allSignedUpUsers = [];
  let rooms = await require('../models/room_model').getAllRooms();
  for (let i = 0; i<allSignupsArray.length; i++){
    allSignedUpUsers.push(allSignupsArray[i].StudentUsername);
  }
  let username = req.body.user;
  let room = req.body.room;
  let roomName = room.split("-").join(" ");
  if(allSignedUpUsers.includes(username)){
    res.redirect('/addSignup');
    let alert = require('alert');
    alert("Each student can only be signed up for one room at a time.");
    console.log("Each student can only be signed up for one room at a time.");
  }else if(rooms[room].studentsSignedUp.length>=rooms[room].maxCapacity){
    res.redirect('/addSignup');
    let alert = require('alert');
    alert("This room has already reached its maximum capacity.");
    console.log("This room has already reached its maximum capacity.");
  } else if(rooms[room].available===false){
    res.redirect('/addSignup');
    let alert = require('alert');
    alert("This room is not currently available for signups.");
    console.log("This room is not currently available for signups.");
  }else {
    Signup.addSignup(username, roomName);
    res.redirect('/addSignup');
  }
});

router.get('/signup/userSelect', async function(req, res){
  let users = await require('../models/user_model').getAllUsers();
  res.status(200);
  res.setHeader('Content-Type', 'text/html');
  res.render('signup/select_user.ejs', {users: users});
});

router.get('/signup', async function(req, res){
  let username = req.query.user;
  let users = await require('../models/user_model').getAllUsers();
  if (users[username]){
    let userRoom = users[username].currentRoomSignup;
    let signupId = username+"_"+userRoom.split(" ").join("-");
    res.redirect('/signup/' + signupId);
  } else{
    let errorCode=404;
    res.status(errorCode);
    res.setHeader('Content-Type', 'text/html');
    res.render("error.ejs", {"errorCode":errorCode});
  }
});

router.get('/signup/:signupId', async function(req, res){
  let signups = await Signup.getAllSignups();
  let signupId = req.params.signupId;
  if(signups[signupId]){
    let signup = signups[signupId];
    res.status(200);
    res.setHeader('Content-Type', 'text/html');
    res.render("signup/signup_details.ejs",{signup: signup, signupId: signupId});
  } else{
    let errorCode=404;
    res.status(errorCode);
    let alert = require('alert');
    alert("This user does not currently have any signups. If you would like to access signup details, you must first sign up for a room on the Sign Up for a Room page.");
    console.log("This user does not currently have any signups. If you would like to access signup details, you must first sign up for a room on the Sign Up for a Room page.");
    res.redirect("/signup/userSelect");
    //res.setHeader('Content-Type', 'text/html');
    res.render("error.ejs", {"errorCode":errorCode});
  }
});

router.get('/signup/:signupId/editSignup', async function(req, res){
  let signupId = req.params.signupId;
  let signups = await Signup.getAllSignups();
  let rooms = await require('../models/room_model').getAllRooms();
  if (signups[signupId]){
    let signup = signups[signupId];
    res.status(200);
    res.setHeader('Content-Type', 'text/html');
    res.render("signup/edit_signup.ejs", {signup: signup, signupId: signupId, rooms: rooms});
  } else{
    let errorCode=404;
    res.status(errorCode);
    res.setHeader('Content-Type', 'text/html');
    res.render("error.ejs", {"errorCode":errorCode});
  }
});

router.put('/signup/:signupId', async function(req, res){
  let rooms = await require('../models/room_model').getAllRooms();
  let signups = await Signup.getAllSignups();
  let signupId = req.params.signupId;
  let newRoom = req.body.Room;
  if (signups[signupId]){
  if(rooms[newRoom].studentsSignedUp.length>=rooms[newRoom].maxCapacity){
    res.redirect('#');
    let alert = require('alert');
    alert("This room has already reached its maximum capacity.");
    console.log("This room has already reached its maximum capacity.");
  } else if(rooms[newRoom].available===false){
    res.redirect('#');
    let alert = require('alert');
    alert("This room is not currently available for signups.");
    console.log("This room is not currently available for signups.");
  } else{
  console.log(newRoom.replace(/-/g, " "));
  Signup.updateSignup(signupId, newRoom.replace(/-/g, " "));
  res.redirect('/signup/userSelect');
  }
} else{
  let errorCode=404;
  res.status(errorCode);
  res.setHeader('Content-Type', 'text/html');
  res.render("error.ejs", {"errorCode":errorCode});
}
});

router.delete('/signup/:signupId', async function(req, res){
  let signupId = req.params.signupId;
  let signups = await Signup.getAllSignups();
  if (signups[signupId]){
  await Signup.deleteSignup(signupId);
  res.redirect('/signup/userSelect');
} else{
  let errorCode=404;
  res.status(errorCode);
  res.setHeader('Content-Type', 'text/html');
  res.render("error.ejs", {"errorCode":errorCode});
}
});

module.exports = router;
