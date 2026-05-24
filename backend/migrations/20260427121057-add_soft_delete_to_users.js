'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (!table.isDeleted) {
      await queryInterface.addColumn('Users', 'isDeleted', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }

    if (!table.deletedAt) {
      await queryInterface.addColumn('Users', 'deletedAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (table.isDeleted) {
      await queryInterface.removeColumn('Users', 'isDeleted');
    }

    if (table.deletedAt) {
      await queryInterface.removeColumn('Users', 'deletedAt');
    }
  }
};
