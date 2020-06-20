const keys = require('../../config/keys')
const axios = require('axios')
const Usuario = require('../../models/usuario-model')
const CONSTANTS = require('../../constants/constants')
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
    await axios.get(`${CONSTANTS.localhost.LOCALHOST_5000}/usuario/get_all/users`).then(async user => {
        let usuarios = user.data.map(async response => {
            return await axios.post(`https://api.mercadolibre.com/oauth/token?grant_type=refresh_token&client_id=${keys.mercadolivre.CLIENT_ID}&client_secret=${keys.mercadolivre.CLIENT_SECRET}&refresh_token=${response.refreshToken}`).then(resp => {
               return Usuario.findByIdAndUpdate(
                    {_id: response._id}, 
                    {$set: {accessToken: resp.data.access_token}}
                ).then(response => {
                   return response
                }).catch(error => console.log(error))
            }).catch(error => console.log(error))
        })
        
        Promise.all(usuarios).then(user => {
            res.send("Refresh token atualizado!")
        })
        
    }).catch(error => console.log(error))
}) 

module.exports = router