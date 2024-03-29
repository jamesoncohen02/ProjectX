let admin = require("firebase-admin");
let db = admin.firestore();

exports.getAllRooms = async function() {
  //var roomData = fs.readFileSync('data/room.json', 'utf8');
  let allRooms = {};

  try {
    let rooms = await db.collection('rooms').get();

    for (let room of rooms.docs) {
      allRooms[room.id] = room.data();
    }
    return allRooms;
  } catch (err) {
    console.log("Error getting documents", err);
  }
  //return JSON.parse(roomData);
};

exports.getRoom = async function(id) {
  try{
  let roomData = await exports.getAllRooms();

  if (roomData[id]) {return roomData[id];}
  console.log(roomData[id]);

  return {};
} catch (err){
  console.log(err);
}
};

exports.updateRoom = async function(id, roomData) {
  let newRoomData = await exports.getAllRooms();
  newRoomData[id] = roomData;

  for (let room of Object.entries(newRoomData)){
    let ref = db.collection('rooms').doc(room[0]);
    let set = ref.set({
      "number": room[1].number,
      "maxCapacity": room[1].maxCapacity,
      "available": room[1].available,
      "studentsSignedUp": room[1].studentsSignedUp
    });
  }
};
