const Message = require('../models/messages');
const Group = require('../models/groups')
const s3Services = require('../services/s3Services')
// const router = express.Router();

// const upload = multer({ dest: 'uploads/' });

// router.post('/file', upload.single('file'), function (req, res) {
//     console.log("hello")
//     console.log(req.file)

// })

const send = async (req, res) => {
    console.log("hello")
    if(req.file != undefined){
        console.log(req.file)
    }
    console.log(req.body.message)
    console.log(req.body.grp)

    const file = req.file
    const newmessage = req.body.message
    const grp = req.body.grp

    try {
        let grpId
        if (grp !== "common") {
            const group = await Group.findOne({ where: { groupName: grp } })
            if (group) {
                grpId = group.id;
            } else {
                return res.status(404).json({ message: "Group not found" });
            }
        }

        let msg = null;
        if (newmessage) {
            console.log("Got Message")
            msg = await Message.create({
                name: req.user.name,
                message: newmessage,
                userId: req.user.id,
                groupId: grpId,
                type: 'msg'
            });
        }

        let fileURL = null;
        // console.log(file.size)
        // console.log("mmmkkkk")
        // console.log(file.mimetype)
        if (file && file !== undefined && file.size>0) {
            console.log("Got file")
            const userId = req.user.id;
            console.log(userId)
            const filename = `chatImage${userId}/${new Date()}.jpg`;
            console.log(filename)
            fileURL = await s3Services.uploadToS3(file, filename);
            console.log(fileURL)
            msg = await Message.create({
                name: req.user.name,
                message: fileURL,
                userId: req.user.id,
                groupId: grpId,
                type: file.mimetype
            });
        }
        

        return res.status(200).json({ messages: msg, message: "message sent Successfully" })
    } catch {
        return res.status(403).json({ message: "something went wrong" })
    }



}

const sendImage = async (req, res, next) => {
    console.log("hello")
    console.log(req.file)
    const { grp, newmessage,formData } = req.body
    console.log(formData)
    
    try {
        let grpId
        if (grp !== "common") {
            const group = await Group.findOne({ where: { groupName: grp } })
            if (group) {
                grpId = group.id;
            } else {
                return res.status(404).json({ message: "Group not found" });
            }
        }

        let msg = null;
        if (newmessage) {
            console.log("Got Message")
            msg = await Message.create({
                name: req.user.name,
                message: newmessage,
                userId: req.user.id,
                groupId: grpId,
                // type: 'msg'
            });
        }

        let fileURL = null;
        console.log(file)
        if (file && file.size > 0) {
            console.log("Got file")
            const userId = req.user.id;
            const filename = `expenses${userId}/${Date.now()}.jpg`;
            fileURL = await s3Services.uploadToS3(file, filename);
            msg = await Message.create({
                name: req.user.name,
                message: fileURL,
                userId: req.user.id,
                groupId: grpId,
                // type: 'doc'
            });
        }
        

        return res.status(200).json({ messages: msg, message: "message sent Successfully" })
    } catch {
        return res.status(403).json({ message: "something went wrong" })
    }
}

module.exports = {
    sendImage,
    send
}
