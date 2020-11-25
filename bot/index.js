const Discord = require('discord.js');

let bot = new Discord.Client();

bot.init = () => {
    return new Promise((resolve, reject) => {
        bot.once('ready', () => {
            console.log(`Logged in as ${bot.user.tag}`);

            bot.generateInvite({
                permissions: ['ADMINISTRATOR']
            }).then(inv => console.log(`Bot invite [ADMINISTRATOR]: ${inv}`)).catch(reject);

            resolve();
        });

        bot.login(process.env.DISCORD_TOKEN).catch(reject);
    });
}

exports.init = bot.init;
exports.default = bot;
