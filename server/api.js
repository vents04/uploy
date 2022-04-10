const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {});
const cors = require('cors');
const mongo = require("./db/mongo");
const indexRoute = require('./routes/index.route');
const errorHandler = require('./errors/errorHandler');

const { PORT } = require('./global');
const KeyService = require('./services/key.service');
const RideService = require('./services/ride.service');

app
    .use(cors())
    .use(express.json({
        verify: function (req, res, buf) {
            var url = req.originalUrl;
            if (url.includes('/webhook')) {
                req.rawBody = buf.toString()
            }
        },
        limit: '50mb'
    }))
    .use(express.urlencoded({ extended: true, limit: '50mb' }))
    .use("/", indexRoute)
    .use(errorHandler)
    .disable("x-powered-by");


mongo.connect();

io.on("connection", (socket) => {
    console.log("Socket connection established")
});

httpServer.listen(PORT, function () {
    console.log("Server listening on port " + PORT)
});

(async () => {
    try {
        await KeyService.refreshAllAccess();
        await KeyService.runCronTaskForRefreshingAccess();
        await RideService.setupCancellationForPendingApprovalRides();
        await RideService.setupCancellationForAwaitingPaymentRides();
    } catch (err) {
        throw new Error(err);
    }
})();