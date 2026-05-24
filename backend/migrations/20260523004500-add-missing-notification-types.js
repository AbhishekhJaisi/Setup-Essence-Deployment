'use strict';

const enumName = '"enum_Notifications_type"';
const notificationTypes = [
  'NEW_REGISTRATION',
  'APPLICATION_SUBMITTED',
  'PROFILE_UPDATED',
  'PASSWORD_RESET',
  'ACCOUNT_DELETED'
];

module.exports = {
  async up(queryInterface) {
    for (const type of notificationTypes) {
      await queryInterface.sequelize.query(
        `ALTER TYPE ${enumName} ADD VALUE IF NOT EXISTS '${type}'`
      );
    }
  },

  async down() {
    // PostgreSQL does not support removing enum values safely in-place.
  }
};
