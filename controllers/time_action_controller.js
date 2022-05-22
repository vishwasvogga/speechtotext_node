const ex={};
ex.getTimeAction = async function getTimeAction(){
    return {"type":"action","name":"tell_time"}
}

ex.stub = async function stub(){
    return {"type":"action","name":"unrecognised"}
}
module.exports = ex;