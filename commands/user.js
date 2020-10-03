const Command = require('../classes/command');

module.exports = class User extends Command {
    run(message, user, property) {
    }

    static get requiredArgs() {
        return {
            user: User
        };
    }
};