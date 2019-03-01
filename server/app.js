const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
//setting the port
let port = process.env.PORT || 3000;
//creating an http server
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
        console.log('User disconnected from server!');
    });

    //When a new user joins the chat, a welcome message is sent to him
    socket.emit('newMessage', 
    {
       from: "Admin",
       text: "Welcome to the chat app! :)",
       createdAt: new Date().getTime()
    });

    //The following message will be shown to all users but the current one
    socket.broadcast.emit('newMessage', 
    {
        from: "Admin",
        text: "New user joined the chat!",
        createdAt: new Date().getTime()
    });

    //Listen for an event, when a message is created by the client
    socket.on('createMessage', (message) => {
        console.log(message);

        //When a new message is sent by an user, it will be sent to all other users
        io.emit('newMessage', 
        {
            from: message.from,
            text: message.text,
            createdAt: new Date().getTime()
        });
    });

});

server.listen(port, () => {
    console.log('starting server...');
});