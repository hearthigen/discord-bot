require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const BaseCommand = require('./classes/command');

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

client.on('message', msg => {
    // check for prefix, not system/bot message, and not a dm
    if (msg.system || msg.channel.type.toLowerCase() === 'dm' || msg.author.bot) {
        return;
    }

    if (msg.member.id === '140225253207965696' && msg.content.indexOf('!') === 0) {
        if (msg.content === '!wipe') {
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
                    client.guilds.fetch('371685488353869824').then(guild  =>  {
                        guild.channels.create(originalName, {
                            parent: parentId,
                            permissionOverwrites: originalPermissions,
                            position: originalPosition,
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