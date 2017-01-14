'use strict';

import axios from 'axios';

const API = 'https://api.telegram.org/bot';
const AUTH_TOKEN = process.env['AUTH_TOKEN'];

if (AUTH_TOKEN === undefined) {
  console.log('AUTH_TOKEN cannot be empty');
  process.exit();
}

const instance = axios.create({
  baseURL: `${API}${AUTH_TOKEN}`,
});

// Add a response interceptor
instance.interceptors.response.use((response) => {
  const { data } = response;
  if (data.ok) {
    return data.result;
  }
  Promise.reject(data.description)
}, function (error) {
  // Do something with response error
  return Promise.reject(error);
});

export function getUpdate(offset) {
  return instance.get('/getupdates', {
    params: {
      offset
    }
  });
}

export function sendMessage(params) {
  return instance.get('/sendmessage', { params });
}
