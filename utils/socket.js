const sendNotification = (connectedUsers, io, userId, notification) => {
    const socketId = connectedUsers[String(userId)];
    if (socketId) {
        io.to(socketId).emit('notification', notification);
        console.log('Notification sent');
    }
    else {
        console.log('User not connected');

    }
};

const broadcastNotification = (io, notification) => {
    io.emit('notification', notification);
        };

module.exports = { sendNotification, broadcastNotification };