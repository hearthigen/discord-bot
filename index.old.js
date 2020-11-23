require('dotenv').config();

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const redis = require('redis');
const qs = require('qs');

const Discord = require('discord.js');
const client = new Discord.Client();

const app = require('express')();
const http = require('http').createServer(app);

const hash = (len = 24) => {
    return crypto.randomBytes(len).toString('hex');
};

const ipsToDiscord = {
    3: '779974137392791553' // forums:  (3) Registered -> discord: (779974137392791553) [FORUMS] Registered
}

// const redisClient = {
//     DB1: redis.createClient(),
//     DB2: redis.createClient({db: 1}),
// }


// webserver stuff
const IPS_AUTH_URL_BASE = process.env.IPS_AUTH;
const IPS_AUTH_TOKEN_URL = process.env.IPS_TOKEN;


app.get('/', (req, res) => {
    res.json({test: true});
    // return {test: true};
});

app.get('/ping', (req, res) => {
    client.channels.cache.get('774156377772785664').send('test message via web');
});

app.get('/auth', (req, res) => {
    // let state = JSON.parse(decodeURI(req.query.state));
    let code = req.query.code;

    console.log('state: ' + decodeURI(req.query.state));
    console.log('code: ' + code);

    let data = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DEV ? 'http://localhost:8642/auth' : 'https://discord.heathigen.com/auth',
        client_id: process.env.IPS_IDENT,
        client_secret: process.env.IPS_SECRET,
    };

    axios.post(IPS_AUTH_TOKEN_URL, qs.stringify(data)).then(res => {
        const cfg = {
            headers: {Authorization: 'Bearer ' + res.data.access_token}
        }

        console.log('access: ' + res.data.access_token);

        axios.get('https://forums.hearthigen.com/api/core/me', cfg).then(res => {
            let data = res.data;

            let groups = data.secondaryGroups;
            groups.push(data.primaryGroup);

            groups.forEach(group => {
                console.log(`[${group.id}] - ${group.name}`);

                if (typeof ipsToDiscord[group.id] !== 'undefined' && !msg.member.roles.cache.has(ipsToDiscord[group.id])) {
                    msg.member.roles.add(ipsToDiscord[group.id]);
                }
            });
        }).catch(err => {
            console.log('failed to get /core/me');
            console.log(err);
        });

    }).catch(err => {
        console.log('uh oh');
        console.log(err);
    });
});

http.listen(process.env.HTTP_PORT, () => console.log('listening on *:' + process.env.HTTP_PORT));

// discord.js stuff

const chatPrefix = process.env.CHAT_PREFIX;

let commandFiles = fs.readdirSync('./commands/'),
    commands = new Map,
    commandAliases = new Map;

commandFiles.forEach(file => {
    let command = require('./commands/' + file);
    let instance = new command(client);

    commands.set(command.command, instance);

    if (command.aliases.length > 0) {
        command.aliases.forEach(alias => {
            commandAliases.set(alias, command.command);
        });
    }
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

let waitingAuths = {};

client.on('message', msg => {
    // check for prefix, not system/bot message, and not a dm
    if (msg.system || msg.channel.type.toLowerCase() === 'dm' || msg.author.bot) {
        return;
    }

    if (msg.member.id === '140225253207965696' && msg.content.indexOf('!') === 0) {
        // if (msg.content === '!here') {
        //     msg.channel.send('@here test');
        // }

        if (msg.content === '!login') {
            let user = {
                id: msg.member.id,
                hash: hash(12),
            };

            waitingAuths[user.hash] = user;

            let state = encodeURI(JSON.stringify(user));
            let buildUrl = new URL(IPS_AUTH_URL_BASE);

            buildUrl.searchParams.append('client_id', process.env.IPS_IDENT);
            buildUrl.searchParams.append('redirect_uri', encodeURI(process.env.DEV ? 'http://localhost:8642/auth' : 'https://discord.heathigen.com/auth'))
            buildUrl.searchParams.append('response_type', 'code');
            buildUrl.searchParams.append('state', state);
            buildUrl.searchParams.append('scope', 'profile');

            msg.member.send(buildUrl.toString());
        }

        if (msg.content === '!wipe') {
            const archivePerms = [
                {
                    id: msg.guild.id,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: '719453726187847711',
                    allow: ['VIEW_CHANNEL']
                },
            ];


            const unix = Math.floor(Date.now() / 1000);

            const parentId = msg.channel.parentID;

            if (parentId === '757771550819614720') {
                console.log('channel already in auto archive...ignoring');
                return;
            }


            const originalName = msg.channel.name;
            const originalPosition = msg.channel.position;
            const originalPermissions = msg.channel.permissionOverwrites

            msg.channel.overwritePermissions(archivePerms).then(channel => {
                channel.edit({
                    name: originalName + '-archive-' + unix,
                    position: 1,
                    parentID: '757771550819614720'
                }).then(_ => {
                    client.guilds.fetch('371685488353869824').then(guild => {
                        guild.channels.create(originalName, {
                            parent: parentId,
                            permissionOverwrites: originalPermissions,
                            position: originalPosition,
                        }).then(channel => {
                            channel.send('@everyone new chat bois')
                        });
                    })
                });
            });

            msg.delete();

        }
    }

    if (msg.channel.parentID !== '562081073849171978' && msg.mentions.users.has('140225253207965696')) {
        console.log('kana mentioned, notifying and deleting message');
        msg.channel.send('stop mentioning me, kicking ' + msg.member.displayName + '...');
        msg.member.kick('mentioning kana').then(() => {
            console.log('kicked: ' + msg.member.displayName);
        }).catch(err => {
            console.log('failed to kick: ' + msg.member.displayName);
            console.error(err);
        });

        msg.delete({timeout: 2500});
    }

    if (msg.content.indexOf(chatPrefix) !== 0) {
        return;
    }

    // message string without prefix
    const messageContent = msg.content.substr(chatPrefix.length).trim();

    const noArgs = messageContent.indexOf(' ') === -1;

    //  the command name
    let command = noArgs ? messageContent : messageContent.substr(0, messageContent.indexOf(' '));
    command = command.toLowerCase();

    // get the command
    if (commandAliases.has(command)) {
        command = commandAliases.get(command);
    }

    let cmd = commands.get(command);

    if (cmd) {
        cmd.parseArgs(messageContent, msg);
        cmd.run();
    } else {
        msg.channel.send('`' + command + '` is not valid command');
        console.log('command: ' + command + ' not found');
    }
});

client.on('error', console.log);

client.login(process.env.DISCORD_TOKEN);