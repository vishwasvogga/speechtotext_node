
module.exports = [
    {
        method: 'GET',
        path: '/ping',
        config: {
            handler: function (req, res) {
                return res.response({ success: true }).code(200);
            },
            auth: {
                strategy: 'simple',
                // mode: 'optional'
            }
        }
    },
    {
        method: 'GET',
        path: '/hault',
        config: {
            handler: async function (req, res) {
                let temp = await hault();
                return res.response(temp).code(200);
            },
            auth: {
                strategy: 'simple',
                // mode: 'optional'
            }
        }
    }

]

async function hault(){
    return new Promise((resolve)=>{
        setTimeout(()=>{
            return resolve({ success: true , delay : 120000 })
        },120000)
    })
}