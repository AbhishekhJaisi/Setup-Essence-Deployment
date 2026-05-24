'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes('session')) {
      await queryInterface.dropTable('session');
    }

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
    const tables = await queryInterface.showAllTables();

    if (tables.includes('session')) {
      await queryInterface.dropTable('session');
    }
  }
};
