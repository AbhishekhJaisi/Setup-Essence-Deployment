const connectedUsers = {};
let ioInstance = null;

const setIO = (io) => {
    ioInstance = io;
};

const getIO = () => ioInstance;

module.exports = {
    connectedUsers,
    setIO,
    getIO
};