const Discord = require('discord.js');

module.exports = class Command {
    /**
     * Make the bot instance accessible without having to the individual methods.
     *
     * @param {Discord.Client} bot
     */
    constructor(bot= null) {
        this.bot = bot;
        this._args = [];
    }

    /**
     * Get the literal command.
     *
     * @returns {string}
     */
    static get command() {
        return this.prototype.constructor.name.toLowerCase();
    }

    /**
     * Get the command name.
     *
     * @returns {string}
     */
    static get commandName() {
        return this.prototype.constructor.name;
    }

    /**
     * Get the command description.
     *
     * @returns {string}
     */
    static get description() {
        return 'No description available';
    }

    /**
     * Command help embed
     *
     * @returns {RichEmbed}
     */
    static help() {
        return this.createEmbed({
            fields: [
                {
                    name: 'Description',
                    value: this.description
                },
                {
                    name: 'Available Arguments',
                    value: '```\n'+(this.args.length > 0 ? JSON.stringify(this.args, null, 4) : 'None')+'\n```'
                }
            ]
        });
    }

    static get aliases() {
        return [];
    }

    static get modifiers() {
        return [];
    }

    /**
     * Run the command given the message instance and args
     *
     * @param message
     */
    run(message) {
        throw new Error('run() not defined. Arguments given: '+JSON.stringify(args));
    }

    set message(message) {
        this.msg = message;
    }

    get message() {
        return this.msg;
    }

    /**
     * Parse the content of the message and return the required args.
     * Passes the message instance in case there's some other logic needed.
     *
     * @param messageContent
     * @param {Message} [msg]
     */
    parseArgs(messageContent, msg= null) {
        this._args = messageContent.split(/ +/);

        if (msg) {
            this.msg = msg;
        }
    }

    get parsedArgs() {
        return this._args;
    }

    /**
     * The arguments for this command, both required and optional.
     *
     * @returns {Array}
     */
    static get args() {
        return {

        };
    }

    /**
     * Does the command have any args?
     *
     * @returns {boolean}
     */
    static hasArgs() {
        return this.args.length > 0;
    }

    /**
     * Create an embed so I don't have to require('discord.js') it in the commands themselves.
     *
     * @param data
     * @returns {RichEmbed}
     */
    static createEmbed(data = {}) {
        return new Discord.RichEmbed(data);
    }
};