//The functions bellow help to avoid duplicate code when generating messages
const formatMessages = (from, text) => {
    return {
        from,
        text,
        createdAt: new Date().getTime()
    }
}

const formatShareLoc = (from, url) => {
    return {
        from,
        url,
        createdAt: new Date().getTime()
    }
}

const formatAudioMsg = (from, audioMsg) => {
    return {
        from,
        audioMsg,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    formatMessages,
    formatShareLoc,
    formatAudioMsg
}