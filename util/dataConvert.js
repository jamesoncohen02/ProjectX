var admin = require("firebase-admin");
var fs = require('fs');
var serviceAccount = require("../firebase-config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//Create a database reference
var db = admin.firestore();

var roomData = JSON.parse(fs.readFileSync('../data/room.json', 'utf8'));
var userData = JSON.parse(fs.readFileSync('../data/user.json', 'utf8'));
var signupData = JSON.parse(fs.readFileSync('../data/signup.json', 'utf8'));

let roomCol = db.collection('rooms');

for (let room of Object.entries(roomData)){
  let ref = db.collection('rooms').doc(room[0]);
  let set = ref.set({
    "number": room[1].number,
    "maxCapacity": room[1].maxCapacity,
    "available": room[1].available,
    "studentsSignedUp": room[1].studentsSignedUp
  });
}

let userCol = db.collection('users');

for (let user of Object.entries(userData)){
  let ref = db.collection('users').doc(user[0]);
  if (user[1].type == "student"){
  let set = ref.set({
    "type": user[1].type,
    "username": user[1].username,
    "name": user[1].name,
    "email": user[1].email,
    "password": user[1].password,
    "currentRoomSignup": user[1].currentRoomSignup
  });
} else{
  let set = ref.set({
    "type": user[1].type,
    "username": user[1].username,
    "name": user[1].name,
    "email": user[1].email,
    "password": user[1].password
  });
}
}

let signupCol = db.collection('signups');

for (let signup of Object.entries(signupData)){
  let ref = db.collection('signups').doc(signup[0]);
  let set = ref.set({
    "StudentName": signup[1].StudentName,
    "StudentUsername": signup[1].StudentUsername,
    "Room": signup[1].Room
  });
}
