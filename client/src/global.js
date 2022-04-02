const ROOT_URLS_PRODUCTION = {

}

const ROOT_URLS_DEVELOPMENT = {
    API: "http://localhost:6140",
    WEB_URL: "http://localhost:3000"
}

module.exports = {
    AUTHENTICATION_TOKEN_KEY: "x-auth-token",
    ROOT_URLS: ROOT_URLS_DEVELOPMENT
}