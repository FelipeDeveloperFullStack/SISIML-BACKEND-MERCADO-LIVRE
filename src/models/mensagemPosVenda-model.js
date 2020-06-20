const mongoose = require("mongoose")

const mensagemPosVenda = mongoose.Schema({
    userId: {
        type: Number
    },
    isHabilitarEnvioCompraRealizada: {
        type: Boolean,
        default: false
    },
    mensagemCompraRealizada: {
        type: String,
        default: ''
    },
    isHabilitarEnvioProdutoEmTransito: {
        type: Boolean,
        default: false
    },
    mensagemProdutoEmTransito: {
        type: String,
        default: ''
    },
    isHabilitarEnvioProntoParaRetirarCorreios: {
        type: Boolean,
        default: false
    },
    mensagemProntoParaRetirarCorreios: {
        type: String,
        default: ''
    },
    isHabilitarEnvioProdutoEntregue: {
        type: Boolean,
        default: false
    },
    mensagemProdutoEntregue: {
        type: String,
        default: ''
    }
    
})

module.exports = mongoose.model("mensagemPosVenda", mensagemPosVenda)