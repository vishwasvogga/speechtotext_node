require('dotenv').config()
const recorder = require('node-record-lpcm16');
const api = require("../controllers/aws_transcribe_api")
const {Writable,Readable} = require("stream")
const {log} = require("../util/util")


async function start(){
  const recording = recorder.record({
    recorder: 'sox',
    sampleRate: 16000,
  })
  
  setTimeout(() => {
    recording.stop()
  }, 50000) // Stop a

  let response = await api.getTextFromSpeech(recording.stream())


  // This snippet should be put into an async function
for await (const event of response.TranscriptResultStream) {
  if (event.TranscriptEvent) {
    const message = event.TranscriptEvent;
    // Get multiple possible results
    const results = event.TranscriptEvent.Transcript.Results;
    // Print all the possible transcripts
    results.map((result) => {
      (result.Alternatives || []).map((alternative) => {
        const transcript = alternative.Items.map((item) => item.Content).join(" ");
        console.log(transcript);
        if(transcript.toLowerCase().includes("i am nine years old".toLowerCase()) || (transcript.toLowerCase() == "i am nine years old".toLowerCase())){
          console.log("---------------- match found ---------------")
          process.exit(0)
        }
      });
    });
  }
}
}


start()







