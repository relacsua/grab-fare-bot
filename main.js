'use strict';

import axios from 'axios';
import mongoose from 'mongoose';
import History from './models/history';
import { getUpdate } from './utils/api.js';
import CommandCenter from './command-center.js';
import hi from './commands/hi.js';

(function () {
  let last_update;
  let telegramInterval = 0;
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

  const pingTelegram = function () {
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

  connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);

  function listen () {
    History
      .getOffset()
      .then((offset) => {
        last_update = offset;
        telegramInterval = setInterval(pingTelegram, 1000);
      })
  }

  function connect () {
    if (telegramInterval) {
      clearInterval(telegramInterval);
    }
    const options = { server: { socketOptions: { keepAlive: 1 } } };
    return mongoose.connect(process.env['MONGO_URL'], options).connection;
  }
}());
