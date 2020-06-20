const mongoose = require('mongoose')

const blacklistCompras = mongoose.Schema({
    usuario_sistema: {
        type: String,
        requered: true,
    },
    nickname: {
        type: String,
        requered: true,
        trim: true
    },
    bloquearCompras: {
        type: Boolean,
        requered: true,
    }
})

module.exports = mongoose.model('blacklistCompras', blacklistCompras)