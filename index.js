require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

const chatPrefix = process.env.CHAT_PREFIX;

let bootedCommands = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.indexOf(chatPrefix) === -1 || msg.system || msg.channel.type.toLowerCase() === 'dm' || msg.author.bot) {
        return;
    }

    // message string without prefix
    const messageContent = msg.content.substr(chatPrefix.length).trim();

    const noArgs = messageContent.indexOf(' ') === -1;

    //  the command name used to find the file
    const commandName = noArgs ? messageContent : messageContent.substr(0, messageContent.indexOf(' '));
    let commandClass = './commands/'+commandName+'.js';

    // check if the message was something like !kick --help
    const isHelp = messageContent.indexOf('--help') !== -1;

    // attempt to find the command class and instantiate it -> run it
    fs.access(commandClass, fs.F_OK, (err) => {
        if (err) {
            console.log('`'+commandName+'` ('+commandClass+') class file does not exist.');
            return;
        }

        commandClass = require(commandClass);

        if (!(commandName in bootedCommands)) {
            bootedCommands[commandName] = new commandClass(client)
        }

        let command = bootedCommands[commandName];

        // send the help embed for a command or run it
        if (isHelp || (noArgs && commandClass.requiredArgs.length > 0)) {
            msg.channel.send(commandClass.help);
        } else {
            command.run(msg, commandClass.parseArgs(messageContent, msg));
        }
    });
});

client.login(process.env.DISCORD_TOKEN);