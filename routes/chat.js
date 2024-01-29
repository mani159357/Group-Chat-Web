const express = require('express');

const router = express.Router();

const chatController = require('../controllers/chat');
const imageController = require('../controllers/image')
const authenticatemiddleware = require('../middleware/auth');

router.post('/sendMessage', authenticatemiddleware.authenticate , chatController.sendMessage)
router.get('/getMessages/:grp', authenticatemiddleware.authenticate, chatController.getMessages)
router.get('/getGroupUsers/:grp', authenticatemiddleware.authenticate, chatController.getGroupUsers)
router.get('/getUsers', authenticatemiddleware.authenticate, chatController.getUsers)
router.get('/getLatestMsgs/:msgId', authenticatemiddleware.authenticate, chatController.getLatestMsgs)
router.post('/createGroup', authenticatemiddleware.authenticate ,chatController.createGroup)
router.get('/getGroups', authenticatemiddleware.authenticate , chatController.getGroups)


router.get('/showUsers/:grp', authenticatemiddleware.authenticate , chatController.showUsers)
router.get('/showMembers/:grp', authenticatemiddleware.authenticate , chatController.showMembers)
router.patch('/makeAdminUser/:uId', authenticatemiddleware.authenticate , chatController.makeAdmin)
router.patch('/removeAdminUser/:uId', authenticatemiddleware.authenticate , chatController.removeAdmin)
router.patch('/removeGroupUser/:uId', authenticatemiddleware.authenticate , chatController.removeUser)
router.patch('/updateGroup', authenticatemiddleware.authenticate , chatController.updateGroup)
router.patch('/leaveGroup/:gId',  authenticatemiddleware.authenticate , chatController.leaveGroup)
router.delete('/deleteGroup/:gId',  authenticatemiddleware.authenticate , chatController.deleteGroup)

router.post('/sendImage',authenticatemiddleware.authenticate, imageController.sendImage)

module.exports = router;