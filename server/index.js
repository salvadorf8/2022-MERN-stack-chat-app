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

    //  below both logged in users Bob, and John will be joined into a room
    socket.on('join-room', (userId) => {
        // console.log('user joined', userId);
        // joining a user into a room
        socket.join(userId);
    });

    // send message to recipient
    // io.to will send message to the recipient that is in the room.
    // Bob or John who ever is the sender, the other will be the recipient
    socket.on('send-message', ({ text, sender, recipient }) => {
        io.to(recipient).emit('receive-message', { text, sender });
    });
});

app.use('/api/users', usersRoute);
app.use('/api/chats', chatsRoute);
app.use('/api/messages', messagesRoute);

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log('listening on 5000');
});
