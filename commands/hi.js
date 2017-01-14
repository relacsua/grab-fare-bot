'use strict';

import { sendMessage } from '../utils/api.js';

const hi = {
  key: /\/hi/,
  process: function ({ from, chat}) {
    const messager = `${from.first_name}${from.last_name ? ` ${from.last_name}` : ''}`;
    sendMessage({
      chat_id: chat.id,
      parse_mode: 'Markdown',
      text: `Hey, *${ messager }*.`
    }); 
  }
}

export default hi;
