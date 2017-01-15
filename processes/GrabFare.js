'use strict';

import { getReceipts, getReceiptInfo } from '../utils/gapi.js';
import { sendMessage } from '../utils/api.js';
import Expense from '../models/expense';
import Mail from '../models/mail';

function GrabFare () {
  let lastMailRead;

  const updateExpenseAndSendMessage = function ({ price, date, 'Booking code': code }) {
    const month = date.getMonth();
    const year = date.getYear();
    return Expense
      .createOrUpdate(year, month, price)
      .then(() => Expense.getExpense(year, month))
      .then((totalExpense) => {
        return sendMessage({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          parse_mode: 'Markdown',
          text: `You have spent SGD ${ price } on ${ date }. In total, you have spent *SGD ${ totalExpense }*`
        });
      });
  }

  const ping = function () {
    if (lastMailRead === undefined) {
      return;
    }

    let tempLastMailRead = null;
    getReceipts()
      .then((receipts) => {
        return Promise.all(
          receipts.map(receipt => getReceiptInfo(receipt, [ 'Booking code' ]))
        );
      })
      .then((receipts) => {
        const currMonth = (new Date()).getMonth();
        tempLastMailRead = receipts[0].id;
        return receipts.filter((receipt) => 
          receipt.date &&
          (new Date(receipt.date)).getMonth() === currMonth &&
          receipt.id > lastMailRead
        );
      })
      .then((receipts) => {
        return receipts
          .slice()
          .sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date)));
      })
      .then((receipts) => {
        return receipts.reduce((prev, curr) => {
          return prev.then(() => {
            return updateExpenseAndSendMessage(curr);
          });
        }, Promise.resolve({}));
      })
      .then(() => {
        if (lastMailRead !== tempLastMailRead) {
          return Mail.createOrUpdate(tempLastMailRead);
        }
        return false;
      })
      .then((isSaved) => {
        if (isSaved) {
          lastMailRead = tempLastMailRead;
          console.log('Data was saved');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  const init = function () {
    Mail
      .getLastIDRead()
      .then(id => {
        lastMailRead = id;
      })
  }

  return { init, ping };
}

export default GrabFare();
