const { Notification, User } = require('../models');
const { sendNotification } = require('./socket');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { connectedUsers, getIO } = require('./socketStore');
const nodemailer = require('nodemailer');
const { sendMail } = require('../utils/emailService');

const createAndSendNotification = async (userId, type, message, data = {}) => {
    try {
        console.log({ userId, type, message, data });

        const notification = await Notification.create(
            {
                userId,
                type,
                message,
                data,
                isRead: false
            });

        const io = getIO();

        if (io) {
            sendNotification(connectedUsers, io, userId, {
                id: notification.id,
                type,
                message,
                data,
                isRead: false,
                createdAt: notification.createdAt
            });
        }

        const receiver = await User.findByPk(userId, {
            attributes: ["id", "email", "username"]
        });

        const subjectMap = {
            'NEW_REGISTRATION': 'Registered',
            'PROFILE_UPDATED': '🔔 Profile Updated',
            'PASSWORD_CHANGED': '🔒 Password Changed',
            'ACCOUNT_DELETED': 'Account deleted'
        };

        if (receiver?.email) {
            sendMail({
                to: receiver.email,
                subject: subjectMap[type] || '🔔 New Notification',
                text: message
            }).then(() => console.log("Notification email sent"))
                .catch(err => console.error("Notification email failed:", err.message));
        }

        return notification;
    }
    catch (err) {
        console.error(`Notification error: ${err.message}`);
        throw err;
    }
}

module.exports = { createAndSendNotification };

