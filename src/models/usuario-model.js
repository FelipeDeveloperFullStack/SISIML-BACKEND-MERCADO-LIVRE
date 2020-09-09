const mongoose = require('mongoose');

const usuarioModel = mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    sobrenome: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    cpf: {
        type: String,
        required: true,
        trim: true
    },
    tipo_impressao:{
        type: String,
        trim: true,
        default: 'pdf'
    },
    password: {
        type: String,
        required: false,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    },
    plano: {
        default: 'free',
        trim: true,
        type: String
    },
    data_expiracao_plano_free: {
        default: new Date().setDate(90),
        trim: true,
        type: Date
    },
    data_inicio_plano: {
        default: new Date(),
        trim: true,
        type: Date
    },
    data_acesso: {
        default: new Date(),
        type: Date
    },
    id: {
        type: Number,
        trim: true
    },
    accessToken: {
        type: String,
        trim: true
    },
    refreshToken: {
        type: String,
        trim: true
    },
    nickname: {
        type: String,
        trim: true
    },
    code_security: {
        type: String,
        default: "0000"
    }
});

module.exports = mongoose.model('usuario', usuarioModel);