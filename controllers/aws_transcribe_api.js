const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("@aws-sdk/client-transcribe-streaming");


const ex = {};

/**
 * 
 * @param {*} audioData Readable stream containing audio data in chunks
 * @returns Readable stream containing wit ai responces in chunks
 */
ex.getTextFromSpeech = async function getTextFromSpeech(audioStreamRaw) {
  audioStreamRaw.on("data",(data)=>{
    console.log(data)
  })
  let credentials = { "accessKeyId": process.env.ACCESS_KEY_ID, "secretAccessKey": process.env.SECRET_ACCESS_KEY }
  const client = new TranscribeStreamingClient({
    credentials,
    region: process.env.REGION
  });
  console.log(process.env.VOCABULARY)
  const command = new StartStreamTranscriptionCommand({
    // The language code for the input audio. Valid values are en-GB, en-US, es-US, fr-CA, and fr-FR
    LanguageCode: "en-US",
    // The encoding used for the input audio. The only valid value is pcm.
    MediaEncoding: "pcm",
    // The sample rate of the input audio in Hertz. We suggest that you use 8000 Hz for low-quality audio and 16000 Hz for
    // high-quality audio. The sample rate must match the sample rate in the audio file.
    MediaSampleRateHertz: 16000,
    AudioStream: audioStream(audioStreamRaw),
    VocabularyName: process.env.VOCABULARY,
    // VocabularyNames:"word-list.txt"
    EnablePartialResultsStabilization: true,
    PartialResultsStability: "medium",
  });

  return await client.send(command);
}

/**
 * Generate audio chunks recognised by the SDK
 */
const audioStream = async function* (audioSource) {
  for await (const payloadChunk of audioSource) {
    yield { AudioEvent: { AudioChunk: payloadChunk } };
  }
};




module.exports = ex;