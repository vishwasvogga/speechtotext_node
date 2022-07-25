#!/usr/bin/env node
const WebSocketServer = require('websocket').server;
const { synthesisAudioAWSTStreamWebsocket } = require("./synthesisSpeech")
const { Readable, Writable } = require("stream")
const { log ,getWavHeader} = require("../util/util")
const fs = require('fs');
let wav = require('node-wav');

class IWebsocket {

    originIsAllowed = function (origin) {
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }

    createWebSocket(server) {
        this.wsServer = new WebSocketServer({
            httpServer: server,
            // You should not use autoAcceptConnections for production
            // applications, as it defeats all standard cross-origin protection
            // facilities built into the protocol and the browser.  You should
            // *always* verify the connection's origin and decide whether or not
            // to accept it.
            autoAcceptConnections: false
        });

        this.wsServer.on('request', function (request) {
            if (!true) {
                // Make sure we only accept requests from an allowed origin
                request.reject();
                console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
                return;
            }

            var connection = request.accept('echo-protocol', request.origin);
            console.log((new Date()) + ' Connection accepted.');


            //define readable stream
            var readableStream = new Readable({
                read(size) {
                }
            });

            //synthesis audio
            try {
                synthesisAudioAWSTStreamWebsocket(readableStream).then((stream) => {
                    if (stream != null) {
                        stream.on("data", (data) => {
                            console.log("response ", data.toString())

                            try {
                                //parse the responce
                                let resp_from_aws = JSON.parse(data.toString())

                                //send result to client
                                connection.sendUTF(data.toString());

                                 //after end of transcribe, close connection after 3 seconds
                                if (resp_from_aws.msg == "done") {
                                    setTimeout(() => {
                                        connection.close()
                                    }, 3000)
                                }
                            } catch (e) {
                                connection.close()
                            }
                        })
                    }
                })
            } catch (e) {
                console.log(e)
                connection.close()
            }


            readableStream.on("close", () => {
                console.log("Readable data Stream closed")
            })

            let writeStream = fs.createWriteStream('secret.pcm');



            // recieve data from websocket
            connection.on('message', function (message) {
                process.stdout.write(`.`);
          
                //console.log(message)
                //if client tries to use the same connection after 
                //recienving responce close the stream forcefully
                if (readableStream.destroyed) {
                    connection.close()
                }
                //if data is present send to aws else notify end of audio
                if (message && message.binaryData && message.binaryData.length) {
                  //  writeStream.write(message.binaryData)
                    readableStream.push(message.binaryData)
                } else if (!message || !message.binaryData || !message.binaryData.length) {
                    readableStream.push(null)
                    readableStream.destroy();
                    writeStream.end();
                }
            });


            // if (message.type === 'utf8') {
            //     console.log('Received Message: ' + message.utf8Data);
            //     connection.sendUTF(message.utf8Data);
            // }
            // else if (message.type === 'binary') {
            //     console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            //     connection.sendBytes(message.binaryData);
            // }


            connection.on('close', function (reasonCode, description) {
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
        });
    }



}

function createWavHeader(){
    var header = new Uint8Array(44);
    getWavHeader(header,360000)
    return header;
}

module.exports = new IWebsocket();
