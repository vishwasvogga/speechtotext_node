const { log, logType, registerRouters } = require('./util/util');
const Hapi = require('@hapi/hapi');
const path = require('path');
const fs = require('fs');

//error handling
process.on('UnhandledPromiseRejectionWarning', async function (err) {
    console.error("Uncaught error in nodeJs", err.stack);
});
process.once('uncaughtException', async function (err) {
    console.error('Something bad happened: ', err);
});


async function startServer() {
    const server = Hapi.server({
        port: process.env.port,
        host: process.env.host,
    });

    //enable cors
    await server.register({
        plugin: require('hapi-cors'),
        options: {
            origins: ["*"],
            methods: ['POST, GET, DELETE, OPTIONS, PATCH'],
            headers: ["Access-Control-Allow-Headers", "Access-Control-Allow-Origin", "Access-Control-Allow-Origin", "Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language"]
        }
    })

    //register routers
    log(logType.info, "registering routers");
    registerRouters(server);



    //start server
    let err = await server.start();


    if (err) {
        log(err, logType.error);
        throw new Error("Server not started!");
    } else {
        log(logType.info, " Server started at ", process.env.port);
        log(logType.info,server.info.address)
        startCron();
    }
}

startServer();

  
