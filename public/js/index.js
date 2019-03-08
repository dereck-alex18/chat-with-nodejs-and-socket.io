let socket = io();

//elements
//const userForm = document.querySelector('#user');
const textForm = document.querySelector('#text');
const submitBt = document.querySelector('#submitBt');
const shareLocBtn = document.querySelector('#shareLoc');
const msgBox = document.querySelector('#messages-box');
const recordBt = document.querySelector('#recordBt');

//templates
const msgTemplate = document.querySelector('#message-template').innerHTML;
const locTemplate = document.querySelector('#loc-template').innerHTML;
const audioTemplate = document.querySelector('#audio-template').innerHTML;

//Get the username the the room that the user wants to join
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })
console.log(username, room);

//Listen for a click on submit button
submitBt.addEventListener('click', (e) => {
    e.preventDefault();
    //disable submitBt to avoid the message being sent twice
    submitBt.setAttribute('disabled', 'disabled');
    //sends the message to the server
    const message = {from: 'User', text: textForm.value};
    socket.emit('createMessage', message, username, room, (error) => {
        //This function is called when the data is sent correctly
        if(error){
            return console.log(error);
        }
        console.log('Delivered!');
        //enable submit bt again
        submitBt.removeAttribute('disabled', 'disabled');
        //To keep the cursor in text form
        textForm.focus();
        textForm.value = '';
    });
});

//Listen for a click on share location button
shareLocBtn.addEventListener('click', () => {
    //disable shareLocBtn to prevent the location from being sent twice
    shareLocBtn.setAttribute('disabled', 'disabled');
    
    //If the browser do not support this feature, an alert will be shown
    if(!navigator.geolocation){
        return alert("Geolocation not available on your browser!");
    }
    //Send the user's current location to server
    navigator.geolocation.getCurrentPosition((pos) => {
        let coords = {lat: pos.coords.latitude, lng: pos.coords.longitude};
        
        socket.emit('shareLoc', coords, username, room, () => {
            //This function is called when the data is sent correctly
            console.log('delivered!');
            //enable shareLocBtn
            shareLocBtn.removeAttribute('disabled', 'disabled');
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
   //The lines bellow insert the message in the message-box by redering the Mustache template
    const html = Mustache.render(msgTemplate, {
        user: message.from,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    msgBox.insertAdjacentHTML('beforeend', html);
});

//Listen for the user's location
socket.on('shareLocMsg', (message) => {
    //Render the Mustache template for the locarion and insert the url dynamically
    const html = Mustache.render(locTemplate, {
        username: message.from,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    //Insert the location in the message box
    msgBox.insertAdjacentHTML('beforeend', html);
});

//Listen for an audio message
socket.on('audioMsg', (audioMsg) => {
    //when an audio message is received a new audio tag with the audio is created 
    //and attatched to the chat
    let audioBlob = new Blob([audioMsg.audioMsg]);
    let url = URL.createObjectURL(audioBlob);
    const html = Mustache.render(audioTemplate, 
        {
            username: audioMsg.from,
            audioURL: url,
            createdAt: moment(audioMsg.createdAt).format('h:mm a')
        });
    msgBox.insertAdjacentHTML('beforeend', html);
    
});

recordBt.addEventListener('click', recordAudioMsg);

let audioChunks = []; //This array will contain the sample of the audio
let recorder, gumStream;

//The function bellow handles recording an audio message
function recordAudioMsg(){
    if (recorder && recorder.state == "recording") {
        //When the app is recording and recordBt is clicked again, it will stop the recording
        recorder.stop();
        gumStream.getAudioTracks()[0].stop();
        audioChunks = [];
        recordBt.textContent = "Audio";
    } else {
        //Otherwise it starts the recording process
        recordBt.textContent = "Stop";
        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(function(stream) {
            gumStream = stream;
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = function(e) {
                audioChunks.push(e.data); //Save the audio samples in this array
                socket.emit('audioMsg', audioChunks[0], username, room, () => {
                    //This callback is called when teh server deliver the audio
                    console.log('Delivered!');
                });
            };
            recorder.start();
        });
    }
}

socket.emit("join", {username, room});
