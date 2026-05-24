'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Events');

    if (!table.registrationDeadline) {
      await queryInterface.addColumn('Events', 'registrationDeadline', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Events');

    if (table.registrationDeadline) {
      await queryInterface.removeColumn('Events', 'registrationDeadline');
    }
  }
};



