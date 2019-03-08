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
    //This variable will save who is the connected current user
    let currentUser;    
    //Handles the event when a user disconnect from server
    socket.on('disconnect', () => {
        socket.broadcast.emit('newMessage', formatMessages('Admin', `${currentUser} has left!`));
    });

   //Listen for an event, when a message is created by the client
    socket.on('createMessage', (message, username, room, callback) => {
        socket.join(room);
        //create an message object with who sent it, the message itself and when it was sent
        message = formatMessages(username, message.text);
        //When a new message is sent by an user, it will be sent to all other users
        io.to(room).emit('newMessage', message);
        callback(); //It tells the client that everything went well
    });

    //Listen for a shareLoc (share location) event. 
    socket.on('shareLoc', (pos, username, room, callback) => {
        socket.join(room);
        // When an user share its location it will be sent to the other users through an url
        io.to(room).emit('shareLocMsg', formatShareLoc(username, `https://www.google.com/maps?q=${pos.lat},${pos.lng}`));
        callback(); //It tells the client that everything went well
        
    });
    
    //Listen for an audioMsg event
    socket.on('audioMsg', (audioMsg,username, room, callback) => {
        //make sure the message is sent only to the current room
        socket.join(room);
        //when a client sends an audio message it will be sent to the other clients
        io.to(room).emit('audioMsg', formatAudioMsg(username, audioMsg));
        callback();
    });

    socket.on("join", ({username, room}) => {
        socket.join(room);
        currentUser = username
        //When a new user joins the chat, a welcome message is sent to him
        socket.emit('newMessage', formatMessages('Admin', `Welcome ${username} :)`));
        //The following message will be shown to all users but the current one
        socket.broadcast.to(room).emit('newMessage', formatMessages('Admin', `${username} joined the chat!`));
        
    });

});

server.listen(port, () => {
    console.log('starting server...');
});