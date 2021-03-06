/* eslint-disable no-restricted-syntax */
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const Account = require('../models/Accounts');
const { ErrorHandler } = require('../../services/handleError');

const isNull = (obj, fields) => {
  // eslint-disable-next-line guard-for-in
  for (const prop in fields) {
    if (!obj[fields[prop]]){
      return true;
    }
  }
  return false;
};

const insertAccount = async (account, agentDetails) => {
  try {
    const exists = await Account.findOne({ accountno: account.accountno });
    if (exists) throw new ErrorHandler(409, 'Account Already Exists');
    await Account.create({...account , agentDetails});
    return new ErrorHandler(200, 'Account Added Succesfully');
  } catch (err) {
    return err;
  }
};

const sendMail = async (content, mailId) => {
  try {
    const { OAuth2 } = google.auth;
    const oauth2Client = new OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
    const accessToken = oauth2Client.getAccessToken();
    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SERVER_MAIL_ADDRESS,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
          accessToken,
      },
    });
    await smtpTransport.sendMail({
      from: process.env.SERVER_MAIL_ADDRESS,
      to: mailId,
      subject: 'Important Information',
      text: `Checkout Accounts for Maturity`,
      html: content,
    });
    return { statusCode: 200, message: 'Mail send successfully' };
  } catch (err) {
    return err;
  }
};

module.exports = { isNull, insertAccount, sendMail };
