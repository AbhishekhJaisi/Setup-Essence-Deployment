const express = require('express');
const router = express.Router();
const { isCreator, isUser, verifyToken } = require('../middleware/authMiddleware');
const { applyLimiter } = require('../middleware/rateLimiter.js');

const {
    applyForEvent,
    cancelApplication,
    getMyApplications,
    getEventApplicants,
    updateApplicationStatus
} = require('../controllers/registrationController');

router.post('/apply/:id', verifyToken, isUser, applyLimiter, applyForEvent);
router.delete('/cancel/:id', verifyToken, isUser, cancelApplication);
router.get('/my-applications', verifyToken, isUser, getMyApplications);
router.get('/event/:eventId/applicants', verifyToken, isCreator, getEventApplicants);
router.patch('/:id/status', verifyToken, isCreator, updateApplicationStatus); // id: registration.eventId

module.exports = router;