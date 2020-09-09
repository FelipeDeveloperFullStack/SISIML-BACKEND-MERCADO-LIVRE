'use strict'

const mongoose = require('mongoose');

const anuncioModel = mongoose.Schema({
    id: {
        type: Number
    },
    titulo: {
        type: String
    },
    preco: {
        type: Number
    },
    estoque_total: {
        type: Number
    },
    foto_principal: {
        type: String
    },
    link_anuncio: {
        type: String
    },
    status: {
        type: String
    },
    visualizacao: {
        type: String
    },
    totalVariacoes: {
        type: Number
    },
    custoFreteGratis: {
        type: String
    },
    freteGratis: {
        type: String
    },
    tarifa: {
        type: Number
    },
    liquido: {
        type: Number
    },
    tipoAnuncio: {
        type: String
    },
    tipoAnuncio_id: {
        type: String
    },
    quantidadeVendido: {
        type: Number
    },
    status: {
        type: String
    },
    description: {
        type: String
    },
    video_id: {
        type: String
    },
    sub_status: {
        type: String
    },
    json: {
        type: Object
    },
    freeShipping: {
        type: Boolean
    },
    question: {
        type: String
    }
});

module.exports = mongoose.model('Anuncio', anuncioModel);
