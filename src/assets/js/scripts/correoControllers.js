const {request, response } = require('express');
const nodeMailer = require('nodemailer');

const envioCorreo = (req = request, resp = response) => {
    let body = req.body;
    let config = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'gilberto.apaza@efitec.pe',
            pass: 'Efitec2022_gpaza$'
        }

    });
    const opciones = {
        from: 'Programacion',
        subject: body.usuario,
        to: body.correo,
        text: body.contraseña
    };

    config.sendMail(opciones, function (error, result) {
        if (error) return resp.json({
            ok: false,
            msg: error
        });
        return resp.json({
            ok: true,
            msg: result
        });
    })
}
module.exports = {
    envioCorreo
}