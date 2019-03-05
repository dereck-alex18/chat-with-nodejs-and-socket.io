//The functions bellow help to avoid duplicate code when generating messages
const formatMessages = (from, text) => {
    return {
        from,
        text,
        createdAt: new Date().getTime()
    }
}

const formatShareLoc = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}

const formatAudioMsg = (audioMsg) => {
    return {
        audioMsg,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    formatMessages,
    formatShareLoc,
    formatAudioMsg
}