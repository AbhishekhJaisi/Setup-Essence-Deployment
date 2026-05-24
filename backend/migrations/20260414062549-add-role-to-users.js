'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (!table.role) {
      await queryInterface.addColumn('Users', 'role', {
        type: Sequelize.ENUM('user', 'creator'),
        defaultValue: 'user',
        allowNull: false
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (table.role) {
      await queryInterface.removeColumn('Users', 'role');
    }
  }
};
