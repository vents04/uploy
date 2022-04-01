const DATABASE_MODELS = {
    USER: "User",
    VEHICLE: "Vehicle",
    RIDE: "Ride",
    LENDER: "Lender"
}

const COLLECTIONS = {
    USERS: "users",
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

const USER_STATUSES = {
    ACTIVE: "ACTIVE",
    BLOCKED: "BLOCKED",
}

const LENDER_STATUSES = {
    ACTIVE: "ACTIVE",
    PENDING_APROVAL: "PENDING_APROVAL",
    INACTIVE: "INACTIVE",
    BLOCKED: "BLOCKED",
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

const SMARTCAR_ID = "a5e76d34-8c1b-4833-92fc-150b9ea077e0";
const SMARTCAR_SECRET = "70db09fe-4575-4b3d-b4e3-50a58951b59c";

const VEHICLE_STATUSES = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
}

const VEHICLE_TYPES = {
    CAR: "CAR",
    SCOOTER: "SCOOTER",
    BIKE: "BIKE"
}

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
    VEHICLE_MAKERS: VEHICLE_MAKERS,
    SMARTCAR_ID: SMARTCAR_ID,
    SMARTCAR_SECRET: SMARTCAR_SECRET,
    USER_STATUSES: USER_STATUSES,
    VEHICLE_STATUSES: VEHICLE_STATUSES,
    VEHICLE_TYPES: VEHICLE_TYPES,
    LENDER_STATUSES: LENDER_STATUSES,
}