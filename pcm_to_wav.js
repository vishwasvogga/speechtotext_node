var wavConverter = require('wav-converter')
var fs = require('fs')
var path = require('path')
var pcmData = fs.readFileSync(path.resolve(__dirname, './secret.pcm'))
var wavData = wavConverter.encodeWav(pcmData, {
    numChannels: 1,
    sampleRate: 16000,
    byteRate: 16
})
 
fs.writeFileSync(path.resolve(__dirname, './secret.wav'), wavData)
