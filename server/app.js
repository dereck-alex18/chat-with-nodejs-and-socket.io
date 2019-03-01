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

    //Creates a newMessage event
    socket.emit('newMessage', 
    {
       from: "JohnDoe",
       text: "Hi there!",
       createdAt: 123
    });

    //Listen for an event, when a message is created by the client
    socket.on('createMessage', (message) => {
        console.log(message);

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