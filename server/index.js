const express = require('express');
require('dotenv').config();

const dbConfig = require('./config/db.config');
const usersRoute = require('./routes/users.route');
const chatsRoute = require('./routes/chats.route');
const messagesRoute = require('./routes/messages.route');

const app = express();
app.use(express.json());

// socket.io initialization
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// check the connection of socket from client
io.on('connection', (socket) => {
    // socket events will be here
    // console.log('connected with socketid', socket.id);

    socket.on('send-new-message-to-all', (data) => {
        console.log('SF - message from client', data);
        socket.emit('new-message-from-server', data);
    });
});

app.use('/api/users', usersRoute);
app.use('/api/chats', chatsRoute);
app.use('/api/messages', messagesRoute);

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log('listening on 5000');
});
