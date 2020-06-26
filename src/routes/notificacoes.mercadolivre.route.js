const express = require('express')
const router = express.Router()
const usuarioService = require("../services/usuario-service")
const axios = require('axios')
const FilaPerguntas = require('../models/filaPerguntas-model')
const util = require('../helpers/util')
const { localhost } = require('../constants/constants')

module.exports = (io) => {

    router.post('/', async (req, res) => {
        await usuarioService.buscarUsuarioPorID(req.body.user_id).then(async user => {
            /** PERGUNTAS */
            if (req.body.topic === 'questions') {
                let resource = req.body.resource.split('').filter(caracter => { return Number(caracter) || caracter == 0 }).join('') //Obtem apenas o número de EX: /questions/5036111111, devolvendo apenas o 5036111111
                await axios.get(`https://api.mercadolibre.com/questions/${resource}?access_token=${user.accessToken}`).then(async question => {
                    await axios.get(`https://api.mercadolibre.com/items/${question.data.item_id}`).then(async item => {
                        await axios.get(`https://api.mercadolibre.com/users/${question.data.from.id}`).then(userName => {
                            question.data.title = item.data.title
                            question.data.nick_name = userName.data.nickname
                            salvarNotificacaoFilaBD(question.data)
                            io.emit('notification-ml', question.data)
                            res.status(200).send(question.data)
                            console.log(req.body)
                        })
                    })
                })
            }
            /** VENDAS */
            if (req.body.topic === 'orders_v2') {
                let resource = req.body.resource.split('').filter(caracter => { return Number(caracter) || caracter == 0 }).join('') //Obtem apenas o número de EX: /questions/5036111111, devolvendo apenas o 5036111111
                await axios.get(`https://api.mercadolibre.com/orders/${resource}?access_token=${user.accessToken}`).then(async question => {
                    await axios.get(`https://api.mercadolibre.com/orders/search?seller=${user.id}&q=${question.data.id}&access_token=${user.accessToken}`).then(order => {
                        let novaVenda = order.data.results.map(async response => {
                            if (response.shipping.id === undefined) {
                                return processarNovaVendaSemShipmentsEntregaACombinar(response, user)
                            } else {
                                return processarNovaVendaComShipments(response, user)
                            }
                        })

                        Promise.all(novaVenda).then(vendas => {
                            let newVendas = []
                            vendas.map(venda => {
                                if (venda != null) {
                                    newVendas.push(venda)
                                }
                            })
                            console.log(req.body)
                            //console.log(vendas)
                            res.status(200).send(newVendas)
                            io.emit("nova_venda", newVendas)
                        })
                    })

                })
            }
            // MENSAGEM DE POS VENDA
            if (req.body.topic === 'messages') {
                await axios.get(`https://api.mercadolibre.com/messages/${req.body.resource}?access_token=${user.accessToken}`).then(async message => {
                    console.log(req.body)
                    console.log(message.data)
                })
            }
        }).catch(error => res.send(error))
    })

    const processarNovaVendaComShipments = async (response, user) => {
        console.log(response)
        return await axios.get(`https://api.mercadolibre.com/shipments/${response.shipping.id}?access_token=${user.accessToken}`).then(async ship => {
            return await axios.get(`https://api.mercadolibre.com/messages/packs/${response.pack_id === null ? response.id : response.pack_id}/sellers/${user.id}?access_token=${user.accessToken}`).then(msg => {
                let json = {
                    id_usuario: JSON.stringify(user.id),
                    id_venda: response.id,
                    status: response.status,
                    data_venda: util.formatarDataHora(response.date_closed),
                    pack_id: response.pack_id,
                    itens_pedido: {
                        quantidade_vendido: response.order_items[0].quantity,
                        id_variacao: response.order_items[0].item.variation_id,
                        sku: response.order_items[0].item.seller_sku,
                        id_anuncio: response.order_items[0].item.id,
                        condicao: response.order_items[0].item.condition,
                        garantia: response.order_items[0].item.warranty,
                        id_categoria: response.order_items[0].item.category_id,
                        titulo_anuncio: response.order_items[0].item.title,
                        taxa_venda: response.order_items[0].sale_fee,
                        variation_attributes: response.order_items[0].item.variation_attributes,
                    },
                    valor_venda: response.total_amount,
                    vendedor: {
                        id: response.seller.id,
                        email: response.seller.email
                    },
                    comprador: {
                        id: response.buyer.id,
                        nickname_comprador: response.buyer.nickname,
                        email_comprador: response.buyer.email,
                        first_name_comprador: response.buyer.first_name,
                        last_name_comprador: response.buyer.last_name,
                        tipo_documento_comprador: response.buyer.billing_info.doc_type,
                        documento_comprador: response.buyer.billing_info.doc_number === undefined ||
                            response.buyer.billing_info.doc_number === null ? 'Não informado' : response.buyer.billing_info.doc_number
                    },
                    dados_pagamento: obterDadosPagamento(response.payments),
                    dados_entrega: {
                        status: ship.data.status,
                        substatus: ship.data.substatus,
                        id: ship.data.id,
                        cod_rastreamento: ship.data.tracking_number,
                        metodo_envio: ship.data.tracking_method,
                        endereco_entrega: {
                            rua: ship.data.receiver_address.street_name,
                            numero: ship.data.receiver_address.street_number,
                            cep: ship.data.receiver_address.zip_code,
                            cidade: ship.data.receiver_address.city,
                            estado: ship.data.receiver_address.state,
                            bairro: ship.data.receiver_address.neighborhood,
                            latitude: ship.data.receiver_address.latitude,
                            longitude: ship.data.receiver_address.longitude,
                            nomePessoaEntrega: ship.data.receiver_address.receiver_name,
                            telefonePessoaEntrega: ship.data.receiver_address.receiver_phone
                        }
                    },
                    msg: msg.data.messages,
                    qtde: obterQuantidadeChar(msg.data.messages),
                    checkbox: false
                }
                return json
            }).catch(error => console.log(error))
        }).catch(error => console.log(error))
    }

    const processarNovaVendaSemShipmentsEntregaACombinar = async (response, user) => {
        return await axios.get(`https://api.mercadolibre.com/messages/packs/${response.pack_id === null ? response.id : response.pack_id}/sellers/${user.id}?access_token=${user.accessToken}`).then(msg => {
            console.log(response)
            let json = {
                id_usuario: JSON.stringify(user.id),
                id_venda: response.id,
                status: response.status,
                data_venda: util.formatarDataHora(response.date_closed),
                pack_id: response.pack_id,
                itens_pedido: {
                    quantidade_vendido: response.order_items[0].quantity,
                    id_variacao: response.order_items[0].item.variation_id,
                    sku: response.order_items[0].item.seller_sku,
                    id_anuncio: response.order_items[0].item.id,
                    condicao: response.order_items[0].item.condition,
                    garantia: response.order_items[0].item.warranty,
                    id_categoria: response.order_items[0].item.category_id,
                    titulo_anuncio: response.order_items[0].item.title,
                    taxa_venda: response.order_items[0].sale_fee,
                    variation_attributes: response.order_items[0].item.variation_attributes,
                },
                valor_venda: response.total_amount,
                vendedor: {
                    id: response.seller.id,
                    email: response.seller.email
                },
                comprador: {
                    id: response.buyer.id,
                    nickname_comprador: response.buyer.nickname,
                    email_comprador: response.buyer.email,
                    first_name_comprador: response.buyer.first_name,
                    last_name_comprador: response.buyer.last_name,
                    tipo_documento_comprador: response.buyer.billing_info.doc_type,
                    documento_comprador: response.buyer.billing_info.doc_number === undefined ||
                        response.buyer.billing_info.doc_number === null ? 'Não informado' : response.buyer.billing_info.doc_number
                },
                dados_pagamento: obterDadosPagamento(response.payments),
                dados_entrega: {
                    substatus: "to_be_agreed",
                    status: "to_be_agreed",
                    status_message: "Entrega a combinar com o vendedor"
                },
                msg: msg.data.messages,
                qtde: obterQuantidadeChar(msg.data.messages),
                checkbox: false
            }
            return json
        }).catch(error => console.log(error))
    }

    let obterDadosPagamento = (payments) => {
        return payments.map(response => {

            let dados_pagamento = {
                id_pagamento: response.id,
                status_pagamento: response.status,
                custo_envio: response.shipping_cost,
                total_pago: response.total_paid_amount,
                taxa_ml: response.marketplace_fee,
                status_pagamento: response.status,
                boleto_url: response.activation_uri,
                metodoPagamento: response.payment_method_id === 'bolbradesco' ? 'Banco Bradesco' :
                    (response.payment_method_id === 'account_money' ? 'Dinheiro em conta' : response.payment_method_id),
                tipoPagamento: response.payment_type === 'credit_card' ? 'Cartão de crédito' :
                    (response.payment_type === 'ticket' ? 'Boleto' :
                        (response.payment_type === 'account_money' ? 'Dinheiro em conta' : response.payment_type)),
            }
            return dados_pagamento

        })
    }

    let obterQuantidadeChar = (messages) => {

        return messages.map(msg => {
            if (msg !== undefined) {
                let obj = {
                    qtdeBarraN: msg.text.split('').filter(c => { return c === "\n" }).length + 2,
                }
                return obj
            } else {
                return 0
            }
        })
    }

    const salvarNotificacaoFilaBD = (body) => {
        FilaPerguntas.findOne({ id: body.id }).then(response => {
            if (response === null) {
                let filaPerguntas = new FilaPerguntas(body)
                filaPerguntas.save().then(response => {
                    console.log("\n")
                    console.log("[MENSAGEM DO SISTEMA] - Nova pergunta salva no banco de dados!")
                    console.log("\n")
                }).catch(error => console.log(error))
            } else {
                FilaPerguntas.findOneAndUpdate({ id: body.id }, { $set: { status: body.status } }).then(response => {
                    console.log("\n")
                    console.log(`[MENSAGEM DO SISTEMA] - Pergunta(${body.id}) atualizada no banco de dados como (${body.status})!`)
                    console.log("\n")
                }).catch(error => console.log(error))
            }
        }).catch(error => console.log(error))

    }

    router.post('/responder/:userId', (req, res) => {
        usuarioService.buscarUsuarioPorID(req.params.userId).then(user => {
            axios.post(`https://api.mercadolibre.com/answers?access_token=${user.accessToken}`, req.body).then(response => {
                FilaPerguntas.findOneAndUpdate({ id: req.body.question_id }, { $set: { status: "ANSWERED" } }).then(response => {
                    console.log("\n")
                    console.log("[MENSAGEM DO SISTEMA] - Pergunta atualizada no banco de dados como respondido(ANSWERED)!")
                    console.log("\n")
                }).catch(error => console.log(error))
                res.send({ isRespondido: true })
            }).catch(error => res.send(error))
        }).catch(error => res.send(error))
    })

    return router
}



