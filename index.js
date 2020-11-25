require('dotenv').config();

const app = require('express')();

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const qs = require('qs');
const redis = require('redis');

const bot = require('./bot');
const http = require('http').createServer(app);

function webServer() {
    return new Promise((resolve, reject) => {
        http.once('error', reject);

        http.listen(process.env.HTTP_PORT, () => {
            console.log('Listening on *:' + process.env.HTTP_PORT);
            resolve();
        });
    })
}

async function init() {
    await bot.init();
    await webServer();
}

init();