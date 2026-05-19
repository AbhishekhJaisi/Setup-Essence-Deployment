'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // remove old unique constraint (email only)
    await queryInterface.removeConstraint('Users', 'Users_email_key');

    // add composite unique (email + isDeleted)
    await queryInterface.addConstraint('Users', {
      fields: ['email', 'isDeleted'],
      type: 'unique',
      name: 'unique_email_isDeleted'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Users', 'unique_email_isDeleted');

    await queryInterface.addConstraint('Users', {
      fields: ['email'],
      type: 'unique',
      name: 'Users_email_key'
    });
  }
};