const axios = require('axios').default;
const ex = {}

/**
 * 
 * @param {*} audioData Readable stream containing audio data in chunks
 * @returns Readable stream containing wit ai responces in chunks
 */
ex.getTextFromSpeech = async function getTextFromSpeech(audioData) {
    const witToken = process.env.witai_server_access_token // get one from wit.ai!
    const params = {
        headers: {
            'Authorization': `Bearer ${witToken}`,
            'Content-Type': 'audio/wav',
            "Transfer-encoding": "chunked"
        }
    };

    let resp = await axios.post(process.env.witai_speech_to_text_endpoint, audioData, { headers: params.headers, responseType: "stream" })
    return resp;
}

module.exports = ex;
