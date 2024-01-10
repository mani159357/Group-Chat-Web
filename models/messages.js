const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Messages = sequelize.define('messages', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    message: {
       type:  Sequelize.STRING,
       allowNull: false,
    }
})

module.exports = Messages;