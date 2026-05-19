require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const db = require('./models');
const path = require('path');
const registrationRoutes = require('./routes/registration');
const pg = require('pg');
const { scheduleUserCleanup, scheduleEventCleanup, accountDeletionFeedbackCleanup } = require('./utils/cleanupUsers');
const { startEventReminder } = require('./utils/eventReminder.js');
const { connectedUsers, setIO } = require('./utils/socketStore');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const logsRouter = require('./routes/logs');
const errorHandler = require('./middleware/errorHandler');
const { connectRedis } = require('./config/redisClient');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');
const notificationRoutes = require('./routes/notification');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS.split(','),
        methods: ['GET', 'POST'],
        credentials: true
    }
});

setIO(io);

io.on('connection', (socket) => { // real time notifications
    console.log('User connected: ', socket.id);

    socket.on('join', (userId) => {
        connectedUsers[String(userId)] = socket.id;
        console.log(`User ${userId} joined with socket ${socket.id}`);
        console.log('All connected:', connectedUsers);
    });

    socket.on('disconnect', () => {
        Object.keys(connectedUsers).forEach(userId => {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
                console.log(`User ${userId} disconnected`);
            }
        });
    });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Event Management API Docs',
    customCss: '.swagger-ui .topbar {background-color:  #1a1a2e}'
}));

app.set('trust proxy', 1);

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
    })
);

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/registrations', registrationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/logs', logsRouter);
app.use('/api', chatRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('Server is working');
});

scheduleUserCleanup();
scheduleEventCleanup();
accountDeletionFeedbackCleanup();
startEventReminder();

const PORT = process.env.PORT || 4000;

// const startServer = async () => {
//     try {
//         await db.sequelize.authenticate();
//         console.log("DB connected");

//         await connectRedis();
//         console.log("Redis connected");

//         await db.sequelize.sync({ logging: false });

//         server.listen(PORT, "0.0.0.0", () => {
//             console.log(`Server running at http://localhost:${PORT}`);
//         });
//     }
//     catch (err) {
//         console.log(`Startup error: ${err.message}`);
//     }
// };

const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log("DB connected");

        // Redis won't block server startup now
        connectRedis().catch((err) => {
            console.log("Redis failed, continuing without it:", err.message);
        });

        await db.sequelize.sync({ logging: false });

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.log(`Startup error: ${err.message}`);
    }
};

startServer();
