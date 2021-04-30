let express = require('express'),
    router = express.Router();

let User = require('../models/user_model');

router.get('/user/userSelect', async function(req, res){
  let users = await User.getAllUsers();
  res.status(200);
  res.setHeader('Content-Type', 'text/html');
  res.render('user/select_user.ejs', {users: users});
});

router.get('/user', async function(req, res){
  let username = req.query.user;
  let users = await User.getAllUsers();
  if(users[username]){
    res.redirect('/user/'+username);
  } else{
    let errorCode=404;
    res.status(errorCode);
    res.setHeader('Content-Type', 'text/html');
    res.render("error.ejs", {"errorCode":errorCode});
  }
});

router.get('/user/:username', async function(req, res){
  let users = await User.getAllUsers();
  let username = req.params.username;
  if(users[username]){
    let user = users[username];
    res.status(200);
    res.setHeader('Content-Type', 'text/html');
    res.render("user/user_details.ejs",{user: user});
  } else {
    let errorCode=404;
    res.status(errorCode);
    res.setHeader('Content-Type', 'text/html');
    res.render("error.ejs", {"errorCode":errorCode});
  }
});

module.exports = router;
