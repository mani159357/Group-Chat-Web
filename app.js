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

app.use(cors())
app.use(express.json())
app.use(compression())
app.use(morgan('combined',{stream: accessLogServices}));

const userRoutes = require('./routes/user')
const chatRoutes = require('./routes/chat')
const password = require('./routes/resetpassword')

app.use('/user',userRoutes)
app.use('/chat',chatRoutes)
app.use('/password',password)

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
    })
    .catch(err => {
        console.log(err);
    })