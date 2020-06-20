const app = require('./app');
const http = require('http');
//const debug = require('debug')('nodestr: server');
const passport = require('passport')
const mongoose = require('mongoose');
const socketIO = require('socket.io')
const server = http.createServer(app);
const io = socketIO(server)
const notificacoesMercadoLivreRoute = require('./src/routes/notificacoes.mercadolivre.route')(io)
require('./src/config/passport.mercadolivre')(passport); //PASSPORT MERCADOLIVRE - INJETANDO O PASSPORT
const axios = require('axios')

mongoose.connect('mongodb+srv://admin:admin@cluster0-5qx8r.mongodb.net/sigiml?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });

const port = process.env.PORT || 5000;

app.set('port', port);

app.set('io', io)
app.use('/notifications', notificacoesMercadoLivreRoute);

/** Envia uma requisição para o servidor da Heroku, a fim de evitar a hibernação do mesmo*/
let SERVER_MESSAGE = `[SERVIDOR SISIML] - Enviando requisição GET para o servidor de refresh token - ${new Date()}`
setInterval(() => {
    axios.get("https://sisiml-atualizador-refreashtk.herokuapp.com").then(response => {
        console.info(SERVER_MESSAGE)
    }).catch(err => console.info(SERVER_MESSAGE))
}, 2400000 ) // 40MIN = 2400000


io.on('connection', socket => {
    console.log('Socket connected')

    socket.on('disconnected', () => {
        console.log('disconnected')
    })
})

server.listen(port, () => {
    console.log("\n");
    console.log(`Servidor rodando na porta: ${port}`);
    console.log("\n");
});


