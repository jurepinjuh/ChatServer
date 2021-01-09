const bodyParser = require('body-parser');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = 3000;
var cors = require('cors')
var users = [];
app.set('port', port);
app.use(bodyParser.json());
app.use(cors())

function deleteUser(socketId) {
    var index = users.findIndex(x => x.socketId === socketId);
    users.splice(index, 1);
    return index;
}

function getUserBySocketId(socketId) {
    var index = users.findIndex(x => x.socketId === socketId);
    return users[index];
}

function getUserById(id) {
    var index = users.findIndex(x => x.id == id);
    return users[index];
}

app.get('/onlineUsers', function(req, res) {
    res.send(users);
})

io.on('connection', (socket) => {

    socket.on('join', function(user) {
        user.socketId = socket.id;
        users.push(user);
        io.emit('user-joined', user);
    });

    socket.on('leave', function(user) {
        deleteUser(user.socketId);
        io.emit('user-left', user);
    });

    socket.on('message', function(data) {
        toUser = getUserById(data.userid);
        io.to(toUser.socketId).emit('new-message', data);
    })

    socket.on('disconnect', function() {
        user = getUserBySocketId(socket.id.toString());
        deleteUser(socket.id.toString())
        io.emit('user-left', user);
    });

});
http.listen(port);