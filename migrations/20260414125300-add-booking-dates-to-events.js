'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Events', 'visibleFrom', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Events', 'bookingOpenDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Events', 'visibleFrom');
    await queryInterface.removeColumn('Events', 'bookingOpenDate');
  }
};
