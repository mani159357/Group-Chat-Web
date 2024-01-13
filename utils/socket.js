// socket.js
const io = require('socket.io')({
    cors: {
        origin: ['http://localhost:3000'],
    },
});

io.on('connection', (socket) => {
    console.log(socket.id + " connection is made");

    socket.on('custom-event', (number, string, obj) => {
        console.log(number, string, obj);
    });

    socket.on('send-message', (message, room, cb) => {
        if (room === '') {
            socket.broadcast.emit('receive-message', message);
        } else {
            io.to(room).emit('receive-message', message);
        }
        cb('Message received!');
    });

    socket.on('join-room', (room, cb) => {
        cb(`${room}` + " called");
        socket.join(room);
    });
});

module.exports = io;
