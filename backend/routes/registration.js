/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Event registration APIs
 */

/**
 * @swagger
 * /api/registrations/apply/{id}:
 *   post:
 *     summary: Apply for an event (user only)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numberOfGuests:
 *                 type: integer
 *                 example: 2
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully applied
 *       400:
 *         description: Already applied or event full
 */

/**
 * @swagger
 * /api/registrations/my-applications:
 *   get:
 *     summary: Get my applications
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications fetched
 */

/**
 * @swagger
 * /api/registrations/cancel/{id}:
 *   delete:
 *     summary: Cancel application
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - password
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Event cancelled due to personal reason"
 *               feedback:
 *                 type: string
 *                 example: "Please improve cancellation flow"
 *               password:
 *                 type: string
 *                 example: "Qwer!234"
 *     responses:
 *       200:
 *         description: Application cancelled successfully
 */

/**
 * @swagger
 * /api/registrations/event/{eventId}/applicants:
 *   get:
 *     summary: Get all applicants for an event (creator only)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Applicants fetched
 */

/**
 * @swagger
 * /api/registrations/{id}/status:
 *   patch:
 *     summary: Update application status (creator only)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Status updated
 */


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