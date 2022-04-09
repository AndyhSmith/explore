const express = require('express');
const app = express();


app.use(express.static('public'));

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

let objects = {}

// const io = new Server(server);
const io = require('socket.io')(server, {
  cors: {
      rememberTransport: false,
      origin: "http://localhost:8100",
      methods: ["GET", "POST"],
      transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'],
      credentials: true
  },
  allowEIO3: true
});

app.get('/explore', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/explore/main.js', (req, res) => {
  res.sendFile(__dirname + '/public/main.js');
});

io.on('connection', (socket) => {
  console.log('User has connected:', socket.id);

  socket.on('entity create', (data) => {
    data.id = socket.id
    objects[socket.id] = data
    io.emit('entity create', data)
  });

  socket.on('entity update', (data) => {
    data.id = socket.id
    objects[socket.id] = data
    io.emit('entity update', data)
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    delete objects[socket.id];
    io.emit('entity delete', socket.id);
    console.log('user disconnected');
  });

});

server.listen(3001, () => {
  console.log('listening on *:3001');
});