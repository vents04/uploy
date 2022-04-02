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
        profilePicture: Joi.string().optional().allow(null)
        
    })
    return schema.validate(data);
}

const postRideValidation = (data) => {
    const schema = Joi.object({
        vehicleId: Joi.string().required().messages({
            "string.base": `Vehicle id should have at least 1 characters`,
            "string.empty": `Vehicle id should not be empty`,
            "any.required": `Vehicle id is a required field`
        }).custom((vehicleId, helper) => {
            if(!mongoose.Types.ObjectId.isValid(vehicleId))
                return helper.message("Invalid vehicle id")
            return true;
        }),
        pickupLocation: Joi.object({
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
        returnLocation: Joi.string().max(100).required().messages({
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
                "string.base": `Address should have at least 1 character`,
                "string.empty": `Address should not be empty`,
                "number.min": `Number should not be less than -180`,
                "number.max": `Number should not be more than 180`,
            })
        }).required().messages({
            "any.required": `returnLocation is a required field`
        }),
        plannedPickupDt: Joi.number().required().messages({
            "number.base": `Password should have at least 1 character`,
            "number.empty": `Password should not be empty`,
            "any.required": `Password is a required field`
        }),
        plannedReturnDt: Joi.string().required().messages({
            "number.base": `Password should have at least 1 character`,
            "number.empty": `Password should not be empty`,
            "any.required": `Password is a required field`
        })

    })
    return schema.validate(data);
}

const updateRideStatusValidation = (data) => {
    const schema = Joi.object({
        status: Joi.string().valid(...Object.values(RIDE_STATUSES)).messages({
            "string.base": `Status should have at least 1 characters`,
            "string.empty": `Status should not be empty`,
            "any.required": `Status is a required field`
        })
    })
    return schema.validate(data);
}

const lenderPostValidation = (data) => {
    const schema = Joi.object({
        userId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid user id");
            }
            return true;
        }).required().messages({
            "string.base": "Please provide an user id before submitting",
            "string.empty": "Please provide an user id before submitting",
            "any.required": "Please provide an user id before submitting"
        })
    })
    return schema.validate(data);
}

const postVehicleValidation = (data) => {
    const schema = Joi.object({
        lenderId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid lender id");
            }
            return true;
        }).required().messages({
            "string.base": "Please provide an existing lender before submitting",
            "string.empty": "Please provide an existing lender before submitting",
            "any.required": "Please provide an existing lender before submitting"
        }),
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
        model: Joi.string().min(1).max(70).required().messages({
            "string.base": `Model should have at least 1 character`,
            "string.empty": `Model should not be empty`,
            "string.min": `Model should have at least 1 character`,
            "string.max": `Model should have at most 200 characters`,
            "any.required": `Model is a required field`
        }),
        type: Joi.string().valid(...VEHICLE_TYPES).required().
        when(Joi.object({type: Joi.string().valid("CAR")}).unknown(), {
            then: Joi.object({
                maker: Joi.string().valid(...CAR_MAKERS).required()
            })
        }).
        when(Joi.object({type: Joi.string().valid("BIKE")}).unknown(), {
            then: Joi.object({
                maker: Joi.string().valid(...BIKE_MAKERS).required()
            })
        }).
        when(Joi.object({type: Joi.string().valid("SCOOTER")}).unknown(), {
            then: Joi.object({
                maker: Joi.string().valid(...SCOOTER_MAKERS).required()
            })
        }),
        status: Joi.string().valid(...VEHICLE_STATUSES).required(),
        seats: Joi.alternatives().conditional('type', { is: "CAR", then: Joi.number().required() }).min(1).max(8),
        smartCarKey: Joi.string().required(),
        pickupLocation: Joi.object({
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
        returnLocations: Joi.object({
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
        unlockTypes: Joi.string().valid(...UNLOCK_TYPES).required(),
        price: Joi.object({
            currency: Joi.string().valid(...CURRENCY_TYPES).required(),
            amount: Joi.number().min(1).required(),
        }).required(),
        pictures: Joi.array().items(Joi.object({
            file: Joi.string().required()
        })).required()
    })
    return schema.validate(data);
}

const updateVehicleValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(100).optional().messages({
            "string.base": `Title should have at least 1 character`,
            "string.empty": `Title should not be empty`,
            "string.min": `Title should have at least 1 character`,
            "string.max": `Title should have at most 100 characters`,
            "any.required": `Title is a required field`
        }),
        description: Joi.string().min(1).max(500).optional().messages({
            "string.base": `Description should have at least 1 character`,
            "string.empty": `Description should not be empty`,
            "string.min": `Description should have at least 1 character`,
            "string.max": `Description should have at most 500 characters`,
            "any.required": `Description is a required field`
        }),
        model: Joi.string().min(1).max(70).optional().messages({
            "string.base": `Model should have at least 1 character`,
            "string.empty": `Model should not be empty`,
            "string.min": `Model should have at least 1 character`,
            "string.max": `Model should have at most 200 characters`,
            "any.required": `Model is a required field`
        }),
        type: Joi.string().valid(...VEHICLE_TYPES).optional().
        when(Joi.object({type: Joi.string().valid("CAR")}).unknown(), {
            then: Joi.object({
                maker: Joi.string().valid(...CAR_MAKERS).required()
            })
        }).
        when(Joi.object({type: Joi.string().valid("BIKE")}).unknown(), {
            then: Joi.object({
                maker: Joi.string().valid(...BIKE_MAKERS).required()
            })
        }).
        when(Joi.object({type: Joi.string().valid("SCOOTER")}).unknown(), {
            then: Joi.object({
                maker: Joi.string().valid(...SCOOTER_MAKERS).required()
            })
        }),
        status: Joi.string().valid(...VEHICLE_STATUSES).optional(),
        seats: Joi.alternatives().conditional('type', { is: "CAR", then: Joi.number().required() }).min(1).max(8),
        pickupLocation: Joi.object({
            address: Joi.string().max(1000).messages({
                "string.base": `Address should have at least 1 character`,
                "string.empty": `Address should not be empty`,
                "string.max": `Address should have at most 1000 characters`,
            }).required(),
            lat: Joi.number().min(-90).max(90).messages({
                "number.base": `Number should have at least 1 character`,
                "number.empty": `Number should not be empty`,
                "number.min": `Number should not be less than -90`,
                "number.max": `Number should not be more than 90`,
            }).required(),
            lon: Joi.number().min(-180).max(180).messages({
                "number.base": `Address should have at least 1 character`,
                "number.empty": `Address should not be empty`,
                "number.min": `Number should not be less than -180`,
                "number.max": `Number should not be more than 180`,
            }).required()
        }).optional().messages({
            "any.required": `pickupLocation is a required field`
        }),
        returnLocations: Joi.object({
            address: Joi.string().max(1000).messages({
                "string.base": `Address should have at least 1 character`,
                "string.empty": `Address should not be empty`,
                "string.max": `Address should have at most 1000 characters`,
            }).required(),
            lat: Joi.number().min(-90).max(90).messages({
                "number.base": `Number should have at least 1 character`,
                "number.empty": `Number should not be empty`,
                "number.min": `Number should not be less than -90`,
                "number.max": `Number should not be more than 90`,
            }).required(),
            lon: Joi.number().min(-180).max(180).messages({
                "number.base": `Address should have at least 1 character`,
                "number.empty": `Address should not be empty`,
                "number.min": `Number should not be less than -180`,
                "number.max": `Number should not be more than 180`,
            }).required()
        }).optional().messages({
            "any.required": `pickupLocation is a required field`
        }),
        unlockTypes: Joi.string().valid(...UNLOCK_TYPES).optional(),
        price: Joi.object({
            currency: Joi.string().valid(...CURRENCY_TYPES).optional(),
            amount: Joi.number().min(1).optional(),
        }).optional(),
        pictures: Joi.array().items(Joi.object({
            file: Joi.string().required()
        })).optional()
    })
    return schema.validate(data);
}

const updateLenderValidation = (data) => {
    const schema = Joi.object({
        status: Joi.string().valid(...LENDER_STATUSES).required()
    })
    return schema.validate(data);
}

const postBusinessValidation = (data) => {
    const schema = Joi.object({
        uid: Joi.string().max(200).required().messages({
            "string.base": `Unique identifier should have at least 1 characters`,
            "string.empty": `Unique identifier should not be empty`,
            "string.max": `Unique identifier should have at most 200 characters`,
            "any.required": `Unique identifier is a required field`
        }),
        name: Joi.string().max(200).required().messages({
            "string.base": `Name identifier should have at least 1 characters`,
            "string.empty": `Name identifier should not be empty`,
            "string.max": `Name identifier should have at most 200 characters`,
            "any.required": `Name identifier is a required field`
        }),
        users: Joi.array().items(Joi.object({
            _id: Joi.string().custom((value, helper) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helper.message("User id must be a valid ObjectId");
                }                 
                return true;
            }).required()
        })),
        phone: Joi.string().min(8).max(15).required().messages({
            "string.base": `Phone number should have at least 8 characters`,
            "string.empty": `Phone number should not be empty`,
            "any.required": `Phone number is a required field`
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
        email: Joi.string().email().min(3).max(320).required().messages({
            "string.base": `Email should have at least 3 characters`,
            "string.empty": `Email should not be empty`,
            "string.min": `Email should have at least 3 characters`,
            "string.email": `Email should be a valid email address`,
            "string.max": `Email should have at most 320 characters`,
            "any.required": `Email is a required field`
        })
    })
    return schema.validate(data);
}

const businessUpdateValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().max(200).optional().messages({
            "string.base": `Name identifier should have at least 1 characters`,
            "string.empty": `Name identifier should not be empty`,
            "string.max": `Name identifier should have at most 200 characters`,
        }),
        users: Joi.array().items({
            _id: Joi.string().custom((value, helper) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helper.message("User id must be a valid ObjectId");
                }                 
                return true;
            }).optional()
        }),
        phone: Joi.string().min(8).max(15).optional().messages({
            "string.base": `Phone number should have at least 8 characters`,
            "string.empty": `Phone number should not be empty`,
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
        email: Joi.string().email().min(3).max(320).optional().messages({
            "string.base": `Email should have at least 3 characters`,
            "string.empty": `Email should not be empty`,
            "string.min": `Email should have at least 3 characters`,
            "string.email": `Email should be a valid email address`,
            "string.max": `Email should have at most 320 characters`,
        })
    })
    return schema.validate(data);
}

const reviewValidation = (data) => {
    const schema = Joi.object({
        rideId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid ride id");
            }
            return true;
        }).required().messages({
            "string.base": "Please provide an ride id before submitting",
            "string.empty": "Please provide an ride id before submitting",
            "any.required": "Please provide an ride id before submitting"
        }),
        reviwerId: Joi.string().custom((value, helper) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helper.message("Invalid reviwer id");
            }
            return true;
        }).required().messages({
            "string.base": "Please provide an reviwer id before submitting",
            "string.empty": "Please provide an reviwer id before submitting",
            "any.required": "Please provide an reviwer id before submitting"
        }),
        rating: Joi.number().min(1).max(5000).messages({
            "number.base": `Rating should have at least 1 character`,
            "number.empty": `Rating should not be empty`,
            "number.min": `Rating should not be less than 1`,
            "number.max": `Rating should not be more than 5000`,

        }),
    })
    return schema.validate(data);
}

module.exports = {
    signupValidation,
    loginValidation,
    userUpdateValidation,
    postRideValidation,
    lenderPostValidation,
    updateLenderValidation,
    updateRideStatusValidation,
    postVehicleValidation,
    updateVehicleValidation,
    postBusinessValidation,
    businessUpdateValidation,
    reviewValidation
}
