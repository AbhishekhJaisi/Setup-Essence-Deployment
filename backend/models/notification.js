'use strict';

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'NEW_REGISTRATION',
        'NEW_APPLICATION',
        'APPLICATION_SUBMITTED',
        'APPLICATION_STATUS_UPDATED',
        'EVENT_UPDATED',
        'EVENT_DELETED',
        'PROFILE_UPDATED',
        'PASSWORD_RESET',
        'ACCOUNT_DELETED'
      ),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  return Notification;
};
