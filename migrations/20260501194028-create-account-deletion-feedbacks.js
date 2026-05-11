'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('AccountDeleteFeedback', {
        id: {
          type: Sequeilize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },

        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true
        },
        username: {
          type: Sequelize.STRING,
          allow
        
        }
      })
  },

  async down (queryInterface, Sequelize) {
   
  }
};
