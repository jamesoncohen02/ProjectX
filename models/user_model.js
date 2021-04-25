var fs = require('fs');

exports.getAllUsers = function(){
  var userData = fs.readFileSync('data/user.json', 'utf8');
  return JSON.parse(userData);
}

exports.getUser = function(username){
  var userData = exports.getAllUsers();
  if (userData[username]) {return userData[username];}

  return {};
}
