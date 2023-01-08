const express = require('express');
require('dotenv').config();

const dbConfig = require('./config/db.config');
const usersRoute = require('./routes/users.route');
const chatsRoute = require('./routes/chats.route');
const messagesRoute = require('./routes/messages.route');

const app = express();
app.use(
    express.json({
        limit: '50mb'
    })
);

// socket.io initialization
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

let onlineUsers = [];

// check the connection of socket from client
io.on('connection', (socket) => {
    // socket events will be here

    //  below both logged in users Bob, and John will be joined into a room
    socket.on('join-room', (userId) => {
        // console.log('user joined', userId);
        // joining a user into a room
        socket.join(userId);
    });

    // send message to clients (who are present in members array)
    socket.on('send-message', (message) => {
        io.to(message.members[0]).to(message.members[1]).emit('receive-message', message);
    });

    socket.on('clear-unread-messages', (data) => {
        io.to(data.members[0]).to(data.members[1]).emit('unread-messages-cleared', data);
    });

    // typing event
    socket.on('typing', (data) => {
        io.to(data.members[0]).to(data.members[1]).emit('started-typing', data);
    });

    // online users
    socket.on('came-online', (userId) => {
        if (!onlineUsers.includes(userId)) {
            onlineUsers.push(userId);
        }

        io.emit('online-users-updated', onlineUsers);
    });
});

app.use('/api/users', usersRoute);
app.use('/api/chats', chatsRoute);
app.use('/api/messages', messagesRoute);

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log('listening on 5000');
});
