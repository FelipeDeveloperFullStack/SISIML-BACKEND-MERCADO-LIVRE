const axios = require('axios')
const usuarioService = require('../services/usuario-service')
const BlackListPerguntas = require('../models/blacklistPerguntas-model')
const BlackListCompras = require('../models/blacklistCompras-model')

//########################################### PERGUNTAS ############################################//
exports.salvarUsuarioListaNegraPerguntas = (req, res) => {
    usuarioService.buscarUsuarioPorID().then(user => {
        axios.post(`https://api.mercadolibre.com/users/${user.id}/questions_blacklist?access_token=${user.accessToken}`, req.body).then(response => {
            res.send(response.data)
        }).catch(error => { res.send(error) })
    }).catch(error => { res.send(error) })
}

exports.listarTodosUsuariosListaNegraPerguntas = (req, res) => {
    usuarioService.buscarUsuarioPorID().then(user => {
        axios.get(`https://api.mercadolibre.com/users/${user.id}/questions_blacklist?access_token=${user.accessToken}`).then(response => {
            res.send(response.data.users)
        }).catch(error => { res.send({ message: "Nenhum usuário encontrado na black list" }) })
    }).catch(error => { res.send(error) })
}

exports.removerUsuarioListaNegraPerguntas = (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(user => {
        axios.delete(`https://api.mercadolibre.com/users/${user.id}/questions_blacklist/${req.params.user_id_perguntas}?access_token=${user.accessToken}`).then(response => {
            res.send(response.data)
        }).catch(error => { res.send(error) })
    }).catch(error => { res.send(error) })
}

exports.buscarUsuarioPorNickName = (req, res) => {
    axios.get(`https://api.mercadolibre.com/sites/MLB/search?nickname=${req.params.nickname}`).then(response => {
        res.send(response.data.seller)
    }).catch(error => { res.send(error) })
}

//MongoDB
exports.salvarUsuarioBlackListPerguntas = (req, res) => {
    let blackListPerguntas = new BlackListPerguntas(req.body)
    blackListPerguntas.save().then(response => {
        res.send('OK').status(200)
    }).catch(error => {res.send(error)})
}

exports.listarUsuarioBlackListPerguntas = (req, res) => {
    BlackListPerguntas.find({usuario_sistema: req.body.usuario_sistema}).then(response => {
        res.send(response).status(200)
    }).catch(error => {res.send(error)})
}

exports.buscarUsuarioBlackListPerguntasPorNickName = (req, res) => {
    BlackListPerguntas.find({
        nickname: req.params.nickname.toUpperCase()
    }).then(response => {
        res.send(response).status(200)
    }).catch(error => {res.send(error)})
}

exports.removerUsuarioBlackListPerguntasBD = (req, res) => {
    BlackListPerguntas.findByIdAndDelete({_id: req.params._id_perguntas}).then(response => {
        res.send(response).status(200)
    }).catch(error => {res.send(error)})
}

//########################################### COMPRAS ############################################//
exports.salvarUsuarioListaNegraCompras = (req, res) => {
    usuarioService.buscarUsuarioPorID().then(user => {
        axios.post(`https://api.mercadolibre.com/users/${user.id}/order_blacklist?access_token=${user.accessToken}`, req.body).then(response => {
            res.send(response.data)
        }).catch(error => { res.send(error) })
    }).catch(error => { res.send(error) })
}

exports.listarTodosUsuariosListaNegraCompras = (req, res) => {
    usuarioService.buscarUsuarioPorID().then(user => {
        axios.get(`https://api.mercadolibre.com/users/${user.id}/order_blacklist?access_token=${user.accessToken}`).then(response => {
            let usuario_blackList = response.data.map(usuario => {
                let dado = {
                    id: usuario.user.id,
                    blocked: usuario.user.blocked
                }
                return dado
            })
            Promise.all(usuario_blackList).then(order_blackList => {
                res.send(order_blackList).status(200)
            })
        }).catch(error => { res.send({ message: "Nenhum usuário encontrado na black list" }) })
    }).catch(error => { res.send(error) })
}

exports.removerUsuarioListaNegraCompras = (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(user => {
        axios.delete(`https://api.mercadolibre.com/users/${user.id}/order_blacklist/${req.params.user_id_compras}?access_token=${user.accessToken}`).then(response => {
            res.send(response.data)
        }).catch(error => { res.send(error) })
    }).catch(error => { res.send(error) })
}

//MongoDB
exports.salvarUsuarioBlackListCompras = (req, res) => {
    let blackListCompras = new BlackListCompras(req.body)
    blackListCompras.save().then(response => {
        res.send('OK').status(200)
    }).catch(error => {res.send(error)})
}

exports.listarUsuarioBlackListCompras = (req, res) => {
    BlackListCompras.find({usuario_sistema: req.body.usuario_sistema}).then(response => {
        res.send(response).status(200)
    }).catch(error => {res.send(error)})
}

exports.buscarUsuarioBlackListComprasPorNickName = (req, res) => {
    BlackListCompras.find({
        nickname: req.params.nickname.toUpperCase()
    }).then(response => {
        res.send(response).status(200)
    }).catch(error => {res.send(error)})
}

exports.removerUsuarioBlackListComprasBD = (req, res) => {
    BlackListCompras.findByIdAndDelete({_id: req.params._id_compras}).then(response => {
        res.send(response).status(200)
    }).catch(error => {res.send(error)})
}
