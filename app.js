const path = require ('path')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv');
const fs = require('fs')
const compression = require('compression');
const morgan = require('morgan')

const app = express();
dotenv.config();
const accessLogServices = fs.createWriteStream(path.join(__dirname,'access.log'),{flags: 'a'});

const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors())
app.use(express.json())
app.use(compression())
app.use(morgan('combined',{stream: accessLogServices}));

const userRoutes = require('./routes/user')
const chatRoutes = require('./routes/chat')
const password = require('./routes/resetpassword')
const sendImage = require('./controllers/image')

const authenticatemiddleware = require('./middleware/auth');

const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

app.use('/user',userRoutes)
app.use('/chat',chatRoutes)
app.use('/password',password)
app.post('/upload/file', authenticatemiddleware.authenticate, upload.single('file'), sendImage.send)

// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
// app.post('/upload/file', upload.single('file'), function (req, res) {
//     console.log("hello")
//     console.log(req.file)

// })

app.use((req,res,next) => {
    res.sendFile(path.join(__dirname,`views/${req.url}`))
})

const sequelize = require('./utils/database');
const User = require('./models/users');
const Message = require('./models/messages')
const Group = require('./models/groups')
const UserGroup = require('./models/userGroup');
const Forgotpassword = require('./models/forgotpassword')

User.hasMany(Message)
Message.belongsTo(User)

Message.belongsTo(Group)
Group.hasMany(Message);

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

sequelize.sync({force: false})
    .then(() => {
        console.log("server running on port  3000")
        app.listen(process.env.PORT || 3000);

        io.on('connetcion', (socket) => {
            console.log(socket.id + "connection is made")
            socket.on('custom-event',(number,string,obj) => {
                console.log(number,string,obj)
            })
            socket.on('send-message',(message,room) => {
                if(room === ''){
                    // io.emit('receive-message',message)
                    socket.broadcast.emit("receive-message", message)
                    console.log(message)
                } else {
                    socket.to(room).emit("receive-message", message)
                }
                
            })
        })

    })
    .catch(err => {
        console.log(err);
    })



