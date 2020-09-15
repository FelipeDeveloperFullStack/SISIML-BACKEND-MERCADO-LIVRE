const mongoose = require('mongoose')

const blacklistPerguntas = mongoose.Schema({
    usuario_sistema: {
        type: String,
        requered: true,
    },
    nickname: {
        type: String,
        requered: true,
        trim: true
    },
    bloquearPerguntas: {
        type: Boolean,
        requered: true,
    },
    user_id:{
        type: Number
    }
})

module.exports = mongoose.model('blacklistPerguntas', blacklistPerguntas)