const Command = require('../classes/command');

module.exports = class Hello extends Command {
    static get description() {
        return 'Basic command to say hello to a user';
    }

    run(message) {
        message.channel.send('Hello '+message.author);
    }

    static get aliases() {
        return ['hello-world', 'hi'];
    }
};