'use strict';

class CommandCenter {
  constructor() {
    this.commands = [];
  }

  register(command) {
    this.commands.push(command);
  }

  forward(message) {
    const originalMessage = message.reply_to_message.text;
    for(let i = 0; i < this.commands.length; i++) {
      if (Object.hasOwnProperty.call(this.commands[i], 'commands')) {
        const index = this.commands[i]['commands'].indexOf(originalMessage);
        if (index >= 0) {
          return this.commands[i].process(message, index);
        }
      }
    }
  }

  notify(message) {
    const key = message.text;
    for(let i = 0; i < this.commands.length; i++) {
      if (this.commands[i].key.test(key)) {
        return this.commands[i].process(message);
      }
    }
  }
}

export default new CommandCenter();

