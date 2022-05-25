const api = require("./api")
const { Writable, Readable } = require("stream")
const { log } = require("../util/util")
const { getTimeAction, stub } = require("./time_action_controller")
const ex = {}

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
            try {
                let data = chunk.toString();
                final_response = JSON.parse(data.replace(/(?:\r\n|\r|\n)/g, ''))
                //null check to prevent premature ending of readable
                //push the wit ai data to readable
                if(final_response != null){
                    readableStream.push(JSON.stringify(final_response), "utf-8")
                }
                
            } catch (e) {
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
        return res.response({"success":false,"err":e})
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
            case "what_time": return await getTimeAction();
            default: return await stub();
        }
    } else {
        return await stub();
    }

}


module.exports = ex;