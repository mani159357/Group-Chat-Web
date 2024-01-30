const Message = require('../models/messages');
const Group = require('../models/groups')
const UserGroup = require('../models/userGroup')
const jwt = require('jsonwebtoken');
const User = require('../models/users')
const sequelize = require('../utils/database');
const { Op } = require('sequelize');
const Messages = require('../models/messages');
const Archive = require('../models/archive')

process.env.TZ = 'Asia/Kolkata';

////////// Cron job //////////
const cron = require('node-cron');
// Schedule a task to run every minute
cron.schedule('0 0 * * *', () => {
    console.log('Running a task every minute');
    const istDate = new Date();
    const oneDayAgo = new Date(istDate.getTime() + (5.5 * 60 * 60 * 1000));
    console.log(istDate)
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    console.log(oneDayAgo)

    Messages.findAll({
        where: {
          createdAt: {
            // [Op.between]: [oneDayAgo, new Date()] // Find rows created between one day ago and now
            [Op.lt]: oneDayAgo // Find rows created before one day ago
          }
        }
      })
      .then(async messages => {
        console.log("heheheheheheheheh")
        console.log(messages); // Messages created before one day ago

        for (const message of messages) {
            console.log(message.updatedAt)
            await Archive.create({
              name: message.name,
              message: message.message,
              type: message.type,
              userId: message.userId,
              groupId: message.groupId,
              createdAt: message.createdAt,
              updatedAt: message.updatedAt
            });
      
            // Delete the message from the original table
            await message.destroy();
          }

      })
      .catch(error => {
        console.error('Error retrieving messages:', error);
      });
},
null, // onComplete
true, // start
'Asia/Kolkata');


// const http = require('http');
// const express = require('express');

// const io = require('socket.io')
// (3000, {
//     cors: {
//         origin: ['http://localhost:3000'],
//     },
// })

// const socketIo = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// io.on('connetcion', (socket) => {
//     console.log(socket.id + "connection is made")
//     socket.on('custom-event',(number,string,obj) => {
//         console.log(number,string,obj)
//     })
//     socket.on('send-message',(message,room) => {
//         if(room === ''){
//             // io.emit('receive-message',message)
//             socket.broadcast.emit("receive-message", message)
//             console.log(message)
//         } else {
//             socket.to(room).emit("receive-message", message)
//         }
        
//     })
//     socket.on('join-room', (room,cb) => {
//         cb(`${room}`+"called")
//         socket.join(room)
//     })
    
// })



const getMessages = async (req, res, next) => {
    const grp = req.params.grp
    console.log("grp is")
    console.log(grp)
    const gId = await Group.findOne({ where: { id: grp } })
    const grpId = gId ? gId.id : gId;
    console.log(grpId)

    try {
        const messages = await Message.findAll({ where: { groupId: grpId } })
        console.log(messages)
        // io.emit('message', { group: grpId, messages });
        return res.status(200).json({ messages: messages })
    } catch {
        return res.status(403).json({ message: "something went wrong while fetching the messages" })
    }
    

}


const sendMessage = async (req, res, next) => {
    const { grp, newmessage } = req.body
    console.log(req.body)

    try {
        let grpId
        if (grp != "common") {
            const gId = await Group.findOne({ where: { groupName: grp } })
            grpId = gId.id;
            console.log(gId)
        }
        // console.log(req.user.dataValues.name)
        // const { message } = req.body
        console.log(req.user.dataValues)

        const msg = await Message.create({
            name: req.user.dataValues.name,
            message: newmessage,
            userId: req.user.dataValues.id,
            groupId: grpId
        });
        // io.emit('newMessage', { group: grpId, message: msg });

        return res.status(200).json({ messages: msg, message: "message sent Successfully" })
    } catch {
        return res.status(403).json({ message: "something went wrong while sending the message" })
    }
    
}


const getGroupUsers = async (req, res, next) => {
    const grp = req.params.grp;
    console.log("grp name is")
    console.log(grp)
    console.log(typeof grp)
    try {
        let Cusers
        if (grp == 'undefined') {
            Cusers = await User.findAll();
        }
        else {
            const gId = await Group.findOne({ where: { id: grp } });

            const ids = await UserGroup.findAll({ where: { groupId: gId.id } })
            console.log(ids)
            const userIds = ids.map(userGroup => userGroup.dataValues.userId);
            console.log(userIds)
            Cusers = await User.findAll({ where: { id: { [Op.in]: userIds } } });
        }

        // console.log(users)
        return res.status(200).json({ you: req.user.dataValues.name, users: Cusers })
    } catch {
        return res.status(403).json({ message: "something went wrong while fetching the users" })
    }

}


const getLatestMsgs = async (req, res, next) => {
    const grp = req.query.grp;
    console.log('grp is')
    console.log(grp)
    try {
        const id = req.params.msgId
        console.log(id)
        if (grp === "common" || grp === null) {
            const msgs = await Message.findAll({where: {groupId: null}})
            let filteredMessages = msgs.filter(msg => msg.id > id);
            console.log(filteredMessages)

            return res.status(200).json({ messages: filteredMessages })
        }
        else {
            const grpId = await Group.findOne({ where: { groupName: grp } })
            const msgs = await Message.findAll({ where: { groupId: grpId.id } })

            let filteredMessages = msgs.filter(msg => msg.id > id);
            console.log(filteredMessages)

            return res.status(200).json({ messages: filteredMessages })
        }

    } catch {
        return res.status(403).json({ message: "error occcured when updating the messages" })
    }



}


const createGroup = async (req, res, next) => {

    const group = req.body.group;
    const you = req.body.you;
    console.log(req.body)
    try {
        const groupDetails = await Group.create({ groupName: group.name, members: group.users })
        console.log(groupDetails)
        const userDetails = await User.findAll({ where: { name: { [Op.in]: group.users } } });
        console.log(userDetails)
        userDetails.forEach(async element => {
            console.log(element)
            const admin = (you == element.dataValues.name) ? 1 : 0;
            await UserGroup.create({ userId: element.dataValues.id, groupId: groupDetails.dataValues.id, admin: admin })
        });
        res.status(200).json({ message: "successfully created the group" })
    } catch {
        res.status(403).json({ message: "Error in creating the group" })
    }

}


const getGroups = async (req, res, next) => {
    console.log("mani")
    try {
        const ids = await UserGroup.findAll({ where: { userId: req.user.dataValues.id } })
        console.log(ids)
        const groupIds = ids.map(userGroup => userGroup.dataValues.groupId);
        console.log(groupIds)
        const groups = await Group.findAll({ where: { id: { [Op.in]: groupIds } } });
        return res.status(200).json({ groups: groups, message: "Groups loaded Successfully" })
    } catch {
        res.status(403).json({ message: "Groups loading failed" })
    }

}


const getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll()
        res.status(200).json({ users: users, message: "successfully fetched users" })
    } catch {
        res.status(403).json({ users: users, message: "fetching users failed" })
    }

}


const showUsers = async (req, res, next) => {
    console.log("hii i am called")
    const grp = req.params.grp;
    console.log("grp name is")
    console.log(grp)
    try {
        let Cusers
        if (grp === "common" || grp === null) {
            Cusers = await User.findAll();
        }
        else {
            const gId = await Group.findOne({ where: { groupName: grp } });
            const ids = await UserGroup.findAll({ where: { groupId: gId.id } })
            console.log(ids)
            const userIds = ids.map(userGroup => userGroup.dataValues.userId);
            console.log(userIds)
            Cusers = await User.findAll({ where: { id: { [Op.in]: userIds } } });
        }

        // console.log(users)
        return res.status(200).json({ you: req.user.dataValues.name, users: Cusers })
    } catch {
        return res.status(403).json({ message: "something went wrong while fetching the users" })
    }

}


const makeAdmin = async (req, res, next) => {
    const uId = req.params.uId
    const gName = req.body.grp
    try {
        const gDetails = await Group.findOne({ where: { groupName: gName } })
        const Details = await UserGroup.update({
            admin: 1
        },
            {
                where: {
                    userId: uId,
                    groupId: gDetails.id
                }
            })
        return res.status(200).json({ gData: Details, message: "Successfully made as Admin" })
    } catch {
        return res.status(403).json({ message: " Something went wrog while making admin" })
    }

}


const removeAdmin = async (req, res, next) => {
    const uId = req.params.uId
    const gName = req.body.grp
    try {
        const gDetails = await Group.findOne({ where: { groupName: gName } })
        const Details = await UserGroup.update({
            admin: 0
        },
            {
                where: {
                    userId: uId,
                    groupId: gDetails.id
                }
            })
        return res.status(200).json({ gData: Details, message: "Successfully removed the Admin access" })
    } catch {
        return res.status(403).json({ message: " Something went wrog while making admin" })
    }

}


const removeUser = async (req, res, next) => {
    const uId = req.params.uId
    const gDetails = req.body.grp
    try {
        const gData = await Group.findOne({ where: { groupName: gDetails.name } })
        const Details = await UserGroup.destroy({
            where: {
                userId: uId,
                groupId: gData.id
            }
        })
        const GDetails = await Group.update({ members: gDetails.users }, { where: { groupName: gDetails.name } })
        return res.status(200).json({Removed: Details, gData: GDetails, message: "successfully removed the user from the group" })
    } catch {
        return res.status(403).json({ message: " Something went wrog while making admin" })
    }

}

const updateGroup = async (req, res, next) => {
    const gDetails = req.body.group
    const selectedUsers = req.body.selected
    try {
        const gId = await Group.findOne({where:{groupName: gDetails.name}})
        console.log('gId -dataValues')
        console.log(gId.dataValues.id)
        await Group.update({ members: gDetails.users }, { where: { groupName: gDetails.name } })
        const userDetails = await User.findAll({ where: { name: { [Op.in]: selectedUsers } } });
        userDetails.forEach(async element => {
            console.log(element)
            await UserGroup.create({ userId: element.dataValues.id, groupId: gId.dataValues.id, admin: 0 })
        });
        return res.status(200).json({ message: "successfully Added the user to the group" })
    } catch {
        return res.status(403).json({ message: " Something went wrog while adding users" })
    }
}


const showMembers = async (req, res, next) => {
    console.log("hii i am members")
    const grp = req.params.grp;
    console.log("grp name ")
    console.log(grp)
    try {
        let Cusers
        console.log("curses")
        if (grp === "common" || grp === null) {
            Cusers = await User.findAll();
            return res.status(200).json({ you: req.user.dataValues.name, users: Cusers})
        }
        
        else {
            const gId = await Group.findOne({ where: { groupName: grp } });

            const ids = await UserGroup.findAll({ where: { groupId: gId.id } })
            console.log("ids are")
            console.log(ids)
            const userIds = ids.map(userGroup => userGroup.dataValues.userId);
            console.log("userids are")

            console.log(userIds)
            Cusers = await User.findAll({ where: { id: { [Op.in]: userIds } } });
            return res.status(200).json({ you: req.user.dataValues.name, users: Cusers ,adminUsers: ids})
        }

        // console.log(users)
        
    } catch {
        return res.status(403).json({ message: "something went wrong while fetching the users" })
    }

}

const leaveGroup = async (req,res,next) => {
    const gId = req.params.gId;
    const userId = req.query.userid;
    const gDetails = req.body.grp
    try {
        const Details = await UserGroup.destroy({
            where: {
                userId: userId,
                groupId: gId
            }
        })
        const GDetails = await Group.update({ members: gDetails.users }, { where: { id : gId } })
        return res.status(200).json({Removed: Details, gData: GDetails, message: "successfully removed the user from the group" })
    } catch {
        return res.status(403).json({ message: " Something went wrog while making admin" })
    }
}



const deleteGroup = async (req,res,next) => {
    console.log("This is mani ")
    const gId = req.params.gId;
    const userId = req.query.userid;
    console.log("This is mani ")
    try {
        const GroupDetails = await UserGroup.findOne({
            where: {
                userId: userId,
                groupId: gId
            }
        })
        console.log("This is mani ")
        console.log(GroupDetails.dataValues.admin)
        if(GroupDetails.dataValues.admin){
        const Details = await UserGroup.destroy({
            where: {
                groupId: gId
            }
        })
        return res.status(200).json({Removed: Details, message: "successfully removed the user from the group" })
        }
        else{
            return res.status(200).json({message: "Sorry, You are not Admin of the Group -_-"})
        }
        
    } catch {
        return res.status(403).json({ message: "Something went wrong while deleting the Group" })
    }
}


const archive = (req,res,next) => {
    const oneDayAgo = new Date();
    // oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    Messages.findAll({
        where: {
          createdAt: {
            // [Op.between]: [oneDayAgo, new Date()] // Find rows created between one day ago and now
            [Op.lt]: oneDayAgo // Find rows created before one day ago
          }
        }
      })
      .then(messages => {
        console.log("heheheheheheheheh")
        console.log(messages); // Messages created before one day ago
      })
      .catch(error => {
        console.error('Error retrieving messages:', error);
      });
}


module.exports = {
    getMessages,
    sendMessage,
    getUsers,
    getLatestMsgs,
    createGroup,
    getGroups,
    getGroupUsers,
    showUsers,
    makeAdmin,
    removeUser,
    updateGroup,
    showMembers,
    leaveGroup,
    removeAdmin,
    deleteGroup,
    archive
}