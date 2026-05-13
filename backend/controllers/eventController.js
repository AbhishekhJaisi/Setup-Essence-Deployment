const bcrypt = require('bcrypt');
const { Event, User, EventDeletionFeedback } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { sendNotification, broadcastNotification } = require('../utils/socket');
const { connectedUsers, getIO } = require('../utils/socketStore');
const { Registration } = require('../models')
const { createAndSendNotification } = require('../utils/notificationHelper');
const { creatorLogActivity } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const sanitize = require('sanitize-html');
const { clean, richText } = require('../utils/sanitize');



const generateEventCode = () => {
    return 'EVT-' + Math.floor(100 + Math.random() * 900);
};

const events = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const offset = (page - 1) * limit;

        const events = await Event.findAll({
            limit: limit,
            offset: offset
        });

        return successResponse(res, events, 200);
    }
    catch (err) {
        errorResponse(res, "Internal Server Error", err.message);
    }
}

const getAllEvents = async (req, res) => {
    try {
        const {
            category,
            city,
            venueName,
            eventCode,
            title,
            state,
            minPrice,
            maxPrice,
            startDate,
            endDate,
            sortBy,
            order
        } = req.query;

        // const page = Number(req.query.page) || 1;
        // const limit = Number(req.query.limit) || 5;

        // const offset = (page - 1) * limit;


        const filter = {
            isDeleted: false
        };

        // Price validation
        if (minPrice && isNaN(Number(minPrice))) {
            return errorResponse(res, "minPrice must be a valid number", 400);
        }

        if (maxPrice && isNaN(Number(maxPrice))) {
            return errorResponse(res, "maxPrice must be a valid number", 400);
        }

        if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
            return errorResponse(res, "minPrice cannot be greater than maxPrice", 400);
        }

        // Date validation
        if (startDate && isNaN(new Date(startDate).getTime())) {
            return errorResponse(res, "startDate must be a valid date", 400);
        }

        if (endDate && isNaN(new Date(endDate).getTime())) {
            return errorResponse(res, "endDate must be a valid date", 400);
        }

        if (
            startDate &&
            endDate &&
            new Date(startDate) > new Date(endDate)
        ) {
            return errorResponse(res, "startDate cannot be greater than endDate", 400);
        }

        // Sort validation
        const allowedSortFields = ["priceAmount", "eventDate", "title", "createdAt"];
        const allowedOrders = ["asc", "desc"];

        if (sortBy && !allowedSortFields.includes(sortBy)) {
            return errorResponse(
                res,
                `sortBy must be one of: ${allowedSortFields.join(", ")}`,
                400
            );
        }

        if (order && !allowedOrders.includes(order.toLowerCase())) {
            return errorResponse(res, "order must be either asc or desc", 400);
        }

        // Filters
        // if (category) filter.category = category;

        if (category) {
            filter.category = {
                [Op.iLike]: `%${category}%`
            }
        }

        if (city) {
            filter.city = {
                [Op.iLike]: `%${city}%`
            };
        }

        if (title) {
            filter.title = {
                [Op.iLike]: `%${title}%`
            };
        }

        if (venueName) {
            filter.venueName = {
                [Op.iLike]: `%${venueName}%`
            };
        }

        if (eventCode) filter.eventCode = eventCode;

        if (state) filter.state = state;

        if (minPrice && maxPrice) {
            filter.priceAmount = {
                [Op.between]: [Number(minPrice), Number(maxPrice)]
            };
        } else if (minPrice) {
            filter.priceAmount = {
                [Op.gte]: Number(minPrice)
            };
        } else if (maxPrice) {
            filter.priceAmount = {
                [Op.lte]: Number(maxPrice)
            };
        }

        if (startDate && endDate) {
            filter.eventDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        } else if (startDate) {
            filter.eventDate = {
                [Op.gte]: new Date(startDate)
            };
        } else if (endDate) {
            filter.eventDate = {
                [Op.lte]: new Date(endDate)
            };
        }

        // Sorting
        const sortOption = [];

        if (sortBy) {
            sortOption.push([
                sortBy,
                order && order.toLowerCase() === "desc" ? "DESC" : "ASC"
            ]);
        } else {
            sortOption.push(["createdAt", "DESC"]);
        }

        const events = await Event.findAll({
            where: filter,
            order: sortOption
        });

        if (events.length === 0) {
            return successResponse(res, "No events found", []);
        }

        const eventWithStats = events.map(event => {
            const data = event.toJSON();

            const total = data.capacityTotal || 0;
            const remaining = data.capacityRemaining || 0;

            const now = new Date();

            const visibilityDate = data.visibleFrom
                ? new Date(data.visibleFrom)
                : null;

            const bookingOpenDate = data.bookingOpenDate
                ? new Date(data.bookingOpenDate)
                : null;

            const deadline = data.registrationDeadline
                ? new Date(data.registrationDeadline)
                : null;

            const isVisible = visibilityDate ? now >= visibilityDate : true;
            const bookingOpensFrom = bookingOpenDate ? now >= bookingOpenDate : true;
            const deadlinePassed = deadline ? now > deadline : false;
            const canApply = isVisible && bookingOpensFrom && !deadlinePassed && remaining > 0;

            return {
                ...data,

                isVisible,
                bookingOpensFrom,
                deadlinePassed,
                canApply,

                totalApplied: total - remaining,
                spotsLeft: remaining,
                isFull: remaining === 0 && total > 0
            };
        });

        return successResponse(
            res,
            "Events fetched successfully",
            eventWithStats
        );

    } catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`, 500);
    }
};

// const getAllEvents = async (req, res) => {
//     try {

//         const { category, city, venueName, eventCode, title, state, minPrice, maxPrice, startDate, endDate, sortBy, order } = req.query;

//         let filter = {
//             isDeleted: false //Always fetch only active(not deleted) events
//         };

//         if (category) {
//             filter.category = category;
//         }

//         if (city) {
//             filter.city = {
//                 [Op.iLike]: `%${city}%`
//             };
//         }

//         if (title) {
//             filter.title = {
//                 [Op.iLike]: `%${title}%` // iLike helps in partial matching and also makes the query work in case-insensitive and it only works in PostgreSQL
//             };
//         }

//         if (venueName) {
//             filter.venueName = {
//                 [Op.iLike]: `%${venueName}%`
//             };
//         }
//         if (eventCode) {
//             filter.eventCode = eventCode;
//         }
//         if (state) {
//             filter.state = state;
//         }

//         if (minPrice && maxPrice) {
//             filter.priceAmount = {
//                 [Op.between]: [Number(minPrice), Number(maxPrice)]
//             };
//         }
//         else if (minPrice) {
//             filter.priceAmount = {
//                 [Op.gte]: Number(minPrice)
//             };
//         }
//         else if (maxPrice) {
//             filter.priceAmount = {
//                 [Op.lte]: Number(maxPrice)
//             };
//         }

//         if (startDate && endDate) {
//             filter.eventDate = {
//                 [Op.between]: [new Date(startDate), new Date(endDate)]
//             };
//         }
//         else if (startDate) {
//             filter.eventDate = {
//                 [Op.gte]: new Date(startDate)
//             };
//         }
//         else if (endDate) {
//             filter.eventDate = {
//                 [Op.lte]: new Date(endDate)
//             };
//         }

//         let sortOption = [];

//         const allowedSortField = ["priceAmount", "eventDate", "title"];

//         if (sortBy && allowedSortField.includes(sortBy)) {
//             sortOption.push([sortBy, order === "desc" ? "DESC" : "ASC"]);
//         }
//         else {
//             sortOption.push(["createdAt", "DESC"]);
//         }

//         const events = await Event.findAll({
//             where: filter,
//             order: sortOption
//         });

//         const eventWithStats = events.map(event => {
//             const data = event.toJSON();
//             const total = data.capacityTotal || 0;
//             const remaining = data.capacityRemaining || 0;
//             const now = new Date();
//             const visibilityDate = new Date(event.visibleFrom)
//             const bookingOpenDate = new Date(event.bookingOpenDate);

//             const deadline = data.registrationDeadline
//                 ? new Date(data.registrationDeadline)
//                 : null;

//             const isVisible = now >= visibilityDate;
//             const bookingOpensFrom = now >= bookingOpenDate;
//             const deadlinePassed = deadline ? now > deadline : false;
//             const canApply = bookingOpensFrom && !deadlinePassed;

//             return {
//                 ...data,
//                 // Added fields manually to print instead of all the fields
//                 // id: data.id,

//                 isVisible,
//                 bookingOpensFrom,
//                 deadlinePassed,
//                 canApply,

//                 // applicationStatus: registration ? registration.status : null,
//                 totalApplied: total - remaining,
//                 spotsLeft: remaining,
//                 isFull: remaining === 0 && total > 0,

//                 registrationDeadline: data.registrationDeadline,

//                 // if deadline exists, it will check if now('currentTime') is greater than the given deadline - if yes, then it will return false(like the event application deadline time is passed)

//                 // here the logic says that the user can only apply when the current time is before or equal to deadline, that means if the deadline is 10 AM, 04 and if the current time(now is 10 AM, 03) than canApply will work
//             };
//         })
//         return successResponse(res, "Events fetched successfully", eventWithStats);
//     }
//     catch (err) {
//         return errorResponse(res, `Internal Server Error: ${err.message}`);
//     }
// };

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
            where: { userId: req.user.id, isDeleted: false, isActive: true },
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
            // --- plain text fields ---
            title: clean(title),
            organizer: clean(organizer),
            category: clean(category),
            username: clean(username),
            venueName: clean(venueName),
            venueAddress: clean(venueAddress),
            city: clean(city),
            prerequisites: clean(prerequisites),
            tags: clean(tags),

            // --- rich text fields (allow basic formatting) ---
            shortDescription: clean(shortDescription, richText),
            fullDescription: clean(fullDescription, richText),
            agenda: clean(agenda, richText),

            // --- these don't need sanitization, just pass through ---
            venueMapLink,        // URL — validate separately if needed
            priceAmount,         // number
            priceCurrency,       // number/code
            isEarlyBird,         // boolean
            eventTimeStart,      // date
            eventTimeEnd,        // date
            numberOfGuests,      // number
            capacityTotal,       // number
            capacityRemaining: capacityTotal,
            eventDate,           // date
            registrationDeadline,
            visibleFrom,
            bookingOpenDate,
            fileUpload,
            userId: req.user.id
        });

        creatorLogActivity(req, {
            user: event.userId,
            eventCode: event.eventCode,
            organizer: event.organizer,
            action: 'EVENT_CREATED',
            role: req.user.role
        });

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

        // await event.update(req.body); // venue city date description


        const registrations = await Registration.findAll({
            where: {
                eventId: event.id,
                status: { [Op.notIn]: ['cancelled'] }
            }
        });

        const {
            title, organizer, category, username,
            venueName, venueAddress, venueMapLink,
            priceAmount, priceCurrency, isEarlyBird, eventTimeStart, eventTimeEnd, numberOfGuests,
            capacityTotal, eventDate, city,
            shortDescription, fullDescription,
            agenda, prerequisites, tags, registrationDeadline, visibleFrom, bookingOpenDate
        } = req.body;

        const updateEvent = await event.update({
            eventCode: generateEventCode(),
            // --- plain text fields ---
            title: clean(title),
            organizer: clean(organizer),
            category: clean(category),
            username: clean(username),
            venueName: clean(venueName),
            venueAddress: clean(venueAddress),
            city: clean(city),
            prerequisites: clean(prerequisites),
            tags: clean(tags),

            // --- rich text fields (allow basic formatting) ---
            shortDescription: clean(shortDescription, richText),
            fullDescription: clean(fullDescription, richText),
            agenda: clean(agenda, richText),

            // --- these don't need sanitization, just pass through ---
            venueMapLink,        // URL — validate separately if needed
            priceAmount,         // number
            priceCurrency,       // number/code
            isEarlyBird,         // boolean
            eventTimeStart,      // date
            eventTimeEnd,        // date
            numberOfGuests,      // number
            capacityTotal,       // number
            capacityRemaining: capacityTotal,
            eventDate,           // date
            registrationDeadline,
            visibleFrom,
            bookingOpenDate,
            fileUpload,
            userId: req.user.id
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

        creatorLogActivity(req, {
            user: event.userId,
            eventCode: event.eventCode,
            organizer: event.organizer,
            action: `${event.title}, information has been updated`,
            role: req.user.role
        });

        return successResponse(res, 'Event updated successfully', updateEvent);

    } catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`);
    }
};

const deleteEvent = async (req, res) => {
    try {

        const { reason, feedback, password } = req.body;

        const requiredFields = { reason, password };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                return errorResponse(res, `${key} is required`, 400)
            }
        }

        const eventId = req.params.id;
        const loggedInUserId = req.user.id;


        const event = await Event.findByPk(eventId);

        if (!event) {
            return errorResponse(res, 'Event not found', 404);
        }

        if (Number(event.userId) !== Number(loggedInUserId)) {
            return errorResponse(res, 'Not authorized', 403);
        }

        const owner = await User.findByPk(loggedInUserId);
        if (!owner) {
            return errorResponse(res, "Owner invalid")
        }

        const isMatched = await bcrypt.compare(password, owner.password);
        if (!isMatched) {
            return errorResponse(res, "Invalid Password", 400);
        }

        await EventDeletionFeedback.create({
            userId: owner.id,
            eventId: event.id,
            reason,
            feedback,
            deletedAt: new Date()
        })

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

        // creatorLogActivity(req, event, 'EVENT HAS BEEN DELETED BY THE OWNER', req.user.role);

        creatorLogActivity(req, {
            user: event.userId,
            eventCode: event.eventCode,
            organizer: event.organizer,
            action: `EVENT DELETED BY THE OWNER`,
            role: req.user.role
        });

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
    events,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    getMyEvents,
    deleteEvent,
    getActivityLog
}


