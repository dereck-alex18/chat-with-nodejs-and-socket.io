let socket = io();
//Display a msg when the client connects to server
socket.on('connect', function(){
    console.log('Connected to server!');
});

socket.on('disconnect', function() {
    console.log('disconnected from server');
});

socket.on('newMessage', function(message){
    console.log("New message received!");
    console.log(message);
});

socket.emit('createMessage', 
{
    from: "JackBauer",
    text: "Damn it! I need your help!",
    
});