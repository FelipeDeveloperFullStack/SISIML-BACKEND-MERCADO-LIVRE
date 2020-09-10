const mongoose = require('mongoose')

const clienteModel = mongoose.Schema({
    id: {
        type: Number
    },
    id_usuario: {
        type: Number
    },
    nickname: {
        type: String
    },
    primeiro_nome: {
        type: String
    },
    last_name: {
        type: String
    },
    tipo_documento: {
        type: String
    },
    documento: {
        type: String
    },
    cidade: {
        type: String
    },
    estado: {
        type: String
    },
    totalCompras: {
        type: String
    },
    quantidadeCompras: {
        type: Number
    },
    data_hora: {
        type: String,
    },
    compras_cliente: {
        type: Array
    },
})

module.exports = mongoose.model('clientes', clienteModel)