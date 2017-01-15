'use strict';

import google from 'googleapis';
import googleAuth from 'google-auth-library';
import cheerio from 'cheerio';

const auth = new googleAuth();
const oauth2Client = new auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

oauth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  expiry_date: process.env.GOOGLE_EXPIRY_DATE
});

const gmail = google.gmail({
  version: 'v1',
  auth: oauth2Client
});

export function getReceipts() {
  return new Promise((resolve, reject) => {
    gmail.users.messages.list({
      userId: 'me',
      q: 'subject:Your GRAB E-Receipt',
      maxResults: 20
    }, (error, response) => {
      if (error) {
        return reject(error);
      }
      resolve(
        response.messages.map(message => message.id)
      );
    });
  });
}

export function getReceiptInfo(id, additionalFields=[]) {
  return new Promise((resolve, reject) => {
    gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full'
    }, (error, receiptEmail) => {
      if (error) {
        return reject(error);
      }
      const receiptInfo = { id };
      const receiptData = receiptEmail.payload.body.data;
      if (receiptData) {
        const receipt = new Buffer(receiptData, 'base64').toString('ascii');
        const $ = cheerio.load(receipt);
        const header = $('td.produceTdLast>span').slice(0, 2);
        receiptInfo.price = parseFloat(header[0].children[0].data.slice(4));
        receiptInfo.date = new Date(header[1].children[0].data);

        if (additionalFields.length > 0) {
          const bookingDetails = $('.tdp5 span');
          // even indices in bookingDetails are field names
          // odd indices in bookingDetails are the field values
          for (let i=0; i < bookingDetails.length/2; i++) {
            const index = additionalFields.indexOf(bookingDetails[2 * i].children[0].data);
            if (index !== -1) {
              receiptInfo[additionalFields[index]] = bookingDetails[2 * i + 1].children[0].data;
            }
          }
        }
      }

      return resolve(receiptInfo);
    });
  });
}
