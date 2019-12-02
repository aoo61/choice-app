const mongoose = require('mongoose');

module.exports = () =>{
    mongoose.connect('mongodb+srv://aoo:0321654987a.@blockchain-api-siuqd.mongodb.net/blockchain_user?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true});

    mongoose.connection.on('open', () => {
        console.log('MongoDB: Connected');
    });

    mongoose.connection.on('error', (err) => {
        console.log('MongoDB: Error', err);
    });
};