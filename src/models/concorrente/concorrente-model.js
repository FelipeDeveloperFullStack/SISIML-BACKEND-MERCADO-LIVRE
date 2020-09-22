const mongoose = require('mongoose')

const concorrenteModel = mongoose.Schema({
    id_usuario: {
        type: Number
    },
    nickName: {
        type: String
    },
    totalTransacoesCanceladas: {
        type: Number
    },
    totalTransacoesCompletadas: {
        type: Number
    },
    classificacaoNegativa: {
        type: String
    },
    classificacaoNeutra: {
        type: String
    },
    classificacaoPositiva: {
        type: String
    },
    perfil: {
        type: String
    },
    reputacao: {
        type: String
    },
    tempoEmVenda: {
        type: String
    },
    qualidadeAtendimento: {
        type: String
    },
    qualidadeAtendimentoCompradores: {
        type: String
    },
    qualidadeEntrega: {
        type: String
    },
    possuiAtraso: {
        type: String
    },
    feedbackBom: {
        type: String
    },
    feedbackRegular: {
        type: String
    },
    feedbackRuim: {
        type: String
    },
    qtdeFeedbackBom: {
        type: Number
    },
    qtdeFeedbackRegular: {
        type: Number
    },
    qtdeFeedbackRuim: {
        type: Number
    },
    totalFeedback: {
        type: String
    },
    ticketMedio: {
        type: String
    },
    totalVendas: {
        type: String
    },
    faturamento: {
        type: String
    },
    mercadoLider: {
        type: String
    },
    mensagemMercadoLider: {
        type: String
    },
    localizacao: {
        type: String
    }
})

module.exports = mongoose.model('concorrente', concorrenteModel)