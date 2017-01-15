'use strict';

import axios from 'axios';
import History from '../models/history';
import { getUpdate } from '../utils/api.js';
import CommandCenter from '../utils/command-center.js';
import hi from '../commands/hi.js';

function Telegram () {
  let last_update;
  CommandCenter.register(hi);

  const formatText = function (text, offset, length) {
    return text.slice(offset, length)
  }

  const isBotCommand = function (result) {
    const { message } = result;
    if (message) {
      const { entities } = message;
      if (entities) {
        return entities.some(
          (entity) => entity.type === 'bot_command'
        );
      }
    }

    return false;
  }

  const isBotReply = function (result) {
    const { message } = result;
    if (message) {
      return Object.hasOwnProperty.call(message, 'reply_to_message');
    }

    return false;
  }

  const ping = function () {
    if (last_update === undefined) {
      return false;
    }

    getUpdate(last_update)
      .then((results) => {
        const resultsToProcess = results
          .filter(result => result.update_id > last_update)
          .map(result => {
            last_update = result.update_id;

            if (isBotCommand(result)) {
              return CommandCenter.notify(result.message);
            } else if (isBotReply(result)) {
              return CommandCenter.forward(result.message);
            }
          });
        
        return axios.all(resultsToProcess);
      })
      .then((messages) => {
        if (messages.length > 0) {
          return History.createOrUpdate(last_update);
        }
        return false;
      })
      .then((data) => {
        if (data) {
          console.log('data was saved');
        }
      })
      .catch((error) => 
        console.log(error)
      )
  }

  function init () {
    History
      .getOffset()
      .then((offset) => {
        last_update = offset;
      })
  }

  return { ping, init };
}

export default Telegram();
