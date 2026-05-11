const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs/activity.txt');

const userLogActivity = (req, user, action, role) => {
    console.log('Log path:', logFile);
    const time = new Date().toISOString();

    const ip =
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket?.remoteAddress ||
        req.ip;

    const entry = `[${time}] UserID: ${user.id} | UserName: ${user.username} | IP: ${ip} | Action: ${action} | Role: ${user.role}\n`;
    fs.appendFile(logFile, entry, (err) => {
        if (err) {
            console.log('Log error:', err);
        };
    });
};

const creatorLogActivity = (req, user, action, role) => {
    console.log('Log path:', logFile);
    const time = new Date().toISOString();

    const ip =
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket?.remoteAddress ||
        req.ip;

    const entry = `[${time}] EventCode: ${user.eventCode} | Organizer: ${user.organizer} | IP: ${ip} | Action: ${action} | Role: ${role} \n`;
    fs.appendFile(logFile, entry, (err) => {
        if (err) {
            console.log('Log error:', err);
        };
    });
};

module.exports = { userLogActivity, creatorLogActivity };