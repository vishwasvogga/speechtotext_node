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
    },
    {
        method: 'POST',
        path: '/api/v1/audio/file/aws/submit/stream',
        options: {
            payload: {
                parse: true,
                output: 'stream',
            },
            handler: async (req, h) => {
                return controller.synthesisAudioAWSTStream(req,h)
             }
        }
    },
    {
        method: 'GET',
        path: '/test',
        handler: function (request, h) {
     
            var Readable = require('stream').Readable;
            var rs = Readable();
     
            var c = 97;
            rs._read = function () {
                rs.push(String.fromCharCode(c++));
                if (c > 'z'.charCodeAt(0)) rs.push(null);
            };
     
            return h.event(rs);
        }
    }
]