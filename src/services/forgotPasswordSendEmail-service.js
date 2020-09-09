const nodemailer = require('nodemailer');
const usuarioService = require("../services/usuario-service")

const sendEmail = (req, res) => {
    let codeSecurity = Math.floor(Math.random() * 10) + ""+Math.floor(Math.random() * 10)+ ""+Math.floor(Math.random() * 10)+ ""+Math.floor(Math.random() * 10);
    nodemailer.createTestAccount((err, account) => {
        let htmlToSend = `
            <div> <b>Recebemos uma solicitação de redefinição de senha para a sua conta.</b> </div>
            <br></br>
            <div> Se você não realizou esta solicitação, nos avise. Se você solicitou a redefinição de senha para a conta associada a ${req.body.emailToSend}, copie o código abaixo e informe no sistema. <div>
            <br></br>
            <div>Código de segurança: <b>${codeSecurity}</b> </div>
            <br></br>
            <div> Uma solicitação de redefinição de senha pode ser feita por qualquer pessoa. Apesar de isso não indicar que sua conta esteja ameaçada ou com risco de ser acessada por outra pessoa, recomendamos que você verifique se está usando uma senha segura e única para proteger sua conta. Também sugerimos usar uma senha diferente para cada conta on-line que você tiver. </div>
            <br></br>
            <div> Se tiver alguma dúvida, entre em contato conosco. Agradecemos por usar nosso sistema.</div>    
            <br></br>
            <div> Atenciosamente </div>
            `
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "felipeanalista3@gmail.com", 
                pass: "fmds1701"
            },
            tls:{
                rejectUnauthorized: false
            }
        });
        /**
         * Se caso apresentar problemas de bloqueio do Google, acesse o link abaixo e verifique se está habilitado
         * https://myaccount.google.com/lesssecureapps?pli=1
         */
        let mailOptions = {
            from: "felipeanalista3@gmail.com", 
            to: req.body.emailToSend,
            subject: 'Recebemos uma solicitação de redefinição de senha para a sua conta',
            text: 'Wooohooo it works!!',
            html: htmlToSend
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                res.send("[MENSAGEM DO SISTEMA] - Houve um erro ao tentar enviar um email para o destinatario "+req.body.emailToSend)
                return console.log(err);
            }
            usuarioService.atualizarCodigoSeguranca(req.body.emailToSend, codeSecurity)
            res.send("[MENSAGEM DO SISTEMA] - E-mail enviado para " + req.body.emailToSend)
            return console.log('Email sent!!!');
        });
    })
}

module.exports = {
    sendEmail
}