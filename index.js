const express = require('express');
const app = express();


app.use(express.static(__dirname + '/public'));

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

let objects = {}

// const io = new Server(server);
const io = require('socket.io')(server, {
  cors: {
      origin: "http://localhost:8100",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
  },
  allowEIO3: true
});

app.get('/explore', (req, res) => {
  
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  // socket.broadcast.emit('hi');

  socket.on('entity create', (data) => {
    data.id = socket.id
    objects[socket.id] = data
    console.log(data)
    io.emit('entity create', data)
  });

  socket.on('entity update', (data) => {
    data.id = socket.id
    console.log(data)
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