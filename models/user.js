'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false, unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        photo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notifyEmail: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        notifyPush: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        dob: { type: DataTypes.DATE, allowNull: true },
        country: { type: DataTypes.STRING, allowNull: true },
        city: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.TEXT, allowNull: true },
        interests: { type: DataTypes.JSON, allowNull: true },
        profilePicture: { type: DataTypes.STRING, allowNull: true },
        isOnBoarded: { type: DataTypes.BOOLEAN, defaultValue: false },
        role: {
            type: DataTypes.ENUM('user', 'creator'),
            defaultValue: 'user'
        },

        // npx sequelize-cli migration:generate --name add-otp-dates-to-events
        otp: {
            type: DataTypes.STRING,
            allowNull: true
        },
        otpExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    });

    return User;
};