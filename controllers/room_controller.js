let express = require('express')
  , router = express.Router();
const fs = require('fs')

let Room = require('../models/room_model')

router.get('/', function(req, res){
  res.redirect('/rooms');
});

router.get('/rooms', async function(req, res){
  let roomList = await Room.getAllRooms();
  res.status(200);
  res.setHeader('Content-Type', 'text/html');
  res.render('room/show_rooms.ejs', {rooms: roomList});
});

router.get('/room/:id/editRoom', async function(req, res){
  let thisRoom = await Room.getRoom(req.params.id);
  console.log(thisRoom);
  thisRoom.id=req.params.id;
  let users = require('../models/user_model').getAllUsers();
  if(thisRoom){
    res.status(200);
    res.setHeader('Content-Type', 'text/html');
    res.render("room/edit_room.ejs", {room: thisRoom, users: users});
    console.log(thisRoom);
  }
  else{
    let errorCode=404;
    res.status(errorCode);
    res.setHeader('Content-Type', 'text/html');
    res.render("error.ejs", {"errorCode":errorCode});
  }
});

router.put('/room/:id', async function(req, res){
  try{
  let newRoomData = {};
  let id = req.params.id;
  let currentRoomData = await Room.getRoom(id);
  newRoomData['number'] = currentRoomData.number;
  newRoomData['maxCapacity'] = parseInt(req.body.maxCapacity);
  if (req.body.Available == 'Yes'){
    newRoomData['available'] = true;
  } else {newRoomData['available'] = false;}
  newRoomData['studentsSignedUp'] = currentRoomData.studentsSignedUp;
  let user = require('../models/user_model').getUser(req.body.User);
  if (user.type == "admin"){
    await Room.updateRoom(id, newRoomData);
    res.redirect('/room/:id/editRoom');
  } else{
    let alert = require('alert');
    alert("Students do not have access to editing rooms.");
    console.log("Students do not have access to editing rooms.");
    res.redirect('/room/:id/editRoom');
  }
} catch(err){
  console.log(err);
}
});

module.exports = router
