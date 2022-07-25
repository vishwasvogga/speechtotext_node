require('dotenv').config()
const { log, logType, registerRouters, basciAuthValidate } = require('./util/util');
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
        // mime: {
        //     override: {
        //         'text/event-stream': {
        //             compressible: false
        //         },
        //         "application/octet-stream":{
        //             compressible: false
        //         }
        //     }
        // }
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

    //add basic auth
    await server.register(require('@hapi/basic'));
    await server.register(require('susie'));
    server.auth.strategy('simple', 'basic', { validate: basciAuthValidate });
    server.auth.default('simple');

    //register routers
    log(logType.info, "registering routers");
    registerRouters(server, __dirname);



    //start server
    let err = await server.start();


    if (err) {
        log(err, logType.error);
        throw new Error("Server not started!");
    } else {

        let web_socket = require('./controllers/socket_stream')
        web_socket.createWebSocket(server.listener)

        log(logType.info, " Server started at ", process.env.port);
        log(logType.info, server.info.address)
    }
}

startServer();


