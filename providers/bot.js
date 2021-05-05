import * as Discord from "discord.js";

class Bot extends Discord.Client {
    constructor() {
        super();
    }

    async init(token) {
        return new Promise((resolve, reject) => {
            bot.once('ready', () => {
                console.log(`Logged in as ${bot.user.tag}`);

                bot.generateInvite({
                    permissions: ['ADMINISTRATOR']
                }).then(inv => console.log(`Bot invite [ADMINISTRATOR]: ${inv}`)).catch(console.error);

                resolve();
            });

            bot.login(process.env.DISCORD_TOKEN).catch(reject);
        })
    }
}

exports = async () => {
    let bot = new Bot;

    await bot.init(process.env.DISCORD_TOKEN);

    return bot;
}
