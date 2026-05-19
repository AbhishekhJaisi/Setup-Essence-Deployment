const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts. Please wait 10 minutes and try again to register.'
    }
});

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please wait 10 minutes and try again.'
    }
});

const applyLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts. Please wait 10 minutes and try again'
    }
});

const editBtnLimiter = rateLimit({
    windowMs: 45 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts. Please wait 10 minutes and try again to edit the same file'
    }
});

const createBtnLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts. Please wait 10 minutes and try again to create a new Event'
    }
});

const deleteBtnLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts. Please wait 10 minutes and try again to delete the Event'
    }
});

const forgotPassBtnLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attemps. Please try again in 45 secons'
    }
});

module.exports = { registerLimiter, loginLimiter, applyLimiter, editBtnLimiter, createBtnLimiter, deleteBtnLimiter, forgotPassBtnLimiter };