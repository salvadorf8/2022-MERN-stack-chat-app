const express = require('express');
require('dotenv').config();

const dbConfig = require('./config/db.config');
const usersRoute = require('./routes/users.route');
const chatsRoute = require('./routes/chats.route');
const messagesRoute = require('./routes/messages.route');

const app = express();
app.use(express.json());
app.use('/api/users', usersRoute);
app.use('/api/chats', chatsRoute);
app.use('/api/messages', messagesRoute);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('listening on 5000');
});
