const Discord = require('discord.js');

module.exports = class Command {
    /**
     * Make the bot instance accessible without having to the individual methods.
     *
     * @param bot
     */
    constructor(bot) {
        this.bot = bot;
    }

    /**
     * Run the command given the message instance and args
     *
     * @param message
     * @param args
     */
    run(message, args) {
        throw new Error('run() not defined. Arguments given: '+JSON.stringify(args));
    }

    /**
     * Parse the content of the message and return the required args.
     * Passes the message instance in case there's some other logic needed.
     *
     * @returns {string[]}
     * @param messageContent
     * @param msg
     */
    static parseArgs(messageContent, msg) {
        return messageContent.split(' ');
    }

    /**
     * Description of the command.
     *
     * @returns {string}
     */
    static get description() {
        return 'Example description for a command';
    }

    /**
     * The arguments for this command, both required and optional.
     *
     * @returns {{optional: Array, required: Array}}
     */
    static get args() {
        return {
            required: this.requiredArgs,
            optional: this.optionalArgs,
        };
    }

    /**
     * Does the command have any args?
     *
     * @returns {boolean}
     */
    static get hasArgs() {
        return this.requiredArgs.length > 0 || this.optionalArgs.length > 0;
    }

    /**
     * Required args for the command.
     *
     * @returns {Array}
     */
    static get requiredArgs() {
        return [];
    }

    /**
     * Optional args for the command.
     *
     * @returns {Array}
     */
    static get optionalArgs() {
        return [];
    }

    /**
     *
     * @returns {module:discord.js.RichEmbed}
     */
    static get help() {
        return this.createEmbed({
            fields: [
                {
                    name: 'Description',
                    value: this.description
                },
                {
                    name: 'Available Arguments',
                    value: '```\n'+(this.hasArgs ? JSON.stringify(this.args, null, 4) : 'None')+'\n```'
                }
            ]
        });
    }

    /**
     * Create an embed so I don't have to require('discord.js') it in the commands themselves.
     *
     * @returns {module:discord.js.RichEmbed}
     */
    static createEmbed(data = {}) {
        return new Discord.RichEmbed(data);
    }
};