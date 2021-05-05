const Discord = require('discord.js');

module.exports = class Command {
    constructor(options) {
        this.bot = options.bot;
        this.meta = options;
    }

    run(message) {
        this.message = message;
        this.handle();
    }

    handle() {
        throw 'Command handle() not defined';
    }

    static get commandName() {
        return this.prototype.constructor.name;
    }

    static get command() {
        return this.name.substr(0, 1).toLowerCase() + this.name.substr(1).toLowerCase();
    }

    static get aliases() {
        return [];
    }

    static get description() {
        return 'No description set';
    }

    static help() {
        return this.createEmbed({
            fields: [
                {
                    name: 'Description',
                    value: this.description
                },
                {
                    name: 'Available Arguments',
                    value: '```\n' + (this.args.length > 0 ? JSON.stringify(this.args, null, 4) : 'None') + '\n```'
                }
            ]
        });
    }

    static createEmbed(data) {
        return new Discord.MessageEmbed(data);
    }
}
