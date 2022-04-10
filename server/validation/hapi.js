const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const PhoneNumber = require('awesome-phonenumber');
const { LENDER_STATUSES, RIDE_STATUSES, VEHICLE_TYPES, CAR_MAKERS, SCOOTER_MAKERS, BIKE_MAKERS, VEHICLE_STATUSES, UNLOCK_TYPES, CURRENCY_TYPES } = require('../global');

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
            "string.min": "User's phone should have at least 8 characters",
            "string.max": "User's phone should have at most 15 characters",
            "string.empty": `User's phone should not be empty`,
            "any.required": `User's phone is a required field`
        }).custom((phone, helper) => {
            if (phone) {
                const regionCode = PhoneNumber(phone).getRegionCode();
                if (!regionCode) {
                    return helper.message("The user phone number appears to be invalid");
                }
                const phoneNumber = PhoneNumber(phone, regionCode);
                if (!phoneNumber || !phoneNumber.isValid()) {
                    return helper.message("The user phone number appears to be invalid");
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
        phone: Joi.string().min(8).max(15).optional().messages({
            "string.base": `User phone should have at least 8 characters`,
            "string.min": "User's phone should have at least 8 characters",
            "string.max": "User's phone should have at most 15 characters",
            "string.empty": `User phone should not be empty`,
            "any.required": `User phone is a required field`
        }).custom((phone, helper) => {
            if (phone) {
                const regionCode = PhoneNumber(phone).getRegionCode();
                if (!regionCode) {
                    return helper.message("The user phone number appears to be invalid");
                }
                const phoneNumber = PhoneNumber(phone, regionCode);
                if (!phoneNumber || !phoneNumber.isValid()) {
                    return helper.message("The user phone number appears to be invalid");
                }
            }
            return true;
        }),
        profilePicture: Joi.string().optional().allow(null),
        customerId: Joi.string().optional().messages({
            "string.base": `Customer id should have at least 1 character`,
            "string.empty": `Customer id should not be empty`,
        })

    })
    return schema.validate(data);
}

const ridePostValidation = (data) => {
    const schema = Joi.object({
        vehicleId: Joi.string().required().custom((vehicleId, helper) => {
            if (!mongoose.Types.ObjectId.isValid(vehicleId))
                return helper.message("Invalid vehicle id")
            return true;
        }).messages({
            "string.base": `Vehicle id should have at least 1 characters`,
            "string.empty": `Vehicle id should not be empty`,
            "any.required": `Vehicle id is a required field`
        }),
        pickupLocation: Joi.object({
            address: Joi.string().messages({
                "string.base": `Address should have at least 1 character`,
                "string.empty": `Address should not be empty`,
            }),
            lat: Joi.number().min(-90).max(90).messages({
                "number.base": `Latitude should have at least 1 character`,
                "number.empty": `Latitude should not be empty`,
                "number.min": `Latitude should not be less than -90`,
                "number.max": `Latitude should not be more than 90`,
            }),
            lon: Joi.number().min(-180).max(180).messages({
                "number.base": `Longitude should have at least 1 character`,
                "number.empty": `Longitude should not be empty`,
                "number.min": `Longitude should not be less than -180`,
                "number.max": `Longitude should not be more than 180`,
            })
        }).required().messages({
            "any.required": `Pickup locations is a required field`
        }),
        returnLocation: Joi.object({
            address: Joi.string().messages({
                "string.base": `Address should have at least 1 character`,
                "string.empty": `Address should not be empty`,
                "string.max": `Address should have at most 1000 characters`,
            }),
            lat: Joi.number().min(-90).max(90).messages({
                "number.base": `Latitude should have at least 1 character`,
                "number.empty": `Latitude should not be empty`,
                "number.min": `Latitude should not be less than -90`,
                "number.max": `Latitude should not be more than 90`,
            }),
            lon: Joi.number().min(-180).max(180).messages({
                "string.base": `Longitude should have at least 1 character`,
                "string.empty": `Longitude should not be empty`,
                "number.min": `Longitude should not be less than -180`,
                "number.max": `Longitude should not be more than 180`,
            })
        }).max(100).required().messages({
            "any.required": `Return locations is a required field`
        }),
        plannedPickupDt: Joi.date().required().messages({
            "number.base": `Planned pickup date and time should have at least 1 character`,
            "number.empty": `Planned pickup date and time should not be empty`,
            "any.required": `Planned pickup date and time is a required field`
        }),
        plannedReturnDt: Joi.date().required().messages({
            "number.base": `Planned return date and time should have at least 1 character`,
            "number.empty": `Planned return date and time should not be empty`,
            "any.required": `Planned return date and time is a required field`
        }),
        unlockType: Joi.string().valid(...Object.values(UNLOCK_TYPES)).required()
    })
    return schema.validate(data);
}

const rideStatusUpdateValidation = (data) => {
    const schema = Joi.object({
        status: Joi.string().valid(...Object.values(RIDE_STATUSES)).messages({
            "string.base": `Status should have at least 1 characters`,
            "string.empty": `Status should not be empty`,
            "any.required": `Status is a required field`
        })
    })
    return schema.validate(data);
}

const vehiclePostValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(100).required().messages({
            "string.base": `Title should have at least 1 character`,
            "string.empty": `Title should not be empty`,
            "string.min": `Title should have at least 1 character`,
            "string.max": `Title should have at most 100 characters`,
            "any.required": `Title is a required field`
        }),
        description: Joi.string().min(1).max(500).required().messages({
            "string.base": `Description should have at least 1 character`,
            "string.empty": `Description should not be empty`,
            "string.min": `Description should have at least 1 character`,
            "string.max": `Description should have at most 500 characters`,
            "any.required": `Description is a required field`
        }),
        type: Joi.string().valid(...Object.values(VEHICLE_TYPES)).required(),
        seats: Joi.alternatives().conditional('type', { is: "CAR", then: Joi.number().required().min(1).max(8) }),
        pickupLocations: Joi.array().items({
            address: Joi.string().max(1000).messages({
                "string.base": `Address should have at least 1 character`,
                "string.empty": `Address should not be empty`,
                "string.max": `Address should have at most 1000 characters`,
            }),
            lat: Joi.number().min(-90).max(90).messages({
                "number.base": `Number should have at least 1 character`,
                "number.empty": `Number should not be empty`,
                "number.min": `Number should not be less than -90`,
                "number.max": `Number should not be more than 90`,
            }),
            lon: Joi.number().min(-180).max(180).messages({
                "number.base": `Address should have at least 1 character`,
                "number.empty": `Address should not be empty`,
                "number.min": `Number should not be less than -180`,
                "number.max": `Number should not be more than 180`,
            })
        }).required().messages({
            "any.required": `pickupLocation is a required field`
        }),
        returnLocations: Joi.array().items({
            address: Joi.string().max(1000).messages({
                "string.base": `Address should have at least 1 character`,
                "string.empty": `Address should not be empty`,
                "string.max": `Address should have at most 1000 characters`,
            }),
            lat: Joi.number().min(-90).max(90).messages({
                "number.base": `Number should have at least 1 character`,
                "number.empty": `Number should not be empty`,
                "number.min": `Number should not be less than -90`,
                "number.max": `Number should not be more than 90`,
            }),
            lon: Joi.number().min(-180).max(180).messages({
                "number.base": `Address should have at least 1 character`,
                "number.empty": `Address should not be empty`,
                "number.min": `Number should not be less than -180`,
                "number.max": `Number should not be more than 180`,
            })
        }).required().messages({
            "any.required": `pickupLocation is a required field`
        }),
        unlockTypes: Joi.array().items(Joi.string().valid(...Object.values(UNLOCK_TYPES))).required().min(1).max(2),
        price: Joi.object({
            currency: Joi.string().valid(...Object.values(CURRENCY_TYPES)).required(),
            amount: Joi.number().min(1).required(),
        }).required(),
        photos: Joi.array().items(Joi.object({
            photo: Joi.string().required(),
        })).min(1).required(),
        vin: Joi.string().length(17).required()
    })
    return schema.validate(data);
}

const vehicleUpdateValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(100).required().messages({
            "string.base": `Title should have at least 1 character`,
            "string.empty": `Title should not be empty`,
            "string.min": `Title should have at least 1 character`,
            "string.max": `Title should have at most 100 characters`,
            "any.required": `Title is a required field`
        }),
        description: Joi.string().min(1).max(500).required().messages({
            "string.base": `Description should have at least 1 character`,
            "string.empty": `Description should not be empty`,
            "string.min": `Description should have at least 1 character`,
            "string.max": `Description should have at most 500 characters`,
            "any.required": `Description is a required field`
        }),
        type: Joi.string().valid(...Object.values(VEHICLE_TYPES)).required(),
        seats: Joi.alternatives().conditional('type', { is: "CAR", then: Joi.number().required().min(1).max(8) }),
        pickupLocations: Joi.array().items({
            address: Joi.string().max(1000).messages({
                "string.base": `Address should have at least 1 character`,
                "string.empty": `Address should not be empty`,
                "string.max": `Address should have at most 1000 characters`,
            }),
            lat: Joi.number().min(-90).max(90).messages({
                "number.base": `Number should have at least 1 character`,
                "number.empty": `Number should not be empty`,
                "number.min": `Number should not be less than -90`,
                "number.max": `Number should not be more than 90`,
            }),
            lon: Joi.number().min(-180).max(180).messages({
                "number.base": `Address should have at least 1 character`,
                "number.empty": `Address should not be empty`,
                "number.min": `Number should not be less than -180`,
                "number.max": `Number should not be more than 180`,
            })
        }).required().messages({
            "any.required": `pickupLocation is a required field`
        }),
        returnLocations: Joi.array().items({
            address: Joi.string().max(1000).messages({
                "string.base": `Address should have at least 1 character`,
                "string.empty": `Address should not be empty`,
                "string.max": `Address should have at most 1000 characters`,
            }),
            lat: Joi.number().min(-90).max(90).messages({
                "number.base": `Number should have at least 1 character`,
                "number.empty": `Number should not be empty`,
                "number.min": `Number should not be less than -90`,
                "number.max": `Number should not be more than 90`,
            }),
            lon: Joi.number().min(-180).max(180).messages({
                "number.base": `Address should have at least 1 character`,
                "number.empty": `Address should not be empty`,
                "number.min": `Number should not be less than -180`,
                "number.max": `Number should not be more than 180`,
            })
        }).required().messages({
            "any.required": `pickupLocation is a required field`
        }),
        unlockTypes: Joi.array().items(Joi.string().valid(...Object.values(UNLOCK_TYPES))).required().min(1).max(2),
        price: Joi.object({
            currency: Joi.string().valid(...Object.values(CURRENCY_TYPES)).required(),
            amount: Joi.number().min(1).required(),
        }).required(),
        photos: Joi.array().items(Joi.object({
            photo: Joi.string().required(),
        })).min(1).required()
    })
    return schema.validate(data);
}

const lenderUpdateValidation = (data) => {
    const schema = Joi.object({
        status: Joi.string().valid(...Object.values(LENDER_STATUSES)).required()
    })
    return schema.validate(data);
}

const businessPostValidation = (data) => {
    const schema = Joi.object({
        uid: Joi.string().min(1).max(200).required().messages({
            "string.base": `Unique identifier should have at least 1 character`,
            "string.empty": `Unique identifier should not be empty`,
            "string.min": `Unique identifier should have at least 1 character`,
            "string.max": `Unique identifier should have at most 200 characters`,
            "any.required": `Unique identifier is a required field`
        }),
        name: Joi.string().min(1).max(200).required().messages({
            "string.base": `Name should have at least 1 characters`,
            "string.empty": `Name should not be empty`,
            "string.min": `Name should have at least 1 character`,
            "string.max": `Name should have at most 200 characters`,
            "any.required": `Name is a required field`
        }),
        users: Joi.array().items(Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Element from the users array has an invalid user id");
            }
            return true;
        })).required(),
        phone: Joi.string().min(8).max(15).required().messages({
            "string.base": `Phone number should have at least 8 characters`,
            "string.empty": `Phone number should not be empty`,
            "string.min": `Phone number have at least 8 characters`,
            "string.max": `Name should have at most 15 characters`,
            "any.required": `Phone number is a required field`
        }).custom((phone, helper) => {
            if (phone) {
                const regionCode = PhoneNumber(phone).getRegionCode();
                if (!regionCode) {
                    return helper.message("The phone number appears to be invalid");
                }
                const phoneNumber = PhoneNumber(phone, regionCode);
                if (!phoneNumber || !phoneNumber.isValid()) {
                    return helper.message("The phone number appears to be invalid");
                }
            }
            return true;
        }),
        email: Joi.string().email().min(3).max(320).required().messages({
            "string.base": `Email should have at least 3 characters`,
            "string.empty": `Email should not be empty`,
            "string.email": `Email should be a valid email address`,
            "string.min": `Email should have at least 3 characters`,
            "string.max": `Email should have at most 320 characters`,
            "any.required": `Email is a required field`
        })
    })
    return schema.validate(data);
}

const businessUpdateValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(1).max(200).required().messages({
            "string.base": `Name should have at least 1 characters`,
            "string.empty": `Name should not be empty`,
            "string.min": `Name should have at least 1 character`,
            "string.max": `Name should have at most 200 characters`,
            "any.required": `Name is a required field`
        }),
        users: Joi.array().items(Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Element from the users array has an invalid user id");
            }
            return true;
        })).required(),
        phone: Joi.string().min(8).max(15).required().messages({
            "string.base": `Phone number should have at least 8 characters`,
            "string.empty": `Phone number should not be empty`,
            "string.min": `Phone number have at least 8 characters`,
            "string.max": `Name should have at most 15 characters`,
            "any.required": `Phone number is a required field`
        }).custom((phone, helper) => {
            if (phone) {
                const regionCode = PhoneNumber(phone).getRegionCode();
                if (!regionCode) {
                    return helper.message("The phone number appears to be invalid");
                }
                const phoneNumber = PhoneNumber(phone, regionCode);
                if (!phoneNumber || !phoneNumber.isValid()) {
                    return helper.message("The phone number appears to be invalid");
                }
            }
            return true;
        }),
        email: Joi.string().email().min(3).max(320).required().messages({
            "string.base": `Email should have at least 3 characters`,
            "string.empty": `Email should not be empty`,
            "string.email": `Email should be a valid email address`,
            "string.min": `Email should have at least 3 characters`,
            "string.max": `Email should have at most 320 characters`,
            "any.required": `Email is a required field`
        }),
    })
    return schema.validate(data);
}

const reviewPostValidation = (data) => {
    const schema = Joi.object({
        rideId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid ride id");
            }
            return true;
        }).required().messages({
            "string.base": "Please provide a ride id",
            "string.empty": "Please provide a ride id",
            "any.required": "Please provide a ride id"
        }),
        rating: Joi.number().integer().min(1).max(5).messages({
            "number.base": `Rating should have at least 1 character`,
            "number.empty": `Rating should not be empty`,
            "number.min": `Rating should greater than or equal to 1`,
            "number.max": `Rating should not be greater than 5`,
        }),
        review: Joi.string().min(1).max(500).optional().messages({
            "string.base": `Review should have at least 1 character`,
            "string.empty": `Review should not be empty`,
            "string.min": `Review should have at least 1 character`,
            "string.max": `Review should have at most 500 characters`,
        })
    })
    return schema.validate(data);
}

module.exports = {
    signupValidation,
    loginValidation,
    userUpdateValidation,
    ridePostValidation,
    lenderUpdateValidation,
    rideStatusUpdateValidation,
    vehiclePostValidation,
    vehicleUpdateValidation,
    businessPostValidation,
    businessUpdateValidation,
    reviewPostValidation
}
