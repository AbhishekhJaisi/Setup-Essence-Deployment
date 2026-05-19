'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Events', 'isDeleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }).catch(() => console.log('isDeleted already exists'));

    await queryInterface.addColumn('Events', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }).catch(() => console.log('isActive already exists'));

    await queryInterface.addColumn('Events', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true
    }).catch(() => console.log('deletedAt already exists'));
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Events', 'isDeleted').catch(() => { });
    await queryInterface.removeColumn('Events', 'isActive').catch(() => { });
    await queryInterface.removeColumn('Events', 'deletedAt').catch(() => { });
  }
};