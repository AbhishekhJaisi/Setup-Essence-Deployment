'use strict';

const addColumnIfMissing = async (queryInterface, Sequelize, tableName, columnName, definition) => {
  const table = await queryInterface.describeTable(tableName);

  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
};

const removeColumnIfExists = async (queryInterface, tableName, columnName) => {
  const table = await queryInterface.describeTable(tableName);

  if (table[columnName]) {
    await queryInterface.removeColumn(tableName, columnName);
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, Sequelize, 'Users', 'dob', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, Sequelize, 'Users', 'country', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, Sequelize, 'Users', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, Sequelize, 'Users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, Sequelize, 'Users', 'interests', {
      type: Sequelize.JSON,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, Sequelize, 'Users', 'profilePicture', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, Sequelize, 'Users', 'isOnBoarded', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, 'Users', 'dob');
    await removeColumnIfExists(queryInterface, 'Users', 'country');
    await removeColumnIfExists(queryInterface, 'Users', 'city');
    await removeColumnIfExists(queryInterface, 'Users', 'address');
    await removeColumnIfExists(queryInterface, 'Users', 'interests');
    await removeColumnIfExists(queryInterface, 'Users', 'profilePicture');
    await removeColumnIfExists(queryInterface, 'Users', 'isOnBoarded');
  }
};
