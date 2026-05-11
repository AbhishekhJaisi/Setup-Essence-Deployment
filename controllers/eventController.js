const { Event, User } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { sendNotification, broadcastNotification } = require('../utils/socket');
const { connectedUsers, getIO } = require('../utils/socketStore');
const { Registration } = require('../models')
const { createAndSendNotification } = require('../utils/notificationHelper');
const { creatorLogActivity } = require('../utils/logger');
const fs = require('fs');
const path = require('path');


const generateEventCode = () => {
    return 'EVT-' + Math.floor(100 + Math.random() * 900);
};

const getAllEvents = async (req, res) => {
    try {

        const { category, city, venueName, eventCode, title, state, minPrice, maxPrice, startDate, endDate, sortBy, order } = req.query;

        let filter = {
            isDeleted: false //Always fetch only active(not deleted) events
        };

        if (category) {
            filter.category = category;
        }

        if (city) {
            filter.city = {
                [Op.iLike]: `%${city}%`
            };
        }

        if (title) {
            filter.title = {
                [Op.iLike]: `%${title}%` // iLike helps in partial matching and also makes the query work in case-insensitive and it only works in PostgreSQL
            };
        }

        if (venueName) {
            filter.venueName = {
                [Op.iLike]: `%${venueName}%`
            };
        }
        if (eventCode) {
            filter.eventCode = eventCode;
        }
        if (state) {
            filter.state = state;
        }

        if (minPrice && maxPrice) {
            filter.priceAmount = {
                [Op.between]: [Number(minPrice), Number(maxPrice)]
            };
        }
        else if (minPrice) {
            filter.priceAmount = {
                [Op.gte]: Number(minPrice)
            };
        }
        else if (maxPrice) {
            filter.priceAmount = {
                [Op.lte]: Number(maxPrice)
            };
        }

        if (startDate && endDate) {
            filter.eventDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        else if (startDate) {
            filter.eventDate = {
                [Op.gte]: new Date(startDate)
            };
        }
        else if (endDate) {
            filter.eventDate = {
                [Op.lte]: new Date(endDate)
            };
        }

        let sortOption = [];

        const allowedSortField = ["priceAmount", "eventDate", "title"];

        if (sortBy && allowedSortField.includes(sortBy)) {
            sortOption.push([sortBy, order === "desc" ? "DESC" : "ASC"]);
        }
        else {
            sortOption.push(["createdAt", "DESC"]);
        }

        const events = await Event.findAll({
            where: filter,
            order: sortOption
        });

        const eventWithStats = events.map(event => {
            const data = event.toJSON();
            const total = data.capacityTotal || 0;
            const remaining = data.capacityRemaining || 0;
            const now = new Date();
            const visibilityDate = new Date(event.visibleFrom)
            const bookingOpenDate = new Date(event.bookingOpenDate);

            const deadline = data.registrationDeadline
                ? new Date(data.registrationDeadline)
                : null;

            const isVisible = now >= visibilityDate;
            const bookingOpensFrom = now >= bookingOpenDate;
            const deadlinePassed = deadline ? now > deadline : false;
            const canApply = bookingOpensFrom && !deadlinePassed;

            return {
                ...data,
                // Added fields manually to print instead of all the fields
                // id: data.id,

                isVisible,
                bookingOpensFrom,
                deadlinePassed,
                canApply,

                // applicationStatus: registration ? registration.status : null,
                totalApplied: total - remaining,
                spotsLeft: remaining,
                isFull: remaining === 0 && total > 0,

                registrationDeadline: data.registrationDeadline,

                // if deadline exists, it will check if now('currentTime') is greater than the given deadline - if yes, then it will return false(like the event application deadline time is passed)

                // here the logic says that the user can only apply when the current time is before or equal to deadline, that means if the deadline is 10 AM, 04 and if the current time(now is 10 AM, 03) than canApply will work
            };
        })
        return successResponse(res, "Events fetched successfully", eventWithStats);
    }
    catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`);
    }
};

const getEventById = async (req, res) => {
    try {
        const events = await Event.findOne({
            where: {
                id: req.params.id,
                isDeleted: false
            }
        });

        if (!events) {
            return errorResponse(res, "Event does not exist");
        }
        return successResponse(res, "List of events by ID", events);
    }
    catch (err) {
        return errorResponse(res, `Server error: ${err.message}`);
    }
};

const getMyEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Registration,
                    attributes: [
                        'eventId'
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (events.length === 0) {
            return errorResponse(res, "No events posted yet", []);
        }

        function to24Hour(timeStr) {
            const [time, modifier] = timeStr.trim().split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);
            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return `${String(hours).padStart(2, '0')}:${minutes}:00`;
        }

        const eventWithStatus = events.map(event => {
            const data = event.toJSON();
            const now = new Date();

            const dateOnly = data.eventDate instanceof Date
                ? data.eventDate.toISOString().split('T')[0]
                : String(data.eventDate).split('T')[0];

            const eventStart = new Date(`${dateOnly}T${to24Hour(data.eventTimeStart)}`);
            const eventEnd = new Date(`${dateOnly}T${to24Hour(data.eventTimeEnd)}`);

            let eventStatus = '';

            if (now < eventStart) {
                eventStatus = "Upcoming";
            }
            else if (now >= eventStart && now <= eventEnd) {
                eventStatus = "Ongoing";
            }
            if (now > eventEnd) {
                eventStatus = "Completed";
            }

            return {
                ...data,
                eventStatus
            }
        })

        return successResponse(res, "List of events created", eventWithStatus);
    }
    catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`);
    }
}

const createEvent = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        const {
            title, organizer, category, username,
            venueName, venueAddress, venueMapLink,
            priceAmount, priceCurrency, isEarlyBird, eventTimeStart, eventTimeEnd, numberOfGuests,
            capacityTotal, eventDate, city,
            shortDescription, fullDescription,
            agenda, prerequisites, tags, registrationDeadline, visibleFrom, bookingOpenDate
        } = req.body;

        const fileUpload = req.file
            ? `uploads/${req.file.filename}`
            : null; // condition ? value_if_true : value_if_false

        const event = await Event.create({
            eventCode: generateEventCode(),
            title, organizer, category, username,
            venueName, venueAddress, venueMapLink,
            priceAmount, priceCurrency, isEarlyBird,
            city, eventTimeStart, eventTimeEnd, numberOfGuests,
            capacityTotal,
            capacityRemaining: capacityTotal,
            eventDate,
            shortDescription, fullDescription,
            agenda, prerequisites, tags,
            fileUpload, registrationDeadline, visibleFrom, bookingOpenDate,
            userId: req.user.id
        });

        creatorLogActivity(req, event, 'EVENT_CREATED', req.user.role);

        return successResponse(res, "Event created", event);
    }

    catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`);
    }
};

const updateEvent = async (req, res) => {
    try {

        const event = await Event.findOne({
            where: {
                id: parseInt(req.params.id),
                isDeleted: false
            }
        });

        if (!event) {
            return errorResponse(res, "Event not found", 404);
        }
        if (event.userId !== req.user.id) {
            return errorResponse(res, "Not authorized", 403);
        }

        await event.update(req.body); // venue city date description

        const registrations = await Registration.findAll({
            where: {
                eventId: event.id,
                status: { [Op.notIn]: ['cancelled'] }
            }
        });

        for (const reg of registrations) {
            await createAndSendNotification(
                reg.userId,
                'EVENT_UPDATED',
                `Event "${event.title}" has been updated`,
                {
                    from: {
                        id: event.userId,
                        name: event.organizer
                    },
                    to: {
                        id: reg.userId
                    },
                    eventId: event.id,
                    eventTitle: event.title,
                    tags: event.tags,
                    time: new Date().toISOString()
                }
            );
        }

        creatorLogActivity(req, event, 'EVENT INFORMATION UPDATED', req.user.role);

        return successResponse(res, 'Event updated successfully', event);

    } catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`);
    }
};

const deleteEvent = async (req, res) => {
    try {

        const event = await Event.findOne({
            where: {
                id: req.params.id,
                isDeleted: false
            }
        });

        if (!event) {
            return errorResponse(res, 'Event not found', 404);
        }
        if (event.userId !== req.user.id) {
            return errorResponse(res, 'Not authorized', 403);
        }

        await event.update({
            isDeleted: true,
            isActive: false,
            deletedAt: new Date()
        });

        const registrations = await Registration.findAll({
            where: {
                eventId: event.id,
                status: { [Op.notIn]: ['cancelled'] }
            }
        });

        for (const reg of registrations) {
            await createAndSendNotification(
                reg.userId,
                'EVENT_DELETED',
                `Event "${event.title}" has been deleted`,
                {
                    from: {
                        id: event.userId,
                        name: event.organizer
                    },
                    to: {
                        id: reg.userId
                    },
                    eventId: event.id,
                    eventTitle: event.title,
                    tags: event.tags,
                    time: new Date().toISOString()
                }
            );
        }

        creatorLogActivity(req, event, 'EVENT HAS BEEN DELETED BY THE OWNER', req.user.role);

        return successResponse(res, 'Event deleted');

    } catch (err) {
        return errorResponse(res, `Internal Server error: ${err.message}`);
    }
};

const getActivityLog = (req, res) => {

    const logFile = path.join(__dirname, '../logs/activity.txt');

    fs.readFile(logFile, 'utf-8', (err, data) => {
        if (err) {
            return errorResponse(res, "Could not read log file", 500);
        }
        return successResponse(res, "logs fetched", { logs: data });
    });
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    getMyEvents,
    deleteEvent,
    getActivityLog
}


