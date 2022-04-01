const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema({
    title: {
        type: String,
        minLength: 1,
        maxLength: 100  ,
        required: true 
    },
    description: {
        type: String,
        minLength: 1,
        maxLength: 500,
        required: true
    },
    model: {
        type: String,
        minLength: 1,
        maxLength: 70, // the actual characters length of the longest car name + a bit more chars - Land Rover Range Rover Evoque 2.0 TD4 E-Capability 4x4 HSE Dynam
        required: true
    },
    maker: {
        type: String,
        enum: Object.values()
    }
})