require('dotenv').config();

const app = require('express')();
const Discord = require('discord.js');

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const qs = require('qs');
const redis = require('redis');

const client = new Discord.Client();
const http = require('http').createServer(app);

http.listen(process.env.HTTP_PORT, () => console.log('listening on *:' + process.env.HTTP_PORT));