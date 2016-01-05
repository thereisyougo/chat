var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');
var userid = {};
app.set('views', './views');
app.set('view engine', 'jade');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data

app.use('/static', express.static(__dirname + '/public'));
app.use('/static/js', express.static('./public/javascripts'));
app.use('/static/css', express.static('./public/stylesheets'));
app.get('/example', function(req, res) {
	var out = {};
	res.render('index', out);
});
app.all('/send', function(req, res) {
	//console.log(req.body);
	var msg = req.param('msg'),
		fromUser = req.param('fromUser'),
		toUser = req.param('toUser');
	console.dir(msg + '#' + fromUser + '#' + toUser);
	if (msg != '' && fromUser && toUser) {
		if (toUser === 'allUser') {
			io.emit('chat message', {msg: msg, fromUser: fromUser, toUser: toUser});
		} else if (userid[toUser]) {
			_.each(userid[toUser], function(socket, index) {
				socket.emit('chat message', {msg: msg, fromUser: fromUser, toUser: toUser});
			});
		}
		//io.emit('chat message', {msg: msg, fromUser: req.param('fromUser'), toUser: req.param('toUser')});
	}
	res.json({success: true});
	res.end();
});
app.all('/disconnect', function(req, res) {
	var user = req.param('user');
	try {
		if (user)
			userid = _.omit(userid, user);
	} catch (e) {
		console.error(e.message);
	}
	res.end();
});

app.all('/online_user', function(req, res) {
	res.json({users: Object.keys(userid)});
	res.end();
});

app.all('/clean', function(req, res) {
	//console.dir(io.sockets);
	userid = {}
	_.each(io.sockets.sockets, function(socket, index) {
		var uid = socket.handshake.query.userid;
		if (uid) {
			userid[uid] = userid[uid] || [];
			userid[uid].push(socket);
		}
	});
	res.end();
});

app.get('/', function(req, res) {
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	var connUser = socket.handshake.query.userid;
	if (connUser) {
		userid[connUser] = userid[connUser] || [];
		userid[connUser].push(socket);
	}
	//console.dir(socket);
	//console.log('a user connected');
	socket.on('chat message', function(msgObj){
		console.log('message: ' + msgObj.msg);
		io.emit('chat message', {msg: msgObj.msg});
	});
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

process.on('uncaughtException', function (err) {
  console.log(err);
  console.log(err.stack);
});
