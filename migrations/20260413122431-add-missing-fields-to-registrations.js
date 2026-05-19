'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Registrations', 'numberOfGuests', {
      type: Sequelize.INTEGER,
      defaultValue: 1
    }).catch(() => console.log('numberOfGuests already exists'));

    await queryInterface.addColumn('Registrations', 'username', {
      type: Sequelize.STRING,
      allowNull: true
    }).catch(() => console.log('username already exists'));
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Registrations', 'numberOfGuests').catch(() => { });
    await queryInterface.removeColumn('Registrations', 'username').catch(() => { });
  }
};