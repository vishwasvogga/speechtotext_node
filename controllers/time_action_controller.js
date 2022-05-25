const ex={};
//always send the text, even if it is empty
ex.getTimeAction = async function getTimeAction(text){
    return {"type":"action","name":"tell_time","text":text?text:""}
}

ex.stub = async function stub(){
    return {"type":"action","name":"unrecognised","text":"I could not recognise the command"}
}
module.exports = ex;