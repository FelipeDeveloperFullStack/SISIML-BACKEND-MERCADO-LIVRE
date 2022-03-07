'use strict';

/**
 * @author Felipe Miguel dos Santos
 */
const express = require('express');
const passport = require("passport");
const bodyParser = require('body-parser');
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
const concorrenteRoute = require('./src/routes/concorrente.route')

//  Adicionar e configurar middleware
app.use(session({
    secret: 'sessionSecretKey',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());
app.use(cors());
app.options('*', cors())
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

/*app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://sisimlserver.herokuapp.com"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });*/
  app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    next();
});

app.use('/anuncio', anuncioRoute);
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
