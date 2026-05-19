const { Notification } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { redisClient } = require('../config/redisClient');

const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll(
            {
                where: { userId: req.user.id },
                order: [['createdAt', 'DESC']]
            }
        );

        return successResponse(res, "Notification fetched", notifications);
    }
    catch (err) {
        return errorResponse(res, `Notification failed: ${err.message}`);
    }
}

const getUnreadNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll(
            {

                where: { userId: req.user.id, isRead: false },
                order: [['createdAt', 'DESC']]
            }
        );

        if (notifications.length === 0) {
            return successResponse(res, "You're all caught up", []);
        }

        return successResponse(res, "Fetched unread notifications", notifications);
    }

    catch (err) {
        return errorResponse(res, `Notification failed: ${err.message}`);
    }
}

const getUnreadCount = async (req, res) => {
    try {
        const cacheKey = `notifications:unread-count:user:${req.user.id}`;

        const cachedCount = await redisClient.get(cacheKey);

        if (cachedCount) {
            console.log("CACHE HIT");
            return successResponse(
                res,
                "Events fetched from cache",
                { count: Number(cachedCount) }
            );
        }

        console.log("CACHE MISS - DB HIT");

        const count = await Notification.count(
            {
                where: { userId: req.user.id, isRead: false }
            }
        );

        await redisClient.setEx(
            cacheKey,
            60,
            String(count)
        );

        console.log("DATA STORED IN REDIS")
        return successResponse(res, "Notifications unread", { unreadCount: count });
    }

    catch (err) {
        return errorResponse(res, `Notification failed: ${err.message}`);
    }
}

const markAsRead = async (req, res) => {
    try {

        await redisClient.del(`notifications:unread-count:user:${req.user.id}`);
        await redisClient.del(`notifications:unread-list:user:${req.user.id}`);
        await redisClient.del(`notifications:all:user:${req.user.id}`);


        const [updatedCount] = await Notification.update(
            { isRead: true },
            { where: { id: req.params.id, userId: req.user.id } }
        );

        if (updatedCount === 0) {
            return errorResponse(res, "Notification not found", 404);
        }


        return successResponse(res, "Notification marked as read", updatedCount);
    }
    catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`);
    }
}

const markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { userId: req.user.id, isRead: false } }
        );

        return successResponse(res, "All notification marked as read");
    }
    catch (err) {
        return errorResponse(res, `Notification failed: ${err.message}`)
    }
}

const deleteNotification = async (req, res) => {
    try {
        const deleted = await Notification.destroy(
            { where: { id: req.params.id, userId: req.user.id } }
        );

        if (!deleted) {
            return errorResponse(res, "Notification not found", 404)
        }

        return successResponse(res, "Notification deleted");
    }
    catch (err) {
        return errorResponse(res, `Notification failed: ${err.message}`);
    }
}

module.exports = { getAllNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, getUnreadNotifications };



