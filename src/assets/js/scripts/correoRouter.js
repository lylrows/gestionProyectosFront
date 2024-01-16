const express = require('express');
const app = express();

let envio = require('../scripts/correoController');

app.post('/envio', envio.envioCorreo);

module.exports = app;