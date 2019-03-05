const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const {formatMessages, formatShareLoc, formatAudioMsg} = require('./utils/messages');

const app = express();
//setting the port
let port = process.env.PORT || 3000;
//creating an http server so it can be sent to socket.io
let server = http.createServer(app);
//adding socket io to the server
let io = socketIO(server);
//setting the path to the frontend
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

//Listen for clients
io.on('connection', (socket) => {
    console.log('New user connected!');
    
    //Handles the event when a user disconnect from server
    socket.on('disconnect', () => {
        socket.broadcast.emit('newMessage', formatMessages('Admin', 'An user has left!'));
    });

    //When a new user joins the chat, a welcome message is sent to him
    socket.emit('newMessage', formatMessages('Admin', 'Welcome! :)'));

    //The following message will be shown to all users but the current one
    socket.broadcast.emit('newMessage', formatMessages('Admin', 'A new user joined the chat!'));

    //Listen for an event, when a message is created by the client
    socket.on('createMessage', (message, callback) => {
        message = formatMessages(message.from, message.text);
        //When a new message is sent by an user, it will be sent to all other users
        io.emit('newMessage', message);
        callback(); //It tells the client that everything went well
    });

    //Listen for a shareLoc (share location) event. 
    socket.on('shareLoc', (pos, callback, test) => {
        // When an user share its location it will be sent to the other users through an url
        io.emit('shareLocMsg', formatShareLoc(`https://www.google.com/maps?q=${pos.lat},${pos.lng}`));
        callback(); //It tells the client that everything went well
        
    });
    
    //Listen for an audioMsg event
    socket.on('audioMsg', (audioMsg, callback) => {
        //when a client sends an audio message it will be sent to the other clients
        io.emit('audioMsg', formatAudioMsg(audioMsg));
        callback();
    });

});

server.listen(port, () => {
    console.log('starting server...');
});