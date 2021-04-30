let admin = require("firebase-admin");
let db = admin.firestore();

exports.getAllUsers = async function(){
  let allUsers = {};
  try{
    let users = await db.collection('users').get();
    for (let user of users.docs) {
      allUsers[user.id] = user.data();
    }
    return allUsers;
  } catch (err) {
    console.log("Error getting documents", err);
  }
};

exports.getUser = async function(username){
  try{
  let userData = await exports.getAllUsers();
  if (userData[username]) {return userData[username];}

  return {};
}catch(err){
  console.log(err);
}
};
