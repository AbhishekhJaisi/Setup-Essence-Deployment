'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Events');

    if (!table.visibleFrom) {
      await queryInterface.addColumn('Events', 'visibleFrom', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!table.bookingOpenDate) {
      await queryInterface.addColumn('Events', 'bookingOpenDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Events');

    if (table.visibleFrom) {
      await queryInterface.removeColumn('Events', 'visibleFrom');
    }

    if (table.bookingOpenDate) {
      await queryInterface.removeColumn('Events', 'bookingOpenDate');
    }
  }
};
