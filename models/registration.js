'use strict';

module.exports = (sequelize, DataTypes) => {
    const Registration = sequelize.define('Registration', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true
        },
        numberOfGuests: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM(
                'applied',
                'approved',
                'rejected',
                'cancelled'
            ),
            defaultValue: 'applied'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });

    return Registration;
};