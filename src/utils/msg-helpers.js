const messagesObj = (username, msg) => {
    return {
        body: msg,
        timestamp: new Date().getTime(),
        username
    }
}

module.exports = {
    messagesObj
}