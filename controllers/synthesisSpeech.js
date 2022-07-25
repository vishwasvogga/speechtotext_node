const api = require("./api")
const aws_api = require("./aws_transcribe_api")
const { Writable, Readable } = require("stream")
const { log } = require("../util/util")
const { getTimeAction, stub } = require("./time_action_controller")
const { read } = require("fs")
const ex = {}
const asyncIteratorToStream = require("../util/asyncToStreamConverter");


/**
 * 
 * @param {*} req  Hapi request
 * @param {*} res  Hapi response
 * @returns Promise<void>
 */
ex.synthesisAudioFromFile = async function synthesisAudioFromFile(req, res) {
    return new Promise(async (resolve) => {
        try {
            //req.payload contains readable stream

            //pass the readable stream to witai end point
            let content_type = req.headers["Content-Type"] ? req.headers["Content-Type"] : "audio/raw;encoding=signed-integer;bits=16;rate=8k;endian=little";

            let wit_resp = await api.getTextFromSpeech(req.payload, content_type)

            //ceate a writable stream to store results from wit ai
            const writableStream = new Writable();
            const readableStream = new Readable();

            //write function
            var final_response = null;
            writableStream._write = function (chunk, encoding, done) {
                try {
                    let data = chunk.toString();
                    final_response = JSON.parse(data.replace(/(?:\r\n|\r|\n)/g, ''))
                } catch (e) {
                }
                done();
            };

            writableStream.on("close", async () => {
                let reply = await getReplyTypeFromIntent(final_response)
                resolve(res.response({ "success": true, "reply": reply }).code(200))
            })

            wit_resp.data.pipe(writableStream)
        } catch (e) {
            log(1, e)
            resolve(res.response({ "success": false, "err": e.toString() }).code(400))
        }
    })

}


/**
 * This is identical to synthesisAudioFromFile, but sends out data in new real time using streams
 * @param {*} req  Hapi request
 * @param {*} res  Hapi response
 * @returns Promise<void>
 */
ex.synthesisAudioFromFileStream = async function synthesisAudioFromFile(req, res) {
    //create readable stream
    let readableStream = new Readable({
        read() { }
    });

    try {
        //pass the readable stream to witai end point
        let content_type = req.headers["Content-Type"] ? req.headers["Content-Type"] : "audio/raw;encoding=signed-integer;bits=16;rate=8k;endian=little";

        let wit_resp = await api.getTextFromSpeech(req.payload, content_type)

        //ceate a writable stream to store results from wit ai
        const writableStream = new Writable();

        //write function in writable on data recive from wit ai in chunks
        var final_response = null;
        writableStream._write = function (chunk, encoding, done) {
            let data = chunk.toString();
            try {
                final_response = JSON.parse(data.replace(/(?:\r\n|\r|\n)/g, ''))
                //null check to prevent premature ending of readable
                //push the wit ai data to readable
                if (final_response != null) {
                    readableStream.push(JSON.stringify(final_response), "utf-8")
                }

            } catch (e) {
                // console.log(e)
                if (data != null) {
                    log(1, "Pushing unparsed data");
                    readableStream.push(data, "utf-8")
                }
            }
            done();
        };

        //On all data has been recieved from wit.ai
        writableStream.on("close", async () => {
            let reply = await getReplyTypeFromIntent(final_response)
            readableStream.push(JSON.stringify(reply), "utf-8")
            readableStream.push(null)
            readableStream.destroy()
        })
        //Pipe the wit ai response to writable stream
        wit_resp.data.pipe(writableStream)
        return res.response(readableStream)  // res.response(readableStream)
    } catch (e) {
        log(1, e)
        return res.response({ "success": false, "err": e })
    }
}


async function getReplyTypeFromIntent(wit_resp) {
    let reply_type = null;
    if (wit_resp && wit_resp.intents && wit_resp.intents.length) {
        //get all listed intents
        let intents = wit_resp.intents;
        //sort intents by confidence
        intents = intents.sort((a, b) => {
            if (a.confidence && b.confidence) {
                if (a.confidence > b.confidence) {
                    return +1
                } else {
                    return -1
                }
            } else {
                return -1;
            }
        })
        //filter 0.98
        intents = intents.filter((intent) => {
            if (intent.confidence > 0.98) {
                return true
            } else {
                return false
            }
        })
        //all intents
        let most_accurate_intent_name = "";
        if (intents[0]) {
            most_accurate_intent_name = intents[0].name;
        }

        switch (most_accurate_intent_name) {
            case "what_time": return await getTimeAction(wit_resp.text);
            default: return await stub();
        }
    } else {
        return await stub();
    }

}



/**
 * 
 * @param {*} req  Hapi request
 * @param {*} res  Hapi response
 * @returns Promise<void>
 */
ex.synthesisAudioAWSTStream = async function synthesisAudioAWSTStream(req, res) {
    try {
        //req.payload contains readable stream
        //ceate a writable stream to store results from wit ai
        const writableStream = new Writable();
        const readableStream = new Readable({
            read(size) {
            }
        });


        //write function
        writableStream._write = function (raw_event, encoding, done) {
            let event ={}
            if(raw_event != null && typeof raw_event == "object"){
                event = JSON.parse(raw_event.toString())
            }
           // console.log(event)

            if (event.TranscriptEvent) {
                // Get multiple possible results
                const results = event.TranscriptEvent.Transcript.Results;
                // Print all the possible transcripts
                results.map((result) => {
                    (result.Alternatives || []).map((alternative) => {
                        const transcript = alternative.Items.map((item) => item.Content).join(" ");
                      //  console.log(transcript);
                        readableStream.push(transcript, "utf-8");
                       // writableStream.write(transcript)
                    });

                    // if(!result.IsPartial){
                    //     done();
                    // }
                  //  console.log(result)
                });

            }
            done();
        };

        writableStream.on("close", async () => {
            console.log("Close writable stream")
            readableStream.push(JSON.stringify({ "success": true, "msg": "done" }), "utf-8")
            readableStream.push(null)
            readableStream.destroy()
        })


        let response = await aws_api.getTextFromSpeech(req.payload)


        // This snippet should be put into an async function
        asyncIteratorToStream.obj(response.TranscriptResultStream).pipe(writableStream)

      //  return res.response(readableStream).code(200);
        return res.event(readableStream).code(200)


    } catch (e) {
        log(1, e)
        console.log(e)
        console.log(e.stack)
        return res.response({ "success": false, "err": e.toString() }).code(400)
    }

}



/**
 * 
 * @param {*} req  Hapi request
 * @param {*} res  Hapi response
 * @returns Promise<void>
 */
 ex.synthesisAudioAWSTStreamWebsocket = async function synthesisAudioAWSTStreamWebsocket(inputStream) {
       //req.payload contains readable stream
        //ceate a writable stream to store results from wit ai
        const writableStream = new Writable();
        const readableStream = new Readable({
            read(size) {
            }
        });


        //write function
        writableStream._write = function (raw_event, encoding, done) {
            let event ={}
            if(raw_event != null && typeof raw_event == "object"){
                event = JSON.parse(raw_event.toString())
            }
           // console.log(event)

            if (event.TranscriptEvent) {
                // Get multiple possible results
                const results = event.TranscriptEvent.Transcript.Results;
                // Print all the possible transcripts
                console.log(results)
                results.map((result) => {
                    (result.Alternatives || []).map((alternative) => {
                        const transcript = alternative.Items.map((item) => item.Content).join(" ");
                        readableStream.push(JSON.stringify({"success":true,"data":transcript}), "utf-8");
                    });
                });

            }
            done();
        };

        writableStream.on("close", async () => {
            console.log("Close writable stream")
            readableStream.push(JSON.stringify({ "success": true, "msg": "done" }), "utf-8")
            readableStream.push(null)
            readableStream.destroy()
        })


        let response = await aws_api.getTextFromSpeech(inputStream)


        // This snippet should be put into an async function
        asyncIteratorToStream.obj(response.TranscriptResultStream).pipe(writableStream)

        return readableStream;

}


module.exports = ex;