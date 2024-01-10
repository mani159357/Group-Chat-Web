const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const UserGroup = sequelize.define('UserGroup', {
    // No need for additional fields in this example
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
  },
  admin: Sequelize.BOOLEAN
  });

  module.exports = UserGroup