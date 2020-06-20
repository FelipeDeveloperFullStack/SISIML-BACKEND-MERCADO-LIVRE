const mongoose = require("mongoose")

const atividadeDiariaModel = mongoose.Schema({
    usuario: {
        type: Number
    },
    qtdeVendasDiaria: {
        type: Number,
        default: 0
    },
    qtdePerguntasDiaria:{
        type: Number,
        default: 0
    },
    faturamentoDiario: {
        type: Number,
        default: 0.00
    },
    ticketMedioDiario: {
        type: Number,
        default: 0.00
    }, 
    data: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model("atividadeDiariaModel", atividadeDiariaModel)