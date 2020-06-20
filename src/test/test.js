const firebase = require('../config/firebase');
const axios = require("axios");
const { rastro } = require('rastrojs');
const constants = require('../constants/constants');
const usuarioService = require('../services/usuario-service')
const anuncioService = require('../services/anuncio-service')
const util = require('../helpers/util')
const postAnuncio = require('./postAnuncio')
const cheerio = require('cheerio');
const Usuario = require('../models/usuario-model')
require('moment/locale/pt-br')
const moment = require("moment")

const usuario = {
    id: 3311227,
    access_token: "78l~987lõ87op´1928373847",
    email: "pedromelo@gmail.com",
    first_name: "Pedro",
    nick_name: "Americana",
    refresh_token: "7op9870op987ó0987928370984705"
}

const usuario02 = {
    id: 987654,
    access_token: "8888888888888888888888888",
    email: "comproline.ecoomercer@gmail.com",
    first_name: "Felipe",
    nick_name: "COMPROLINE COMERCIO DE PRODUTOS ONLINE",
    refresh_token: "987P98P798P798P798P79P879P87"
}

const usuario03 = {
    id: 336659,
    access_token: "22222222222222555444411111",
    email: "jurubeba@gmail.com",
    first_name: "João",
    nick_name: "JOAOANTONIO",
    refresh_token: "0Q02Q02Q01W01W01A01A10A98A"
}

const editarUsuario = async () => {
    await axios.put("https://sisiml.firebaseio.com/usuarios.json", usuario).then(resp => {
        console.log("Usuario salvo com sucesso!" + resp);
    }).catch(err => {
        console.log("Houve um erro ao salvar o usuario no firebase: " + err);
    });
}

const salvarUsuario = () => {
    let _usuarioJSON = {}
    listarTodosUsuarios().then(resp => {
        resp.usuario.map(usuario => {
            if (usuario.id === 362614126) {
                _usuarioJSON = [{
                    accessToken: "teste",
                    refreshToken: "teste",
                    nickname: "protesteckn",
                    first_name: "te.te",
                    email: "teste",
                    id: 123
                }]
                axios.put("https://sisiml.firebaseio.com/usuarios/usuario.json", _usuarioJSON).then(resp => {
                    console.log("Usuario salvo com sucesso!" + resp)
                }).catch(err => {
                    console.log("Houve um erro ao salvar o usuario no firebase: " + err)
                });
            } else {
                _usuarioJSON = [{
                    accessToken: "teste",
                    refreshToken: "teste",
                    nickname: "protesteckn",
                    first_name: "te.te",
                    email: "teste",
                    id: 123
                }]
                axios.post("https://sisiml.firebaseio.com/usuarios/usuario.json", _usuarioJSON).then(resp => {
                    console.log("Usuario salvo com sucesso!" + resp)
                }).catch(err => {
                    console.log("Houve um erro ao salvar o usuario no firebase: " + err)
                });
            }
        })
    })

}

const listarTodosUsuarios = async () => {
    const usuarios = await axios.get("https://sisiml.firebaseio.com/usuarios.json").then(resp => {
        console.log(resp.data)
        return resp.data
    }).catch(err => {
        console.log("Houve um erro ao listar todos os usuarios: " + err)
    });
    return usuarios;
}



const listarTodosAnuncio = async (req, res) => {
    usuarioService.buscarUsuarioPorID().then(resp => {
        axios.get(`${constants.API_MERCADO_LIVRE}/users/${resp.id}/items/search?search_type=scan&access_token=${resp.accessToken}`).then(response => {
            var detalhesAnuncio = response.data.results.map(result => {
                return axios.get(`${constants.API_MERCADO_LIVRE}/items/${result}/`).then(res => {
                    return axios.get(`${constants.API_MERCADO_LIVRE}/visits/items?ids=${result}`).then(resp => {
                        if (res.data.shipping.free_shipping) {
                            return axios.get(`${constants.API_MERCADO_LIVRE}/items/${result}/shipping_options/free`).then(resp => {
                                var anuncio = {
                                    id: res.data.id,
                                    titulo: res.data.title,
                                    preco: res.data.price,
                                    estoque_total: res.data.available_quantity,
                                    foto_principal: res.data.pictures[0].url,
                                    link_anuncio: res.data.permalink,
                                    status: res.data.status,
                                    visualizacao: Object.values(resp.data).reduce((accumulador, valorCorrente) => { return valorCorrente }),
                                    totalVariacoes: res.data.variations.length,
                                    tipoAnuncio: res.data.listing_type_id === "gold_pro" ? "Premium - Exposição máxima" : "Clássico - Exposição Alta",
                                    custoFreteGratis: resp.data.coverage.all_country.list_cost,
                                    json: res.data
                                }
                                return anuncio;
                            }).catch(err => console.log(err))
                        } else {
                            var anuncio = {
                                id: res.data.id,
                                titulo: res.data.title,
                                preco: res.data.price,
                                estoque_total: res.data.available_quantity,
                                foto_principal: res.data.pictures[0].url,
                                link_anuncio: res.data.permalink,
                                status: res.data.status,
                                visualizacao: Object.values(resp.data).reduce((accumulador, valorCorrente) => { return valorCorrente }),
                                totalVariacoes: res.data.variations.length,
                                tipoAnuncio: res.data.listing_type_id === "gold_pro" ? "Premium - Exposição máxima" : "Clássico - Exposição Alta",
                                custoFreteGratis: 0,
                                json: res.data
                            }
                            return anuncio;
                        }

                    }).catch(err => {
                        console.log("Houve um erro: " + err)
                    })
                }).catch(err => {
                    console.log("Houve um erro ao buscar os detalhes do anuncio: " + err)
                });
            })

            Promise.all(detalhesAnuncio).then(resp => {
                resp.map(usuario => {
                    console.log(usuario.json.variations)
                })
            });


        }).catch(err => {
            console.log("Houve um erro ao listar todos os anuncios: " + err)
        });
    })
}



const obterTotalDeVendas = async () => {
    var data = new Date();
    usuarioService.buscarUsuarioPorID().then(resp => {
        axios.get(`${constants.API_MERCADO_LIVRE}/orders/search?seller=${resp.id}&order.date_created.from=${data.getFullYear()}-${data.getMonth() + 1}-01T00:00:00.000-00:00&order.date_created.to=${data.getFullYear()}-${data.getMonth() + 1}-30T00:00:00.000-00:00&&access_token=${resp.accessToken}`).then(response => {
            console.log('\n')
            console.log({
                total_vendas: response.data.results.length,
                nome_mes: util.converterDataInteiroParaStringMes(data.getMonth() + 1),
                ano: data.getFullYear()
            })
            console.log('\n')
        }).catch(err => {
            console.log(err)
        })
    })
}

const obterVendasPendentes = async () => {
    usuarioService.buscarUsuarioPorID().then(async resp => {
        await axios.get(`${constants.API_MERCADO_LIVRE}/orders/search/pending?seller=${resp.id}&access_token=${resp.accessToken}`).then(async response => {
            let vendasPendentes = await response.data.results.filter(value => value.payments[0].status === 'pending').map(async value => {
                return await anuncioService.obterFotoPrincipalAnuncio(value.order_items[0].item.id).then(resp => {
                    let vendas = {
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
                        statusPagamento: value.payments[0].status === 'pending' ? 'Pendente' : value.payments[0].status ||
                            value.payments[0].status === 'rejected' ? 'Rejeitado' : value.payments[0].status,
                        boleto: value.payments[0].activation_uri,
                        metodoPagamento: value.payments[0].payment_method_id === 'bolbradesco' ? 'Boleto Banco Bradesco' : value.payments[0].payment_method_id,
                        tipoPagamento: value.payments[0].payment_type === 'credit_card' ? 'Cartão de crédito' : value.payments[0].payment_type ||
                            value.payments[0].payment_type === 'ticket' ? 'Boleto' : value.payments[0].payment_type,
                        cliente: value.buyer.nickname,
                        fotoPrincipal: resp,
                        quantidadeVendasPendente: response.data.results.filter(value => value.payments[0].status === 'pending').length
                    }
                    return vendas
                })
            })

            Promise.all(vendasPendentes).then(resp => { console.log(resp) })

        }).catch(err => {
            console.log(err)
        })
    })
}


function tratarNumeroCelularComDDD(ddd, numero) {
    if (ddd != null) ddd = ddd.replace(' ', '')
    if (ddd === null || ddd == undefined) {
        if (numero != null || numero != undefined) {
            numero = numero.replace("(", "").replace(")", "").replace(" ", "").replace("-", "").trim()
            if (numero.substring(0, 1) == 0) {
                return adicionarNove(numero.substring(1, 12))
            } else {
                return adicionarNove(numero)
            }
        }
    } else {
        numero = numero.replace("(", "").replace(")", "").replace(" ", "").replace("-", "").trim()
        if (ddd.substring(0, 1) == 0) {
            ddd = ddd.substring(1, 3)
            return adicionarNove(ddd + '' + numero)
        } else {
            return adicionarNove(ddd + '' + numero)
        }
    }
    return numero
}

function adicionarNove(numero) {
    if (numero.length == 10) {
        ddd = numero.substring(0, 2)
        numero = numero.substring(2, 10)
        return ddd + '9' + numero
    } else {
        return numero
    }
}



async function example() {

    const track = await rastro.track('PX858327215BR');

    console.log(track);

};




function obterEnderecoCliente() {
    return axios.get('https://api.mercadolibre.com/users/202221965').then(resp => {
        return resp.data.address
    })
}

function postAnuncioMercadoLivre() {
    usuarioService.buscarUsuarioPorID().then(user => {
        axios.post(`http://api.mercadolibre.com/items?access_token=${user.accessToken}`, JSON.stringify(postAnuncio))
    }).catch(err => console.log("err.error"))
}

const getQuestion = () => {
    usuarioService.buscarUsuarioPorID().then(user => {
        axios.get(`https://api.mercadolibre.com/questions/search?item=MLB1332847351&access_token=${user.accessToken}`).then(resp => {
            resp.data.questions.map(prop => {
                console.log(prop.answer.text)
            })
        })
    })
}

const updatePrice = () => {
    let v = {}
    usuarioService.buscarUsuarioPorID().then(user => {
        axios.get(`https://api.mercadolibre.com/items/MLB1363166469?access_token=${user.accessToken}`).then(response => {
            const newVariation = response.data.variations.map((variation, key) => {
                if (variation.id === 46280842511) {
                    v = {
                        id: variation.id,
                        price: 15.98
                    }
                } else {
                    v = {
                        id: variation.id,
                        price: 150.58
                    }
                }
                return v
            })
            console.log(newVariation)
        }).catch(err => {
            console.log(err)
        })
    }).catch(err => {
        console.log(err)
    })
}

let obterVendaProntoParaEnviar = () => {
    let anoAtual = new Date().getFullYear()
    let mesAtual = new Date().getMonth() + 1
    let cincoDiasAtras = new Date().getDate() - 5
    let diaAtual = new Date().getDate()

    usuarioService.buscarUsuarioPorID().then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search?seller=${user.id}&order.date_created.from=${anoAtual}-${mesAtual}-${cincoDiasAtras}T00:00:00.000-00:00&order.date_created.to=${anoAtual}-${mesAtual}-${diaAtual}T00:00:00.000-00:00&&access_token=${user.accessToken}`).then(resp => {
            let vendasAEnviar = resp.data.results.map(async response => {
                /*if (response.shipping.substatus !== null) {
                    if (response.shipping.substatus === 'ready_to_print' || response.shipping.substatus === 'printed') {
                        if (response.shipping.id != null) {
                            return await axios.get(`https://api.mercadolibre.com/shipments/${response.shipping.id}?access_token=${user.accessToken}`).then(ship => {
                                let json = {
                                    id_venda: response.id,
                                    status: response.status,
                                    data_venda: util.formatarDataHora(response.date_closed),
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
                                        whatsapp: util.tratarNumeroCelularComDDD(response.buyer.phone.area_code, response.buyer.phone.number) === null ?
                                            'Não informado' : 'https://api.whatsapp.com/send?phone=55' + util.tratarNumeroCelularComDDD(response.buyer.phone.area_code, response.buyer.phone.number) + '',
                                        numero_contato: util.tratarNumeroCelularComDDD(response.buyer.phone.area_code, response.buyer.phone.number) === null ?
                                            'Não informado' : util.tratarNumeroCelularComDDD(response.buyer.phone.area_code, response.buyer.phone.number),
                                        ddd: response.buyer.phone.area_code,
                                        nickname_comprador: response.buyer.nickname,
                                        email_comprador: response.buyer.email,
                                        first_name_comprador: response.buyer.first_name,
                                        last_name_comprador: response.buyer.last_name,
                                        tipo_documento_comprador: response.buyer.billing_info.doc_type,
                                        documento_comprador: response.buyer.billing_info.doc_number === undefined ||
                                            response.buyer.billing_info.doc_number === null ? 'Não informado' : response.buyer.billing_info.doc_number
                                    },
                                    dados_pagamento: {},
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
                                    }
                                }
                                return json
                            })
                        }
                    }
                }*/
                return response
            })

            Promise.resolve(vendasAEnviar).then(vendas => {
                Promise.all(vendas).then(vnd => {
                    console.log(vnd)
                })
            })

        }).catch(error => console.log(error))
    }).catch(error => console.log(error))
}

const obterVendas = async () => {
    usuarioService.buscarUsuarioPorID().then(user => {
        axios.get(`https://api.mercadolibre.com/orders/search?seller=${user.id}&access_token=${user.accessToken}`).then(resp => {
            let vendasConcluidas = resp.data.results.map(response => {
                if (response.shipping.id != null) {
                    return axios.get(`https://api.mercadolibre.com/shipments/${response.shipping.id}?access_token=${user.accessToken}`).then(ship => {
                        let json = {
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
                        console.log(json)
                    })
                }
            })
            //console.log(vendasConcluidas)
        }).catch(error => console.error(error))
    }).catch(error => console.error(error))
}

let obterDadosPagamento = (payments) => {
    return payments.map(response => {
        if (response.status === 'approved') {
            let dados_pagamento = {
                status_pagamento: response.status,
                custo_envio: response.shipping_cost,
                total_pago: response.total_paid_amount,
                taxa_ml: response.marketplace_fee,
                metodo_pagamento: response.payment_method_id,
                tipo_pagamento: response.payment_type,
                status_pagamento: response.status
            }
            return dados_pagamento
        }
    })
}

let obterVendasEmTransito = async (userId) => {
    let jsonVenda = []
    await usuarioService.buscarUsuarioPorID(userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search/recent?seller=${user.id}&access_token=${user.accessToken}`).then(async resp => {
            let vendasEmTransito = await resp.data.results.map(async response => {
                if (response.shipping.id != null) {
                    return await axios.get(`https://api.mercadolibre.com/shipments/${response.shipping.id}?access_token=${user.accessToken}`).then(async ship => {
                        return await axios.get(`https://api.mercadolibre.com/messages/packs/${response.pack_id === null ? response.id : response.pack_id}/sellers/${user.id}?access_token=${user.accessToken}`).then(msg => {
                            let json = {
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
                        }).catch(error => console.log(error))
                    })
                }
                return jsonVenda
            })

            Promise.all(vendasEmTransito).then(vendas => {
                let newVendas = []
                vendas.map(venda => {
                    if (venda != null) {
                        newVendas.push(venda)
                    }
                })
                //res.status(200).send(newVendas)
                console.log(newVendas)
            })

        }).catch(error => { console.log(error) })
    })
}

let obterImagemSite = async (url) => {
    await axios.get('https://uploaddeimagens.com.br/imagens/unNVwzQ').then(async response => {
        let $ = cheerio.load(response.data)
        let imagem = $('.fancybox').find('img').attr('src')
        console.log('https://uploaddeimagens.com.br/' + imagem)
    })
}


let getDataSite = async () => {
    await axios.get('https://www.mercadolivre.com.br/perfil/comproline').then(async response => {
        let $ = cheerio.load(response.data)
        let totalVendas = $('#profile > div > div.main-wrapper > div.content-wrapper > div.seller-info > div:nth-child(1) > p > span > span').text()
        let reputacao = $('#profile > div > div.main-wrapper > div.content-wrapper > div.seller-info > div:nth-child(1) > p > span').text()
        let tempoEmVenda = $('#profile > div > div.main-wrapper > div.content-wrapper > div.store-info > div:nth-child(2) > div > p > span').text()
        let qualidadeAtendimento = $('#profile > div > div.main-wrapper > div.inner-wrapper > div.metric__wrapper > div:nth-child(1) > div.metric__description > h2').text()
        let qualidadeAtendimentoCompradores = $('#profile > div > div.main-wrapper > div.inner-wrapper > div.metric__wrapper > div:nth-child(1) > div.metric__description > p > span').text()

        let qualidadeEntrega = $('#profile > div > div.main-wrapper > div.inner-wrapper > div.metric__wrapper > div.metric.metric--last > div.metric__description > h2').text()
        let possuiAtraso = $('#profile > div > div.main-wrapper > div.inner-wrapper > div.metric__wrapper > div.metric.metric--last > div.metric__description > p').text()

        let totalFeedback = $("#profile > div > div.main-wrapper > div.inner-wrapper > section > div.buyers-feedback__wrapper > span").text()
        let feedback = $('#feedback_good').text()

        await axios.get('https://api.mercadolibre.com/sites/MLB/search?nickname=comproline').then(async response => {

            let totalVenda = response.data.results.map(result => {
                return result.price * result.sold_quantity
            })
            let quantidadeVendas = response.data.results.map(result => {
                return result.sold_quantity
            })

            /*
            let quantidadeTotalVendas = quantidadeVendas.reduce((soma, valorCorrente) => {
                return soma + valorCorrente
            })
            */
            let soma = totalVenda.reduce((soma, valorCorrente) => {
                return soma + valorCorrente
            })
            let visitas = response.data.results.map(async result => {
                return await axios.get(`https://api.mercadolibre.com/visits/items?ids=${result.id}`).then(resp => {
                    return Object.values(resp.data).reduce((acumulador, valorCorrente) => { return valorCorrente })
                }).catch(error => console.error(error))
            })

            let faturamento = soma.toLocaleString("pt-BR", { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })


            Promise.all(visitas).then(async resp => {

                let totalVisitas = resp.reduce((acumulador, valorCorrente) => { return acumulador + valorCorrente })

                await axios.get(`https://api.mercadolibre.com/users/${response.data.seller.id}`).then(resp => {
                    console.log('Transações:')
                    console.log('Total de transações canceladas: ' + resp.data.seller_reputation.transactions.canceled)
                    console.log('Total de transações completadas: ' + resp.data.seller_reputation.transactions.completed)
                    console.log('-------------------------------------------------')
                    console.log('Classificações')
                    console.log('Classificação negativa: ' + (resp.data.seller_reputation.transactions.ratings.negative * 100).toFixed(0) + '%')
                    console.log('Classificação neutra: ' + (resp.data.seller_reputation.transactions.ratings.neutral * 100).toFixed(0) + '%')
                    console.log('Classificação positiva: ' + (resp.data.seller_reputation.transactions.ratings.positive * 100).toFixed(0) + '%')
                    console.log('Perfil: ' + resp.data.permalink)

                    console.log('-------------------------------------------------')
                    console.log('Reputação: ' + reputacao)
                    console.log('-------------------------------------------------')
                    console.log("Tempo de vendas: " + tempoEmVenda)
                    console.log("Qualidade no atendimento: " + qualidadeAtendimento)
                    console.log('Qualidade no atendimento para os compradores: ' + qualidadeAtendimentoCompradores)
                    console.log('Qualidade da entrega: ' + qualidadeEntrega)
                    console.log("Possui atraso na entrega: " + possuiAtraso)
                    console.log('-------------------------------------------------')
                    console.log('Feedback: ' + feedback)
                    console.log('Total de Feedback: ' + totalFeedback)
                    console.log('-------------------------------------------------')

                    console.log('Total de visitas: ' + totalVisitas)
                    console.log('Ticket médio: ' + (soma / totalVendas).toLocaleString("pt-BR", { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' }))
                    console.log('Total de vendas: ' + totalVendas)
                    console.log("Total de faturamento: " + faturamento)

                }).catch(error => console.error(error))
            }).catch(error => console.error(error))
        }).catch(error => console.error(error))
    }).catch(error => console.error(error))
}



let obterVendasConcluidas = async (userId) => {
    usuarioService.buscarUsuarioPorID(userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/orders/search?seller=${user.id}&access_token=${user.accessToken}`).then(resp => {
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
                console.log(newVendas)
            })

        }).catch(error => console.log(error))
    }).catch(error => console.log(error))
}

const processarVendasConcluidasComShipments = async (response, user) => {
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
        }).catch(error => console.log(error))
    }).catch(error => console.log(error))
}

const processarVendasConcluidasSemShipmentsEntregaACombinar = async (response, user) => {
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
                status_entrega:  "Entrega a combinar com o vendedor",
                msg: msg.data.messages,
                qtde: obterQuantidadeChar(msg.data.messages)

            }
            return json
        }).catch(error => console.log(error))
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


const obterDadosVendasPorCliente = async (id) => {
    usuarioService.buscarUsuarioPorID().then(async user => {
        await axios.get(`${constants.API_MERCADO_LIVRE}/orders/search?seller=${user.id}&access_token=${user.accessToken}`).then(orders => {
            let vendas = orders.data.results.filter(ordersClient => {
                return ordersClient.buyer.id == id
            })
            let vendasClient = vendas.map(value => {
                //console.log(value.order_items)
                return value.order_items.reduce((acumulador, order_item) => {
                    return order_item
                })
            })

            let valor_venda = vendasClient.map(valorCorrente => { return valorCorrente.unit_price })
            let dados = {
                totalCompras: valor_venda.reduce((acumulador, valorCorrent) => { return acumulador + valorCorrent }),
                quantidadeCompras: valor_venda.length,
                tituloAnuncio: vendasClient.reduce((acumulador, valorCorrente) => { return valorCorrente.item.title }),
                IDAnuncio: vendasClient.reduce((a, valorCorrente) => { return valorCorrente.item.id })
            }

            console.log(dados)

        }).catch(error => console.log(error))
    }).catch(error => console.log(error))
}

const obterDadosCliente = async () => {
    usuarioService.buscarUsuarioPorID().then(resp => {
        axios.get(`${constants.API_MERCADO_LIVRE}/orders/search?seller=${resp.id}&access_token=${resp.accessToken}`).then(resp => {
            let clientes = resp.data.results.filter(function (a) {
                //Evita os IDs duplicados
                return !this[JSON.stringify(a.buyer.id)] && (this[JSON.stringify(a.buyer.id)] = true)

            }, Object.create(null)).map(value => {

                return axios.get('https://api.mercadolibre.com/users/' + value.buyer.id).then(resp => {
                    var dadosClient = {
                        id: value.buyer.id,
                        nickname: value.buyer.nickname,
                        primeiro_nome: value.buyer.first_name,
                        last_name: value.buyer.last_name,
                        tipo_documento: value.buyer.billing_info.doc_type,
                        documento: value.buyer.billing_info.doc_number === undefined ||
                            value.buyer.billing_info.doc_number === null ? 'Não informado' : value.buyer.billing_info.doc_number,
                        cidade: resp.data.address.city,
                        estado: JSON.parse(JSON.stringify(resp.data.address.state).replace("BR-", "")),
                        valorCompra: value.order_items[0].unit_price.toFixed(2),
                        vendasClient: obterDadosVendasPorCliente(value.buyer.id)
                    }
                    return dadosClient
                }).catch(err => console.log(err))
            })

            Promise.all(clientes).then((resultado) => {
                console.log(resultado).status(200)
            })

        }).catch(err => {
            console.log({ mensagem: "Houve um erro ao buscar todas as vendas realizadas: " + err })
        })
    })
}

const obterAtributosPorCategoria = async () => {
    usuarioService.buscarUsuarioPorID().then(async response => {
        await axios.get(`https://api.mercadolibre.com/categories/MLB3112/attributes`).then(async atrib => {
            atrib.data.map(value => {
                console.log("\n")
                console.log("Id: " + value.id)
                console.log("Name: " + value.name)
                console.log("Type: " + value.value_type)
                console.log("Values: " + JSON.stringify(value.values))
                console.log("\n")
            })
        }).catch(error => console.error(error))
    }).catch(error => console.error(error))
}

const obterValorDoCustoFreteGratisPorAnuncios = async () => {
    usuarioService.buscarUsuarioPorID().then(async user => {
        await axios.get(`https://api.mercadolibre.com/users/${user.id}/shipping_options/free?item_id=MLB1461682466`).then(async response => {
            console.log(response.data.coverage.all_country.list_cost)
        }).catch(error => console.error(error))
    }).catch(error => console.error(error))
}

const encontrarString = () => {
    let dado = []
    let info = "- Material: 92% poliéster e 8% elastano (Sem Transparência)"
    dado = info.split('').map(caracter => {
        return caracter.replace("%", "\u0025")
    }).join('')
    console.log(dado)
}

const obterTotalAnuncios = async () => {

    usuarioService.buscarUsuarioPorID(541569110).then(async user => {
        await axios.get(`https://api.mercadolibre.com/users/${user.id}/items/search?access_token=${user.accessToken}&status=paused`).then(response => {
            console.log(response.data.paging.total)
        })
    }).catch(error => console.log(error))
}

const buscarUsuarioPorID = async () => {
    usuarioService.buscarUsuarioByID()

    //return usuario;
}

const getProcurarUsuarioPorEmail = async () => {
    Usuario.findById({
        _id: '5ebc4c15e76af43bd8ada5c6'
    }).then(response => {
        console.log(response)
    }).catch(error => console.log(error))
}

const testeMomentJS = (date) => {
    if(moment(util.formatarDataInverter(date)).isBefore(util.formatarDataInverter(moment().format()))) {
        console.log("Atrasado")
    }
}

testeMomentJS('2020-06-06T02:26:43.264Z')