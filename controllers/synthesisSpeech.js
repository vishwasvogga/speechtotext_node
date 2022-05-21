const api = require("./api")
const { Writable } = require("stream")

const ex = {}

/**
 * 
 * @param {*} req  Hapi request
 * @param {*} res  Hapi response
 * @returns Promise<void>
 */
ex.synthesisAudioFromFile = async function synthesisAudioFromFile(req, res) {
    return new Promise(async (resolve) => {
        //req.payload contains readable stream

        //pass the readable stream to witai end point
        let wit_resp = await api.getTextFromSpeech(req.payload)

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

        writableStream.on("close", () => {
            resolve(res.response({ "success": true, "data": final_response }).code(200))
        })

        wit_resp.data.pipe(writableStream)
    })

}


module.exports = ex;