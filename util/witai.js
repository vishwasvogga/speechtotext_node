const {Wit, log} = require('node-wit');



class AUIWIT {

    init(){
        this.client = new Wit({
            accessToken: process.env.witai_server_access_token,
            logger: new log.Logger(log.DEBUG), // optional
        });
    }
}