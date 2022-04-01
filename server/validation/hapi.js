const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const PhoneNumber = require('awesome-phonenumber');

const signupValidation = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().min(1).max(200).required().messages({
            "string.base": `First name should have at least 1 character`,
            "string.empty": `First name should not be empty`,
            "string.min": `First name should have at least 1 character`,
            "string.max": `First name should have at most 200 characters`,
            "any.required": `First name is a required field`
        }),
        lastName: Joi.string().min(1).max(200).required().messages({
            "string.base": `Last name should have at least 1 character`,
            "string.empty": `Last name should not be empty`,
            "string.min": `Last name should have at least 1 character`,
            "string.max": `Last name should have at most 200 characters`,
            "any.required": `Last name is a required field`
        }),
        email: Joi.string().email().min(3).max(320).required().messages({
            "string.base": `Email should have at least 3 characters`,
            "string.empty": `Email should not be empty`,
            "string.min": `Email should have at least 3 characters`,
            "string.email": `Email should be a valid email address`,
            "string.max": `Email should have at most 320 characters`,
            "any.required": `Email is a required field`
        }),
        password: Joi.string().min(8).max(100).required().messages({
            "string.base": `Password should have at least 8 characters`,
            "string.empty": `Password should not be empty`,
            "string.min": `Password should have at least 8 characters`,
            "string.max": `Password should have at most 100 characters`,
            "any.required": `Password is a required field`
        }),
        phone: Joi.string().min(8).max(15).required().messages({
            "string.base": `User's phone should have at least 8 characters`,
            "string.empty": `User's phone should not be empty`,
            "any.required": `User's phone is a required field`
        }).custom((phone, helper) => {
            if (phone) {
                const regionCode = PhoneNumber(phone).getRegionCode();
                if (!regionCode) {
                    return helper.message("The User phone number appears to be invalid");
                }
                const phoneNumber = PhoneNumber(phone, regionCode);
                if (!phoneNumber || !phoneNumber.isValid()) {
                    return helper.message("The User phone number appears to be invalid");
                }
            }
            return true;
        }),
    })
    return schema.validate(data);
}

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().max(320).required().messages({
            "string.base": `Email should have at least 1 characters`,
            "string.empty": `Email should not be empty`,
            "string.email": `Email should be a valid email address`,
            "string.max": `Email should have at most 320 characters`,
            "any.required": `Email is a required field`
        }),
        password: Joi.string().max(100).required().messages({
            "string.base": `Password should have at least 1 character`,
            "string.empty": `Password should not be empty`,
            "string.max": `Password should have at most 100 characters`,
            "any.required": `Password is a required field`
        })
    })
    return schema.validate(data);
}

const userUpdateValidation = data => {
    const schema = Joi.object({
        email: Joi.string().min(3).max(320).optional().email().messages({
            "string.base": `User email should have at least 3 characters`,
            "string.empty": `User email should not be empty`,
            "string.min": `User email should have at least 3 characters`,
            "string.email": `User email should be a valid email address`,
            "string.max": `User email should have at most 320 characters`,
            "any.required": `User email is a required field`
        }),
        firstName: Joi.string().min(1).max(200).optional().messages({
            "string.base": `First name should have at least 1 character`,
            "string.empty": `First name should not be empty`,
            "string.min": `First name should have at least 1 character`,
            "string.max": `First name should have at most 200 characters`,
            "any.required": `First name is a required field`
        }),
        lastName: Joi.string().min(1).max(200).optional().messages({
            "string.base": `First name should have at least 1 character`,
            "string.empty": `First name should not be empty`,
            "string.min": `First name should have at least 1 character`,
            "string.max": `First name should have at most 200 characters`,
            "any.required": `First name is a required field`
        }),
        phone: Joi.string().optional().messages({
            "string.base": `User phone should have at least 8 characters`,
            "string.empty": `User phone should not be empty`,
            "any.required": `User phone is a required field`
        }).custom((phone, helper) => {
            if (phone) {
                const regionCode = PhoneNumber(phone).getRegionCode();
                if (!regionCode) {
                    return helper.message("The User phone number appears to be invalid");
                }
                const phoneNumber = PhoneNumber(phone, regionCode);
                if (!phoneNumber || !phoneNumber.isValid()) {
                    return helper.message("The User phone number appears to be invalid");
                }
            }
            return true;
        }),
        profilePicture: Joi.string().optional().allow(null)
        
    })
    return schema.validate(data);
}

const postRideValidation = (data) => {
    const schema = Joi.object({
        vehicleId: Joi.string().email().max(320).required().messages({
            "string.base": `Email should have at least 1 characters`,
            "string.empty": `Email should not be empty`,
            "string.email": `Email should be a valid email address`,
            "string.max": `Email should have at most 320 characters`,
            "any.required": `Email is a required field`
        }),
        pickUpLocation: Joi.string().max(100).required().messages({
            "string.base": `Password should have at least 1 character`,
            "string.empty": `Password should not be empty`,
            "string.max": `Password should have at most 100 characters`,
            "any.required": `Password is a required field`
        }),
        returnLocation: Joi.string().max(100).required().messages({
            "string.base": `Password should have at least 1 character`,
            "string.empty": `Password should not be empty`,
            "string.max": `Password should have at most 100 characters`,
            "any.required": `Password is a required field`
        }),
        pickUpLocation: Joi.string().max(100).required().messages({
            "string.base": `Password should have at least 1 character`,
            "string.empty": `Password should not be empty`,
            "string.max": `Password should have at most 100 characters`,
            "any.required": `Password is a required field`
        }),
        pickUpLocation: Joi.string().max(100).required().messages({
            "string.base": `Password should have at least 1 character`,
            "string.empty": `Password should not be empty`,
            "string.max": `Password should have at most 100 characters`,
            "any.required": `Password is a required field`
        })

    })
    return schema.validate(data);
}

module.exports = {
    signupValidation,
    loginValidation,
    userUpdateValidation,
    postRideValidation
}