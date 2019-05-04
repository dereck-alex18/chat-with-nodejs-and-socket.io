let socket = io();

const selectRooms = document.querySelector('#rooms');
let rooms = 
{
    "Sweet River": 0,
    "Atlantic Garden": 0,
    "Little Fish": 0,
    "Yellow House": 0
};

//make a request to get the users in all rooms
socket.emit("getUsersInRoom", rooms);

//Listen for the users in all rooms
socket.on("getUsersInRoom", (rooms) => {
    for(index in rooms){
        //Populate the select box
        selectRooms.options[selectRooms.options.length] = new Option(`${index} (${rooms[index]} users)`, index);
    }
});

