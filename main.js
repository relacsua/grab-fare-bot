'use strict';

import mongoose from 'mongoose';
import Telegram from './processes/Telegram.js';
import GrabFare from './processes/GrabFare.js';

(function () {
  let intervals = [];

  connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);

  function addProcess(process, freq) {
    process.init();
    intervals.push(
      setInterval(process.ping, freq)
    );
  }

  function listen () {
    addProcess(Telegram, 1000);
    addProcess(GrabFare, 60000);
  }

  function connect () {
    if (intervals.length) {
      for (const interval in intervals) {
        clearInterval(interval);
      }
    }
    const options = { server: { socketOptions: { keepAlive: 1 } } };
    return mongoose.connect(process.env.MONGO_URL, options).connection;
  }
}());
