const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

const {
    getAllNotifications,
    getUnreadCount,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notificationController.js');

router.get('/', verifyToken, getAllNotifications); // this will print all the notifications that the user might have received
router.get('/unread-count', verifyToken, getUnreadCount);
router.get('/unread-notification', verifyToken, getUnreadNotifications); // this will return those notifications which are unread, if read it won't show
router.patch('/:id/read', verifyToken, markAsRead); // To mark a single specific notification as read
router.patch('/:id/mark-all-read', verifyToken, markAllAsRead);
router.delete('/:id', verifyToken, deleteNotification);

module.exports = router;


// GET    http://localhost:4000/api/notifications
// GET    http://localhost:4000/api/notifications/unread-count
// PATCH  http://localhost:4000/api/notifications/:id/read
// PATCH  http://localhost:4000/api/notifications/:id/mark-all-read
// DELETE http://localhost:4000/api/notifications/:id