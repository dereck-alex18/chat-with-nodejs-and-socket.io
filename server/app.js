const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const {formatMessages, formatShareLoc, formatAudioMsg} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

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
        const user = removeUser(socket.id);
        //Makesure the user exist in order to not crash the server side code
        if(user){
            socket.broadcast.to(user.room).emit('newMessage', formatMessages('Admin', `${user.username} has left!`));
        }
       
    });

   //Listen for an event, when a message is created by the client
    socket.on('createMessage', (message, callback) => {
        //get the username and from from getUser function
        const {username, room} = getUser(socket.id);
        
        socket.join(room);
        //create an message object with who sent it, the message itself and when it was sent
        message = formatMessages(username, message.text);
        //When a new message is sent by an user, it will be sent to all other users
        io.to(room).emit('newMessage', message);
        callback(); //It tells the client that everything went well
    });

    //Listen for a shareLoc (share location) event. 
    socket.on('shareLoc', (pos, callback) => {
        //get the username and from from getUser function
        const {username, room} = getUser(socket.id);

        socket.join(room);
        // When an user share its location it will be sent to the other users through an url
        io.to(room).emit('shareLocMsg', formatShareLoc(username, `https://www.google.com/maps?q=${pos.lat},${pos.lng}`));
        callback(); //It tells the client that everything went well
        
    });
    
    //Listen for an audioMsg event
    socket.on('audioMsg', (audioMsg, callback) => {
        //get the username and from from getUser function
        const {username, room} = getUser(socket.id);
        
        //make sure the message is sent only to the current room
        socket.join(room);
        //when a client sends an audio message it will be sent to the other clients
        io.to(room).emit('audioMsg', formatAudioMsg(username, audioMsg));
        callback();
    });

    socket.on("join", ({username, room}, callback) => {
        const {user, error} = addUser({id: socket.id, username, room});
        //if there is an error it will be passed to the client through a cb function
        if(error){
            return callback(error);
        }

        socket.join(user.room);
        currentUser = username
        //When a new user joins the chat, a welcome message is sent to him
        socket.emit('newMessage', formatMessages('Admin', `Welcome ${user.username} :)`));
        //The following message will be shown to all users but the current one
        socket.broadcast.to(user.room).emit('newMessage', formatMessages('Admin', `${user.username} joined the chat!`));
        
        callback();
    });

});

server.listen(port, () => {
    console.log('starting server...');
});