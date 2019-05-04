const users = [];

const addUser = ({id, username, room}) => {
    //check if a username and room exist
    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }
    //Remove all blank space and lowercase both room and username
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //check if the username already exists
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    });
    
    //if so, an error message is returned
    if(existingUser){
        return {
            error: 'Username already exists in this room'
        }
    }

    //Otherwise the user is added
    const user = {id, username, room}
    users.push(user)
    return{ user }
}

const removeUser = (id) => {
    //get the index of the user in the users array by its id
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    //Remove the user from the array
    if(index !== -1){
        return users.splice(index, 1)[0];    
    }
}

const getUser = (id) => {
    //find user by its id
    const foundUser = users.find((user) => {
        if(user.id === id){
            return user;
        }
    });
    //if the user exist it is returned, otherwise undefinied is returned
    return foundUser;
}

const getUsersInRoom = (room) => {
    //Return an array of users in the room
    return users.filter((user) => user.room === room);
}
//get all users in all rooms
const allUsersInRoom = (rooms) => {
    //loop through rooms object
    for(index in rooms){
        let roomName = index;
        roomName = roomName.trim().toLowerCase();
        //the length of the array returned by getUsersInRoom is the number of users in that particular room
        rooms[index] = getUsersInRoom(roomName).length;
    }
    return rooms;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    allUsersInRoom
}

