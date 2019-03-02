let socket = io();

const userForm = document.querySelector('#user');
const textForm = document.querySelector('#text');
const submitBt = document.querySelector('#submitBt');
const shareLocBtn = document.querySelector('#shareLoc');

//Listen for a click on submit button
submitBt.addEventListener('click', (e) => {
    e.preventDefault();
    //sends the message to the server
    const message = {from: userForm.value, text: textForm.value};
    socket.emit('createMessage', message, (error) => {
        //This function is called when the data is sent correctly
        if(error){
            return console.log(error);
        }
        console.log('Delivered!');
    });
    
    userForm.value = '';
    textForm.value = '';

});

//Listen for a click on share location button
shareLocBtn.addEventListener('click', () => {
    //If the browser do not support this feature, an alert will be shown
    if(!navigator.geolocation){
        return alert("Geolocation not available on your browser!");
    }
    //Send the user's current location to server
    navigator.geolocation.getCurrentPosition((pos) => {
        let coords = {lat: pos.coords.latitude, lng: pos.coords.longitude};
        
        socket.emit('shareLoc', coords, () => {
            //This function is called when the data is sent correctly
            console.log('delivered!');
        });   
    });
});

//Display a msg when the client connects to server
socket.on('connect', function(){
    console.log('Connected to server!');
});

socket.on('disconnect', function() {
    console.log('disconnected from server');
});

//it's fired when a new message from other user is sent to the server
socket.on('newMessage', function(message){
    console.log("New message received!");
    console.log(`${message.from || 'admin'} says: ${message.text || message}`);
});


