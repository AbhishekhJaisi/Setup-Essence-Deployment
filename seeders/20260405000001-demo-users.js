'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        username: 'Admin User',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone_number: '9876543210',
        role: 'creator',
        createdAt: new Date(),
        updatedAt: new Date()

      },
      {
        id: 2,
        username: 'Test User',
        email: 'test@gmail.com',
        password: hashedPassword,
        phone_number: '9876543211',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()

      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};