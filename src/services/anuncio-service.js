'use strict'

const axios = require('axios');
const constants = require('../constants/constants');
const usuarioService = require('../services/usuario-service')
const cheerio = require('cheerio');

/**
 * Created by Felipe M. Santos
 */

exports.obterVisualizacao = (req, res) => {
    axios.get(`${constants.API_MERCADO_LIVRE}/visits/items?ids=${req.params.itemId}`).then(response => {
        res.status(200).send({ visualizacao: Object.values(response.data).reduce((accumulador, valorCorrente) => { return valorCorrente }) })
    })
}

exports.totalStatusAnuncios = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/users/${user.id}/items/search?access_token=${user.accessToken}&status=active`).then(async totalAtivos => {
            await axios.get(`https://api.mercadolibre.com/users/${user.id}/items/search?access_token=${user.accessToken}&status=paused`).then(async totalPausados => {
                let data = {
                    total_ativos: totalAtivos.data.paging.total,
                    total_pausados: totalPausados.data.paging.total
                }
                res.send(data)
            }).catch(error => {
                console.log(error)
                res.send(error)
            })
        }).catch(error => {
            console.log(error)
            res.send(error)
        })
    }).catch(error => {
        console.log(error)
        res.send(error)
    })
}

/** Function responsible for get for all product */
exports.listarTodosAnuncio = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(resp01 => {
        axios.get(`${constants.API_MERCADO_LIVRE}/users/${resp01.id}/items/search?access_token=${resp01.accessToken}&limit=100&offset=${req.params.offset}&status=${req.params.status}`).then(resp07 => {
            var detalhesAnuncio = resp07.data.results.map(resp02 => {
                return axios.get(`${constants.API_MERCADO_LIVRE}/items/${resp02}?access_token=${resp01.accessToken}`).then(resp03 => {
                    return axios.get(`${constants.API_MERCADO_LIVRE}/visits/items?ids=${resp02}`).then(resp04 => {
                        return axios.get(`https://api.mercadolibre.com/items/${resp02}/description?access_token=${resp01.accessToken}`).then(resp08 => {
                            return axios.get(`https://api.mercadolibre.com/questions/search?item=${resp02}&access_token=${resp01.accessToken}`).then(resp09 => {
                                if (resp03.data.shipping.free_shipping && resp03.data.shipping.mode !== "not_specified") {
                                    return axios.get(`${constants.API_MERCADO_LIVRE}/items/${resp02}/shipping_options/free`).then(resp05 => {
                                        var anuncio = {
                                            id: resp03.data.id,
                                            titulo: resp03.data.title,
                                            preco: resp03.data.price,
                                            estoque_total: resp03.data.available_quantity,
                                            foto_principal: resp03.data.pictures[0].url,
                                            link_anuncio: resp03.data.permalink,
                                            status: resp03.data.status,
                                            visualizacao: Object.values(resp04.data).reduce((accumulador, valorCorrente) => { return valorCorrente }),
                                            totalVariacoes: resp03.data.variations.length,
                                            custoFreteGratis: resp05.data.coverage.all_country.list_cost,
                                            freteGratis: "Grátis Brasil",
                                            tarifa: Number(((resp03.data.price) * (11 / 100)).toFixed(2)),
                                            liquido: Number((resp03.data.price - (resp05.data.coverage.all_country.list_cost) - (resp03.data.price) * (11 / 100)).toFixed(2)),
                                            tipoAnuncio: resp03.data.listing_type_id === "gold_pro" ? "Premium - Exposição máxima" : "Clássico - Exposição alta",
                                            tipoAnuncio_id: resp03.data.listing_type_id,
                                            quantidadeVendido: resp03.data.sold_quantity,
                                            status: resp03.data.status,
                                            description: resp08.data.plain_text,
                                            video_id: resp03.data.video_id === null ? '' : 'https://www.youtube.com/watch?v=' + resp03.data.video_id,
                                            sub_status: resp03.data.sub_status[0] === 'out_of_stock' ? 'Sem estoque' : resp03.data.sub_status,
                                            json: resp03.data,
                                            freeShipping: resp03.data.shipping.free_shipping,
                                            question: resp09.data.questions
                                        }
                                        return anuncio;
                                    }).catch(err => {
                                        res.send(err)
                                        console.log("\n")
                                        console.log("ACONTECEU O ERRO DO ANUNCIO AQUI.....CATCH 01")
                                        console.log("\n")
                                    })
                                } else if (resp03.data.shipping.mode === "not_specified") {
                                    var anuncio = {
                                        id: resp03.data.id,
                                        titulo: resp03.data.title,
                                        preco: resp03.data.price,
                                        estoque_total: resp03.data.available_quantity,
                                        foto_principal: resp03.data.pictures[0].url,
                                        link_anuncio: resp03.data.permalink,
                                        status: resp03.data.status,
                                        visualizacao: Object.values(resp04.data).reduce((accumulador, valorCorrente) => { return valorCorrente }),
                                        totalVariacoes: resp03.data.variations.length,
                                        custoFreteGratis: 5.00 + ",00",
                                        freteGratis: "",
                                        tarifa: Number(((resp03.data.price) * (11 / 100)).toFixed(2)),
                                        liquido: Number((resp03.data.price - 5.00 - ((resp03.data.price) * (11 / 100))).toFixed(2)),
                                        tipoAnuncio: resp03.data.listing_type_id === "gold_pro" ? "Premium - Exposição máxima" : "Clássico - Exposição alta",
                                        tipoAnuncio_id: resp03.data.listing_type_id,
                                        quantidadeVendido: resp03.data.sold_quantity,
                                        description: resp08.data.plain_text,
                                        video_id: resp03.data.video_id === null ? '' : 'https://www.youtube.com/watch?v=' + resp03.data.video_id,
                                        sub_status: resp03.data.sub_status[0] === 'out_of_stock' ? 'Sem estoque' : resp03.data.sub_status,
                                        json: resp03.data,
                                        freeShipping: false,
                                        question: resp09.data.questions
                                    }
                                    return anuncio;
                                } else {
                                    var anuncio = {
                                        id: resp03.data.id,
                                        titulo: resp03.data.title,
                                        preco: resp03.data.price,
                                        estoque_total: resp03.data.available_quantity,
                                        foto_principal: resp03.data.pictures[0].url,
                                        link_anuncio: resp03.data.permalink,
                                        status: resp03.data.status,
                                        visualizacao: Object.values(resp04.data).reduce((accumulador, valorCorrente) => { return valorCorrente }),
                                        totalVariacoes: resp03.data.variations.length,
                                        custoFreteGratis: 5.00 + ",00",
                                        freteGratis: "",
                                        tarifa: Number(((resp03.data.price) * (11 / 100)).toFixed(2)),
                                        liquido: Number((resp03.data.price - 5.00 - ((resp03.data.price) * (11 / 100))).toFixed(2)),
                                        tipoAnuncio: resp03.data.listing_type_id === "gold_pro" ? "Premium - Exposição máxima" : "Clássico - Exposição alta",
                                        tipoAnuncio_id: resp03.data.listing_type_id,
                                        quantidadeVendido: resp03.data.sold_quantity,
                                        description: resp08.data.plain_text,
                                        video_id: resp03.data.video_id === null ? '' : 'https://www.youtube.com/watch?v=' + resp03.data.video_id,
                                        sub_status: resp03.data.sub_status[0] === 'out_of_stock' ? 'Sem estoque' : resp03.data.sub_status,
                                        json: resp03.data,
                                        freeShipping: false,
                                        question: resp09.data.questions
                                    }
                                    return anuncio;
                                }
                            })
                        }).catch(err => {
                            res.send(err)
                            console.log("\n")
                            console.log("ACONTECEU O ERRO DO ANUNCIO AQUI.....CATCH 02")
                            console.log("\n")
                            listarTodosAnuncio(req, res)
                        })
                    }).catch(err => {
                        res.send(err)
                        console.log("\n")
                        console.log("ACONTECEU O ERRO DO ANUNCIO AQUI.....CATCH 03")
                        console.log("\n")
                    })
                }).catch(err => {
                    res.send(err)
                    console.log("\n")
                    console.log("ACONTECEU O ERRO DO ANUNCIO AQUI.....CATCH 04")
                    console.log("\n")
                })
            })

            //Ordenar 

            Promise.all(detalhesAnuncio).then(resp06 => {
                res.send(orderAnunciosPorQuantidadeVendas(resp06))
            });


        }).catch(err => {
            console.log("\n")
            console.log("ACONTECEU O ERRO DO ANUNCIO AQUI.....CATCH 05")
            console.log("\n")
        });
    })
}

/** Order by quantity sold*/
const orderAnunciosPorQuantidadeVendas = (detalhesAnuncio) => {
    return detalhesAnuncio.sort((a, b) => { return b.quantidadeVendido - a.quantidadeVendido })
}

exports.obterFotoPrincipalAnuncio = async (idAnuncio) => {
    return await axios.get(`${constants.API_MERCADO_LIVRE}/items/${idAnuncio}/`).then(res => {
        return res.data.pictures[0].url;
    }).catch(err => {
        console.log("An Error occurred to get details product" + err)
    });
}

exports.buscarAnuncioPorTitulo = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(resp => {
        axios.get(`${constants.API_MERCADO_LIVRE}/users/${resp.id}/items/search?search_type=scan&access_token=${resp.accessToken}`)
            .then(response => {
                let resultadoPesquisa = response.data.results.filter(resp => resp.title === req.params.titulo)
                res.status(200).send(resultadoPesquisa)
            }).catch(err => res.send(err))
    })
}

/*
    Function responsible for to update procuct price
*/
exports.updatePrice = (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(user => {
        axios.get(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`).then(response => {
            if (response.data.variations.length === 0) {
                axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
                    {
                        price: req.body.price
                    })).then(resp => {
                        res.send("Preço do anúncio atualizado!")
                    })
            } else {
                let values = response.data.variations.map((variat) => {
                    let dados = {
                        id: variat.id,
                        price: Number(req.body.price)
                    }
                    return dados
                })
                axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
                    {
                        variations: values
                    })).then(resp => {
                        res.send("Preço das variações atualizado!")
                    })
            }
        }).catch(err => {
            console.error('> An error occurred while process a PUT method in line 177')
            res.send('An error occurred while process a PUT method in line 177', err)
        })
    }).catch(err => {
        console.error('> An error occurred to get user ID, line 182')
        res.send('An error occurred to get user ID, line 182', err)
    })
}

/** Function responsible for to update status 'paused' or 'active' */
exports.updateStatus = (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(user => {
        axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`,
            JSON.stringify({
                status: req.body.status
            })).then(response => {
                res.send('Status updated with success!')
            }).catch(error => {
                console.log("An error occurred to updated status Anuncio: " + error)
            })
    }).catch(error => {
        console.log("An error occurred to get user: " + error)
    })
}

exports.updateAvailableQuantity = (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(user => {
        axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify({
            variations: {
                id: req.body.id,
                available_quantity: req.body.available_quantity
            }
        })).then(response => {
            res.status(200).send('Estoque atualizado com sucesso!')
        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

exports.updateListingType = (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.post(`https://api.mercadolibre.com/items/${req.body.itemId}/listing_type?access_token=${user.accessToken}`, JSON.stringify(
            {
                id: req.body.id
            }
        )).then(response => {
            res.status(200).send("ListingType atualizado no anúncio " + req.body.itemId)
        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

exports.updateTitle = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
            {
                title: req.body.title
            }
        )).then(response => {
            res.status(200).send("Título atualizado no anúncio " + req.body.itemId)
        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

exports.obterValorDoCustoFreteGratisPorAnuncio = async (req, res) => {
    usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/users/${user.id}/shipping_options/free?item_id=${req.params.item_id}`).then(async response => {
            res.status(200).send({ custo: response.data.coverage.all_country.list_cost })
        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

exports.updateShipping = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        if (req.body.free_shipping) {
            await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
                {
                    shipping: {
                        free_methods: [
                            {
                                id: 100009,
                                rule: {
                                    default: true,
                                    free_mode: "country",
                                    free_shipping_flag: true,
                                    value: null
                                }
                            }
                        ]
                    }
                }
            )).then(response => {
                res.status(200).send("Shipping atualizado.")
            }).catch(error => res.send(error))
        } else {
            await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
                {
                    shipping: {
                        methods: []
                    },
                }
            )).then(response => {
                res.status(200).send("Shipping atualizado.")
            }).catch(error => res.send(error))
        }


    }).catch(error => res.send(error))
}

exports.updateRetirarPessoalmente = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
            {
                shipping: {
                    local_pick_up: req.body.local_pick_up
                }
            }
        )).then(response => {
            res.status(200).send("Retirar pessoalmente atualizado.")
        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

exports.updateDescription = async (req, res) => {
    let text = []
    text = req.body.plain_text.split('').map(caracter => {
        return caracter.replace("%", "(porcento)")
    })

    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}/description?access_token=${user.accessToken}`, JSON.stringify(
            {
                plain_text: text.join('')
            }
        )).then(response => {
            res.status(200).send("Descrição atualizada.")
        }).catch(error => {
            console.log(error)
            res.send(error)
        })
    }).catch(error => {
        console.log(error)
        res.send(error)
    })
}

exports.updateVideoYouTube = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
            {
                video_id: req.body.videoId
            }
        )).then(response => {
            res.status(200).send("Vídeo atualizado.")
        }).catch(error => {
            console.log(error)
            res.send(error)
        })
    }).catch(error => {
        console.log(error)
        res.send(error)
    })
}

exports.updateDisponibilidadeEstoque = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
            {
                sale_terms: [{
                    id: "MANUFACTURING_TIME",
                    value_name: `${req.body.value_name} días`
                }]
            }
        )).then(response => {
            res.status(200).send("Disponibilidade de estoque atualizado!")
        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

exports.updateGarantia = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        if (req.body.tipo_garantia === 'Sem garantia') {
            await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
                {
                    sale_terms: [
                        {
                            id: "WARRANTY_TYPE",
                            name: "Tipo de garantia",
                            value_id: "6150835",
                            value_name: `${req.body.tipo_garantia}`
                        }
                    ]
                }
            )).then(response => {
                res.status(200).send(response)
            }).catch(error => res.send(error))
        } else {
            await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
                {
                    sale_terms: [
                        {
                            id: "WARRANTY_TYPE",
                            name: "Tipo de garantia",
                            value_id: `${req.body.tipo_garantia === 'Garantia do fabrica' ? 2230279 : 2230280}`,
                            value_name: `${req.body.tipo_garantia}`
                        },
                        {
                            id: "WARRANTY_TIME",
                            name: "Tempo de garantia",
                            value_name: `${req.body.value_name} ${req.body.tempo}`
                        }
                    ]
                }
            )).then(response => {
                res.status(200).send(response)
            }).catch(error => res.send(error))
        }
    }).catch(error => res.send(error))
}

exports.updateCondicao = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`, JSON.stringify(
            {
                condition: `${req.body.condicao}`
            }
        )).then(response => {
            res.status(200).send("Condição atualizado!")
        }).catch(error => res.send(error))
    }).catch(error => res.send(error))
}

exports.getCategoria = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/items/${req.params.itemId}?access_token=${user.accessToken}`).then(async response => {
            await axios.get(`https://api.mercadolibre.com/categories/${response.data.category_id}`).then(categoria => {
                res.send(categoria.data.path_from_root)
            }).catch(error => res.send(error))
        }).catch(error => res.send(error))
    })
}


exports.obterAtributosPorCategoria = async (req, res) => {
    await axios.get(`https://api.mercadolibre.com/categories/${req.params.categoria}/attributes`).then(async atrib => {
        let dados = atrib.data.map(value => {
            let obj = {
                id: value.id,
                name: value.name,
                type: value.value_type,
                value_name: '',
                isNaoPreenchido: '',
                values: value.values
            }
            return obj
        })
        Promise.all(dados).then(attr => {
            res.send(attr)
        })
    }).catch(error => console.error(error))
}

exports.updateAtributos = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`,
            {
                attributes: req.body.attributes
            }
        ).then(response => {
            res.status(200).send(response)
        }).catch(error => {
            console.log(error)
            res.send(error)
        })
    }).catch(error => {
        console.log(error)
        res.send(error)
    })
}

exports.obterImagemSite = async (req, res) => {
    await axios.get(req.body.url).then(async response => {
        let $ = cheerio.load(response.data)
        let imagem = $('.fancybox').find('img').attr('src')
        res.send('https://uploaddeimagens.com.br/' + imagem)
    })
}

exports.updateImagemVariation = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.put(`https://api.mercadolibre.com/items/${req.body.itemId}?access_token=${user.accessToken}`,
            {
                pictures: req.body.pictures,
                variations: req.body.variations
            }
        ).then(response => {
            res.status(200).send("Imagens atualizada na variação do anuncio")
        }).catch(error => {
            console.log(error)
            res.send(error)
        })
    }).catch(error => {
        console.log(error)
        res.send(error)
    })
}

exports.copiarAnuncioPorID = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(async user => {
        await axios.get(`https://api.mercadolibre.com/items/${req.params.itemId}?access_token=${user.accessToken}`).then(async anuncio => {
            await axios.get(`https://api.mercadolibre.com/items/${req.params.itemId}/description?access_token=${user.accessToken}`).then(async description => {
                await axios.post(`https://api.mercadolibre.com/items?access_token=${user.accessToken}`, JSON.stringify(
                    {
                        "site_id": "MLB",
                        "title": anuncio.data.title,
                        "category_id": anuncio.data.category_id,
                        "official_store_id": anuncio.data.official_store_id,
                        "price": anuncio.data.price,
                        "currency_id": anuncio.data.currency_id,
                        "available_quantity": anuncio.data.available_quantity,
                        "sale_terms": anuncio.data.sale_terms,
                        "buying_mode": anuncio.data.buying_mode,
                        "listing_type_id": anuncio.data.listing_type_id,
                        "condition": anuncio.data.condition,
                        "pictures": anuncio.data.pictures,
                        "video_id": anuncio.data.video_id,
                        "description":
                        {
                            "plain_text": description.data.plain_text
                        },
                        "accepts_mercadopago": anuncio.data.accepts_mercadopago,
                        "non_mercado_pago_payment_methods": anuncio.data.non_mercado_pago_payment_methods,
                        "shipping": anuncio.data.shipping,
                        "seller_address": anuncio.data.seller_address,
                        "location": {},
                        "coverage_areas": [],
                        "attributes": anuncio.data.attributes,
                        "variations": getVariations(anuncio.data.variations),
                        "status": anuncio.data.status,
                        "tags": anuncio.data.tags,
                        "warranty": anuncio.data.warranty,
                        "domain_id": anuncio.data.domain_id,
                        "seller_custom_field": anuncio.data.seller_custom_field,
                        "automatic_relist": anuncio.data.automatic_relist,
                        "catalog_listing": anuncio.data.catalog_listing
                    })
                ).then(response => {
                    res.send("Anuncio copiado.")
                }).catch(error => {
                    console.log(error)
                    res.send(error)
                })
            }).catch(error => {
                console.log(error)
                res.send(error)
            })
        }).catch(error => {
            console.log(error)
            res.send(error)
        })
    })
}

const getVariations = (variations) => {
    if (variations.length !== 0) {
        return variations.map(variat => {
            return {
                "id": variat.id,
                "price": variat.price,
                "attribute_combinations": variat.attribute_combinations,
                "available_quantity": variat.available_quantity,
                "sold_quantity": variat.sold_quantity,
                "sale_terms": variat.sale_terms,
                "picture_ids": variat.picture_ids,
                "seller_custom_field": variat.seller_custom_field
            }
        })
    }
}

const modificarDescricaoEmMassa = async (req, res) => {
    await usuarioService.buscarUsuarioPorID(req.params.userId).then(user => {

    }).catch(error => console.log(error))
}


