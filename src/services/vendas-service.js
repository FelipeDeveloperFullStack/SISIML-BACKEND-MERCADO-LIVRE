const axios = require('axios')
const usuarioService = require('../services/usuario-service')
const anuncioService = require('../services/anuncio-service')
const constants = require('../constants/constants')
const util = require('../helpers/util')
const fs = require('fs')
require('moment/locale/pt-br')
const moment = require("moment")


exports.obterTotalDeVendas = async (req, res) => {
    var data = new Date();
    let diaAtual = new Date().getDate()

    await usuarioService.buscarUsuarioPorID(req.params.userId).then(resp => {
        axios.get(`${constants.API_MERCADO_LIVRE}/orders/search?seller=${resp.id}&order.date_created.from=${data.getFullYear()}-${data.getMonth() + 1}-01T00:00:00.000-00:00&order.date_created.to=${data.getFullYear()}-${data.getMonth() + 1}-${diaAtual}T00:00:00.000-00:00&&access_token=${resp.accessToken}`).then(response => {
            res.send({
                total_vendas: response.data.results.length,
                nome_mes: util.converterDataInteiroParaStringMes(data.getMonth() + 1)
            })
        }).catch(err => {
            res.status(401).send(err)
        })
    })
}

/*exports.obterVendaProntoParaEnviar = async (req, res) => {
    let anoAtual = new Date().getFullYear()
    let mesAtual = new Date().getMonth() + 1
    let cincoDiasAtras = new Date().getDate() - 5
    let diaAtual = new Date().getDate()

    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search?seller=${user.id}&order.date_created.from=${anoAtual}-${mesAtual}-01T00:00:00.000-00:00&order.date_created.to=${anoAtual}-${mesAtual}-${diaAtual}T00:00:00.000-00:00&&access_token=${user.accessToken}`).then(resp => {
            let vendasAEnviar = resp.data.results.map(async response => {
                if (response.shipping.id !== undefined) {
                    return obterVendaProntoParaEnviarCOMShipping(response, user)
                } else {
                    return obterVendaProntoParaEnviarSEMShipping(response, user)
                }
            })

            Promise.all(vendasAEnviar).then(vendas => {

                res.send(vendas)

            })

        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

const obterVendaProntoParaEnviarCOMShipping = async (response, user) => {
    if (response.shipping.substatus !== null) {
        if (response.shipping.substatus === 'ready_to_print' || response.shipping.substatus === 'printed') {
            if (response.shipping.id != null) {
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
                            comprador: {
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
                            qtde: obterQuantidadeChar(msg.data.messages)
                        }
                        return json
                    })
                })
            }
        }
    }
}

const obterVendaProntoParaEnviarSEMShipping = async (response, user) => {
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
            comprador: {
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
            qtde: obterQuantidadeChar(msg.data.messages)

        }
        return json
    })

}*/

exports.gerarEtiquetaEnvio = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        /*await axios.get(`https://api.mercadolibre.com/shipment_labels?shipment_ids=${req.params.shipping_id}&savePdf=Y&access_token=${user.accessToken}`).then(response => {
            //res.header('content-disposition', 'inline');
            //res.contentType("application/pdf")
            //res.send('https://api.mercadolibre.com/shipment_labels?shipment_ids='+req.params.shipping_id+'&savePdf=Y&access_token='+user.accessToken)
            //res.send(response.data)
            //var data = fs.readFileSync(response.data);
            //res.send(data)
        }).catch(error => res.send(error))*/
        res.send('https://api.mercadolibre.com/shipment_labels?shipment_ids=' + req.params.shipping_id + '&response_type='+user.tipo_impressao+'&access_token=' + user.accessToken)
    }).catch(error => res.send(error))
}

exports.gerarEtiquetaEnvioMesmaPLP = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        res.send('https://api.mercadolibre.com/shipment_labels?shipment_ids=' + req.body.shipping_ids + '&response_type='+user.tipo_impressao+'&access_token=' + user.accessToken)
    }).catch(error => res.send(error))
}

exports.obterVendasPendentes_old = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async resp => {
        await axios.get(`${constants.API_MERCADO_LIVRE}/orders/search/pending?seller=${resp.id}&access_token=${resp.accessToken}`).then(async response => {
            let dadosVendaPendente = await response.data.results.filter(value => value.payments[0].status === 'pending').map(async value => {
                return await anuncioService.obterFotoPrincipalAnuncio(value.order_items[0].item.id).then(resp => {
                    let vendaPendente = {
                        idVariacao: value.order_items[0].item.variation_id,
                        idAnuncio: value.order_items[0].item.id,
                        titulo: value.order_items[0].item.title,
                        quantidade: value.order_items[0].quantity,
                        preco: value.order_items[0].full_unit_price,
                        sku: value.order_items[0].item.seller_sku,
                        idCategoria: value.order_items[0].item.category_id,
                        variacao: value.order_items[0].item.variation_attributes
                            .filter(value => value.name === 'Tamanho')
                            .reduce((value) => value).value_name,
                        dataPedido: util.formatarDataHora(value.date_created),
                        statusPagamento: value.payments[0].status === 'pending' ? 'Pendente' : value.payments[0].status
                            || value.payments[0].status === 'rejected' ? 'Rejeitado' : value.payments[0].status,
                        boleto: value.payments[0].activation_uri,
                        metodoPagamento: value.payments[0].payment_method_id === 'bolbradesco' ? 'Boleto Banco Bradesco' : value.payments[0].payment_method_id,
                        tipoPagamento: value.payments[0].payment_type === 'credit_card' ? 'Cartão de crédito' : value.payments[0].payment_type
                            || value.payments[0].payment_type === 'ticket' ? 'Boleto' : value.payments[0].payment_type,
                        cliente: value.buyer.nickname,
                        fotoPrincipal: resp,
                        totalVendasPendentes: response.data.results.filter(value => value.payments[0].status === 'pending').length
                    }
                    return vendaPendente
                })

            })

            Promise.all(dadosVendaPendente).then(response => res.status(200).send(response))

        }).catch(err => {
            res.status(401).send(err)
        })
    })
}


exports.obterVendasPendentes = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`${constants.API_MERCADO_LIVRE}/orders/search/pending?seller=${user.id}&access_token=${user.accessToken}`).then(async resp => {
            let vendasPendentes = await resp.data.results.map(async response => {
                if (response.shipping.id !== undefined) {
                    return obterVendasPendentesCOMShipping(response, user)
                } else {
                    return obterVendasPendentesSEMShipping(response)
                }
            })

            Promise.all(vendasPendentes).then(vendas => {
                let newVendas = []
                vendas.map(venda => {
                    if (venda != null) {
                        newVendas.push(venda)
                    }
                })
                res.status(200).send(newVendas)
            })

        }).catch(error => { res.send(error) })
    })
}

const obterVendasPendentesCOMShipping = async (response, user) => {
    if (response.shipping.id != null) {
        return await axios.get(`https://api.mercadolibre.com/shipments/${response.shipping.id}?access_token=${user.accessToken}`).then(ship => {
            let json = {
                id_venda: response.id,
                status: response.status,
                data_venda: util.formatarDataHora(response.date_created),
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
                comprador: {
                    nickname_comprador: response.buyer.nickname,
                },
                dados_pagamento: obterDadosPagamento(response.payments),
                dados_entrega: {
                    status: ship.data.status,
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
                }
            }
            return json
        })
    }
}

const obterVendasPendentesSEMShipping = async (response) => {
    let json = {
        id_venda: response.id,
        status: response.status,
        data_venda: util.formatarDataHora(response.date_created),
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
        comprador: {
            nickname_comprador: response.buyer.nickname,
        },
        dados_pagamento: obterDadosPagamento(response.payments),
        dados_entrega: {
            substatus: "to_be_agreed",
            status: "to_be_agreed",
            status_message: "Entrega a combinar com o vendedor"
        }
    }
    return json
}

exports.obterVendasEmTransito = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search/recent?seller=${user.id}&access_token=${user.accessToken}`).then(async resp => {
            let vendasEmTransito = await resp.data.results.map(async response => {
                if (response.shipping.id !== undefined) {
                    return obterVendasEmTransitoCOMShipping(response, user)
                } else {
                    return obterVendasEmTransitoSEMShipping(response, user)
                }
            })

            Promise.all(vendasEmTransito).then(vendas => {
                let newVendas = []
                vendas.map(venda => {
                    if (venda != null) {
                        newVendas.push(venda)
                    }
                })
                res.status(200).send(newVendas)
            })

        }).catch(error => { res.send(error) })
    })
}

const obterVendasEmTransitoCOMShipping = async (response, user) => {
    if (response.shipping.id != null) {
        return await axios.get(`https://api.mercadolibre.com/shipments/${response.shipping.id}?access_token=${user.accessToken}`).then(async ship => {
            return await axios.get(`https://api.mercadolibre.com/messages/packs/${response.pack_id === null ? response.id : response.pack_id}/sellers/${user.id}?access_token=${user.accessToken}&limit=50`).then(msg => {
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
                    comprador: {
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
                    qtde: obterQuantidadeChar(msg.data.messages)
                }
                return json
            }).catch(error => res.send(error))
        }).catch(error => res.send(error))
    }
}

const obterVendasEmTransitoSEMShipping = async (response, user) => {
    return await axios.get(`https://api.mercadolibre.com/messages/packs/${response.pack_id === null ? response.id : response.pack_id}/sellers/${user.id}?access_token=${user.accessToken}&limit=50`).then(msg => {
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
            comprador: {
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
            qtde: obterQuantidadeChar(msg.data.messages)

        }
        return json
    }).catch(error => res.send(error))
}

exports.obterTotalVendas = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search?seller=${user.id}&access_token=${user.accessToken}`).then(response => {
            let resultVendas = response.data.results.map(async result => {
                if (result.shipping.id !== undefined) {
                    return await axios.get(`https://api.mercadolibre.com/shipments/${result.shipping.id}?access_token=${user.accessToken}`).then(ship => {
                        if (ship.data.status === 'delivered') {
                            return 'delivered'
                        }
                        if (ship.data.status === 'cancelled') {
                            return 'cancelled'
                        }
                        if (ship.data.status === 'shipped') {
                            return 'shipped'
                        }
                    })
                } else {
                    return "to_be_agreed"
                }
            })

            Promise.all(resultVendas).then(vendas => {
                let qtdeVendasConcluidas = vendas.filter(vendasConcluidas => { return vendasConcluidas === 'delivered' }).length
                let qtdeVendasEmTransito = vendas.filter(vendasEmTransito => { return vendasEmTransito === 'shipped' }).length
                let qtdeVendasCanceladas = vendas.filter(vendaCancelada => { return vendaCancelada === 'cancelled' }).length
                res.status(200).send({
                    qtdeVendasConcluidas,
                    qtdeVendasCanceladas,
                    qtdeVendasEmTransito
                })
            })
        })
    })
}

exports.obterTotalVendasEmTransito = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search/recent?seller=${user.id}&access_token=${user.accessToken}`).then(response => {
            let resultVendas = response.data.results.map(async result => {
                if (result.shipping.id !== undefined) {
                    return await axios.get(`https://api.mercadolibre.com/shipments/${result.shipping.id}?access_token=${user.accessToken}`).then(ship => {
                        if (ship.data.status === 'shipped') {
                            return 'shipped'
                        }
                    })
                }
            })
            Promise.all(resultVendas).then(vendas => {
                let qtdeVendasEmTransito = vendas.filter(vendasEmTransito => { return vendasEmTransito === 'shipped' }).length
                res.status(200).send({
                    qtdeVendasEmTransito
                })
            })
        })
    })
}

exports.obterTotalVendasAEnviar = async (req, res) => {
    let anoAtual = new Date().getFullYear()
    let mesAtual = new Date().getMonth() + 1
    let cincoDiasAtras = new Date().getDate() - 5
    let diaAtual = new Date().getDate()

    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search?seller=${user.id}&access_token=${user.accessToken}`).then(response => {
            let resultVendas = response.data.results.map(result => {
                if (result.shipping.id !== undefined) {
                    if (result.shipping.id !== undefined) {
                        if (result.shipping.status === 'ready_to_ship') {
                            return 'ready_to_ship'
                        }
                    }
                } else {
                    return "to_be_agreed"
                }
            })

            Promise.all(resultVendas).then(vendas => {
                let qtdeVendasProntoEnvio = vendas.filter(status => { return status === 'ready_to_ship' }).length
                let qtdeVendasACombinarComComprador = vendas.filter(status => status === 'to_be_agreed').length
                res.send({ qtdeVendasAEnviar: (qtdeVendasProntoEnvio + qtdeVendasACombinarComComprador) })
            })
        })
    }).catch(error => res.send(error))
}

exports.obterTotalVendasPendentes = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search/pending?seller=${user.id}&access_token=${user.accessToken}`).then(response => {
            let resultVendas = response.data.results.map(async result => {
                if (result.payments[0].status === 'pending' && result.shipping.status === 'pending') {
                    return await axios.get(`https://api.mercadolibre.com/shipments/${result.shipping.id}?access_token=${user.accessToken}`).then(ship => {
                        if (ship.data.status === 'pending') {
                            return 'pending'
                        }
                    })
                }else{
                    return 'to_be_agreed'
                }
            })

            Promise.all(resultVendas).then(vendas => {
                let qtdeVendasPendentes = vendas.filter(vendasPendentes => { return vendasPendentes === 'pending' }).length
                let qtdeVendasPendentesEnvioACombinar = vendas.filter(vendasPendentes => { return vendasPendentes === 'to_be_agreed' }).length
                res.status(200).send({
                    qtdeVendasPendentes: (qtdeVendasPendentes + qtdeVendasPendentesEnvioACombinar)
                })
            })
        })
    })
}


exports.obterVendasConcluidas = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search?seller=${user.id}&sort=date_asc&access_token=${user.accessToken}`).then(resp => {
            let vendasConcluidas = resp.data.results.map(async response => {
                if (response.shipping.id === undefined) {
                    return processarVendasConcluidasSemShipmentsEntregaACombinar(response, user)
                } else {
                    return processarVendasConcluidasComShipments(response, user)
                }
            })

            Promise.all(vendasConcluidas).then(vendas => {
                let newVendas = []
                vendas.map(venda => {
                    if (venda != null) {
                        newVendas.push(venda)
                    }
                })
                res.send(newVendas)
            })

        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

const processarVendasConcluidasComShipments = async (response, user) => {
    return await axios.get(`https://api.mercadolibre.com/shipments/${response.shipping.id}?access_token=${user.accessToken}`).then(async ship => {
        return await axios.get(`https://api.mercadolibre.com/messages/packs/${response.pack_id === null ? response.id : response.pack_id}/sellers/${user.id}?access_token=${user.accessToken}&limit=50`).then(msg => {
            let json = {
                id_usuario: JSON.stringify(user.id),
                id_venda: response.id,
                status: response.status,
                data_venda: util.formatarDataHora(response.date_closed),
                data_venda_formatada: util.formatarDataInverter(response.date_closed),
                atraso_no_envio: isAtrasoNoEnvio(response.date_closed, ship),
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
                vendedor: {
                    id: response.seller.id,
                    email: response.seller.email
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
        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

const processarVendasConcluidasSemShipmentsEntregaACombinar = async (response, user) => {
    return await axios.get(`https://api.mercadolibre.com/messages/packs/${response.pack_id === null ? response.id : response.pack_id}/sellers/${user.id}?access_token=${user.accessToken}&limit=50`).then(msg => {
        let json = {
            id_usuario: JSON.stringify(user.id),
            id_venda: response.id,
            status: response.status,
            data_venda: util.formatarDataHora(response.date_closed),
            data_venda_formatada: util.formatarDataInverter(response.date_closed),
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
            vendedor: {
                id: response.seller.id,
                email: response.seller.email
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
    }).catch(error => res.send(error))
}

let isAtrasoNoEnvio = (date, ship) => {
    if(ship.data.status === 'ready_to_ship' || ship.data.substatus === 'printed'){
        if(moment(util.formatarDataInverter(date)).isBefore(util.formatarDataInverter(moment().format()))) {
            return true
        }else{
            return false
        }
    }else{
        return false
    }
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

exports.obterQuantidadeDeMensagensNaoRespondidas = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.body.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/messages/unread?access_token=${user.accessToken}`).then(message => {
            let total = message.data.results.map(result => result.count).reduce((previousValue, currentValue) => previousValue + currentValue)
            res.status(200).send({total})
        }).catch(err => res.send(err))
    }).catch(err => res.send(err))
}

exports.markAsReadMessage = async(req, res) => {
    await usuarioService.buscarUsuarioPorID(req.body.userId).then(async user => {
        await axios.put(`https://api.mercadolibre.com/messages/mark_as_read/${req.body.messageId}?access_token=${user.accessToken}`).then(message => {
            res.status(200).send("Messages Read")
        }).catch(err => res.send(err))
    }).catch(err => res.send(err))
}

exports.sendMessage = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.body.userId).then(async user => {
        await axios.post(`https://api.mercadolibre.com/messages/packs/${req.body.packId}/sellers/${req.body.userId}?access_token=${user.accessToken}`, {
            from : 
            {
                user_id: req.body.userId,
                email : req.body.email
            },
                to: 
                    {
                        user_id : req.body.buyerId
                    },
                   text: req.body.text
        }).then(message => {
            res.status(201).send(message)
        }).catch(err => res.send(err))
    }).catch(err => res.send(err))
}

exports.dadosGraficoAnual = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.body.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search?seller=${req.body.userId}&sort=date_asc&order.date_created.from=2019-01-01T00:00:00.000-00:00&order.date_created.to=2020-09-15T00:00:00.000-00:00&access_token=${user.accessToken}`).then(order => {
            
            let dadosOrders = order.data.results.map(result => {
                return result.payments.map(pay => {
                    if(pay.status === 'approved'){
                        return {
                            mes: util.getDateMonthString(util.getDateMonthInteger(pay.date_approved)),
                            preco: pay.total_paid_amount
                        }
                    }
                })
            })
            let temp = []
            dadosOrders.map(orders => {
                orders.map(value => temp.push(value))
            })
            let dadosGraficoObj = []
            temp.map(ordersValue => {
                if(ordersValue !== undefined){
                    dadosGraficoObj.push(ordersValue)
                }
            })
            let mes01 = 0
            let mes02 = 0
            let mes03 = 0
            let mes04 = 0
            let mes05 = 0
            let mes06 = 0
            let mes07 = 0
            let mes08 = 0
            let mes09 = 0
            let mes10 = 0
            let mes11 = 0
            let mes12 = 0
            dadosGraficoObj.map(value => {
                if(value.mes === 'Janeiro'){
                    mes01 += value.preco
                }
                if(value.mes === 'Fevereiro'){
                    mes02 += value.preco
                }
                if(value.mes === 'Março'){
                    mes03 += value.preco
                }
                if(value.mes === 'Abril'){
                    mes04 += value.preco
                }
                if(value.mes === 'Maio'){
                    mes05 += value.preco
                }
                if(value.mes === 'Junho'){
                    mes06 += value.preco
                }
                if(value.mes === 'Julho'){
                    mes07 += value.preco
                }
                if(value.mes === 'Agosto'){
                    mes08 += value.preco
                }
                if(value.mes === 'Setembro'){
                    mes09 += value.preco
                }
                if(value.mes === 'Outubro'){
                    mes10 += value.preco
                }
                if(value.mes === 'Novembro'){
                    mes11 += value.preco
                }
                if(value.mes === 'Dezembro'){
                    mes12 += value.preco
                }
            })
            let dadosTratados = []
            dadosTratados.push({mes: 'Janeiro', total: mes01.toFixed(2)})
            dadosTratados.push({mes: 'Fevereiro', total: mes02.toFixed(2)})
            dadosTratados.push({mes: 'Março', total: mes03.toFixed(2)})
            dadosTratados.push({mes: 'Abril', total: mes04.toFixed(2)})
            dadosTratados.push({mes: 'Maio', total: mes05.toFixed(2)})
            dadosTratados.push({mes: 'Junho', total: mes06.toFixed(2)})
            dadosTratados.push({mes: 'Julho', total: mes07.toFixed(2)})
            dadosTratados.push({mes: 'Agosto', total: mes08.toFixed(2)})
            dadosTratados.push({mes: 'Setembro', total: mes09.toFixed(2)})
            dadosTratados.push({mes: 'Outubro', total: mes10.toFixed(2)})
            dadosTratados.push({mes: 'Novembro', total: mes11.toFixed(2)})
            dadosTratados.push({mes: 'Dezembro', total: mes12.toFixed(2)})
            res.status(200).json(dadosTratados)
        }).catch(err => res.send(err))
    }).catch(err => res.send(err))
}



