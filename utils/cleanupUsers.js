const cron = require('node-cron');
const { Op } = require('sequelize');
const { User, Event } = require('../models');

// const eventReminder = () => {
//     cron.schedule('0 0 0 0 0', async () => {
//         try {
//             const twoDaysBefore = new Date(eventDate - 3*24*60*1000);


//         }
//         catch (err) {
//             console.error(`Internal server error: ${err.message}`)
//         }
//     })
// }

const scheduleUserCleanup = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

            const deleted = await User.unscoped().destroy({
                where: {
                    isDeleted: true,
                    deletedAt: { [Op.lte]: threeDaysAgo }
                }
            });

            console.log('Permanantly deleted all the users which were soft deleted before 3 days');
        }
        catch (err) {
            console.error(`Cleanup error: ${err.message}`);
        }
    })
}

const scheduleEventCleanup = () => {
    cron.schedule('0 0 * * *', async () => {

        try {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            const toDelete = await Event.unscoped().findAll({
                where: {
                    isDeleted: true,
                    deletedAt: { [Op.lte]: threeDaysAgo }
                }
            });

            console.log('Events to delete:', toDelete.length);
            console.log('threeDaysAgo:', threeDaysAgo);

            const deleted = await Event.unscoped().destroy({
                where: {
                    isDeleted: true,
                    deletedAt: { [Op.lte]: threeDaysAgo }
                }
            });

            console.log('Permanantly deleted all the events which were soft deleted before 3 days');

        }
        catch (err) {
            console.error(`Cleanup error: ${err.message}`);
        }
    })
}

module.exports = { scheduleUserCleanup, scheduleEventCleanup };