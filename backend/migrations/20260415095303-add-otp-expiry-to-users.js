'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (!table.otp) {
      await queryInterface.addColumn('Users', 'otp', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!table.otpExpiresAt) {
      await queryInterface.addColumn('Users', 'otpExpiresAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (table.otp) {
      await queryInterface.removeColumn('Users', 'otp');
    }

    if (table.otpExpiresAt) {
      await queryInterface.removeColumn('Users', 'otpExpiresAt');
    }
  }
};
