import http from 'http';
import express from 'express';
import cors from 'cors';
import io from 'socket.io';
import config from '../config/config.json';
import path from 'path';

// setup server
const app = express();
const server = http.createServer(app);

const socketIo = io(server);

// 메시지를 저장할 데이터
let db = []; 

// Allow CORS
app.use(cors());

// Render a API index page
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// 기존의 대화를 모두 불러오는 라우트

app.get('/messages', (req, res) => {
  res.send(db);
});


// Start listening
server.listen(process.env.PORT || config.port);
console.log(`Started on port ${config.port}`);

// Setup socket.io
socketIo.on('connection', socket => {
  const username = socket.handshake.query.username;
  console.log(`${username} connected`);

  socket.on('client:message', data => {
    console.log(`${data.username}: ${data.message}`);

    //들어온 메시지를 데이터에 푸쉬
    db.push(data)
    console.log(db);
    // message received from client, now broadcast it to everyone else
    socket.broadcast.emit('server:message', data);
  });

  socket.on('disconnect', () => {
    console.log(`${username} disconnected`);
  });
});

export default app;
