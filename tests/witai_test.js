require('dotenv').config()
const recorder = require('node-record-lpcm16');
const api = require("../util/api")
const {Writable} = require("stream")


function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

async function start(){
  const recording = recorder.record({
    recorder: 'sox'
  })
  
  setTimeout(() => {
    recording.stop()
  }, 5000) // Stop a

  let wit_resp = await api.getTextFromSpeech(recording.stream())

  const writableStream = new Writable();

  writableStream._write = function (chunk, encoding, done) {
    try{
      let data = chunk.toString();
      console.log(JSON.parse(data.replace(/(?:\r\n|\r|\n)/g, '')))
    }catch(e){
    }
    done();
  };

  wit_resp.data.pipe(writableStream)
}


start()







