require('dotenv').config();
const { Registration, User, Event } = require('../models');
const nodemailer = require("nodemailer");
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { sendNotification, broadcastNotification } = require('../utils/socket');
const { connectedUsers, getIO } = require('../utils/socketStore');
const { createAndSendNotification } = require('../utils/notificationHelper')
const { creatorLogActivity, userLogActivity } = require('../utils/logger');

const applyForEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const user = await User.findOne
            ({
                where: { id: userId },
                attributes: ['id', 'username', 'email', 'role']
            });

        const numberOfGuests = req.body?.numberOfGuests || 1;

        const event = await Event.findOne({
            where: {
                id: eventId,
                isDeleted: false
            }
        });

        if (!event) {
            return errorResponse(res, "Event not found", 404);
        }

        const now = new Date();

        if (event.bookingOpenDate) {
            const openDate = new Date(event.bookingOpenDate);
            if (now < openDate) {
                return errorResponse(res, "Booking has not opened yet", {
                    bookingOpenDate: event.bookingOpenDate,
                }, 400);
            }
        }

        if (event.registrationDeadline) {
            const deadline = new Date(event.registrationDeadline);

            if (now > deadline) {
                return errorResponse(res, "Application deadline end",
                    {
                        deadline: event.registarationDeadline,
                        deadlinePassed: true
                    }, 400
                );
            }
        }

        const existing = await Registration.findOne({
            where: {
                userId,
                eventId,
                status: {
                    [Op.ne]: 'cancelled'
                }
            }
        });

        if (existing) {
            return errorResponse(res, "Already applied for this event",
                {
                    status: existing.status
                },
                409
            );
        }

        if (event.capacityRemaining === 0) {
            return errorResponse(res, 'Event is full', 400);
        }

        if (numberOfGuests > event.capacityRemaining) {
            return errorResponse(res, `Only ${event.capacityRemaining} spots remaining`, 409);
        }

        const registration = await Registration.create({
            userId,
            username: user.username,
            numberOfGuests,
            eventId,
            status: 'applied',
            notes: req.body?.notes || null
        });

        const newRemaining = event.capacityRemaining - numberOfGuests;
        await event.update({
            capacityRemaining: newRemaining
        });

        const io = getIO();
        console.log("io:", io);

        console.log("connectedUsers:", connectedUsers);
        console.log("event.userId:", event.userId);


        await createAndSendNotification(
            event.userId,
            'NEW_APPLICATION',
            `${user.username} applied for ${event.title}`,
            {
                from: {
                    id: user.id,
                    name: user.username
                },
                to: {
                    id: event.userId
                },
                eventId: event.id,
                eventTitle: event.title,
                applicantName: user.username,
                applicantId: user.id,
                tags: event.tags,
                time: new Date().toISOString()
            }
        );

        userLogActivity(req, registration, 'APPLIED FOR THE EVENT', req.user.role);

        return successResponse(res, "Successfully applied for event",
            {
                message: 'Successfully applied for event',
                registration,
                title: event.title,
                numberOfGuests,
                capacityRemaining: newRemaining,
                totalApplied: event.capacityTotal - newRemaining,
                slotsLeft: newRemaining,
                deadline: event.registrationDeadline
            });

    }
    catch (err) {
        return errorResponse(res, `Internal Server error: ${err.message}`);
    }
};

const cancelApplication = async (req, res) => {
    try {
        const numberOfGuests = req.body?.numberOfGuests || 1;

        const eventId = req.params.id;
        const userId = req.user.id;

        const registration = await Registration.findOne(
            {
                where: {
                    eventId,
                    userId,
                    status: { [Op.ne]: 'cancelled' }
                }
            }
        );

        if (!registration) {
            return errorResponse(res, 'Registration not found', 404);
        }

        if (registration.status === 'cancelled') {
            return errorResponse(res, 'Already cancelled', 400);
        }

        // restore capacity
        const event = await Event.findByPk(registration.eventId);
        if (!event) {
            return errorResponse(res, 'Event not found', 404);
        }


        const guestsToRestore = registration.numberOfGuests || 1;


        const newRemaining = event.capacityRemaining + guestsToRestore;
        await event.update({
            capacityRemaining: newRemaining
        });

        await registration.update({ status: 'cancelled' });

        userLogActivity(req, registration, 'APPLICATION CANCELLED BY THE USER', req.user.role);

        return successResponse(res, 'Application cancelled successfully',
            {
                registration,
                title: event.title,
                numberOfGuests: guestsToRestore,
                capacityRemaining: newRemaining,
                slotsLeft: newRemaining

            }
        );

    } catch (err) {
        return errorResponse(res, `Server error: ${err.message}`);
    }
};

// logged in user sees their own applications
const getMyApplications = async (req, res) => {
    try {

        const registrations = await Registration.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Event,
                    attributes: [
                        'id', 'title', 'category',
                        'eventDate', 'city',
                        'capacityRemaining'
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return successResponse(res, "Application fetched",
            registrations
        );

    } catch (err) {
        return errorResponse(res, `Internal Server error: ${err.message}`);
    }
};

// owner can see the list of applied event user
const getEventApplicants = async (req, res) => {
    try {

        const eventId = parseInt(req.params.eventId);
        const loggedInUserId = req.user.id;

        const event = await Event.findByPk(eventId);

        if (!event) {
            return errorResponse(res, "Event not found", 404);
        }

        if (event.userId != loggedInUserId) {
            return errorResponse(res, "Unauthorized user, only the owner can see the list", 403);
        }

        // To check if logged in user owns the event
        const registrations = await Registration.findAll({
            where: { eventId },
            include: [
                {
                    model: User,
                    attributes: [
                        'id', 'username', 'email', 'phone_number'
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return successResponse(res, "Applicants fetched successfully",
            {
                totalApplicants: registrations.length,
                registrations
            });
    }

    catch (err) {
        return errorResponse(res, `Server error: ${err.message}`);
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const loggedInUserId = req.user.id;

        const allowedStatus = ['applied', 'approved', 'rejected', 'cancelled'];
        if (!allowedStatus.includes(status)) {
            return errorResponse(res, "Invalid status", 400);
        }

        const registration = await Registration.findByPk(req.params.id, {
            where: { eventId },
            include: [
                {
                    model: User,
                    attributes: [
                        'id', 'email'
                    ]
                }
            ],
        });

        if (!registration) {
            return errorResponse(res, "Registration not found", 404);
        }

        if(registration.isDeleted){
            errorResponse(res, "No access of the deleted record")
        }

        const event = await Event.findOne({
            where: {
                id: registration.eventId,
                isDeleted: false
            }
        });

        if (!event) {
            return errorResponse(res, "Event not found", 404);
        }

        if (event.userId !== loggedInUserId) {
            return errorResponse(res, "Unauthorized - only owner can update the status", 403);
        }

        await registration.update({ status });

        const user = await User.findByPk(registration.userId);

        await createAndSendNotification(
            registration.userId,
            'APPLICATION_STATUS_UPDATED',
            `Your application for ${event.title} has been ${status}`,
            {
                from: {
                    id: event.userId
                },
                to: {
                    id: registration.userId,
                    name: user?.username || "User"
                },
                eventId: event.id,
                registrationId: registration.id,
                eventTitle: event.title,
                tags: event.tags,
                time: new Date().toISOString(),
                status
            }
        );

        // createAndSendNotification(connectedUsers, io, registration.userId, {
        //     type: 'APPLICATION_STATUS_CHANGED',
        //     from: {
        //         id: event.userId
        //     },
        //     to: {
        //         id: registration.userId,
        //         name: user.username
        //     },
        //     message: `Your application for ${event.title} has been ${status} `,
        //     eventId: event.id,
        //     eventTitle: event.title,
        //     tags: event.tags,
        //     time: new Date().toISOString(),
        //     unread: true,
        //     status
        // });

        return successResponse(res, `Application status updated to ${status}`,
            {
                registration: {
                    id: registration.id,
                    userId: registration.userId,
                    eventId: registration.eventId,
                    status: registration.status,
                    numberOfGuests: registration.numberOfGuests
                }
            });
    }
    catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`);
    }
}

module.exports = {
    applyForEvent,
    cancelApplication,
    getMyApplications,
    getEventApplicants,
    updateApplicationStatus
};