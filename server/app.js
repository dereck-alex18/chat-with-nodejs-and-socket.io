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
});

server.listen(port, () => {
    console.log('starting server...');
});