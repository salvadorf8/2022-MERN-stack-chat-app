const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('SF - mongo DB conenction successfull');
});

db.on('error', (error) => {
    console.log('SF - mongo DB conenction failed');
});

module.exports = db;
