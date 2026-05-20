require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const db = require('./models');
const path = require('path');
const registrationRoutes = require('./routes/registration');
const pg = require('pg');
const { scheduleUserCleanup, scheduleEventCleanup } = require('./utils/cleanupUsers');
const { connectedUsers, setIO } = require('./utils/socketStore');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');
const notificationRoutes = require('./routes/notification');

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

app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/registrations', registrationRoutes);
app.use('/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Server is working');
});

scheduleUserCleanup();
scheduleEventCleanup();

const PORT = process.env.PORT || 4000;

db.sequelize.authenticate()
    .then(() => {
        console.log('DB connected');
        return db.sequelize.sync({ logging: false });
    })
    .then(() => {
        console.log('Tables synced');
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Startup error:', err.message);
    });




// const session = require('express-session');
// const pgSession = require('connect-pg-simple')(session);
// const { autoLogout } = require('./middleware/authMiddleware');
// const pgPool = new pg.Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     ssl: {
//         rejectUnauthorized: false
//     }
// });

// app.use(session({
//     store: new pgSession({
//         pool: pgPool,
//         tableName: 'session'
//     }),
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         httpOnly: true,
//         secure: false,
//         sameSite: 'none',
//         maxAge: 1000 * 60 * 60
//     }
// }));