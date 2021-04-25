let express = require('express')
  , router = express.Router();
let request = require('request');

let Signup = require('../models/signup_model');

router.get('/addSignup', function(req, res){
  let rooms = require('../models/room_model').getAllRooms();
  let users = require('../models/user_model').getAllUsers();
  res.status(200);
  res.setHeader('Content-Type', 'text/html');
  res.render('signup/new_signup.ejs', {rooms: rooms, users: users});
});

router.post('/signup', function(req, res){
  let allSignups = Signup.getAllSignups();
  let allSignupsArray = [];
  for (signup of Object.values(allSignups)){
    allSignupsArray.push(signup);
  }
  let allSignedUpUsers = [];
  let rooms = require('../models/room_model').getAllRooms();
  for (let i = 0; i<allSignupsArray.length; i++){
    allSignedUpUsers.push(allSignupsArray[i].StudentUsername);
  }
  let username = req.body.user;
  let room = req.body.room;
  let roomName = room.split("-").join(" ");
  if(allSignedUpUsers.includes(username)){
    res.redirect('/addSignup');
    console.log("Each student can only be signed up for one room at a time.")
  }else if(rooms[room].studentsSignedUp.length>=rooms[room].maxCapacity){
    res.redirect('/addSignup');
    console.log("This room has already reached its maximum capacity.");
  } else if(rooms[room].available==false){
    res.redirect('/addSignup');
    console.log("This room is not currently available for signups.");
  }else {
    Signup.addSignup(username, roomName);
    res.redirect('/signup/userSelect');
  }
});

router.get('/signup/userSelect', function(req, res){
  let users = require('../models/user_model').getAllUsers();
  res.status(200);
  res.setHeader('Content-Type', 'text/html');
  res.render('signup/select_user.ejs', {users: users});
});

router.get('/signup', function(req, res){
  let username = req.query.user;
  let users = require('../models/user_model').getAllUsers();
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

router.get('/signup/:signupId', function(req, res){
  let signups = Signup.getAllSignups();
  let signupId = req.params.signupId;
  if(signups[signupId]){
    let signup = signups[signupId];
    res.status(200);
    res.setHeader('Content-Type', 'text/html')
    res.render("signup/signup_details.ejs",{signup: signup, signupId: signupId});
  } else{
    let errorCode=404;
    res.status(errorCode);
    console.log("This user does not currently have any signups. If you would like to access signup details, you must first sign up for a room on the Sign Up for a Room page.");
    res.setHeader('Content-Type', 'text/html');
    res.render("error.ejs", {"errorCode":errorCode});
  }
});

router.get('/signup/:signupId/editSignup', function(req, res){
  let signupId = req.params.signupId;
  let signups = Signup.getAllSignups();
  let rooms = require('../models/room_model').getAllRooms();
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

router.put('/signup/:signupId', function(req, res){
  let rooms = require('../models/room_model').getAllRooms();
  let signups = Signup.getAllSignups();
  let signupId = req.params.signupId;
  let newRoom = req.body.Room;
  if (signups[signupId]){
  if(rooms[newRoom].studentsSignedUp.length>=rooms[newRoom].maxCapacity){
    res.redirect('#');
    console.log("This room has already reached its maximum capacity.");
  } else if(rooms[newRoom].available==false){
    res.redirect('#');
    console.log("This room is not currently available for signups.");
  } else{
  Signup.updateSignup(signupId, newRoom);
  res.redirect('/signup/userSelect');
  }
} else{
  let errorCode=404;
  res.status(errorCode);
  res.setHeader('Content-Type', 'text/html');
  res.render("error.ejs", {"errorCode":errorCode});
}
});

router.delete('/signup/:signupId', function(req, res){
  let signupId = req.params.signupId;
  let signups = Signup.getAllSignups();
  if (signups[signupId]){
  Signup.deleteSignup(signupId);
  res.redirect('/signup/userSelect');
} else{
  let errorCode=404;
  res.status(errorCode);
  res.setHeader('Content-Type', 'text/html');
  res.render("error.ejs", {"errorCode":errorCode});
}
});

module.exports = router
