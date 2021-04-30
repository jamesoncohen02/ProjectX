let admin = require("firebase-admin");
let db = admin.firestore();
const {google} = require('googleapis');
const keys = require('../client-secret.json');
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC"];

exports.getAllSignups = async function(){
  let allSignups = {};

  try {
    let signups = await db.collection('signups').get();

    for (let signup of signups.docs) {
      allSignups[signup.id] = signup.data();
    }
    return allSignups;
  } catch (err) {
    console.log("Error getting documents", err);
  }
  //return JSON.parse(roomData);
};

exports.getSignup = async function(signupId){
  try{
  let signupData = await exports.getAllSignups();
  if (signupData[signupId]){
    return signupData[signupId];
  }
  return {};
} catch(err){
  console.log(err);
}
};

exports.addSignup = async function(username, room){
  let signupData = await exports.getAllSignups();
  let users = await require("../models/user_model").getAllUsers();
  let rooms = await require("../models/room_model").getAllRooms();

  let newSignup = {
    "StudentName": users[username].name,
    "StudentUsername": username,
    "Room": room
  };
  let roomId = room.split(' ').join('-');
  let id = username+"_"+roomId;
  signupData[id] = newSignup;
  rooms[roomId].studentsSignedUp.push(users[username].name);
  users[username].currentRoomSignup = room;

  for (let signup of Object.entries(signupData)){
    let ref = db.collection('signups').doc(signup[0]);
    let set = ref.set({
      "StudentName": signup[1].StudentName,
      "StudentUsername": signup[1].StudentUsername,
      "Room": signup[1].Room
    });
  }
  console.log("Document added: " + newSignup.Room);

  for (let room of Object.entries(rooms)){
    let ref = db.collection('rooms').doc(room[0]);
    let set = ref.set({
      "number": room[1].number,
      "maxCapacity": room[1].maxCapacity,
      "available": room[1].available,
      "studentsSignedUp": room[1].studentsSignedUp
    });
  }

  for (let user of Object.entries(users)){
    let ref = db.collection('users').doc(user[0]);
    if (user[1].type === "student"){
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
  //Send addition to spreadsheet
  let client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  let gsapi = google.sheets({version:'v4', auth:client});

  let opt = {
    spreadsheetId: '1arZIycfuj_6mp2A_DtawfoE6_vKmjxnI92G4zXoF84E',
    range: 'Signups!A:AC'
  };
  let addOpt = {
    spreadsheetId: '1arZIycfuj_6mp2A_DtawfoE6_vKmjxnI92G4zXoF84E',
    valueInputOption: 'USER_ENTERED'
  };
  let data = await gsapi.spreadsheets.values.get(opt);
  let dataArray = data.data.values;
  console.log(dataArray);
  let newDataArray = dataArray.map(function(r){
    for (let i = 0; i<29; i++){
      if (!r[i]){
        r[i] = "";
      }
    }
    return r;
  });
  for (let i = 0; i<newDataArray[0].length; i++){
    if (dataArray[0][i] == room){
      let col = await gsapi.spreadsheets.values.get({spreadsheetId: '1arZIycfuj_6mp2A_DtawfoE6_vKmjxnI92G4zXoF84E',range: 'Signups!' + letters[i] + ":" + letters[i]});
      let lastRow = col.data.values.length;
      addOpt.range = 'Signups!'+letters[i]+(lastRow+1);
      addOpt.resource = {majorDimension: 'COLUMNS', values: [[users[username].name]]};
    }
  }
  let res = await gsapi.spreadsheets.values.update(addOpt);
  console.log(res);
};

exports.updateSignup = async function(signupId, newRoom){
  await exports.deleteSignup(signupId);
  let users = await require("../models/user_model").getAllUsers();
  let rooms = await require("../models/room_model").getAllRooms();
  let splitId = signupId.split("_");
  let username = splitId[0];
  let studentName = users[username].name;
  let oldRoom = splitId[1];
  let roomName = oldRoom.split('-').join(' ');
  exports.addSignup(username, newRoom);
};

exports.deleteSignup = async function(signupId){
  let users = await require("../models/user_model").getAllUsers();
  let rooms = await require("../models/room_model").getAllRooms();
  let splitId = signupId.split("_");
  let username = splitId[0];
  let studentName = users[username].name;
  let oldRoom = splitId[1];
  let roomName = oldRoom.split('-').join(' ');

  try{
  await db.collection('signups').doc(signupId).delete();
  console.log("Document deleted: " + signupId);
} catch(err){
  console.log(err);
}

  users[username].currentRoomSignup = "";

  for (let user of Object.entries(users)){
    let ref = db.collection('users').doc(user[0]);
    if (user[1].type === "student"){
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

  for (let i = 0; i<rooms[oldRoom].studentsSignedUp.length; i++){
    if (rooms[oldRoom].studentsSignedUp[i] === studentName){
      rooms[oldRoom].studentsSignedUp.splice(i, i+1);
    }
  }

  for (let room of Object.entries(rooms)){
    let ref = db.collection('rooms').doc(room[0]);
    let set = ref.set({
      "number": room[1].number,
      "maxCapacity": room[1].maxCapacity,
      "available": room[1].available,
      "studentsSignedUp": room[1].studentsSignedUp
    });
  }

  //Delete signup from spreadsheet
  let client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  let gsapi = google.sheets({version:'v4', auth:client});

  let opt = {
    spreadsheetId: '1arZIycfuj_6mp2A_DtawfoE6_vKmjxnI92G4zXoF84E',
    range: 'Signups!A:AC'
  };
  let data = await gsapi.spreadsheets.values.get(opt);
  let dataArray = data.data.values;
  console.log(dataArray);
  let newDataArray = dataArray.map(function(r){
    for (let i = 0; i<29; i++){
      if (!r[i]){
        r[i] = "";
      }
    }
    return r;
  });

  for (let i = 0; i<newDataArray[0].length; i++){
    if (dataArray[0][i] == roomName){
      let col = await gsapi.spreadsheets.values.get({spreadsheetId: '1arZIycfuj_6mp2A_DtawfoE6_vKmjxnI92G4zXoF84E',range: 'Signups!' + letters[i] + ":" + letters[i]});
      console.log(col.data.values);
      let lastRow = col.data.values.length;
      console.log(lastRow);
      for (let j = 1; j<(lastRow+1); j++){
        if(col.data.values[(j-1)][0] == users[username].name){
          let res = await gsapi.spreadsheets.values.clear({spreadsheetId: '1arZIycfuj_6mp2A_DtawfoE6_vKmjxnI92G4zXoF84E',range: 'Signups!' + letters[i] + j});
          console.log(res);
          /*let res2 = await gsapi.spreadsheets.batchUpdate({
            auth: client,
            spreadsheetId: '1arZIycfuj_6mp2A_DtawfoE6_vKmjxnI92G4zXoF84E',
            requestBody:{
              requests:[
                {
                  cutPaste:{
                    source:{
                      sheetId: 0,
                      startColumnIndex: (i+1),
                      startRowIndex: (j+1),
                      endRowIndex: lastRow
                    },
                    destination: {sheetId: 0, rowIndex: j},
                    pasteType: "PASTE_NORMAL"
                  }
                }
              ]
            }
          }, function(err, response){
              if (err) console.log('API error: ' + err);
          });*/
        }
      }
    }
  }
};
