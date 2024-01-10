const express = require('express');

const resetpasswordController = require('../controllers/resetpassword');

const router = express.Router();

router.post('/updatepassword/:resetpasswordid', resetpasswordController.updatepassword)

router.get('/resetpassword/:id', resetpasswordController.resetpassword)

router.use('/forgotpassword', resetpasswordController.forgotpassword)

module.exports = router;