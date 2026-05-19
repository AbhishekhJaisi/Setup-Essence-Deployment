'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('session').catch(() => { });
    await queryInterface.createTable('session', {
      sid: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      sess: {
        type: Sequelize.JSON,
        allowNull: false
      },
      expire: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('session');
  }
};