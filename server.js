let express = require('express');
let app = express();
let ejs = require('ejs');
let methodOverride = require('method-override');

let admin = require("firebase-admin");
let serviceAccount = require("./firebase-config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(express.json());
app.use(express.urlencoded());
app.use(methodOverride('_method'));
app.set('view_engine', 'ejs');
app.use(express.static('public'));

app.use(require('./controllers/room_controller'));
app.use(require('./controllers/user_controller'));
app.use(require('./controllers/signup_controller'));

var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log('listening on port:'+port+'!');
});
