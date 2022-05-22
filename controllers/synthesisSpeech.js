const api = require("./api")
const { Writable } = require("stream")
const { log } = require("../util/util")
const { getTimeAction,stub } = require("./time_action_controller")
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
           // console.log(req.payload)
            let content_type = req.headers["Content-Type"]?req.headers["Content-Type"] : "audio/raw;encoding=signed-integer;bits=16;rate=8k;endian=little";
            
            let wit_resp = await api.getTextFromSpeech(req.payload,content_type)

            //ceate a writable stream to store results from wit ai
            const writableStream = new Writable();

            //write function
            var final_response = null;
            writableStream._write = function (chunk, encoding, done) {
                try {
                    let data = chunk.toString();
                   // console.log(data);
                    final_response = JSON.parse(data.replace(/(?:\r\n|\r|\n)/g, ''))
                } catch (e) {
                }
                done();
            };

            writableStream.on("close", async () => {
                let reply = await getReplyTypeFromIntent(final_response)
                resolve(res.response({ "success": true,"reply":reply }).code(200))
            })

            wit_resp.data.pipe(writableStream)
        } catch (e) {
            log(1, e)
            resolve(res.response({ "success": false,"err":e.toString()}).code(400))
        }
    })

}


async function getReplyTypeFromIntent(wit_resp){
    let reply_type=null;
    if(wit_resp && wit_resp.intents && wit_resp.intents.length){
        //get all listed intents
        let intents = wit_resp.intents;
        //sort intents by confidence
        intents = intents.sort((a,b)=>{
            if(a.confidence && b.confidence){
                if(a.confidence>b.confidence){
                    return +1
                }else{
                    return -1
                }
            }else{
                return -1;
            }
        })
        //filter 0.98
        intents = intents.filter((intent)=>{
            if(intent.confidence>0.98){
                return true
            }else{
                return false
            }
        })
        console.log(wit_resp)
        //all intents
        let most_accurate_intent_name ="";
        if( intents[0]){
            most_accurate_intent_name = intents[0].name;
        }
 
        switch(most_accurate_intent_name){
            case "what_time" : return await getTimeAction();
            default : return await stub();
        }
    }else{
        return await stub();
    }

}


module.exports = ex;