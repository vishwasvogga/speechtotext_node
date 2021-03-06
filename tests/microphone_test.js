function main(
  encoding = 'LINEAR16',
  sampleRateHertz = 16000,
  languageCode = 'en-US'
) {
  // [START micStreamRecognize]
  const recorder = require('node-record-lpcm16');
  const fs = require("fs")
  const {log} = require("../util/util")

  // Create a writable stream
  var audioStream = fs.createWriteStream('output.wav', { encoding: 'binary' });

  audioStream.on('finish',async  function () {
    log(2,"Audio file completed.");

    var readAudio = fs.readFileSync('output.wav', { encoding: 'binary' });

   // let resp  = await api.getTextFromSpeech(readAudio)
    log(2,resp)

  });


  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const encoding = 'LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };

  // Start recording and send the microphone input to the Speech API
  recorder
    .record({
      sampleRateHertz: sampleRateHertz,
      threshold: 5, //silence threshold
      recordProgram: 'sox', // Try also "arecord" or "sox"
      silence: '5.0', //seconds of silence before ending
    })
    .stream()
    .on('error', console.error)
    .on('end', () => {
      audioStream.end()
    })
    .pipe(audioStream);

    log(1,'Listening, press Ctrl+C to stop.');
  // [END micStreamRecognize]
}

main()
//module.exports = main;