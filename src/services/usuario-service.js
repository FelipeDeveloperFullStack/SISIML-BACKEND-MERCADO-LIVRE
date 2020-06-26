const express = require('express');
const router = express.Router();
const axios = require("axios");
const constants = require('../constants/constants');
const Usuario = require('../models/usuario-model')

/**
 * @author Felipe Miguel dos Santos
 */

const salvarUsuario = async (usuario) => {
    await axios.put(constants.urlbase.COLLECTION_USUARIOS, usuario).then(resp => {
        console.log("Usuario salvo com sucesso!");
    }).catch(err => {
        console.log("Houve um erro ao salvar o usuario no firebase: " + err);
    });
}


const postUsuario = async (req, res) => {
    //console.log("USUARIO: "+JSON.stringify(req.body))
    let usuario = new Usuario(req.body)
    usuario.save().then(resp => {
        res.status(200).send({
            isUsuarioSalvo: true,
            usuario: resp
        })
    }).catch(error => res.send(error))
}

/*const salvarUsuario = async (user) => {
    console.log("USUARIO: "+JSON.stringify(user))
    let usuario = new Usuario(user)
    usuario.save().then(resp => {
        console.log('Usuario salvo!')
    }).catch(error => console.error(error))
}*/

const getProcurarUsuarioPorEmail = async (req, res) => {
    Usuario.find({
        email: req.params.email
    }).then(response => {
        res.send(response).status(200)
    }).catch(error => res.send(error))
}

const buscarUsuarioPorNumberDocumento = async (profile, accessToken, refreshToken) => {
    await Usuario.find({
        cpf: String(profile._json.identification.number).trim()
    }).then(async response => {
        let userData = response.map(user => {
            return {
                active: user.active,
                plano: user.plano,
                data_expiracao_plano_free: user.data_expiracao_plano_free,
                data_inicio_plano: user.data_inicio_plano,
                id: profile.id,
                accessToken: accessToken,
                refreshToken: refreshToken,
                nickname: profile.nickname,
                nome: user.nome,
                sobrenome: user.sobrenome,
                email: user.email,
                password: user.password,
                cpf: user.cpf
            }
        })
        await Usuario.findOneAndUpdate({ cpf: String(profile._json.identification.number).trim() }, { $set: userData[0] })
    }).catch(error => console.error(error))

}

const atualizarCodigoSeguranca = async (email, codeSecurity) => {
    await Usuario.findOneAndUpdate({ email: email.trim() }, {
        $set: {
            code_security: codeSecurity
        }
    }).then(response => {
        console.log("[MENSAGEM DO SISTEMA] - Codigo de segurança atualizado no banco de dados!")
    }).catch(error => console.error(error))
}

const procurarCodigoSeguranca = async (req, res) => {
    await Usuario.find({ code_security: req.body.code }).then(response => {
        res.send(response)
    }).catch(error => console.error(error))
}


const salvarUsuarioRoute = async (req, res) => {
    console.log("User saved")
    res.status(200).send("User saved");
}

const listarTodosUsuarios = async (req, res) => {
    await axios.get(constants.urlbase.COLLECTION_USUARIOS).then(resp => {
        res.status(200).send(resp.data);
    }).catch(err => {
        res.status(401).send({
            mensagem: "houve um erro ao listar os usuarios",
            error: err
        });
    });
}

const buscarUsuarioPorID = async (id) => {
    const usuarios = await axios.post(`${constants.producao.PRODUCAO}/usuario/post/usuario_by_id`, { id }).then(response => {
        //console.log(response.data[0])
        return response.data[0]
    }).catch(err => { console.log("Houve um erro ao listar todos os usuarios: " + err); })
    return usuarios
}

const getUserById = async (req, res) => {
    await axios.get('https://api.mercadolibre.com/users/' + req.params.id).then(user => {
        res.status(200).send(user.data)
    }).catch(error => {
        res.status(400).send(error)
    })
}

const getUsuarioByID = async (req, res) => {
    await Usuario.find({
        id: req.body.id
    }).then(response => {
        res.status(200).send(response)
    }).catch(error => res.send(error))
}

const getAllUsers = async (req, res) => {
    Usuario.find({}).then(response => {
        res.status(200).send(response)
    }).catch(error => res.send(error))
}

const atualizarTipoImpressao = async (req, res) => {
    await Usuario.findOneAndUpdate({ id: req.body.id }, { $set: { tipo_impressao: req.body.tipo_impressao } }).then(response => {
        res.status(200).send("Tipo de impressao atualizado!")
    }).catch(error => res.send(error))
}

const atualizarSenhaUsuario = async (req, res) => {
    await Usuario.findOneAndUpdate({ id: req.body.id }, {
        $set: {
            password: req.body.password
        }
    }).then(response => {
        res.status(200).send("OK")
    }).catch(error => res.send(error))
}

module.exports = {
    salvarUsuario,
    atualizarSenhaUsuario,
    atualizarTipoImpressao,
    buscarUsuarioPorID,
    salvarUsuarioRoute,
    listarTodosUsuarios,
    getUserById,
    postUsuario,
    getProcurarUsuarioPorEmail,
    buscarUsuarioPorNumberDocumento,
    getUsuarioByID,
    getAllUsers,
    atualizarCodigoSeguranca,
    procurarCodigoSeguranca
}