const controller = require("../controllers/synthesisSpeech")
module.exports=[
    {
        method: 'POST',
        path: '/api/v1/audio/file/submit',
        options: {
            payload: {
                parse: true,
                output: 'stream',
            },
            handler: async (req, h) => {
               return controller.synthesisAudioFromFile(req,h)
            }
        }
    },
    {
        method: 'POST',
        path: '/api/v1/audio/file/submit/stream',
        options: {
            payload: {
                parse: true,
                output: 'stream',
            },
            handler: controller.synthesisAudioFromFileStream
        }
    }
]