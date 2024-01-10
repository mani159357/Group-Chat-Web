const bcrypt = require('bcrypt');
const User = require('../models/users');
const jwt = require('jsonwebtoken')
require('dotenv').config()



const signup = (req, res,next)=>{
    console.log(req.body)
    const { name, email,phoneNumber,password } = req.body;
    console.log(name)
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        console.log(salt)
        bcrypt.hash(password, salt, async function (err, hash) {
            console.log('hi welcome to hash')
            // Store hash in password DB.
            if(err){
                console.log('error at salt')
                return res.status(404).json({message: 'Unable to create new user'})
            }
            try{
                await User.create({ name, email,phoneNumber, password: hash })
                    console.log('inserted into table')
                    res.status(201).json({message: 'Successfuly created new user'})
                    // console.log(err)
            }catch{
                // throw new Error('User already exist')
                res.status(403).json({message: 'User already exist'})
            }
            

        });
    });
}


const login = (req, res) => {
    const { email, password } = req.body;
    User.findAll({ where : { email }}).then(user => {
        if(user.length > 0){
            bcrypt.compare(password, user[0].password, function(err, response) {
                if (err){
                return res.status(403).json({success: false, message: 'Something went wrong'})
                }
                if (response){
                    console.log(JSON.stringify(user))
                    const jwttoken = generateAccessToken(user[0].id);
                    res.status(200).json({ token: jwttoken, userDetails: user, success: true, message: 'Successfully Logged In' });
                // Send JWT
                } else {
                // response is OutgoingMessage object that server response http request
                return res.status(401).json({success: false, message: 'User not authorized'});
                }
            });
        } else {
            return res.status(404).json({success: false, message: 'User Not Found'})
        }
    })
}


function generateAccessToken(id) {
    return jwt.sign(id ,process.env.TOKEN_SECRET);
}



module.exports = {
    signup,
    login
}