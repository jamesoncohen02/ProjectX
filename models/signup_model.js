var fs = require('fs');

exports.getAllSignups=function(){
  var signupData = fs.readFileSync('data/signup.json', 'utf8');
  return JSON.parse(signupData);
}

exports.getSignup = function(signupId){
  var signupData = exports.getAllSignups();
  if (signupData[signupId]){
    return signupData[signupId];
  }
  return {};
}

exports.addSignup = function(username, room){
  var signupData = exports.getAllSignups();
  let users = JSON.parse(fs.readFileSync('data/user.json', 'utf8'));
  let rooms = JSON.parse(fs.readFileSync('data/room.json', 'utf8'));
  let newSignup = {
    "StudentName": users[username].name,
    "StudentUsername": username,
    "Room": room
  }
  let roomId = room.split(' ').join('-');
  let id = username+"_"+roomId;
  signupData[id] = newSignup;
  rooms[roomId].studentsSignedUp.push(users[username].name);
  users[username].currentRoomSignup = room;
  fs.writeFileSync('data/signup.json', JSON.stringify(signupData));
  fs.writeFileSync('data/room.json', JSON.stringify(rooms));
  fs.writeFileSync('data/user.json', JSON.stringify(users));
}

exports.updateSignup = function(signupId, newRoom){
  exports.deleteSignup(signupId);
  let splitId = signupId.split("_");
  let username = splitId[0];
  exports.addSignup(username, newRoom);
} 

exports.deleteSignup = function(signupId){
  var signupData = exports.getAllSignups();
  let users = JSON.parse(fs.readFileSync('data/user.json', 'utf8'));
  let rooms = JSON.parse(fs.readFileSync('data/room.json', 'utf8'));
  let splitId = signupId.split("_");
  let username = splitId[0];
  let studentName = users[username].name;
  let oldRoom = splitId[1];

  delete signupData[signupId];
  fs.writeFileSync('data/signup.json', JSON.stringify(signupData));
  users[username].currentRoomSignup = "";
  fs.writeFileSync('data/user.json', JSON.stringify(users));
  for (let i = 0; i<rooms[oldRoom].studentsSignedUp.length; i++){
    if (rooms[oldRoom].studentsSignedUp[i] == studentName){
      rooms[oldRoom].studentsSignedUp.splice(i, i+1);
    }
  }
  fs.writeFileSync('data/room.json', JSON.stringify(rooms));
}
