const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Archive = sequelize.define('archives', {
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
    },
    type: Sequelize.STRING
})

module.exports = Archive;