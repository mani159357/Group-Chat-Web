import {io} from "socket.io-client"

const socket = io('http://localhost:3000')

socket.on('/upload/file', updatemsgs());

socket.on('receive-message', (message) => {
    // Handle received messages in real-time
    addNewMessage(message);
    scrollToBottom();
});

// const socket = io('http://localhost:3000')
socket.on('connect',() =>{
    displayMessage("your connection is made")
    socket.emit('custom-event', 10, 'Hi', {a:'a'})
    socket.emit('send-message',message="hi", room)

})

socket.on('receive-message',message => {
    displayMessage(message)
})

socket.emit('join-room',  room, message=> {
    displayMessage(message)
})

function displayMessage(message){
    alert(message);
}