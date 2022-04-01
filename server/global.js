const DATABASE_MODELS = {
    VEHICLE: "Vehicle",
    RIDE: "Ride",
    LENDER: "Lender"
}

const COLLECTIONS = {
    VEHICLES: "vehicles",
    RIDES: "rides",
    LENDERS: "lenders"
}

const DB_URI = "mongodb://127.0.0.1:27017/HACKAUBG";

const JWT_SECRET = "lj1ds21idpk2]312d's[23123q";

const PORT = 6140;

const NODE_ENVIRONMENTS = {
    DEVELOPMENT: "DEVELOPMENT",
    PRODUCTION: "PRODUCTION",
}

const NODE_ENVIRONMENT = NODE_ENVIRONMENTS.PRODUCTION;

const HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}

const DEFAULT_ERROR_MESSAGE = "Internal server error";

const VEHICLE_MAKERS = [
    "Abarth",
    "Alfa Romeo",
    "Aston Martin",
    "Audi",
    "Bentley",
    "BMW",
    "Bugatti",
    "Cadillac",
    "Chevrolet",
    "Chrysler",
    "Citroën",
    "Dacia",
    "Daewoo",
    "Daihatsu",
    "Dodge",
    "Donkervoort",
    "DS",
    "Ferrari",
    "Fiat",
    "Fisker",
    "Ford",
    "Honda",
    "Hummer",
    "Hyundai",
    "Infiniti",
    "Iveco",
    "Jaguar",
    "Jeep",
    "Kia",
    "KTM",
    "Lada",
    "Lamborghini",
    "Lancia",
    "Land Rover",
    "Landwind",
    "Lexus",
    "Lotus",
    "Maserati",
    "Maybach",
    "Mazda",
    "McLaren",
    "Mercedes-Benz",
    "MG",
    "Mini",
    "Mitsubishi",
    "Morgan",
    "Nissan",
    "Opel",
    "Peugeot",
    "Porsche",
    "Renault",
    "Rolls-Royce",
    "Rover",
    "Saab",
    "Seat",
    "Skoda",
    "Smart",
    "SsangYong",
    "Subaru",
    "Suzuki",
    "Tesla",
    "Toyota",
    "Volkswagen",
    "Volvo",
    "Segway",
    "Xiaomi",
]

module.exports = {
    DATABASE_MODELS: DATABASE_MODELS,
    COLLECTIONS: COLLECTIONS,
    DB_URI: DB_URI,
    COLLECTIONS: COLLECTIONS,
    PORT: PORT,
    NODE_ENVIRONMENT: NODE_ENVIRONMENT,
    NODE_ENVIRONMENTS: NODE_ENVIRONMENTS,
    HTTP_STATUS_CODES: HTTP_STATUS_CODES,
    JWT_SECRET: JWT_SECRET,
    DEFAULT_ERROR_MESSAGE: DEFAULT_ERROR_MESSAGE,
    VEHICLE_MAKERS: VEHICLE_MAKERS
}