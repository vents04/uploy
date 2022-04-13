const ROOT_URLS_PRODUCTION = {

}

const ROOT_URLS_DEVELOPMENT = {
    API: "http://localhost:6140",
    WEB_URL: "http://localhost:3000"
}

const VEHICLE_TYPES = {
    CAR: "CAR",
    SCOOTER: "SCOOTER",
    BIKE: "BIKE"
};

const UNLOCK_TYPES = {
    MANUAL: "MANUAL"
}

const CURRENCY_TYPES = {
    EUR: "EUR",
    BGN: "BGN",
    USD: "USD"
}

const MENUS = {
    DISCOVER: "DISCOVER",
    RIDES: "RIDES",
    VEHICLES: "VEHICLES",
    PROFILE: "PROFILE",
}

module.exports = {
    AUTHENTICATION_TOKEN_KEY: "x-auth-token",
    ROOT_URLS: ROOT_URLS_DEVELOPMENT,
    VEHICLE_TYPES: VEHICLE_TYPES,
    UNLOCK_TYPES: UNLOCK_TYPES,
    CURRENCY_TYPES: CURRENCY_TYPES,
    MENUS: MENUS,
}