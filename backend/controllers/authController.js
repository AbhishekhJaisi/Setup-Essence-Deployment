const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blackListedTokens = new Set();
const nodemailer = require('nodemailer');
const { User, Event, AccountDeletionFeedback } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { userLogActivity, creatorLogActivity } = require('../utils/logger');
const { createAndSendNotification } = require('../utils/notificationHelper')
const SECRET = process.env.JWT_SECRET;
const sanitize = require('sanitize-html');
const { clean, richText } = require('../utils/sanitize');
const errorHandler = require('../middleware/errorHandler');

const otpStore = {};


const user = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const offset = (page - 1) * limit;

        const user = await User.findAll({
            limit: limit,
            offset: offset
        })

        return successResponse(res, user, 200)
    }
    catch (err) {
        return errorResponse(res, "Internal server error", err.message)
    }
}

const register = async (req, res, next) => {
    try {

        const { username, email, password, phone_number, role } = req.body;

        if (!username || !email || !password || !role) {
            const error = new Error("Username, Email, Password and role required");
            error.statusCode;
            throw error;
            // return errorResponse(res, "Username, Email, Password and role required", 400)
        }

        if (!['user', 'creator'].includes(role)) {
            const error = new Error("Role must either be user or creator!");
            error.statusCode;
            throw error;
        }
        // check if user exists in AIVEN (not the array)
        const existingUser = await User.findOne(
            {
                where: { email: email, isDeleted: false }
            });

        if (existingUser) {
            const error = new Error("User already registered");
            error.statusCode;
            throw error;
        }

        if (password.length < 6) {
            const error = new Error("Password must be of at least 6 character");
            error.statusCode;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username: clean(username),
            email: req.body.email?.trim().toLowerCase(),
            password: hashedPassword,
            phone_number: clean(phone_number),
            role: clean(role)
        });


        await createAndSendNotification(
            newUser.id,
            'NEW_REGISTRATION',
            `Welcome ${newUser.username}, you have successfully registered on the platform`,
            {
                to: {
                    id: newUser.id
                },
                type: 'SYSTEM',
                time: new Date().toISOString()
            }
        );

        userLogActivity(req, newUser, 'REGISTER', newUser.role);

        return successResponse(res, "User registered successfully", {
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                phone_number,
                role
            },
        }, 201)

    }

    catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {

        const { email, password, rememberMe } = req.body;

        if (!email || !password) {
            const error = new Error("Email, Password required");
            error.statusCode;
            throw error;
        }

        // // const cleanEmail = email?.trim().toLowerCase();
        // const requiredFields = { email, password };

        // for (const [key, value] of Object.entries(requiredFields)) {
        //     if (!value) {
        //         const error = new Error(`${key} is mising, please enter`);
        //         error.statusCode;
        //         throw error;
        //     }
        // }

        const user = await User.findOne(
            {
                where: { email, isDeleted: false }
            });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode;
            throw error;
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            const error = new Error("Invalid password");
            error.statusCode;
            throw error;
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET, {
            expiresIn: rememberMe ? "7d" : "1h"

        });

        await userLogActivity(req, user, 'LOGIN', user.role);

        return successResponse(res, "Logged in successfully", {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });
        ;
    }

    catch (err) {
        next(err);
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id },
            attributes: ['id', 'username', 'email', 'phone_number', 'bio', 'photo', 'notifyEmail', 'notifyPush',
                'dob',
                'country',
                'city',
                'address',
                'interests',
                'bio', 'role'],
        });

        if (!user) {
            return errorResponse(res, "User not found", 404)
        }
        return successResponse(res, "Profile fetched successfully", {
            isOnboarded: user.isOnboarded,
            user
        });
    }

    catch (err) {
        return errorResponse(res, `Internal Server error: ${err.message}`)
    }
};

const updateProfile = async (req, res) => {
    try {

        const { username, phone_number, bio, notifyEmail, notifyPush } = req.body;

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return errorResponse(res, "User not found", 404);
        };

        const oldData = {
            username: user.username,
            phone_number: user.phone_number,
            bio: user.bio,
            notifyEmail: user.notifyEmail,
            notifyPush: user.notifyPush
        };

        const cleanUsername = clean(username);
        const cleanPhone = clean(phone_number);
        const cleanBio = clean(bio);


        await user.update({
            username: cleanUsername,
            phone_number: cleanPhone,
            bio: cleanBio,
            notifyEmail,
            notifyPush
        });

        const updatedFields = [];

        if (oldData.username !== cleanUsername) {
            updatedFields.push(`username from "${oldData.username}" to "${username}"`);
        }

        if (oldData.phone_number !== cleanPhone) {
            updatedFields.push(`phone number from "${oldData.phone_number}" to "${phone_number}"`);
        }

        if (oldData.bio !== cleanBio) {
            updatedFields.push(`bio from "${oldData.bio}" to "${bio}"`);
        }

        if (oldData.notifyEmail !== notifyEmail) {
            updatedFields.push(`email notification preference from "${oldData.notifyEmail}" to "${notifyEmail}"`);
        }

        if (oldData.notifyPush !== notifyPush) {
            updatedFields.push(`push notification preference from "${oldData.notifyPush}" to "${notifyPush}"`);
        }

        const message = `Hi ${user.username}, your profile was updated.`;


        await createAndSendNotification(
            user.id,
            'PROFILE_UPDATED',
            message,                          // short, safe
            {
                to: { id: user.email },
                type: 'SYSTEM',
                updatedFields,                // full detail lives here
                time: new Date().toISOString()
            }
        );


        userLogActivity(req, user, 'USER UPDATED HIS/HER PROFILE', user.role);


        return successResponse(res, "Profile updated successfully", {
            user: {
                id: user.id,
                name: user.username,
                email: user.email,
                phone: user.phone_number,
                bio: user.bio,
                notifyEmail: user.notifyEmail,
                notifyPush: user.notifyPush
            }
        })
    }

    catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`);
    }
};

const logout = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return errorResponse(req, "User not found", 500);
        }

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return errorResponse(res, "No token provided", 400);

        // userLogActivity(req, {
        //     userId: user.id,
        //     username: user.username,
        //     action: 'LOGOUT',
        //     role: user.role
        // });

        await userLogActivity(req, user, 'LOGOUT', user.role);



        blackListedTokens.add(token);

        return successResponse(res, "User logged out successfully", {
            id: user.id,
            name: user.username,
        });

    }
    catch (err) {
        return errorResponse(res, `Logout failed: ${err.message}`, 500);
    }
};

const onBoardUser = async (req, res) => {
    try {
        const {
            phone_number,
            dob,
            country,
            city,
            address,
            interests,
            bio
        } = req.body;

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }
        await user.update({
            phone_number,
            dob,
            country,
            city,
            address,
            interests,
            bio
        });

        return successResponse(res, "Profile setup completed", {
            user: {
                id: user.id,
                name: user.username,
                email: user.email,
                phone: user.phone_number,
                dob: user.dob,
                country: user.country,
                city: user.city,
                address: user.address,
                interests: user.interests,
                bio: user.bio
            }
        });

    }
    catch (err) {
        return errorResponse(res, `Internal server error: ${err.message}`);
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return errorResponse(res, "User not found", 404); //User validation
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generating the OTP

        await user.update({
            otp,
            otpExpiresAt: Date.now() + 2 * 60 * 1000
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp-gmail.com',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Job Portal - Password reset OTP',
            text: `Your OTP is: ${otp}\n\nThis OTP expires in 2 minutes.`
        };

        await transporter.sendMail(mailOptions);
        return successResponse(res, "OTP send to your email", 200);
    }
    catch (err) {
        return errorResponse(res, `Failed to send email: ${err.message}`);
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return errorResponse(res, "Email required", 404);
        }

        if (user.otp !== otp) {
            return errorResponse(res, "Invalid OTP", 500);
        }

        if (new Date() > user.otpExpiresAt) {
            return errorResponse(res, "OTP expired", 400)
        }

        await user.update({
            otp: null,
            otpExpiresAt: null
        });

        userLogActivity(req, user, 'VERIFIED OTP', user.role);

        return successResponse(res, "OTP has been validated");
    }
    catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`);
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return errorResponse(res, "Invalid or expired token", 400);
        }

        if (newPassword !== confirmPassword) {
            return errorResponse(res, "Password does not match", 404);
        }

        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return errorResponse(res, "Old password and new password cannot be same", 404);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await user.update({
            password: hashedPassword
        });


        await createAndSendNotification(
            user.id,
            'PASSWORD_RESET',
            `Hi ${user.username}, you have successfully reset your password`,
            {
                to: {
                    id: user.id
                },
                type: 'SYSTEM',
                time: new Date().toISOString()
            }
        );

        userLogActivity(req, user, "PASSWORD HAS BEEN RESET", user.role);

        return successResponse(res, 'Password has been reset');

    }
    catch (err) {
        return errorResponse(res, `Internal Server Error: ${err.message}`);
    }
}

const deleteUser = async (req, res) => {
    try {

        const { reason, feedback, password } = req.body;

        const requiredFields = { reason, password };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                return errorResponse(res, `${key} is required`, 400)
            }
        }
        const user = await User.findOne({
            where: {
                id: req.user.id,
                isDeleted: false
            }
        });

        if (!user) {
            return errorResponse(res, "User not found", 401);
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return errorResponse(res, "Inavlid Password", 400)
        }


        const allowedReasons =
            [
                "I no longer attend events",
                "I found a better event platform",
                "Too many notifications or emails",
                "Privacy or data concerns",
                "App is difficult to use",
                "Events are not relevant to me",
                "Facing technical issues or bugs",
                "Created account by mistake",
                "I don’t trust the platform",
                "Poor event quality or experience",
                "Duplicate account",
                "Other"
            ];

        if (!allowedReasons.includes(reason)) {
            return errorResponse(res, "Inavlid reason, select one", 400)
        }


        await AccountDeletionFeedback.create({
            id: user.id,
            email: user.email,
            username: user.username,
            reason,
            feedback,
            deletedAt: new Date()
        })

        await createAndSendNotification(
            user.id,
            'ACCOUNT_DELETED',
            `Hi ${user.username}, your account has been deleted.`,
            {
                to: {
                    id: user.id
                },
                type: 'SYSTEM',
                time: new Date().toISOString()
            }
        );

        await user.update({
            isDeleted: true,
            deletedAt: new Date(),
            email: `deleted_${user.id}_${Date.now()}_${user.email}`,
            phone_number: user.phone_number
                ? `deleted_${user.id}_${Date.now()}_${user.phone_number}`
                : null
        });

        userLogActivity(req, user, 'USER ACCOUNT DELETED', user.role);

        return successResponse(res, "User deleted successfully", {
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        return errorResponse(res, `Internal Server Error: ${err.message}`, 500);
    }
};


// const login = catchAsync(async (req, res) => {
//     const { email, password, rememberMe } = req.body;
//     const cleanEmail = email?.trim().toLowerCase();

//     // Validation
//     const requiredFields = { email, password };
//     for (const [key, value] of Object.entries(requiredFields)) {
//         if (!value) throw new AppError(`${key} is missing, please enter`, 400);
//     }

//     // User check
//     const user = await User.findOne({ where: { email: cleanEmail, isDeleted: false } });
//     if (!user) throw new AppError("User not found", 404);

//     // Password check
//     const isMatched = await bcrypt.compare(password, user.password);
//     if (!isMatched) throw new AppError("Invalid password", 401);

//     // Token
//     const token = jwt.sign(
//         { id: user.id, role: user.role, email: user.email },
//         process.env.JWT_SECRET,
//         { expiresIn: rememberMe ? "7d" : "1h" }
//     );

//     await userLogActivity(req, user, "LOGIN", user.role);

//     return successResponse(res, "Logged in successfully", {
//         user: { id: user.id, username: user.username, email: user.email, role: user.role },
//         token,
//     });
// });

module.exports = { register, user, login, getProfile, logout, updateProfile, onBoardUser, forgotPassword, verifyOtp, resetPassword, deleteUser, blackListedTokens };



