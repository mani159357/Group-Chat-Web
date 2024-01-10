const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Group = sequelize.define('groups', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    groupName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    members: {
        type: Sequelize.JSON,
        allowNull: false,
    }
});

module.exports = Group;
