require('dotenv').config();

// const app = require('express')();

const Discord = require('discord.js');
const client = new Discord.Client();

// const axios = require('axios');
// const crypto = require('crypto');
const fs = require('fs');
// const qs = require('qs');
// const redis = require('redis');


// http.once('error', reject);
//
// http.listen(process.env.HTTP_PORT, () => {
//     console.log('Listening on *:' + process.env.HTTP_PORT);
//     resolve();
// });

let commandfiles = fs.readdirSync('./commands'),
    commands = new Map;

commandfiles.forEach(file => {
    let cmd = require(`./commands/${file}`);

    commands.set(cmd.command, new cmd(client));

    // cmd.set()
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const getUserIdFromMention = mention => {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return mention;
    }
}

const kickMember = (member) => {
    member.kick();
}

client.on('message', msg => {
    if (msg.member.id === '140225253207965696' && msg.content.indexOf('!') === 0) {
        const guild = msg.guild;
        let split = msg.content.split(/ +/g);
        let cmd = split[0].slice(1).toLowerCase();
        let args = split.slice(1);

        let target;
        switch (cmd) {
            case 'kick':
                target = msg.mentions.members.first();

                guild.member(target).kick().then(_ => {
                    msg.channel.send('kicked ' + target.displayName);
                }).catch(err => {
                    msg.channel.send('Failed to kick ' + target.displayName);

                    console.error(err);
                });
                msg.channel.send('Kicked ' + target.displayName);

                break;

            case 'role':
                target = msg.mentions.members.first();

                let role = msg.content.split(' ');
                role = role[role.length - 1];

                target.roles.add(role);
                break;
            case 'roles':
                target = msg.mentions.members.first();

                let roles = {};

                target.roles.cache.each(role => {
                    roles[role.id] = role.name;
                });

                let content = '```' + JSON.stringify(roles, null, 4) + '```';

                msg.channel.send(target.displayName + '\'s roles are: ' + content);
                break;
            default:
                if (commands.has(cmd)) {
                    commands.get(cmd).run(msg);
                } else {
                    console.log('command not found');
                    msg.channel.send('command not found');
                }
                break;

        }
    }
});


client.login(process.env.DISCORD_TOKEN);
