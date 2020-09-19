'use strict';

/**
 * @author Felipe Miguel dos Santos
 */

const express = require('express');
const passport = require("passport");
const bodyParser = require('body-parser');
const index = require('./src/routes/index.route');
const productRoute = require('./src/routes/product.route');
const anuncioRoute = require('./src/routes/anuncio.route');
const mercadoLivreRoute = require('./src/routes/mercadoLivre.route');
const app = express();
//require('./src/config/passport.mercadolivre')(passport); //PASSPORT MERCADOLIVRE - INJETANDO O PASSPORT
const cors = require('cors');
const usuarioRoute = require('./src/routes/usuario.route');
const session = require('express-session');
const flash = require('connect-flash');
const saldoRoute = require('./src/routes/saldo.route')
const vendasRoute = require('./src/routes/vendas.router')
const clienteRoute = require('./src/routes/cliente.route')
const bloqueioRoute = require('./src/routes/bloqueio.route')
const rastreioRoute = require('./src/routes/rastreio.route')
const filaPerguntasRoute = require("./src/routes/filaPerguntas.route")
const comunicadoVendedorRoute = require("./src/routes/comunicadoVendedor.route")
const atualizadorRefreshToken = require("./src/services/agendadorRefreshToken/atualizadorRefreshToken")
const atividadeDiariaRoute = require('./src/routes/atividadeDiaria.route')
const mensagemPosVenda = require("./src/routes/msgPosVenda.route")
const forgotPassword = require("./src/routes/forgotpassword.route")
const concorrenteRoute = require('./src/routes/Concorrente/concorrente.route')

//  Adicionar e configurar middleware
app.use(session({
    secret: 'sessionSecretKey',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.use('/products', productRoute);

//Anúncio
app.use('/anuncio', anuncioRoute);

//Mercado Livre
app.use('/', mercadoLivreRoute);
app.use('/novo_usuario_mercado_livre', mercadoLivreRoute);

app.use('/usuario', usuarioRoute);

app.use('/saldo', saldoRoute);

app.use('/vendas', vendasRoute);

app.use('/clientes', clienteRoute);

app.use('/rastreio', rastreioRoute)

app.use('/bloqueio', bloqueioRoute)

app.use('/perguntas', filaPerguntasRoute)

app.use('/comunicado', comunicadoVendedorRoute)

app.use('/atualizador_refresh_token', atualizadorRefreshToken)

app.use('/atividade', atividadeDiariaRoute)

app.use("/msg_pos_venda", mensagemPosVenda)

app.use("/forgot_password", forgotPassword)

app.use('/concorrente', concorrenteRoute)


module.exports = app;
