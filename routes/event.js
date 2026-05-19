const express = require('express');
const router = express.Router();
const { isCreator, verifyToken } = require('../middleware/authMiddleware.js');
const { editBtnLimiter, createBtnLimiter, deleteBtnLimiter } = require('../middleware/rateLimiter.js');
const upload = require('../utils/upload');
const {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    getMyEvents,
    deleteEvent
} = require('../controllers/eventController.js');

router.get('/view-events', getAllEvents);
router.get('/my-events', verifyToken, getMyEvents);
router.post(
    '/createEvents', verifyToken,
    isCreator, createBtnLimiter,
    upload.single('fileUpload'),
    createEvent
);
router.get('/:id', getEventById);
router.put('/:id', verifyToken, isCreator, editBtnLimiter, upload.single('fileUpload'), updateEvent);
router.delete('/:id', verifyToken, isCreator, deleteBtnLimiter, deleteEvent);

module.exports = router;