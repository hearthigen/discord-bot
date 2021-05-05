const Command = require('../classes/command')

module.exports = class Ping extends Command {
    handle() {
        this.message.reply('pong');
    }

    static get description() {
        return 'pong'
    }
}
