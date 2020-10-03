const Command = require('../classes/command');

module.exports = class TestArgs extends Command {
    static get description() {
        return 'Basic command to say hello to a user';
    }

    run(message, ...args) {
        message.channel.send('Default arg parsing: '+JSON.stringify(args));
    }
};