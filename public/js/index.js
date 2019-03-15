let socket = io();

//elements
//const userForm = document.querySelector('#user');
const textForm = document.querySelector('#text');
const submitBt = document.querySelector('#submitBt');
const shareLocBtn = document.querySelector('#shareLoc');
const sidebar = document.querySelector('#sidebar');
const msgBox = document.querySelector('#messages-box');
const recordBt = document.querySelector('#recordBt');

//templates
const msgTemplate = document.querySelector('#message-template').innerHTML;
const locTemplate = document.querySelector('#loc-template').innerHTML;
const audioTemplate = document.querySelector('#audio-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Get the username the the room that the user wants to join
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

window.addEventListener("load",function() {
    setTimeout(function(){
        // This hides the address bar:
        window.scrollTo(0, 1);
    }, 0);
});


//Listen for a click on submit button
submitBt.addEventListener('click', (e) => {
    e.preventDefault();
    //Makesure the user do not send empty messages
    if(textForm.value.trim() !== ''){
        //disable submitBt to avoid the message being sent twice
        submitBt.setAttribute('disabled', 'disabled');
        //sends the message to the server
        const message = {from: 'User', text: textForm.value};
        socket.emit('createMessage', message, (error) => {
            //This function is called when the data is sent correctly
            //if there's an error the page is refreshed
            if(error){
                location.reload();
            }
            //enable submit bt again
            submitBt.removeAttribute('disabled', 'disabled');
            //To keep the cursor in text form
            textForm.focus();
            textForm.value = '';
        });
        
    }
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
        
        socket.emit('shareLoc', coords, (error) => {
            
            //This function is called when the data is sent correctly
            //if there's an error, the page is refreshed
            if(error){
                location.reload();
            }
            //enable shareLocBtn
            shareLocBtn.removeAttribute('disabled', 'disabled');
        });   
    });
});

//Display a msg when the client connects to server
socket.on('connect', function(){
    //location.reload();
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
        user: (message.from !== username) ? message.from : "you",
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    msgBox.insertAdjacentHTML('beforeend', html);
    playSound(message.from);
    autoscroll();
});

//Listen for the user's location
socket.on('shareLocMsg', (message) => {
    //Render the Mustache template for the locarion and insert the url dynamically
    const html = Mustache.render(locTemplate, {
        username: (message.from !== username) ? message.from : "you",
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    //Insert the location in the message box
    msgBox.insertAdjacentHTML('beforeend', html);
    playSound(message.from);
    autoscroll();
});

//Listen for an audio message
socket.on('audioMsg', (audioMsg) => {
    //when an audio message is received a new audio tag with the audio is created 
    //and attatched to the chat
    let audioBlob = new Blob([audioMsg.audioMsg]);
    let url = URL.createObjectURL(audioBlob);
    const html = Mustache.render(audioTemplate, 
        {
            username: (audioMsg.from !== username) ? audioMsg.from : "you",
            audioURL: url,
            createdAt: moment(audioMsg.createdAt).format('h:mm a')
        });
    msgBox.insertAdjacentHTML('beforeend', html);
    playSound(audioMsg.from);
    autoscroll();
});

//This event handles updating the sidebar with the usernames and room
socket.on('roomData', ({room, users}) => {
   const html = Mustache.render(sideBarTemplate, 
    {
        room,
        users
    });
    //update the sidebar when an user join or leave the chat
    sidebar.innerHTML = html;
});

socket.emit("join", {username, room}, (error) => {
    //If there is an error it will be redirected to the initial form
    if(error){
        alert(error);
        location.href = '/';
    }
    
});

//Listen for a click on the audio button
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
        recordBt.style.background = "#7C5CBF"
    } else {
        //Otherwise it starts the recording process
        recordBt.textContent = "Stop";
        recordBt.style.background = "red";
        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(function(stream) {
            gumStream = stream;
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = function(e) {
                audioChunks.push(e.data); //Save the audio samples in this array
                socket.emit('audioMsg', audioChunks[0], (error) => {
                    //This callback is called when the server deliver the audio
                    //if there is any error the page will be refreshed
                    if(error){
                        location.reload();
                    }
                });
            };
            recorder.start();
        });
    }
}

//This function handles playing a sound when a new msg is received
function playSound(currentUser){
    let bleep = new Audio();
    
    //if the user who sent the message is different from the current user, the sound will be played
    //This is to avoid the sound being played when the current user sends a message
    if(currentUser !== username && currentUser !== 'Admin'){
        bleep.src = '/sound/msg.mp3';
        bleep.play();
    }else if(currentUser === 'Admin'){
        //If it's an automatic message another sound is played
        bleep.src = '/sound/join.mp3';
        bleep.play();
    }
}

function autoscroll() {
    //This function is run everytime a new message is received. It verifies where is the scrollbar
    //when the message comes. If it is at the very bottom the page scrolls automatically

    //get the last received message
    const newMessage = msgBox.lastElementChild;
    //get the height of the message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
    
    //visible height
    const visibleHeight = msgBox.offsetHeight;
    //container height
    const containerHeight = msgBox.scrollHeight;
    //How far down have I scrolled
    const scrollOffSet = msgBox.scrollTop + visibleHeight;

    //This if statement verifies if the scroll bar is at the very bottom
    //if so, the page is scrolled down automatically, otherwise it'll not be
    if(containerHeight - newMessageHeight <= scrollOffSet){
        msgBox.scrollTop = msgBox.scrollHeight;
    }
}

