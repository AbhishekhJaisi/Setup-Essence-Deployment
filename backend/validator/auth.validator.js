// validators/auth.validator.js
const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().min(1).required(),
    phone_number: Joi.number().min(10).required()
});


const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const updateProfileSchema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    phone_number: Joi.number().min(10).required(),
    bio: Joi.string().min(50).required(),
    notifyEmail: Joi.boolean().required(),
    notifyPush: Joi.boolean().required()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.number().min(6).required()
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().min(6).required(),
});


module.exports = { registerSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema };